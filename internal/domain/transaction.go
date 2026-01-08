package domain

import "time"

type Transaction struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"` // income | expense
	Amount      float64   `json:"amount"`
	Category    string    `json:"category"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	CreatedBy   string    `json:"created_by"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}
