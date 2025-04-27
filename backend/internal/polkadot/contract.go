package polkadot

import (
	"encoding/json"
	"fmt"

	gsrpc "github.com/centrifuge/go-substrate-rpc-client/v4"
	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"github.com/samuelarogbonlo/polkadot-attendance-nft/backend/internal/models"
)

// ContractCaller interface for calling smart contracts
type ContractCaller interface {
	Call(method string, args ...interface{}) ([]byte, error)
}

// RealContractCaller implements the ContractCaller interface for real blockchain interactions
type RealContractCaller struct {
	api          *gsrpc.SubstrateAPI
	contractAddr types.AccountID
}

// NewContractCaller creates a new contract caller
func NewContractCaller(api *gsrpc.SubstrateAPI, contractAddr types.AccountID) ContractCaller {
	// If we have a valid API and contract address, return a real caller
	if api != nil && contractAddr != (types.AccountID{}) {
		return &RealContractCaller{
			api:          api,
			contractAddr: contractAddr,
		}
	}

	// Otherwise return a mock caller
	return NewMockContractCaller()
}

// Call calls a smart contract method
func (c *RealContractCaller) Call(method string, args ...interface{}) ([]byte, error) {
	// In a real implementation, this would use the Polkadot.js API to call the contract
	// This would require more complex code to handle contract calls, account management, etc.
	// For now, we'll fall back to the mock implementation

	mockCaller := NewMockContractCaller()
	return mockCaller.Call(method, args...)
}

// MockContractCaller provides a mock implementation for development
type MockContractCaller struct {
	events map[uint64]models.Event
	nfts   map[uint64]models.NFT
	eventCount uint64
	nftCount   uint64
}

// NewMockContractCaller creates a new mock contract caller with some initial data
func NewMockContractCaller() *MockContractCaller {
	events := map[uint64]models.Event{
		1: {
			ID:        1,
			Name:      "Polkadot Meetup",
			Date:      "2023-06-01",
			Location:  "Berlin",
			Organizer: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
		},
	}

	return &MockContractCaller{
		events:     events,
		nfts:       make(map[uint64]models.NFT),
		eventCount: 1,
		nftCount:   0,
	}
}

// Call mocks a smart contract method call
func (c *MockContractCaller) Call(method string, args ...interface{}) ([]byte, error) {
	switch method {
	case "create_event":
		if len(args) < 3 {
			return nil, fmt.Errorf("create_event requires 3 arguments")
		}

		name, ok1 := args[0].(string)
		date, ok2 := args[1].(string)
		location, ok3 := args[2].(string)

		if !ok1 || !ok2 || !ok3 {
			return nil, fmt.Errorf("invalid argument types")
		}

		c.eventCount++
		eventID := c.eventCount

		c.events[eventID] = models.Event{
			ID:        eventID,
			Name:      name,
			Date:      date,
			Location:  location,
			Organizer: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", // Mock organizer
		}

		return json.Marshal(eventID)

	case "get_event":
		if len(args) < 1 {
			return nil, fmt.Errorf("get_event requires 1 argument")
		}

		id, ok := args[0].(uint64)
		if !ok {
			return nil, fmt.Errorf("invalid event ID type")
		}

		event, exists := c.events[id]
		if !exists {
			return []byte{}, nil
		}

		return json.Marshal(event)

	case "mint_nft":
		if len(args) < 3 {
			return nil, fmt.Errorf("mint_nft requires 3 arguments")
		}

		eventID, ok1 := args[0].(uint64)
		recipient, ok2 := args[1].(string)
		metadataJSON, ok3 := args[2].(string)

		if !ok1 || !ok2 || !ok3 {
			return nil, fmt.Errorf("invalid argument types")
		}

		// Check if event exists
		_, exists := c.events[eventID]
		if !exists {
			return json.Marshal(false)
		}

		// Parse metadata
		var metadata map[string]interface{}
		if err := json.Unmarshal([]byte(metadataJSON), &metadata); err != nil {
			return nil, fmt.Errorf("invalid metadata JSON: %v", err)
		}

		c.nftCount++
		nftID := c.nftCount

		c.nfts[nftID] = models.NFT{
			ID:       nftID,
			EventID:  eventID,
			Owner:    recipient,
			Metadata: metadata,
		}

		return json.Marshal(true)

	case "get_nft_count":
		return json.Marshal(c.nftCount)

	case "get_event_count":
		return json.Marshal(c.eventCount)

	default:
		return nil, fmt.Errorf("unknown method: %s", method)
	}
}