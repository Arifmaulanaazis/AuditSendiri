package domain

import "time"

type AuditLog struct {
	ID         string    `json:"id"`
	EntityType string    `json:"entity_type"`
	EntityID   string    `json:"entity_id"`
	Action     string    `json:"action"` // create | correction
	Note       string    `json:"note"`
	Details    string    `json:"details,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
	CreatedBy  string    `json:"created_by"`
}
