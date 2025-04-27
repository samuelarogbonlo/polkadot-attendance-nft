# Polkadot Attendance NFT System - Development Guide

This guide provides instructions for setting up and working with the Polkadot Attendance NFT System in a development environment.

## Project Structure

The project is organized as follows:

```
polkadot-attendance-nft/
├── frontend/              # React web application
├── backend/               # Go API server
│   ├── cmd/               # Command-line entry points
│   ├── internal/          # Internal packages
│   │   ├── api/           # API handlers
│   │   ├── config/        # Configuration
│   │   ├── middleware/    # HTTP middleware
│   │   └── polkadot/      # Polkadot integration
├── contracts/             # Smart contracts (if applicable)
└── docs/                  # Documentation
```

## Prerequisites

To develop for this project, you'll need:

- Node.js (v16+) and npm for frontend development
- Go (v1.19+) for backend development
- Git for version control
- A Polkadot.js browser extension with test accounts
- Access to a Polkadot node (local or testnet)
- Docker (optional, for containerized development)

## First-time Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-organization/polkadot-attendance-nft.git
cd polkadot-attendance-nft
```

### 2. Frontend Setup

```bash
cd frontend
npm install
# Create development environment file
cp .env.example .env.local
# Edit .env.local with your development settings
```

### 3. Backend Setup

```bash
cd backend
go mod download
# Create development config
cp config.json.example config.json
# Edit config.json with your development settings
```

## Running in Development Mode

### Frontend

```bash
cd frontend
npm start
```

This will start the React development server at http://localhost:3000.

### Backend

```bash
cd backend
go run cmd/server/main.go
```

This will start the API server at http://localhost:8080.

## Development Workflow

### Frontend Development

The frontend is a React application with the following key components:

- **React**: UI library
- **Material UI**: Component library for styling
- **Redux** (if used): State management
- **React Router**: Routing
- **Polkadot.js**: Integration with Polkadot wallets

#### Adding a New Component

1. Create a new component file in `frontend/src/components/`
2. Import and use components from Material UI
3. If the component needs to interact with the blockchain:
   - Use the Polkadot hooks provided in `frontend/src/hooks/usePolkadot.js`
   - Test with mock data before integrating with the blockchain

#### Working with API Services

API services are defined in `frontend/src/services/api.js`. When adding a new API endpoint:

1. Add a new method to the API service
2. Use the standard error handling provided
3. Test with mock data before connecting to the backend

### Backend Development

The backend is a Go API server with the following key components:

- **HTTP Server**: Handles API requests
- **Polkadot Integration**: Connects to Polkadot nodes
- **Middleware**: Handles authentication, logging, etc.
- **Luma Integration**: Handles webhook events from Luma

#### Adding a New API Endpoint

1. Define the handler function in the appropriate file in `backend/internal/api/`
2. Register the endpoint in `backend/internal/api/router.go`
3. Add validation logic if needed
4. Test the endpoint with unit tests

#### Working with Polkadot

The Polkadot integration is in `backend/internal/polkadot/`. When working with Polkadot:

1. Use the `Client` struct for blockchain interactions
2. Test with a local node or testnet before using mainnet
3. Handle errors appropriately, as blockchain operations can fail

## Testing

### Frontend Testing

```bash
cd frontend
npm test
```

Frontend tests use Jest and React Testing Library. When writing tests:

- Test component rendering
- Test user interactions
- Mock API calls and blockchain interactions

### Backend Testing

```bash
cd backend
go test ./...
```

Backend tests use Go's testing package. When writing tests:

- Use table-driven tests for handlers
- Mock external dependencies
- Test both success and error cases

## Debugging

### Frontend Debugging

- Use the browser's developer tools (F12)
- Use `console.log()` for temporary debugging
- Use the React Developer Tools browser extension

### Backend Debugging

- Use `fmt.Println()` or the logger for temporary debugging
- Use Delve for advanced debugging:
  ```bash
  go install github.com/go-delve/delve/cmd/dlv@latest
  dlv debug cmd/server/main.go
  ```

## Mock Services

During development, you might want to use mock services:

### Mock Polkadot Node

The backend supports a mock mode for Polkadot interactions. To enable it:

- In your `config.json`, set `"mock_mode": true`
- The mock service is defined in `backend/internal/polkadot/mock.go`

### Mock Luma Events

To test Luma webhook integration:

- Use curl to send mock webhook events:
  ```bash
  curl -X POST http://localhost:8080/webhook/luma \
    -H "Content-Type: application/json" \
    -d @test/fixtures/luma-check-in-event.json
  ```

## Code Style and Conventions

### Frontend Style Guide

- Use functional components with hooks
- Use Material UI for styling
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

### Backend Style Guide

- Follow [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- Use dependency injection for testability
- Use structured logging

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Run all tests
4. Submit a pull request
5. Ask for a code review
6. Address review comments
7. Merge when approved

## Working with Environment Variables

### Frontend Environment Variables

Environment variables for the frontend are defined in:
- `.env.local` (development, not in git)
- `.env.development` (default development values)
- `.env.production` (production values)

Access these variables in code using `process.env.REACT_APP_*`.

### Backend Environment Variables

The backend can load configuration from:
- Environment variables
- `config.json` file

Priority is given to environment variables over the config file.

## Common Issues and Solutions

### "No Polkadot Extension Found"

- Install the Polkadot.js extension
- Make sure it's enabled for the development site

### "Invalid Contract Address"

- Check that the contract address in your environment matches a deployed contract
- Verify that you're connected to the correct network

### CORS Issues

- Make sure the backend server has CORS enabled for your frontend domain
- Check that the frontend is calling the correct API URL

## Advanced Development Topics

### Custom Contract Integration

If you need to customize the contract interaction:

1. Update the ABI in `backend/internal/polkadot/contract/abi.json`
2. Update the caller methods in `backend/internal/polkadot/client.go`

### Performance Optimization

- Use React.memo for components that render frequently
- Use useMemo and useCallback for expensive computations
- Use pagination for large data sets

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed information on how to contribute to this project. 