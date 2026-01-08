package domain

import (
	"fmt"
	"time"
	"golang.org/x/crypto/bcrypt"
	"github.com/golang-jwt/jwt/v5"
)

type Role string

const (
	RoleAdmin Role = "admin"
	RoleGuest Role = "guest"
	RoleUser  Role = "user"
)

type User struct {
	ID           string    `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"password_hash"`
	Role         Role      `json:"role"`
	FullName     string    `json:"full_name"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type SafeUser struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Role      Role      `json:"role"`
	FullName  string    `json:"full_name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (u User) ToSafe() SafeUser {
	return SafeUser{
		ID:        u.ID,
		Username:  u.Username,
		Role:      u.Role,
		FullName:  u.FullName,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token     string   `json:"token"`
	ExpiresAt int64    `json:"expires_at"`
	User      SafeUser `json:"user"`
}

type SetupRequest struct {
	RTName    string `json:"rt_name"`
	RWName    string `json:"rw_name"`
	Kelurahan string `json:"kelurahan"`
	Kecamatan string `json:"kecamatan"`
	Address   string `json:"address"`
	Username  string `json:"username"`
	Password  string `json:"password"`
}

type CreateUserRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
	Role     Role   `json:"role"`
}

type JWTSession struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Role     Role   `json:"role"`
	jwt.RegisteredClaims
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func ValidateUsername(username string) error {
	if len(username) < 3 {
		return fmt.Errorf("username must be at least 3 characters")
	}
	if len(username) > 30 {
		return fmt.Errorf("username must be less than 30 characters")
	}
	for _, char := range username {
		if !((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || 
		     (char >= '0' && char <= '9') || char == '_') {
			return fmt.Errorf("username can only contain letters, numbers, and underscore")
		}
	}
	return nil
}

func ValidatePassword(password string) error {
	if len(password) < 8 {
		return fmt.Errorf("password must be at least 8 characters")
	}
	if len(password) > 72 {
		return fmt.Errorf("password must be less than 72 characters")
	}
	return nil
}
