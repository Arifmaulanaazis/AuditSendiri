package db

import (
	"audit-sendiri/internal/domain"
	"crypto/rand"
	"encoding/binary"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
	"sync"
	"time"
)

type SawitDB struct {
	Path        string
	file        *os.File
	mu          sync.Mutex
	Transactions []domain.Transaction
	AuditLogs    []domain.AuditLog
	Users        []domain.User
	Settings     domain.AppSettings
}

func generateID() string {
	bytes := make([]byte, 8)
	if _, err := rand.Read(bytes); err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(bytes)
}

func NewSawitDB(path string) (*SawitDB, error) {
	if err := os.MkdirAll(path, 0755); err != nil {
		return nil, err
	}

	filePath := path + "/data.sawit"
	f, err := os.OpenFile(filePath, os.O_APPEND|os.O_CREATE|os.O_RDWR, 0644)
	if err != nil {
		return nil, err
	}

	db := &SawitDB{
		Path: path,
		file: f,
		Transactions: []domain.Transaction{},
		AuditLogs:    []domain.AuditLog{},
		Users:        []domain.User{},
		Settings:     domain.AppSettings{RTName: "001", RWName: "001"},
	}

	if err := db.Rehydrate(); err != nil {
		return nil, err
	}

	return db, nil
}

func (db *SawitDB) Rehydrate() error {
	db.mu.Lock()
	defer db.mu.Unlock()

	log.Println("Rehydrating database from disk...")
	
	db.file.Seek(0, 0)
	
	for {
		var length int32
		err := binary.Read(db.file, binary.LittleEndian, &length)
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}

		aqlBytes := make([]byte, length)
		_, err = db.file.Read(aqlBytes)
		if err != nil {
			return err
		}

		aql := string(aqlBytes)
		db.applyLocally(aql)
	}

	db.file.Seek(0, 2)
	log.Printf("Rehydration complete. %d transactions, %d users loaded.", len(db.Transactions), len(db.Users))
	return nil
}

func (db *SawitDB) applyLocally(aql string) {
	if strings.HasPrefix(aql, "TANAM JSON") || strings.HasPrefix(aql, "UBAH JSON") {
		op := "TANAM"
		if strings.HasPrefix(aql, "UBAH JSON") {
			op = "UBAH"
		}

		parts := strings.SplitN(aql, " ", 4)
		if len(parts) < 4 {
			return
		}
		tableName := parts[2]
		payload := parts[3]

		switch tableName {
		case "transactions":
			var tx domain.Transaction
			if err := json.Unmarshal([]byte(payload), &tx); err == nil {
				if op == "TANAM" {
					db.Transactions = append(db.Transactions, tx)
				} else {
					for i, t := range db.Transactions {
						if t.ID == tx.ID {
							db.Transactions[i] = tx
							break
						}
					}
				}
			}
		case "users":
			var user domain.User
			if err := json.Unmarshal([]byte(payload), &user); err == nil {
				if op == "TANAM" {
					db.Users = append(db.Users, user)
				} else {
					for i, u := range db.Users {
						if u.ID == user.ID {
							db.Users[i] = user
							break
						}
					}
				}
			} else {
				log.Printf("Failed to unmarshal user: %v", err)
			}
		case "audit_log":
			var auditLog domain.AuditLog
			if err := json.Unmarshal([]byte(payload), &auditLog); err == nil {
				if auditLog.ID == "" {
					auditLog.ID = generateID()
				}
				if op == "TANAM" {
					db.AuditLogs = append(db.AuditLogs, auditLog)
				}
			}
		case "settings":
			var s domain.AppSettings
			if err := json.Unmarshal([]byte(payload), &s); err == nil {
				db.Settings = s
			}
		}
		return
	}

	if strings.HasPrefix(aql, "HAPUS JSON") {
		parts := strings.SplitN(aql, " ", 4)
		if len(parts) < 4 {
			return
		}
		tableName := parts[2]
		idRaw := parts[3] 
		type IDWrapper struct {
			ID string `json:"id"`
		}
		var idObj IDWrapper
		if err := json.Unmarshal([]byte(idRaw), &idObj); err != nil {
			return
		}

		switch tableName {
		case "users":
			newUsers := []domain.User{}
			for _, u := range db.Users {
				if u.ID != idObj.ID {
					newUsers = append(newUsers, u)
				}
			}
			db.Users = newUsers
		}
		return
	}
}

func (db *SawitDB) ExecuteAQL(query string) (interface{}, error) {
	db.mu.Lock()
	defer db.mu.Unlock()
	aqlBytes := []byte(query)
	length := int32(len(aqlBytes))

	if err := binary.Write(db.file, binary.LittleEndian, length); err != nil {
		return nil, err
	}
	if _, err := db.file.Write(aqlBytes); err != nil {
		return nil, err
	}
	if err := db.file.Sync(); err != nil {
		return nil, err
	}
	db.applyLocally(query)
	upper := strings.ToUpper(query)
	if strings.Contains(upper, "PANEN * DARI JSON TRANSACTIONS") || strings.Contains(upper, "PANEN * DARI TRANSACTIONS") {
		return db.Transactions, nil
	} else if strings.Contains(upper, "PANEN * DARI AUDIT_LOG") {
		return db.AuditLogs, nil
	} else if strings.Contains(upper, "PANEN * DARI USERS") {
		return db.Users, nil
	}

	return nil, nil
}

func (db *SawitDB) InsertTransaction(tx domain.Transaction) {
	payload, _ := json.Marshal(tx)
	query := fmt.Sprintf("TANAM JSON transactions %s", string(payload))
	db.ExecuteAQL(query)
}

func (db *SawitDB) UpdateTransaction(tx domain.Transaction) {
	payload, _ := json.Marshal(tx)
	query := fmt.Sprintf("UBAH JSON transactions %s", string(payload))
	db.ExecuteAQL(query)
}

func (db *SawitDB) InsertUser(u domain.User) {
	payload, _ := json.Marshal(u)
	query := fmt.Sprintf("TANAM JSON users %s", string(payload))
	db.ExecuteAQL(query)
}

func (db *SawitDB) InsertAuditLog(log domain.AuditLog) {
	if log.ID == "" {
		log.ID = generateID()
	}
	payload, _ := json.Marshal(log)
	query := fmt.Sprintf("TANAM JSON audit_log %s", string(payload))
	db.ExecuteAQL(query)
}

func (db *SawitDB) UpdateUser(u domain.User) {
	payload, _ := json.Marshal(u)
	query := fmt.Sprintf("UBAH JSON users %s", string(payload))
	db.ExecuteAQL(query)
}

func (db *SawitDB) DeleteUser(id string) {
	payload := fmt.Sprintf(`{"id":"%s"}`, id)
	query := fmt.Sprintf("HAPUS JSON users %s", payload)
	db.ExecuteAQL(query)
}

func (db *SawitDB) Migrate() {
	queries := []string{
		"LAHAN users",
		"LAHAN categories",
		"LAHAN transactions",
		"LAHAN audit_log",
	}
	for _, q := range queries {
		db.ExecuteAQL(q)
	}
}

func (db *SawitDB) Close() {
	db.file.Close()
}
