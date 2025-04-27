package config

import (
	"encoding/json"
	"log"
	"os"
)

// RateLimit holds rate limiting configuration
type RateLimit struct {
	Enabled           bool `json:"enabled"`
	RequestsPerMinute int  `json:"requests_per_minute"`
}

// Config holds all configuration for the application
type Config struct {
	ServerAddress   string    `json:"server_address"`
	PolkadotRPC     string    `json:"polkadot_rpc"`
	ContractAddress string    `json:"contract_address"`
	LumaAPIKey      string    `json:"luma_api_key"`
	LumaWebhookKey  string    `json:"luma_webhook_key"`
	JWTSecret       string    `json:"jwt_secret"`
	AdminUser       string    `json:"admin_user"`
	AdminPassword   string    `json:"admin_password"`
	RateLimit       RateLimit `json:"rate_limit"`
}

// Load loads configuration from environment variables or a config file
func Load() *Config {
	cfg := &Config{
		ServerAddress:   getEnv("SERVER_ADDRESS", ":8080"),
		PolkadotRPC:     getEnv("POLKADOT_RPC", "wss://westend-rpc.polkadot.io"),
		ContractAddress: getEnv("CONTRACT_ADDRESS", ""),
		LumaAPIKey:      getEnv("LUMA_API_KEY", ""),
		LumaWebhookKey:  getEnv("LUMA_WEBHOOK_KEY", ""),
		JWTSecret:       getEnv("JWT_SECRET", "polkadot-attendance-secret-key"),
		AdminUser:       getEnv("ADMIN_USER", "admin"),
		AdminPassword:   getEnv("ADMIN_PASSWORD", "password"),
		RateLimit: RateLimit{
			Enabled:           true,
			RequestsPerMinute: 60,
		},
	}

	// Check if config file exists and load it
	if _, err := os.Stat("config.json"); err == nil {
		file, err := os.Open("config.json")
		if err != nil {
			log.Printf("Error opening config file: %v", err)
		} else {
			defer file.Close()
			decoder := json.NewDecoder(file)
			if err := decoder.Decode(cfg); err != nil {
				log.Printf("Error decoding config file: %v", err)
			}
		}
	}

	return cfg
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}