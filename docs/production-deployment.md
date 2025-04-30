# Polkadot Attendance NFT System - Production Deployment Guide

## Quick Start

For experienced operators, here's a quick summary of deployment commands:

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the build/ directory to your web server
```

### Backend Deployment
```bash
cd backend
go build -o attendance-nft-server
# Configure environment variables
./attendance-nft-server
```

## Pre-Deployment Checklist

Before deploying the Polkadot Attendance NFT System to production, ensure the following tasks are complete:

- [ ] All environment variables are configured for production (see Environment Configuration section)
- [ ] Frontend build is optimized for production
- [ ] Backend is compiled with production flags
- [ ] Database is set up and configured correctly
- [ ] SSL certificates are obtained and ready to use
- [ ] Polkadot node access is configured and tested
- [ ] Smart contract addresses are verified and deployed
- [ ] Luma API access is configured (if using direct integration)

## Environment Configuration

Update the following environment variables for production:

### Frontend Environment (.env.production)

```dotenv
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_NETWORK_PROVIDER=wss://rpc.polkadot.io
REACT_APP_CONTRACT_ADDRESS=<your_production_contract_address>
REACT_APP_ENV=production
```

### Backend Environment

```dotenv
PORT=8080
DATABASE_URL=postgres://username:password@localhost:5432/attendance_nft
JWT_SECRET=<strong_random_generated_secret>
CONTRACT_ADDRESS=<your_production_contract_address>
POLKADOT_NODE_URL=wss://rpc.polkadot.io
LUMA_API_KEY=<your_luma_api_key>
LUMA_WEBHOOK_SECRET=<your_luma_webhook_secret>
ENV=production
LOG_LEVEL=info
```

## Deployment Steps

### Frontend Deployment

1. Build the optimized production bundle:

```bash
cd frontend
npm ci
npm run build
```

2. The optimized build will be in the `frontend/build` directory.

3. Deploy the build directory to your web server. Options include:
   - Nginx/Apache serving static files
   - Amazon S3 + CloudFront
   - Netlify, Vercel, or similar static hosting services

4. If using Nginx, a basic configuration might look like:

```nginx
server {
    listen 80;
    server_name attendance.polkadot.network;
    
    location / {
        root /path/to/frontend/build;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to the backend
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Backend Deployment

1. Build the Go binary:

```bash
cd backend
go build -o attendance-nft-server
```

2. Set up environment variables as outlined above.

3. Deploy options:
   - Systemd service (recommended for Linux servers)
   - Docker container
   - Kubernetes deployment
   - Cloud services like Google Cloud Run or AWS ECS

4. Example systemd service file `/etc/systemd/system/attendance-nft.service`:

```ini
[Unit]
Description=Polkadot Attendance NFT Backend Service
After=network.target

[Service]
User=attendance
WorkingDirectory=/opt/attendance-nft
ExecStart=/opt/attendance-nft/attendance-nft-server
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=attendance-nft
Environment=PORT=8080
Environment=DATABASE_URL=postgres://username:password@localhost:5432/attendance_nft
# Add other environment variables here

[Install]
WantedBy=multi-user.target
```

5. Enable and start the service:

```bash
sudo systemctl enable attendance-nft.service
sudo systemctl start attendance-nft.service
```

## Database Setup

For production, we recommend:

1. PostgreSQL database with proper replication and backup
2. Create the database and user:

```sql
CREATE DATABASE attendance_nft;
CREATE USER attendance WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE attendance_nft TO attendance;
```

3. Run the database migrations:

```bash
# Using the migration tool included with the backend
./attendance-nft-server migrate
```

## Domain and SSL Setup

1. Acquire a domain name for your service
2. Set up DNS records to point to your web server
3. Obtain SSL certificates (Let's Encrypt recommended)
4. Configure your web server to use HTTPS

For Let's Encrypt with Nginx:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d attendance.polkadot.network
```

## Security Hardening

1. Implement rate limiting:

```nginx
# In your Nginx configuration
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    server {
        # Other server config...
        
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            # Other location config...
        }
    }
}
```

2. Set up a firewall:

```bash
# UFW example
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

3. Regularly update dependencies:

```bash
# Frontend
cd frontend
npm audit fix

# Backend
cd backend
go get -u all
```

4. Consider implementing Web Application Firewall (WAF) like ModSecurity or AWS WAF

## Multi-Tenant Architecture Implementation

For production deployments with multiple event organizers, we recommend implementing a multi-tenant architecture to ensure proper access control and data isolation.

### Database Schema Updates

1. Add an Organizations table:

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. Add a Users table with organization relationships:

```sql
CREATE TABLE users (
    wallet_address VARCHAR(64) PRIMARY KEY,
    display_name VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE TABLE organization_members (
    organization_id UUID REFERENCES organizations(id),
    wallet_address VARCHAR(64) REFERENCES users(wallet_address),
    role VARCHAR(20) NOT NULL, -- 'admin', 'member', 'viewer'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (organization_id, wallet_address)
);
```

3. Update the Events table to include organization ownership:

```sql
ALTER TABLE events 
ADD COLUMN organization_id UUID REFERENCES organizations(id);
```

### Backend Code Changes

1. Update the event creation API to associate events with organizations:

```go
// In your event creation handler
func (h *AdminHandler) CreateEvent(c *gin.Context) {
    // Get the wallet address from the JWT token
    walletAddress := c.GetString("walletAddress")
    
    // Get the organization ID from the request
    var req CreateEventRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    // Verify the user has permission in this organization
    hasPermission, err := h.db.CheckUserOrganizationRole(walletAddress, req.OrganizationID, []string{"admin", "member"})
    if err != nil || !hasPermission {
        c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to create events for this organization"})
        return
    }
    
    // Create the event with organization ID
    event, err := h.db.CreateEvent(req.Name, req.Description, req.Date, req.Location, req.OrganizationID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusCreated, event)
}
```

2. Add middleware to verify organization access:

```go
func OrganizationAccessMiddleware(db *database.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get the wallet address from the JWT token
        walletAddress := c.GetString("walletAddress")
        
        // Get the organization ID from the URL or request body
        organizationID := c.Param("organizationId")
        if organizationID == "" {
            // Try to get it from the request body for POST requests
            if c.Request.Method == "POST" {
                var req struct {
                    OrganizationID string `json:"organizationId"`
                }
                if err := c.ShouldBindJSON(&req); err == nil {
                    organizationID = req.OrganizationID
                }
            }
        }
        
        // If we still don't have an organization ID, continue
        // (the handler will need to handle this case)
        if organizationID == "" {
            c.Next()
            return
        }
        
        // Check if the user has access to this organization
        hasAccess, err := db.CheckUserOrganizationAccess(walletAddress, organizationID)
        if err != nil || !hasAccess {
            c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "You don't have access to this organization's resources"})
            return
        }
        
        c.Next()
    }
}
```

### Frontend Updates

1. Add organization selection UI to the admin dashboard.
2. Update the event creation form to associate events with the selected organization.
3. Filter events and NFTs based on the user's organizations.

### API Endpoint Updates

Add the following endpoints to manage organizations:

```
POST /api/organizations: Create a new organization
GET /api/organizations: List user's organizations
GET /api/organizations/:id: Get organization details
PUT /api/organizations/:id: Update organization details
POST /api/organizations/:id/members: Add a member to an organization
DELETE /api/organizations/:id/members/:address: Remove a member from an organization
PUT /api/organizations/:id/members/:address/role: Update a member's role
```

### Migration Plan

1. Create the new database tables
2. Modify the backend code to support the multi-tenant model
3. Update the frontend to include organization management
4. For existing data, create a default organization and migrate all events to it
5. Assign all existing users as admins of the default organization

### Testing

Before deploying to production, thoroughly test:
- Organization creation and management
- User permissions within organizations
- Event isolation between organizations
- Access control for organization resources

## Monitoring and Logging

1. Set up application logging to a centralized logging system:
   - ELK Stack (Elasticsearch, Logstash, Kibana)
   - Graylog
   - AWS CloudWatch
   - Google Cloud Logging

2. Set up monitoring and alerting:
   - Prometheus + Grafana for metrics
   - Set up alerts for:
     - High error rates
     - Slow response times
     - Server resource usage (CPU, memory, disk)
     - Failed NFT minting operations

3. Health check endpoint:

The backend provides a `/health` endpoint that returns the system status. Configure your monitoring system to regularly check this endpoint.

## Backup Strategy

1. Database backups:
   - Daily full backups
   - Point-in-time recovery setup
   - Test restoration process regularly

2. Configuration backups:
   - Environment variables
   - Web server configuration
   - Systemd service files

3. Disaster recovery plan:
   - Document steps to restore service from backups
   - Regularly test the disaster recovery process

## Post-Deployment Verification

After deployment, verify the system works correctly:

1. Test user authentication flow
2. Create a test event
3. Configure a test webhook (if using Luma integration)
4. Simulate an attendee check-in
5. Verify NFT is properly minted
6. Check that all monitoring and logging systems are receiving data

## Maintenance Plan

1. Regular updates:
   - Schedule monthly dependency updates
   - Plan quarterly feature updates

2. Monitoring review:
   - Weekly review of error logs
   - Monthly review of performance metrics

3. Regular security audits:
   - Quarterly security review
   - Annual penetration testing

4. Scaling considerations:
   - Monitor system load during events
   - Be prepared to scale horizontally during large events

---

This deployment guide provides a comprehensive approach to deploying the Polkadot Attendance NFT System to production. Adapt the instructions to your specific infrastructure and operational requirements. 