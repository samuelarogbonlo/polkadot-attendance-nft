package polkadot

import (
	"encoding/json"
	"fmt"
	"log"

	gsrpc "github.com/centrifuge/go-substrate-rpc-client/v4"
	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"github.com/samuelarogbonlo/polkadot-attendance-nft/backend/internal/models"
)

// Client handles interactions with the Polkadot blockchain
type Client struct {
	api            *gsrpc.SubstrateAPI
	contractAddr   types.AccountID
	contractCaller ContractCaller
}

// NewClient creates a new Polkadot client
func NewClient(rpcURL, contractAddress string) *Client {
	log.Printf("Connecting to %s...", rpcURL)
	// Connect to Polkadot node
	api, err := gsrpc.NewSubstrateAPI(rpcURL)
	if err != nil {
		log.Printf("Failed to connect to Polkadot node: %v", err)
		log.Printf("Using mock implementation for development")
		// Create a mock API for development
		return &Client{
			contractCaller: NewMockContractCaller(),
		}
	}

	// Parse contract address if provided
	var contractAddr types.AccountID
	if contractAddress != "" {
		// Handle Substrate format address (starting with 5)
		if len(contractAddress) > 0 && contractAddress[0] == '5' {
			// For Substrate addresses, use a different approach
			log.Printf("Using Substrate format address: %s", contractAddress)
			
			// For development, continue with mock implementation
			// In production, implement proper Substrate address handling here
			log.Printf("Substrate address format used in mock mode")
			return &Client{
				api:            api,
				contractCaller: NewMockContractCaller(),
			}
		}
		
		// Handle Ethereum/hex format addresses
		// Remove 0x prefix if present
		if len(contractAddress) > 2 && contractAddress[:2] == "0x" {
			contractAddress = contractAddress[2:]
		}
		
		addr, err := types.NewAccountIDFromHexString(contractAddress)
		if err != nil {
			log.Printf("Invalid contract address '%s': %v", contractAddress, err)
			log.Printf("Using mock implementation for development")
			return &Client{
				api:            api,
				contractCaller: NewMockContractCaller(),
			}
		}
		contractAddr = *addr
		log.Printf("Using contract at address: %s", contractAddress)
	} else {
		log.Printf("No contract address provided, using mock implementation")
	}

	// Create contract caller
	caller := NewContractCaller(api, contractAddr)

	return &Client{
		api:            api,
		contractAddr:   contractAddr,
		contractCaller: caller,
	}
}

// CreateEvent creates a new event in the smart contract
func (c *Client) CreateEvent(name, date, location string) (uint64, error) {
	// Call the smart contract
	result, err := c.contractCaller.Call("create_event", name, date, location)
	if err != nil {
		return 0, fmt.Errorf("failed to create event: %v", err)
	}

	// Parse result
	var eventID uint64
	if err := json.Unmarshal(result, &eventID); err != nil {
		return 0, fmt.Errorf("failed to parse event ID: %v", err)
	}

	return eventID, nil
}

// GetEvent gets an event by ID
func (c *Client) GetEvent(id uint64) (*models.Event, error) {
	// Call the smart contract
	result, err := c.contractCaller.Call("get_event", id)
	if err != nil {
		return nil, fmt.Errorf("failed to get event: %v", err)
	}

	// Check if event exists
	if len(result) == 0 {
		return nil, nil
	}

	// Parse result
	var event models.Event
	if err := json.Unmarshal(result, &event); err != nil {
		return nil, fmt.Errorf("failed to parse event: %v", err)
	}

	return &event, nil
}

// ListEvents lists all events
func (c *Client) ListEvents() ([]models.Event, error) {
	// Get total event count
	countResult, err := c.contractCaller.Call("get_event_count")
	if err != nil {
		return nil, fmt.Errorf("failed to get event count: %v", err)
	}

	var count uint64
	if err := json.Unmarshal(countResult, &count); err != nil {
		return nil, fmt.Errorf("failed to parse event count: %v", err)
	}

	events := make([]models.Event, 0, count)
	for i := uint64(1); i <= count; i++ {
		event, err := c.GetEvent(i)
		if err != nil {
			log.Printf("Failed to get event %d: %v", i, err)
			continue
		}
		if event != nil {
			events = append(events, *event)
		}
	}

	return events, nil
}

// MintNFT mints a new NFT for an attendee
func (c *Client) MintNFT(eventID uint64, recipient string, metadata map[string]interface{}) (bool, error) {
	// Convert metadata to JSON string
	metadataJSON, err := json.Marshal(metadata)
	if err != nil {
		return false, fmt.Errorf("failed to marshal metadata: %v", err)
	}

	// Call the smart contract
	result, err := c.contractCaller.Call("mint_nft", eventID, recipient, string(metadataJSON))
	if err != nil {
		return false, fmt.Errorf("failed to mint NFT: %v", err)
	}

	// Parse result
	var success bool
	if err := json.Unmarshal(result, &success); err != nil {
		return false, fmt.Errorf("failed to parse result: %v", err)
	}

	return success, nil
}

// ListNFTs lists all NFTs
func (c *Client) ListNFTs() ([]models.NFT, error) {
	// Get total NFT count
	countResult, err := c.contractCaller.Call("get_nft_count")
	if err != nil {
		return nil, fmt.Errorf("failed to get NFT count: %v", err)
	}

	var count uint64
	if err := json.Unmarshal(countResult, &count); err != nil {
		return nil, fmt.Errorf("failed to parse NFT count: %v", err)
	}

	nfts := make([]models.NFT, 0)

	// For development purposes, return mock data if no NFTs exist
	if count == 0 {
		return []models.NFT{
			{
				ID:      1,
				EventID: 1,
				Owner:   "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
				Metadata: map[string]interface{}{
					"name":        "Attendance: Polkadot Meetup",
					"description": "Proof of attendance for Polkadot Meetup",
					"event_name":  "Polkadot Meetup",
					"event_date":  "2023-06-01",
					"location":    "Berlin",
					"attendee":    "John Doe",
				},
			},
		}, nil
	}

	// In a real implementation, we would fetch each NFT
	// This is a simplified version that returns mock data
	return nfts, nil
}