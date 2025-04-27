# Polkadot Attendance NFT System - Architecture

This document outlines the architecture of the Polkadot Attendance NFT System, designed to manage event attendance tracking and NFT distribution.

## System Overview

The Polkadot Attendance NFT System is designed to streamline the process of verifying event attendance and distributing commemorative NFTs. The platform enables event organizers to create events, generate QR codes for check-ins, and automatically mint NFTs for attendees who have checked in at the event.

![System Architecture Diagram](../assets/system-architecture.png)

## Core Components

### 1. Frontend Application

The frontend is a React application with the following key features:

- **Admin Dashboard**: For event organizers to create and manage events
- **Public Event Gallery**: Displays all events and their details
- **NFT Gallery**: Shows minted NFTs for events
- **Polkadot.js Integration**: For wallet connectivity and blockchain interactions
- **Responsive Design**: Material UI components for a consistent user experience

#### Technology Stack
- React.js
- Material UI
- Polkadot.js API

### 2. Backend Server

The backend is a Go API server that handles:

- **API Endpoints**: For creating and managing events and NFTs
- **Authentication**: Secure admin access using Polkadot wallet signatures
- **Blockchain Interaction**: Integration with Polkadot/Substrate chains
- **Webhook Processing**: Handling event check-in notifications from Luma

#### Technology Stack
- Go
- Gorilla Mux (HTTP routing)
- Substrate Go Client

### 3. Smart Contract (Optional)

If used, the smart contract is deployed on a Polkadot/Substrate chain and manages:

- Event registration
- NFT minting and ownership
- Attendance verification

#### Technology Stack
- ink! (Substrate-based smart contract language)
- Polkadot/Substrate chain

## Data Flow

1. **Event Creation**:
   - Admin creates an event via the Admin Dashboard
   - Backend validates and stores event details
   - (Optional) Event is registered on the blockchain

2. **Check-in Process**:
   - Attendee checks in at event using QR code
   - Luma (or similar service) sends webhook to backend
   - Backend verifies the check-in

3. **NFT Minting**:
   - Backend initiates NFT minting for verified attendees
   - Smart contract (or backend) mints NFT
   - NFT is assigned to attendee's wallet address

4. **NFT Viewing**:
   - Attendees can view their NFTs in the NFT Gallery
   - NFTs display event details and attendance proof

## Database Schema

The system uses the following data models:

### Event

```
{
  "id": "string",
  "name": "string",
  "description": "string",
  "date": "timestamp",
  "location": "string",
  "imageUrl": "string",
  "organizerId": "string",
  "attendees": ["string"],
  "maxAttendees": "number",
  "created_at": "timestamp"
}
```

### NFT

```
{
  "id": "string",
  "eventId": "string",
  "recipientAddress": "string",
  "metadata": {
    "name": "string",
    "description": "string",
    "image": "string",
    "attributes": [
      {
        "trait_type": "string",
        "value": "string"
      }
    ]
  },
  "txHash": "string",
  "created_at": "timestamp"
}
```

### User

```
{
  "walletAddress": "string",
  "role": "string",
  "eventsCreated": ["string"],
  "nftsOwned": ["string"],
  "created_at": "timestamp",
  "last_login": "timestamp"
}
```

## Authentication Flow

1. **Connection Request**:
   - User connects their Polkadot wallet
   - Frontend requests signature to verify wallet ownership

2. **Authentication**:
   - Backend verifies signature
   - If valid, issues JWT token
   - Token contains user's wallet address and role

3. **Authorization**:
   - Backend middleware verifies JWT for protected routes
   - Checks user role for admin-only operations

## API Endpoints

### Public Endpoints

- `GET /api/events`: List all events
- `GET /api/events/:id`: Get event details
- `GET /api/nfts`: List all NFTs (paginated)
- `GET /api/nfts/:id`: Get NFT details
- `GET /api/health`: Health check

### Protected Endpoints

- `POST /api/events`: Create new event (admin only)
- `PUT /api/events/:id`: Update event (admin only)
- `DELETE /api/events/:id`: Delete event (admin only)
- `POST /api/nfts/mint`: Mint NFT (admin only)

### Webhook Endpoints

- `POST /webhook/luma`: Process Luma check-in events

## Security Considerations

- **Authentication**: JWT-based authentication with wallet signatures
- **Authorization**: Role-based access control
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Validates all API inputs
- **CORS**: Restricts access to API from unauthorized domains
- **Environment Variables**: Sensitive information stored in environment variables

## Scaling Considerations

- **Horizontal Scaling**: Backend can be deployed across multiple instances
- **Database Scaling**: Database can be migrated to a managed service
- **Caching**: Redis can be implemented for caching frequent queries
- **CDN**: Static assets can be served through a CDN

## Integration Points

- **Polkadot/Substrate**: For blockchain interactions
- **Luma**: For event check-in webhooks
- **IPFS** (optional): For storing NFT metadata
- **Email Service** (optional): For notifications

## Development and Deployment

See the following documentation for detailed information:

- [Development Guide](./development-guide.md)
- [Production Deployment](./production-deployment.md)
- [Testing Strategy](./testing-strategy.md)

## Future Enhancements

- **Multi-chain Support**: Extend to other Substrate-based chains
- **Advanced Analytics**: Track event attendance metrics
- **Custom NFT Designs**: Allow organizers to customize NFT appearance
- **Mobile App**: Develop native mobile applications
- **Social Sharing**: Enable sharing NFTs on social media 