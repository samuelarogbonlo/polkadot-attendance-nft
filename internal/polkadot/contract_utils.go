package polkadot

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"path/filepath"
	"strings"

	gsrpc "github.com/centrifuge/go-substrate-rpc-client/v4"
	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"github.com/centrifuge/go-substrate-rpc-client/v4/signature"
)

// ContractMetadata represents the metadata of an ink! contract (5.1.1 format)
type ContractMetadata struct {
	Source struct {
		Hash     string `json:"hash"`
		Language string `json:"language"`
		Compiler string `json:"compiler"`
		BuildInfo struct {
			BuildMode            string `json:"build_mode"`
			CargoContractVersion string `json:"cargo_contract_version"`
			RustToolchain        string `json:"rust_toolchain"`
			WasmOptSettings struct {
				KeepDebugSymbols    bool   `json:"keep_debug_symbols"`
				OptimizationPasses  string `json:"optimization_passes"`
			} `json:"wasm_opt_settings"`
		} `json:"build_info"`
	} `json:"source"`
	Contract struct {
		Name        string   `json:"name"`
		Version     string   `json:"version"`
		Authors     []string `json:"authors"`
		Description string   `json:"description,omitempty"`
	} `json:"contract"`
	Spec struct {
		Constructors []struct {
			Args []struct {
				Label string `json:"label"`
				Type  struct {
					DisplayName []string `json:"displayName"`
					Type        int      `json:"type"`
				} `json:"type"`
			} `json:"args"`
			Default    bool     `json:"default"`
			Docs       []string `json:"docs"`
			Label      string   `json:"label"`
			Payable    bool     `json:"payable"`
			ReturnType struct {
				DisplayName []string `json:"displayName"`
				Type        int      `json:"type"`
			} `json:"returnType"`
			Selector   string   `json:"selector"`
		} `json:"constructors"`
		Docs       []string `json:"docs"`
		Events     []struct {
			Args []struct {
				Docs    []string `json:"docs"`
				Indexed bool     `json:"indexed"`
				Label   string   `json:"label"`
				Type    struct {
					DisplayName []string `json:"displayName"`
					Type        int      `json:"type"`
				} `json:"type"`
			} `json:"args"`
			Docs  []string `json:"docs"`
			Label string   `json:"label"`
		} `json:"events"`
		Messages []struct {
			Args []struct {
				Label string `json:"label"`
				Type  struct {
					DisplayName []string `json:"displayName"`
					Type        int      `json:"type"`
				} `json:"type"`
			} `json:"args"`
			Default    bool     `json:"default"`
			Docs       []string `json:"docs"`
			Label      string   `json:"label"`
			Mutates    bool     `json:"mutates"`
			Payable    bool     `json:"payable"`
			ReturnType struct {
				DisplayName []string `json:"displayName"`
				Type        int      `json:"type"`
			} `json:"returnType"`
			Selector   string   `json:"selector"`
		} `json:"messages"`
	} `json:"spec"`
}

// Method represents an ink! contract method
type Method struct {
	Name      string
	Label     string
	Selector  string
	Args      []interface{}
	Mutates   bool
	ReturnType string
}

// LoadContractMetadata loads the contract metadata from a file
func LoadContractMetadata(contractFile string) (*ContractMetadata, error) {
	// First try to load from the direct path
	data, err := ioutil.ReadFile(contractFile)
	if err != nil {
		// If that fails, try to load from the contracts directory
		contractsDir := filepath.Join("..", "contracts", "target", "ink")
		alternativePath := filepath.Join(contractsDir, filepath.Base(contractFile))
		data, err = ioutil.ReadFile(alternativePath)
		if err != nil {
			// Try one more directory level up
			contractsDir = filepath.Join("..", "..", "contracts", "target", "ink")
			alternativePath = filepath.Join(contractsDir, filepath.Base(contractFile))
			data, err = ioutil.ReadFile(alternativePath)
			if err != nil {
				// Try searching for the file by extension
				files, err := filepath.Glob(filepath.Join("..", "contracts", "target", "ink", "*.json"))
				if err != nil || len(files) == 0 {
					files, err = filepath.Glob(filepath.Join("..", "..", "contracts", "target", "ink", "*.json"))
					if err != nil || len(files) == 0 {
						return nil, fmt.Errorf("contract metadata file not found: %s", contractFile)
					}
				}
				// Use the first .json file found
				data, err = ioutil.ReadFile(files[0])
				if err != nil {
					return nil, fmt.Errorf("failed to read contract metadata: %v", err)
				}
				log.Printf("Found contract metadata at: %s", files[0])
			} else {
				log.Printf("Found contract metadata at: %s", alternativePath)
			}
		} else {
			log.Printf("Found contract metadata at: %s", alternativePath)
		}
	} else {
		log.Printf("Loaded contract metadata from: %s", contractFile)
	}

	var metadata ContractMetadata
	if err := json.Unmarshal(data, &metadata); err != nil {
		return nil, fmt.Errorf("failed to parse contract metadata: %v", err)
	}

	return &metadata, nil
}

// FindMethodInMetadata finds a method in the contract metadata
func FindMethodInMetadata(metadata *ContractMetadata, methodName string) (*Method, error) {
	for _, message := range metadata.Spec.Messages {
		if strings.EqualFold(message.Label, methodName) {
			return &Method{
				Name:     methodName,
				Label:    message.Label,
				Selector: message.Selector,
				Mutates:  message.Mutates,
			}, nil
		}
	}
	return nil, fmt.Errorf("method not found in contract metadata: %s", methodName)
}

// hexToBytes converts a hex string (with or without 0x prefix) to bytes
func hexToBytes(hexStr string) ([]byte, error) {
	// Remove 0x prefix if present
	if strings.HasPrefix(hexStr, "0x") {
		hexStr = hexStr[2:]
	}
	return hex.DecodeString(hexStr)
}

// PrepareContractCall prepares a contract call for the given method and arguments
func PrepareContractCall(api *gsrpc.SubstrateAPI, contractAddr types.AccountID, method *Method, args ...interface{}) (types.Call, error) {
	// First get the metadata
	meta, err := api.RPC.State.GetMetadataLatest()
	if err != nil {
		return types.Call{}, fmt.Errorf("failed to get metadata: %v", err)
	}
	
	// Here we would properly encode the method selector and arguments
	// For now, this is a simplified implementation that doesn't actually encode correctly
	
	// In a real implementation, we would:
	// 1. Encode the method selector (usually a 4-byte value)
	// 2. Encode each argument according to its SCALE encoding
	// 3. Concatenate these into the contract call data
	
	// This is a placeholder that doesn't correctly encode the data
	gasLimit := types.NewUCompactFromUInt(1000000000)
	value := types.NewUCompactFromUInt(0) // zero value transfer
	
	// Convert hex string selector (like "0x8067c49f") to bytes
	selector := method.Selector
	if !strings.HasPrefix(selector, "0x") {
		selector = "0x" + selector
	}
	
	// Convert selector to bytes
	selectorBytes, err := hexToBytes(selector)
	if err != nil {
		return types.Call{}, fmt.Errorf("invalid selector format: %v", err)
	}
	
	// For now, just use the selector as the data
	// In a real implementation, we'd append encoded arguments
	
	// Create the contract call
	call, err := types.NewCall(
		meta,
		"Contracts.call",
		contractAddr,
		value,
		gasLimit,
		selectorBytes,
	)
	
	if err != nil {
		return types.Call{}, fmt.Errorf("failed to create contract call: %v", err)
	}
	
	return call, nil
}

// CreateSignedExtrinsic creates a signed extrinsic for a contract call
func CreateSignedExtrinsic(api *gsrpc.SubstrateAPI, call types.Call, keypair signature.KeyringPair) (types.Extrinsic, error) {
	// Get the latest runtime version
	rv, err := api.RPC.State.GetRuntimeVersionLatest()
	if err != nil {
		return types.Extrinsic{}, fmt.Errorf("failed to get runtime version: %v", err)
	}
	
	// Get genesis hash
	genesisHash, err := api.RPC.Chain.GetBlockHash(0)
	if err != nil {
		return types.Extrinsic{}, fmt.Errorf("failed to get genesis hash: %v", err)
	}
	
	// Get the account nonce
	var nonce uint32
	meta, err := api.RPC.State.GetMetadataLatest()
	if err != nil {
		return types.Extrinsic{}, fmt.Errorf("failed to get metadata: %v", err)
	}
	
	key, err := types.CreateStorageKey(meta, "System", "Account", keypair.PublicKey)
	if err != nil {
		return types.Extrinsic{}, fmt.Errorf("failed to create storage key: %v", err)
	}
	
	var accountInfo types.AccountInfo
	ok, err := api.RPC.State.GetStorageLatest(key, &accountInfo)
	if err != nil || !ok {
		// If we couldn't get the account info, assume nonce is 0
		nonce = 0
	} else {
		nonce = uint32(accountInfo.Nonce)
	}
	
	// Get the current block hash
	blockHash, err := api.RPC.Chain.GetBlockHashLatest()
	if err != nil {
		return types.Extrinsic{}, fmt.Errorf("failed to get latest block hash: %v", err)
	}
	
	// Create the extrinsic
	era := types.ExtrinsicEra{IsMortalEra: false} // Use immortal era for simplicity
	
	ext := types.NewExtrinsic(call)
	o := types.SignatureOptions{
		BlockHash:          blockHash,
		Era:                era,
		GenesisHash:        genesisHash,
		Nonce:              types.NewUCompactFromUInt(uint64(nonce)),
		SpecVersion:        rv.SpecVersion,
		Tip:                types.NewUCompactFromUInt(0),
		TransactionVersion: rv.TransactionVersion,
	}
	
	// Sign the extrinsic
	err = ext.Sign(keypair, o)
	if err != nil {
		return types.Extrinsic{}, fmt.Errorf("failed to sign extrinsic: %v", err)
	}
	
	return ext, nil
}

// QueryContractState performs a read-only query of contract state
func QueryContractState(api *gsrpc.SubstrateAPI, contractAddr types.AccountID, method *Method, args ...interface{}) ([]byte, error) {
	// Convert selector to bytes
	selector := method.Selector
	if !strings.HasPrefix(selector, "0x") {
		selector = "0x" + selector
	}
	
	selectorBytes, err := hexToBytes(selector)
	if err != nil {
		return nil, fmt.Errorf("invalid selector format: %v", err)
	}
	
	// This is a placeholder - in a real implementation, we would:
	// 1. Encode the method selector
	// 2. Encode the arguments using SCALE encoding
	// 3. Use the Contracts.call_readonly RPC method
	
	// For now, let's try to at least attempt a real call but handle failures gracefully
	gasLimit := types.NewUCompactFromUInt(1000000000)
	
	// Example of how we might call the contract (if properly implemented)
	origin := types.MultiAddress{
		IsID: true,
		AsID: types.AccountID{}, // empty account ID for now - use real account in production
	}
	
	// This is not fully implemented yet - in a real implementation, we'd:
	// 1. Encode the args properly
	// 2. Use api.RPC.State.Call to make the actual read-only call
	// 3. Decode the results
	
	// For now just return an error but don't crash
	return nil, fmt.Errorf("QueryContractState not fully implemented yet - currently requires mock fallback")
} 