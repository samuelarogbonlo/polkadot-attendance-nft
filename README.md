# Polkadot Attendance NFT System

A blockchain-based proof of attendance NFT system for Polkadot events, integrated with the Luma platform.

## Overview

This dApp enables attendees of Polkadot events to receive proof of attendance NFTs directly to their wallets when they check in via the Luma platform. Using Luma's existing scanner functionality, event organizers scan attendees' QR codes at the venue, triggering automatic NFT minting and distribution to attendees' wallets.

## Features

- NFT generation for event attendance
- Integration with Luma event platform
- Automatic minting when attendees check-in
- Admin dashboard for event management
- Mobile-friendly frontend

## Architecture

The system consists of:

1. **Smart Contract**: Written in ink! (Rust) for the Polkadot ecosystem
2. **Backend API**: Go service handling Luma webhook integration and NFT minting
3. **Frontend**: React-based dashboard for event management

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) with `nightly` toolchain
- [cargo-contract](https://github.com/paritytech/cargo-contract) for ink! contract compilation
- [Go](https://golang.org/doc/install) 1.20 or higher
- [Node.js](https://nodejs.org/) 16.x or higher
- [Polkadot.js Extension](https://polkadot.js.org/extension/) for wallet interaction
- Access to a Polkadot node (local or remote)
- Luma platform account with API access

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/polkadot-attendance-nft.git
cd polkadot-attendance-nft
```

### 2. Build and deploy the smart contract

```bash
# Install Rust and the ink! contract toolchain
rustup default nightly
rustup target add wasm32-unknown-unknown
cargo install cargo-contract --force

# Build the contract
cd contracts
cargo +nightly contract build
cd ..

# Deploy the contract (to a local development node)
# For production, use the appropriate network and account
node scripts/deploy_contract.js local alice
```

### 3. Set up the backend server

```bash
# Navigate to the backend directory
cd backend

# Build the backend
go build -o attendance-nft ./cmd/server

# Run the server
# For production, set the environment variables appropriately
./attendance-nft
```

Configuration via environment variables:

- `SERVER_ADDRESS`: HTTP server address (default: `:8080`)
- `POLKADOT_RPC`: Polkadot node RPC endpoint (default: `wss://rpc.polkadot.io`)
- `CONTRACT_ADDRESS`: Deployed contract address
- `LUMA_API_KEY`: Luma API key
- `LUMA_WEBHOOK_KEY`: Luma webhook signing key

Alternatively, create a `config.json` file in the backend directory:

```json
{
  "server_address": ":8080",
  "polkadot_rpc": "wss://rpc.polkadot.io",
  "contract_address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "luma_api_key": "your-luma-api-key",
  "luma_webhook_key": "your-luma-webhook-key"
}
```

### 4. Set up the frontend

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:8080/api" > .env
echo "REACT_APP_POLKADOT_RPC=wss://rpc.polkadot.io" >> .env

# Start the development server
npm start
```

For production, build the frontend:

```bash
npm run build
```

## Luma Integration

### Setting up Luma

1. Create an event on Luma platform
2. Go to the event settings and find the API/Developer section
3. Generate an API key for your event
4. Set up a webhook to point to your backend: `https://your-server.com/api/webhook/check-in`
5. Add a custom field for attendees to enter their Polkadot wallet address

### Testing the Integration

1. Create an event in both Luma and the Attendance NFT system
2. Register an attendee for the event with a valid Polkadot wallet address
3. Use the Luma app to scan the attendee's QR code
4. The system should mint an NFT and send it to the attendee's wallet

## Development

### Running tests

#### Smart Contract Tests

```bash
cd contracts
cargo +nightly test
```

#### Backend Tests

```bash
cd backend
go test ./...
```

#### Frontend Tests

```bash
cd frontend
npm test
```

### Development Workflow

For local development:

1. Run a local Polkadot node:
   ```bash
   docker run -p 9944:9944 parity/polkadot:latest --dev --ws-external
   ```

2. Deploy the contract to the local node:
   ```bash
   node scripts/deploy_contract.js local alice
   ```

3. Run the backend and frontend in development mode

## Deployment

### Production Deployment Checklist

1. Build and deploy the smart contract to the appropriate Polkadot network
2. Set up secure key management for the contract deployer account
3. Configure environment variables for production
4. Build and deploy the backend server
5. Set up HTTPS for the backend API
6. Build and deploy the frontend to a static hosting service
7. Configure Luma webhooks with the production backend URL

## License

MIT / Apache 2.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.