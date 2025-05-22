package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/samuelarogbonlo/polkadot-attendance-nft/backend/internal/database"
	"github.com/samuelarogbonlo/polkadot-attendance-nft/backend/internal/polkadot"
)

// UserHandler handles user-related API endpoints
type UserHandler struct {
	polkadotClient *polkadot.Client
	eventRepo      *database.EventRepository
	nftRepo        *database.NFTRepository
	userRepo       *database.UserRepository
}

// NewUserHandler creates a new user API handler
func NewUserHandler(
	polkadotClient *polkadot.Client,
	eventRepo *database.EventRepository,
	nftRepo *database.NFTRepository,
	userRepo *database.UserRepository,
) *UserHandler {
	return &UserHandler{
		polkadotClient: polkadotClient,
		eventRepo:      eventRepo,
		nftRepo:        nftRepo,
		userRepo:       userRepo,
	}
}

// GetProfile gets the user's profile information
func (h *UserHandler) GetProfile(c *gin.Context) {
	// Get user ID from the JWT
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in token"})
		return
	}

	// Get user by wallet address (user ID is the wallet address)
	user, err := h.userRepo.GetByWalletAddress(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Update last login time
	if err := h.userRepo.UpdateLastLogin(user.ID); err != nil {
		// Log the error but continue
		c.Error(err)
	}

	c.JSON(http.StatusOK, user)
}

// GetUserEvents gets all events the user has permission for
func (h *UserHandler) GetUserEvents(c *gin.Context) {
	// Get user ID from the JWT
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in token"})
		return
	}

	// Get user by wallet address
	user, err := h.userRepo.GetByWalletAddress(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// For now, return all events (we'll implement permissions later)
	events, err := h.eventRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, events)
}

// GetUserNFTs gets all NFTs owned by the user
func (h *UserHandler) GetUserNFTs(c *gin.Context) {
	// Get user ID from the JWT
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in token"})
		return
	}

	// Get NFTs owned by the user
	nfts, err := h.nftRepo.GetAllByOwner(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, nfts)
} 