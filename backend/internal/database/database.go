package database

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq" // PostgreSQL driver
)

// Config represents database configuration
type Config struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// DB is a wrapper around *sql.DB with additional functionality
type DB struct {
	*sql.DB
}

// New creates a new database connection
func New(config Config) (*DB, error) {
	// Construct connection string
	connStr := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		config.Host, config.Port, config.User, config.Password, config.DBName, config.SSLMode,
	)

	// Open database connection
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	log.Printf("Connected to database %s at %s:%d", config.DBName, config.Host, config.Port)

	return &DB{db}, nil
}

// MigrateUp performs database migrations
func (db *DB) MigrateUp() error {
	// Create events table if it doesn't exist
	if _, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS events (
			id SERIAL PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			date DATE NOT NULL,
			location VARCHAR(100) NOT NULL,
			organizer VARCHAR(100) NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT NOW()
		)
	`); err != nil {
		return fmt.Errorf("failed to create events table: %w", err)
	}

	// Create NFTs table if it doesn't exist
	if _, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS nfts (
			id SERIAL PRIMARY KEY,
			event_id INTEGER NOT NULL REFERENCES events(id),
			owner VARCHAR(100) NOT NULL,
			metadata JSONB NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT NOW(),
			tx_hash VARCHAR(100),
			confirmed BOOLEAN NOT NULL DEFAULT FALSE
		)
	`); err != nil {
		return fmt.Errorf("failed to create nfts table: %w", err)
	}

	// Create users table if it doesn't exist
	if _, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			wallet_address VARCHAR(100) NOT NULL UNIQUE,
			username VARCHAR(100),
			created_at TIMESTAMP NOT NULL DEFAULT NOW(),
			last_login TIMESTAMP
		)
	`); err != nil {
		return fmt.Errorf("failed to create users table: %w", err)
	}

	// Create event_permissions table if it doesn't exist
	if _, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS event_permissions (
			id SERIAL PRIMARY KEY,
			event_id INTEGER NOT NULL REFERENCES events(id),
			user_id INTEGER NOT NULL REFERENCES users(id),
			role VARCHAR(20) NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT NOW(),
			UNIQUE(event_id, user_id)
		)
	`); err != nil {
		return fmt.Errorf("failed to create event_permissions table: %w", err)
	}

	log.Println("Database migrations completed successfully")
	return nil
} 