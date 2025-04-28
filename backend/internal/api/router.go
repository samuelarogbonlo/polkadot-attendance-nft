package api

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/samuelarogbonlo/polkadot-attendance-nft/backend/internal/config"
	"github.com/samuelarogbonlo/polkadot-attendance-nft/backend/internal/luma"
	"github.com/samuelarogbonlo/polkadot-attendance-nft/backend/internal/polkadot"
)

// NewRouter creates a new router with all the routes defined
func NewRouter(cfg *config.Config, client *polkadot.Client) *gin.Engine {
	router := gin.Default()

	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Create clients
	lumaClient := luma.NewClient(cfg.LumaAPIKey)

	// Create handlers
	adminHandler := NewAdminHandler(client)
	lumaHandler := NewLumaHandler(lumaClient, client, cfg.LumaWebhookKey)
	authHandler := NewAuthHandler(cfg.JWTSecret)

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Public auth routes
	router.POST("/api/auth", authHandler.Authenticate)

	// Admin routes - protected by JWT auth now
	adminRoutes := router.Group("/api/admin")
	adminRoutes.Use(JWTAuthMiddleware(cfg.JWTSecret))
	{
		adminRoutes.POST("/events", adminHandler.CreateEvent)
		adminRoutes.GET("/events", adminHandler.ListEvents)
		adminRoutes.GET("/events/:id", adminHandler.GetEvent)
		adminRoutes.GET("/nfts", adminHandler.ListNFTs)
	}

	// Webhook routes
	webhookRoutes := router.Group("/api/webhook")
	{
		webhookRoutes.POST("/check-in", lumaHandler.HandleCheckIn)
	}

	return router
}