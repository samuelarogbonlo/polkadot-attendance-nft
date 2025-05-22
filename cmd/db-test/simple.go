package main

import (
	"fmt"
	"log"
	"os"

	"github.com/samuelarogbonlo/polkadot-attendance-nft/backend/internal/config"
	"github.com/samuelarogbonlo/polkadot-attendance-nft/backend/internal/database"
)

func main() {
	// Load configuration
	cfg := config.Load()

	log.Printf("Connecting to database at %s:%d...", cfg.Database.Host, cfg.Database.Port)

	// Initialize database
	db, err := database.New(database.Config{
		Host:     cfg.Database.Host,
		Port:     cfg.Database.Port,
		User:     cfg.Database.User,
		Password: cfg.Database.Password,
		DBName:   cfg.Database.DBName,
		SSLMode:  cfg.Database.SSLMode,
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	log.Println("Database connection successful.")

	// Run migrations
	log.Println("Running database migrations...")
	if err := db.MigrateUp(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	log.Println("Migrations completed successfully. Database is ready!")

	fmt.Println("\n✅ Database is properly set up and working!\n")
	os.Exit(0)
} 