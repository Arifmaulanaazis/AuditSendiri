package api

import (
	"audit-sendiri/internal/domain"
	"log"
	"os"
	"strings"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

var (
	jwtSecret     []byte
	jwtSecretOnce sync.Once
)

func getJWTSecret() []byte {
	jwtSecretOnce.Do(func() {
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			log.Fatal("SECURITY ERROR: JWT_SECRET environment variable is required! Generate one with: openssl rand -base64 64")
		}
		if len(secret) < 32 {
			log.Fatal("SECURITY ERROR: JWT_SECRET must be at least 32 characters long for production security!")
		}
		jwtSecret = []byte(secret)
	})
	return jwtSecret
}

func AuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{
				"error": "Missing authorization header",
			})
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(401).JSON(fiber.Map{
				"error": "Invalid authorization header format",
			})
		}

		tokenString := parts[1]
		token, err := jwt.ParseWithClaims(tokenString, &domain.JWTSession{}, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			return c.Status(401).JSON(fiber.Map{
				"error": "Invalid or expired token",
			})
		}

		claims, ok := token.Claims.(*domain.JWTSession)
		if !ok {
			return c.Status(401).JSON(fiber.Map{
				"error": "Invalid token claims",
			})
		}

		c.Locals("userID", claims.UserID)
		c.Locals("username", claims.Username)
		c.Locals("role", claims.Role)

		return c.Next()
	}
}

func AdminOnly() fiber.Handler {
	return func(c *fiber.Ctx) error {
		role, ok := c.Locals("role").(domain.Role)
		if !ok {
			return c.Status(401).JSON(fiber.Map{
				"error": "Unauthorized - role not found",
			})
		}

		if role != domain.RoleAdmin {
			return c.Status(403).JSON(fiber.Map{
				"error": "Forbidden - admin access required",
			})
		}

		return c.Next()
	}
}
