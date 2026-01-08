package api

import (
	"audit-sendiri/internal/db"
	"audit-sendiri/internal/domain"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/golang-jwt/jwt/v5"
)

type Handler struct {
	DB *db.SawitDB
}

func NewHandler(d *db.SawitDB) *Handler {
	return &Handler{DB: d}
}

func (h *Handler) Register(app *fiber.App) {
	api := app.Group("/api")

	authLimiter := limiter.New(limiter.Config{
		Max:        5,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(429).JSON(fiber.Map{
				"error": "Too many requests. Please try again later.",
			})
		},
	})

	api.Get("/", h.GetIndex)
	api.Post("/login", authLimiter, h.Login)
	api.Post("/setup", authLimiter, h.Setup)
	api.Get("/check-setup", h.CheckSetup)
	api.Get("/transactions", h.GetTransactions)

	protected := api.Use(AuthMiddleware())
	
	protected.Get("/audit-log", h.GetAuditLog)
	protected.Get("/users", h.GetUsers)
	protected.Get("/settings", h.GetSettings)
	
	adminOnly := protected.Use(AdminOnly())
	
	adminOnly.Post("/transactions", h.CreateTransaction)
	adminOnly.Put("/transactions/:id", h.UpdateTransaction)
	adminOnly.Delete("/transactions/:id", h.DeleteTransaction)
	
	adminOnly.Post("/users", h.CreateUser)
	adminOnly.Put("/users/:id", h.UpdateUser)
	adminOnly.Delete("/users/:id", h.DeleteUser)

	adminOnly.Put("/settings", h.UpdateSettings)
	adminOnly.Post("/audit-log/:id/restore", h.RestoreAuditLog)
}

func (h *Handler) GetIndex(c *fiber.Ctx) error {
	return c.SendString("AuditSendiri API")
}

func (h *Handler) CheckSetup(c *fiber.Ctx) error {
	isSetup := len(h.DB.Users) > 0
	return c.JSON(fiber.Map{
		"is_setup": isSetup,
	})
}

func (h *Handler) Login(c *fiber.Ctx) error {
	var req domain.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		log.Printf("Login BodyParser error: %v", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request format"})
	}

	var foundUser *domain.User
	for _, u := range h.DB.Users {
		if u.Username == req.Username {
			foundUser = &u
			break
		}
	}

	if foundUser == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	if !domain.CheckPasswordHash(req.Password, foundUser.PasswordHash) {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
	}
	expiresAt := time.Now().Add(24 * time.Hour)
	claims := &domain.JWTSession{
		UserID:   foundUser.ID,
		Username: foundUser.Username,
		Role:     foundUser.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(getJWTSecret())
	if err != nil {
		log.Printf("JWT signing error: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Internal server error"})
	}

	return c.JSON(domain.LoginResponse{
		Token:     tokenString,
		ExpiresAt: expiresAt.Unix(),
		User:      foundUser.ToSafe(),
	})
}

func (h *Handler) Setup(c *fiber.Ctx) error {
	if len(h.DB.Users) > 0 {
		return c.Status(403).JSON(fiber.Map{"error": "Setup already completed"})
	}

	var req domain.SetupRequest
	if err := c.BodyParser(&req); err != nil {
		log.Printf("Setup BodyParser error: %v", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request format"})
	}

	if err := domain.ValidateUsername(req.Username); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	if err := domain.ValidatePassword(req.Password); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	hashedPassword, err := domain.HashPassword(req.Password)
	if err != nil {
		log.Printf("Password hashing error: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Internal server error"})
	}

	admin := domain.User{
		ID:           generateID(),
		Username:     req.Username,
		PasswordHash: hashedPassword,
		Role:         domain.RoleAdmin,
		FullName:     req.Username + " (Administrator)",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	h.DB.InsertUser(admin)

	h.DB.InsertAuditLog(domain.AuditLog{
		EntityType: "user",
		Action:     "setup_admin",
		CreatedAt:  time.Now(),
	})

	settings := domain.AppSettings{
		RTName:    req.RTName,
		RWName:    req.RWName,
		Kelurahan: req.Kelurahan,
		Kecamatan: req.Kecamatan,
		Address:   req.Address,
	}
	
	payload, _ := json.Marshal(settings)
	query := fmt.Sprintf("TANAM JSON settings %s", string(payload))
	h.DB.ExecuteAQL(query)

	return c.JSON(admin.ToSafe())
}

func (h *Handler) GetTransactions(c *fiber.Ctx) error {
	var activeTransactions []domain.Transaction
	for _, tx := range h.DB.Transactions {
		if tx.DeletedAt == nil {
			activeTransactions = append(activeTransactions, tx)
		}
	}
	return c.JSON(activeTransactions)
}

func (h *Handler) CreateTransaction(c *fiber.Ctx) error {
	var tx domain.Transaction
	if err := c.BodyParser(&tx); err != nil {
		log.Printf("CreateTransaction BodyParser error: %v", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request format"})
	}
	
	tx.CreatedAt = time.Now()
	if tx.ID == "" {
		tx.ID = generateID()
	}
	
	h.DB.InsertTransaction(tx)
	
	h.DB.InsertAuditLog(domain.AuditLog{
		EntityType: "transaction", 
		Action:     "create", 
		CreatedAt:  time.Now(),
	})

	return c.JSON(tx)
}

func (h *Handler) UpdateTransaction(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"error": "ID required"})
	}

	var req domain.Transaction
	if err := c.BodyParser(&req); err != nil {
		log.Printf("UpdateTransaction BodyParser error: %v", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request format"})
	}

	var existingTx domain.Transaction
	var found bool
	for _, tx := range h.DB.Transactions {
		if tx.ID == id {
			existingTx = tx
			found = true
			break
		}
	}

	if !found {
		return c.Status(404).JSON(fiber.Map{"error": "Transaction not found"})
	}

	changes := make(map[string]string)
	if req.Amount != 0 && req.Amount != existingTx.Amount {
		changes["amount"] = fmt.Sprintf("%.2f -> %.2f", existingTx.Amount, req.Amount)
		existingTx.Amount = req.Amount
	}
	if req.Type != "" && req.Type != existingTx.Type {
		changes["type"] = fmt.Sprintf("%s -> %s", existingTx.Type, req.Type)
		existingTx.Type = req.Type
	}
	if req.Category != "" && req.Category != existingTx.Category {
		changes["category"] = fmt.Sprintf("%s -> %s", existingTx.Category, req.Category)
		existingTx.Category = req.Category
	}
	if req.Description != "" && req.Description != existingTx.Description {
		changes["description"] = fmt.Sprintf("%s -> %s", existingTx.Description, req.Description)
		existingTx.Description = req.Description
	}

	if len(changes) > 0 {
		h.DB.UpdateTransaction(existingTx)

		detailsJSON, _ := json.Marshal(changes)

		var noteParts []string
		for k, v := range changes {
			noteParts = append(noteParts, fmt.Sprintf("%s: %s", k, v))
		}
		note := strings.Join(noteParts, "; ")

		h.DB.InsertAuditLog(domain.AuditLog{
			EntityType: "transaction",
			EntityID:   existingTx.ID,
			Action:     "update",
			Note:       note,
			Details:    string(detailsJSON),
			CreatedAt:  time.Now(),
		})
	}

	return c.JSON(existingTx)
}

func (h *Handler) DeleteTransaction(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"error": "ID required"})
	}

	var existingTx domain.Transaction
	var found bool
	for _, tx := range h.DB.Transactions {
		if tx.ID == id {
			existingTx = tx
			found = true
			break
		}
	}

	if !found {
		return c.Status(404).JSON(fiber.Map{"error": "Transaction not found"})
	}

	now := time.Now()
	existingTx.DeletedAt = &now
	h.DB.UpdateTransaction(existingTx)
	note := fmt.Sprintf("Deleted transaction: %s (Amount: %.2f)", existingTx.Description, existingTx.Amount)
	h.DB.InsertAuditLog(domain.AuditLog{
		EntityType: "transaction",
		EntityID:   existingTx.ID,
		Action:     "delete",
		Note:       note,
		CreatedAt:  time.Now(),
	})

	return c.SendStatus(200)
}

func (h *Handler) GetAuditLog(c *fiber.Ctx) error {
	return c.JSON(h.DB.AuditLogs)
}

func (h *Handler) GetUsers(c *fiber.Ctx) error {
	var safeUsers []domain.SafeUser
	for _, u := range h.DB.Users {
		safeUsers = append(safeUsers, u.ToSafe())
	}
	return c.JSON(safeUsers)
}

func (h *Handler) GetSettings(c *fiber.Ctx) error {
	return c.JSON(h.DB.Settings)
}

func (h *Handler) UpdateSettings(c *fiber.Ctx) error {
	var settings domain.AppSettings
	if err := c.BodyParser(&settings); err != nil {
		log.Printf("UpdateSettings BodyParser error: %v", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request format"})
	}
	
	payload, _ := json.Marshal(settings)
	query := fmt.Sprintf("TANAM JSON settings %s", string(payload))
	h.DB.ExecuteAQL(query)
	
	return c.JSON(settings)
}

func (h *Handler) CreateUser(c *fiber.Ctx) error {
	var req domain.CreateUserRequest
	if err := c.BodyParser(&req); err != nil {
		log.Printf("CreateUser BodyParser error: %v", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request format"})
	}

	if err := domain.ValidateUsername(req.Username); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	if err := domain.ValidatePassword(req.Password); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	hashedPassword, err := domain.HashPassword(req.Password)
	if err != nil {
		log.Printf("Password hashing error: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Internal server error"})
	}

	user := domain.User{
		ID:           generateID(),
		Username:     req.Username,
		PasswordHash: hashedPassword,
		FullName:     req.FullName,
		Role:         req.Role,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	h.DB.InsertUser(user)
	
	return c.JSON(user.ToSafe())
}

func (h *Handler) UpdateUser(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"error": "ID required"})
	}

	var req domain.CreateUserRequest
	if err := c.BodyParser(&req); err != nil {
		log.Printf("UpdateUser BodyParser error: %v", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request format"})
	}

	if req.Username != "" {
		if err := domain.ValidateUsername(req.Username); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
	}
	if req.Password != "" {
		if err := domain.ValidatePassword(req.Password); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
	}

	var existingUser domain.User
	var found bool
	for _, u := range h.DB.Users {
		if u.ID == id {
			existingUser = u
			found = true
			break
		}
	}
	if !found {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	if req.Username != "" {
		existingUser.Username = req.Username
	}
	if req.Password != "" {
		hashedPassword, err := domain.HashPassword(req.Password)
		if err != nil {
			log.Printf("Password hashing error: %v", err)
			return c.Status(500).JSON(fiber.Map{"error": "Internal server error"})
		}
		existingUser.PasswordHash = hashedPassword
	}
	if req.FullName != "" {
		existingUser.FullName = req.FullName
	}
	if req.Role != "" {
		existingUser.Role = req.Role
	}
	existingUser.UpdatedAt = time.Now()

	h.DB.UpdateUser(existingUser)
	
	return c.JSON(existingUser.ToSafe())
}

func (h *Handler) DeleteUser(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"error": "ID required"})
	}

	userID, ok := c.Locals("userID").(string)
	if ok && userID == id {
		return c.Status(400).JSON(fiber.Map{"error": "Cannot delete your own account"})
	}
	adminCount := 0
	var targetUser *domain.User
	for _, u := range h.DB.Users {
		if u.Role == domain.RoleAdmin {
			adminCount++
		}
		if u.ID == id {
			copyUser := u
			targetUser = &copyUser
		}
	}

	if targetUser != nil && targetUser.Role == domain.RoleAdmin && adminCount <= 1 {
		return c.Status(400).JSON(fiber.Map{"error": "Cannot delete the last admin user"})
	}
	if targetUser == nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	h.DB.DeleteUser(id)
	return c.SendStatus(200)
}

func (h *Handler) RestoreAuditLog(c *fiber.Ctx) error {
	id := c.Params("id")
	
	var logEntry *domain.AuditLog
	for _, l := range h.DB.AuditLogs {
		if l.ID == id {
			entry := l
			logEntry = &entry
			break
		}
	}
	
	if logEntry == nil {
		return c.Status(404).JSON(fiber.Map{"error": "Audit log not found"})
	}

	if logEntry.EntityType != "transaction" {
		 return c.Status(400).JSON(fiber.Map{"error": "Only transaction restoration is supported"})
	}

	var targetTx *domain.Transaction
	for i := range h.DB.Transactions {
		if h.DB.Transactions[i].ID == logEntry.EntityID {
			targetTx = &h.DB.Transactions[i]
			break
		}
	}

	if targetTx == nil {
		 return c.Status(404).JSON(fiber.Map{"error": "Transaction not found"})
	}

	if logEntry.Action == "delete" {
		targetTx.DeletedAt = nil
		h.DB.UpdateTransaction(*targetTx)
		
		h.DB.InsertAuditLog(domain.AuditLog{
			EntityType: "transaction",
			EntityID:   targetTx.ID,
			Action:     "create",
			Note:       fmt.Sprintf("Restored from deletion (Audit Log ID: %s)", logEntry.ID),
			CreatedAt:  time.Now(),
		})
	} else if logEntry.Action == "update" || logEntry.Action == "correction" {
		var changes map[string]string
		if err := json.Unmarshal([]byte(logEntry.Details), &changes); err != nil {
			 return c.Status(500).JSON(fiber.Map{"error": "Failed to parse audit details"})
		}

		for field, change := range changes {
			parts := strings.Split(change, " -> ")
			if len(parts) < 1 {
				continue
			}
			oldValueStr := parts[0]
			
			switch field {
			case "amount":
				if val, err := strconv.ParseFloat(oldValueStr, 64); err == nil {
					targetTx.Amount = val
				}
			case "type":
				targetTx.Type = oldValueStr
			case "category":
				targetTx.Category = oldValueStr
			case "description":
				targetTx.Description = oldValueStr
			}
		}
		h.DB.UpdateTransaction(*targetTx)

		h.DB.InsertAuditLog(domain.AuditLog{
			EntityType: "transaction",
			EntityID:   targetTx.ID,
			Action:     "update",
			Note:       fmt.Sprintf("Restored from update (Audit Log ID: %s)", logEntry.ID),
			CreatedAt:  time.Now(),
		})
	} else {
		return c.Status(400).JSON(fiber.Map{"error": "Action not restorable"})
	}

	return c.JSON(targetTx)
}

func generateID() string {
	bytes := make([]byte, 8)
	if _, err := rand.Read(bytes); err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(bytes)
}
