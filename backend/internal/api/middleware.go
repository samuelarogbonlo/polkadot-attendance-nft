package api

import (
	"errors"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/samuelarogbonlo/polkadot-attendance-nft/backend/internal/config"
)

// BasicAuthMiddleware provides basic authentication for admin routes
func BasicAuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the Authorization header
		auth := c.GetHeader("Authorization")
		if auth == "" {
			c.Header("WWW-Authenticate", "Basic realm=Authorization Required")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization required"})
			return
		}

		// Check if it's a Basic auth header
		if !strings.HasPrefix(auth, "Basic ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid authentication method"})
			return
		}

		// Validate credentials
		if !gin.BasicAuth(gin.Accounts{
			cfg.AdminUsername: cfg.AdminPassword,
		})(c) {
			return
		}

		c.Next()
	}
}

// RateLimiter defines a rate limiting middleware
type RateLimiter struct {
	requests      map[string][]time.Time
	mutex         sync.Mutex
	requestsLimit int
	timeWindow    time.Duration
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(requestsPerMinute int) *RateLimiter {
	return &RateLimiter{
		requests:      make(map[string][]time.Time),
		mutex:         sync.Mutex{},
		requestsLimit: requestsPerMinute,
		timeWindow:    time.Minute,
	}
}

// RateLimitMiddleware provides rate limiting functionality
func (rl *RateLimiter) RateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		rl.mutex.Lock()
		defer rl.mutex.Unlock()

		now := time.Now()
		ip := c.ClientIP()

		// Remove old timestamps
		var recent []time.Time
		for _, t := range rl.requests[ip] {
			if now.Sub(t) <= rl.timeWindow {
				recent = append(recent, t)
			}
		}
		rl.requests[ip] = recent

		// Check if limit reached
		if len(recent) >= rl.requestsLimit {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Rate limit exceeded. Try again later.",
			})
			return
		}

		// Add current request timestamp
		rl.requests[ip] = append(rl.requests[ip], now)
		c.Next()
	}
}

// ValidateContractAddress validates and formats contract addresses
func ValidateContractAddress(address string) string {
	// If address is empty, return empty
	if address == "" {
		return ""
	}

	// If address doesn't start with 0x, add it
	if !strings.HasPrefix(address, "0x") {
		return "0x" + address
	}

	return address
}

// JWTAuthMiddleware validates the JWT token in the Authorization header
func JWTAuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer {token}"})
			return
		}

		tokenStr := parts[1]
		claims := jwt.MapClaims{}

		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		// Add wallet address to context
		walletAddress, ok := claims["walletAddress"].(string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}
		
		c.Set("walletAddress", walletAddress)
		c.Next()
	}
}

// OwnershipMiddleware checks if the user owns the requested event
func OwnershipMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// This middleware would check if the authenticated wallet address
		// is the owner of the resource being accessed
		// For now, we'll implement a permissionless system where any
		// authenticated user can access everything

		c.Next()
	}
} 