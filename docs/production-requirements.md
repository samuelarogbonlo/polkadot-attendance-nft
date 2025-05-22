# Polkadot Attendance NFT System - Production Requirements

## Project Overview

The Polkadot Attendance NFT System is a blockchain-based proof of attendance system that enables event organizers to issue digital NFT certificates to attendees when they check in at Polkadot events via the Luma platform. Using Luma's scanning functionality, organizers can scan attendees' QR codes at the venue, triggering automatic NFT minting and distribution to the attendees' wallets.

These NFTs serve as verifiable proof of participation that can be used to access perks, exclusive content, and future opportunities within the Polkadot ecosystem. The system showcases practical NFT utility while leveraging Polkadot's NFT standards and low transaction costs.

## System Architecture

The application consists of three main components:

1. **Smart Contract**: Written in ink! (Rust) for the Polkadot ecosystem, deployed on the Polkadot blockchain
2. **Backend API**: Go-based service handling Luma webhook integration and NFT minting
3. **Frontend**: React-based dashboard for event management with Material UI

## Platform Logic and Workflows

### Core System Logic

The platform follows these logical workflows:

1. **Authentication Flow**:
   - User connects their Polkadot.js wallet to the application
   - Backend verifies wallet signature to authenticate the user
   - JWT token is issued for subsequent authenticated requests
   - User session is maintained with token refresh mechanisms

2. **Event Creation Flow**:
   - Authenticated user creates an event through the frontend
   - Backend validates the event data and stores it in the database
   - Smart contract interaction records the event on the blockchain
   - Event creator is automatically assigned owner permissions

3. **Check-in and NFT Minting Flow**:
   - Attendee checks in at event via Luma app
   - Luma webhook triggers backend notification
   - Backend verifies attendee's wallet address
   - Smart contract interaction mints NFT to attendee's wallet
   - Transaction hash and status are recorded for verification

4. **Authorization Logic**:
   - Every API request includes authentication token verification
   - User roles and permissions are checked against resources
   - Only event creators can edit or delete their own events
   - Admin users have override access to all resources
   - Access control lists define precise permission boundaries

5. **Data Synchronization**:
   - Database serves as the primary data source
   - Blockchain stores immutable proof of events and NFTs
   - Periodic reconciliation ensures data consistency
   - Fallback mechanisms handle temporary blockchain unavailability

### Component Interaction

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│             │      │             │      │             │
│  Frontend   │◄────►│  Backend    │◄────►│  Database   │
│  (React)    │      │  (Go API)   │      │ (PostgreSQL)│
│             │      │             │      │             │
└─────────────┘      └──────┬──────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐      ┌─────────────┐
                     │             │      │             │
                     │ Blockchain  │◄────►│   Luma      │
                     │ (Polkadot)  │      │  Platform   │
                     │             │      │             │
                     └─────────────┘      └─────────────┘
```

- **Frontend to Backend**: REST API calls for all operations
- **Backend to Database**: Data persistence and retrieval
- **Backend to Blockchain**: Contract calls for event registration and NFT minting
- **Backend to Luma**: Webhook integration for check-in events
- **Frontend to Blockchain**: Direct wallet connection for authentication

## Core Features

### Event Management
- Create events with name, date, and location information
- View and manage events in an admin dashboard
- Edit event details (name, date, location, capacity)
- QR code generation for event check-in
- Import events from Luma for seamless workflow
- Webhook configuration for Luma integration

### NFT Management
- Automatic minting when attendees check in
- NFT listing with detailed information
- Error handling with retry mechanisms
- Batch operations for NFT minting
- NFT ownership verification

### User Interface
- Modern design using Material UI
- Dark/light mode toggle
- Responsive layout for mobile and desktop
- Polkadot-branded styling and animations

### Security
- Wallet-based authentication via Polkadot.js
- Role-based access control
- Rate limiting to prevent abuse
- Contract address validation
- JWT token-based session management

## Production Requirements

### 1. Smart Contract Deployment
- **Current Status**: Contract deployed to Westend testnet with address: `5E34VfGGLfR7unMf9UH6xCtsoKy7sgLiGzUXC47Mv2U5uB28`
- **Production Requirements**:
  - Ensure contract has been properly audited
  - Verify contract functionality in production environment
  - Update backend configuration with production contract address

### 2. Luma API Integration
- **Current Status**: Using mock implementation for development
- **Production Requirements**:
  - Upgrade Luma account to access API
  - Obtain production API credentials
  - Configure webhook endpoints
  - Set up custom fields for wallet addresses
  - Test with real check-in events

### 3. Database Implementation
- **Current Status**: Database schema designed and migration scripts created
- **Production Requirements**:
  - Set up production PostgreSQL database
  - Configure connection pooling and security
  - Implement backup and recovery procedures
  - Test database performance under load
  - Implement proper indexing for query optimization

### 4. Backend Deployment
- **Production Requirements**:
  - Build optimized production binary
  - Deploy to chosen hosting environment (Render, AWS, GCP, etc.)
  - Set up reverse proxy with SSL
  - Configure monitoring and logging
  - Implement rate limiting and security measures

### 5. Frontend Deployment
- **Production Requirements**:
  - Build optimized production bundle
  - Deploy to static hosting (Netlify, Render, S3, etc.)
  - Configure frontend to use production API endpoint
  - Set up proper CORS configuration
  - Verify responsive design across devices

## New Feature Requirements

### 1. User Visibility in Dashboard
- **Requirement**: Add user profile information display in the dashboard
- **Implementation Details**:
  - Create user profile component for dashboard header/sidebar
  - Display connected wallet address (with abbreviation)
  - Add ENS resolution if available
  - Implement account menu with logout option
  - Success Criteria: User information clearly visible in the dashboard interface

### 2. Google Maps Location Integration
- **Requirement**: Replace simple text location field with Google Maps integration
- **Implementation Details**:
  - Register for Google Maps JavaScript API key
  - Create location picker component with embedded map
  - Implement search functionality for location selection
  - Add geocoding/reverse geocoding to convert between coordinates and addresses
  - Store both coordinates and human-readable location text
  - Success Criteria: Interactive map for selecting and displaying event locations
  - Production Configuration: Secure API key with domain restrictions

### 3. Import from Luma Functionality
- **Requirement**: Add ability to import events from Luma platform
- **Implementation Details**:
  - Upgrade Luma account to obtain API access
  - Create Luma API client with authentication
  - Implement event import interface with event selection
  - Add data mapping between Luma events and internal format
  - Success Criteria: Working "Import from Luma" button that successfully imports event data

### 4. NFT Generation Confirmation
- **Requirement**: Add confirmation for NFT generation
- **Implementation Details**:
  - Create transaction tracking system for NFT minting
  - Add confirmation screens with transaction details
  - Implement blockchain explorer deep linking
  - Add transaction status indicators (pending, confirmed, failed)
  - Success Criteria: Clear confirmation UI and blockchain explorer links

### 5. Admin Process for NFT Designs
- **Requirement**: Create functionality to manage NFT designs
- **Implementation Details**:
  - Create NFT design management interface
  - Implement file upload for NFT artwork
  - Add template system for NFT metadata
  - Build preview functionality for NFT designs
  - Create storage solution for design assets (IPFS/S3)
  - Success Criteria: UI for uploading and customizing NFT artwork
- **Design Upload Process**:
  - Support common image formats (PNG, JPG, SVG)
  - Implement size and dimension restrictions
  - Add template variables for dynamic content (attendee name, event details)
  - Process uploads through secure backend endpoint
  - Store designs with proper versioning

### 6. Check-in Attendance Process
- **Requirement**: Automate NFT minting upon attendee check-in
- **Implementation Details**:
  - Complete webhook handler for Luma check-ins
  - Add wallet address validation
  - Implement automatic NFT minting process
  - Create check-in dashboard for event organizers
  - Add real-time status updates
  - Success Criteria: Automatic NFT distribution upon check-in

### 7. Authorization Logic for Events
- **Requirement**: Implement proper permission controls
- **Implementation Details**:
  - Define permission levels (owner, editor, viewer)
  - Add user roles to event data model
  - Implement middleware for access control
  - Update UI to show/hide actions based on permissions
  - Success Criteria: Proper permission checking on all event operations
- **Owner-Only Actions**:
  - Only event creators can edit their own events
  - Only event creators can delete their own events
  - Only event creators can manage NFT designs for their events
  - Only event creators can configure webhooks for their events
  - Event creators can assign editor permissions to other users

## Data Model

### Core Entities

1. **Users**:
   ```
   User {
     id: UUID
     wallet_address: String
     created_at: Timestamp
     last_login: Timestamp
     role: Enum(ADMIN, USER)
   }
   ```

2. **Events**:
   ```
   Event {
     id: UUID
     name: String
     date: Date
     location: String
     location_coordinates: GeoPoint
     capacity: Integer
     creator_id: UUID (User.id)
     blockchain_id: String
     created_at: Timestamp
     updated_at: Timestamp
   }
   ```

3. **NFTs**:
   ```
   NFT {
     id: UUID
     event_id: UUID (Event.id)
     attendee_address: String
     transaction_hash: String
     status: Enum(PENDING, MINTED, FAILED)
     design_id: UUID (Design.id)
     created_at: Timestamp
     updated_at: Timestamp
   }
   ```

4. **Permissions**:
   ```
   Permission {
     id: UUID
     user_id: UUID (User.id)
     event_id: UUID (Event.id)
     permission_type: Enum(OWNER, EDITOR, VIEWER)
     created_at: Timestamp
     updated_at: Timestamp
   }
   ```

5. **Designs**:
   ```
   Design {
     id: UUID
     event_id: UUID (Event.id)
     name: String
     image_url: String
     metadata: JSON
     created_by: UUID (User.id)
     created_at: Timestamp
     updated_at: Timestamp
   }
   ```

### Entity Relationships

- User creates many Events (one-to-many)
- Event has many NFTs (one-to-many)
- Event has many Permissions (one-to-many)
- User has many Permissions (one-to-many)
- Event has many Designs (one-to-many)

## Testing Verification

Before considering the project production-ready, perform comprehensive testing:

1. End-to-end testing of complete workflow
2. Performance testing under load
3. Security testing for vulnerabilities
4. Cross-browser and device testing
5. API integration testing
6. Permission testing to verify authorization logic

## Conclusion

The Polkadot Attendance NFT System provides a complete solution for event organizers to issue verifiable attendance NFTs. The production implementation with the new features, particularly the Google Maps location integration and owner-based permissions, will enhance the user experience and streamline the event management process.

The system's architecture leverages the advantages of the Polkadot blockchain while providing an intuitive interface for non-technical users. With proper deployment on Netlify and Render, and robust monitoring, it will provide a reliable and secure platform for Polkadot event organizers. 