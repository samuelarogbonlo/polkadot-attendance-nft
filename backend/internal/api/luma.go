package api

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"io/ioutil"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/samuelarogbonlo/polkadot-attendance-nft/backend/internal/luma"
	"github.com/samuelarogbonlo/polkadot-attendance-nft/backend/internal/models"
	"github.com/samuelarogbonlo/polkadot-attendance-nft/backend/internal/polkadot"
)

// LumaHandler handles Luma webhook events
type LumaHandler struct {
	lumaClient     *luma.Client
	polkadotClient *polkadot.Client
	webhookKey     string
}

// NewLumaHandler creates a new Luma webhook handler
func NewLumaHandler(lumaClient *luma.Client, polkadotClient *polkadot.Client, webhookKey string) *LumaHandler {
	return &LumaHandler{
		lumaClient:     lumaClient,
		polkadotClient: polkadotClient,
		webhookKey:     webhookKey,
	}
}

// HandleCheckIn processes Luma check-in events
func (h *LumaHandler) HandleCheckIn(c *gin.Context) {
	// Verify webhook signature
	signature := c.GetHeader("X-Luma-Signature")
	if !h.verifySignature(c.Request, signature) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid webhook signature"})
		return
	}

	var checkIn models.CheckInEvent
	if err := c.ShouldBindJSON(&checkIn); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get attendee's wallet address from Luma
	attendee, err := h.lumaClient.GetAttendee(checkIn.AttendeeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get attendee: " + err.Error()})
		return
	}

	// Verify wallet address is present
	if attendee.WalletAddress == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Attendee has no wallet address"})
		return
	}

	// Get event details
	event, err := h.lumaClient.GetEvent(checkIn.EventID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get event: " + err.Error()})
		return
	}

	// Convert Luma event ID to internal event ID
	// In a real implementation, you would store a mapping between Luma event IDs and internal event IDs
	// For simplicity, we're using a mock ID of 1 here
	internalEventID := uint64(1)

	// Create NFT metadata
	metadata := map[string]interface{}{
		"name":        "Attendance: " + event.Name,
		"description": "Proof of attendance for " + event.Name,
		"event_id":    checkIn.EventID,
		"event_name":  event.Name,
		"event_date":  event.Date,
		"location":    event.Location,
		"attendee":    attendee.Name,
	}

	// Mint NFT
	success, err := h.polkadotClient.MintNFT(internalEventID, attendee.WalletAddress, metadata)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mint NFT: " + err.Error()})
		return
	}

	if !success {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mint NFT"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"message": "NFT minted successfully",
		"attendee": attendee.Name,
		"wallet": attendee.WalletAddress,
		"event": event.Name,
	})
}

// verifySignature verifies the webhook signature
func (h *LumaHandler) verifySignature(req *http.Request, signature string) bool {
	// If webhook key is not set, skip verification in development
	if h.webhookKey == "" {
		return true
	}

	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		return false
	}

	// Reset the request body for later reading
	req.Body = ioutil.NopCloser(bytes.NewBuffer(body))

	// Compute HMAC using the webhook key
	mac := hmac.New(sha256.New, []byte(h.webhookKey))
	mac.Write(body)
	expectedSignature := hex.EncodeToString(mac.Sum(nil))

	return hmac.Equal([]byte(signature), []byte(expectedSignature))
}