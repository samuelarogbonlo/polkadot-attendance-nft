package api

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/samuelarogbonlo/polkadot-attendance-nft/backend/internal/polkadot"
)

// AdminHandler handles admin API endpoints
type AdminHandler struct {
	polkadotClient *polkadot.Client
}

// NewAdminHandler creates a new admin API handler
func NewAdminHandler(polkadotClient *polkadot.Client) *AdminHandler {
	return &AdminHandler{
		polkadotClient: polkadotClient,
	}
}

// EventRequest represents a request to create an event
type EventRequest struct {
	Name     string `json:"name" binding:"required,min=3,max=100"`
	Date     string `json:"date" binding:"required"`
	Location string `json:"location" binding:"required,min=2,max=100"`
}

// validateDate checks if a date string is valid
func validateDate(date string) bool {
	_, err := time.Parse("2006-01-02", date)
	return err == nil
}

// CreateEvent creates a new event
func (h *AdminHandler) CreateEvent(c *gin.Context) {
	var req EventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Additional validation
	if !validateDate(req.Date) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	if strings.TrimSpace(req.Name) == "" || strings.TrimSpace(req.Location) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name and location cannot be empty or just whitespace"})
		return
	}

	// Create event
	eventID, err := h.polkadotClient.CreateEvent(req.Name, req.Date, req.Location)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get created event
	event, err := h.polkadotClient.GetEvent(eventID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, event)
}

// ListEvents lists all events
func (h *AdminHandler) ListEvents(c *gin.Context) {
	events, err := h.polkadotClient.ListEvents()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, events)
}

// GetEvent gets an event by ID
func (h *AdminHandler) GetEvent(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	event, err := h.polkadotClient.GetEvent(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if event == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	c.JSON(http.StatusOK, event)
}

// ListNFTs lists all NFTs
func (h *AdminHandler) ListNFTs(c *gin.Context) {
	nfts, err := h.polkadotClient.ListNFTs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, nfts)
}