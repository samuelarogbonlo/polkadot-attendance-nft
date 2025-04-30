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

# Polkadot Attendance NFT - Feature Verification Guide

This guide will help you verify that all features of the Polkadot Attendance NFT application are working correctly. No technical knowledge is required!

## Before You Begin

1. **Install the Polkadot.js Extension**:
   - Visit [Polkadot.js Extension](https://polkadot.js.org/extension/) and install it for your browser
   - After installation, you should see a colorful 'P' icon in your browser toolbar

2. **Create a Test Account**:
   - Click the Polkadot.js extension icon in your browser
   - Click the "+" button to create a new account
   - Follow the prompts to save your account details
   - **Note**: This is a testnet account, no real funds are involved

3. **Open the Application**:
   - Go to [https://polkadot-attendance-nft.netlify.app](https://polkadot-attendance-nft.netlify.app)

## Feature Verification Checklist

### 1. Wallet Connection

- [ ] Paste your wallet address and click "Connect Wallet" on the homepage
- [ ] You should see a notification that you're connected to a testnet
- [ ] After successful connection, you will be redirected to the admin dashboard

### 2. Dark/Light Mode

- [ ] Look for a sun/moon icon in the top right corner
- [ ] Click it to switch between dark and light modes
- [ ] The entire interface should change colors

### 3. Event Creation

- [ ] On the Admin dashboard, find the "Create Event" form
- [ ] Enter an event name (e.g., "Polkadot Demo Event")
- [ ] Select a date using the calendar picker
- [ ] Enter a location (e.g., "Virtual Conference")
- [ ] Set a capacity (e.g., "100")
- [ ] Click "Create Event"
- [ ] You should see a transaction progress indicator
- [ ] After completion, your new event should appear in the events list

### 4. Event Management

- [ ] Find your newly created event in the list
- [ ] Click the pencil icon to edit the event
- [ ] Change some details and save
- [ ] The updated information should appear in the list
- [ ] Click the QR code icon to see the event check-in QR code
- [ ] The QR code should display in a popup

### 5. NFT Minting (Check-in Simulation)

- [ ] Click "Check-In" on your event in the event list
- [ ] You'll see the "Mock Check-In Simulator" page
- [ ] The event should be pre-selected based on which event you clicked
- [ ] Enter a wallet address (or leave the pre-filled address)
- [ ] Click "Simulate Check-In"
- [ ] You should see a transaction progress indicator
- [ ] After completion, a success message should appear

### 6. Viewing NFTs

- [ ] Go to the "NFTs" tab in the navigation
- [ ] You should see your newly minted NFT
- [ ] Note the details like event name, attendee name, and wallet address
- [ ] Try filtering NFTs by event or searching by name
- [ ] Try sorting NFTs by different criteria

### 7. Export Features

- [ ] On the NFTs page, look for the download icon in the upper right
- [ ] Click on the icon to open the export menu
- [ ] Click "Export as CSV"
- [ ] A CSV file should download with your NFT data

### 8. Wallet Verification

- [ ] Click the "Verify in Wallet" button on any NFT card
- [ ] A dialog should appear showing ownership verification details
- [ ] Confirm the wallet address matches the one used during check-in
- [ ] Close the verification dialog
- [ ] You can also disconnect and reconnect with a different wallet address

### 9. Public Gallery

- [ ] Visit the "Public Gallery" from the navigation
- [ ] You should see a public view of the NFTs without needing wallet connection
- [ ] Try filtering or sorting the gallery using the provided controls

## What You've Just Verified

✅ **Blockchain Integration**: Events and NFTs are stored on the Polkadot blockchain
✅ **Wallet Connectivity**: The app connects to Polkadot.js wallet extension
✅ **Event Management**: Create, edit, and manage attendance events
✅ **NFT Minting**: Generate attendance NFTs tied to specific wallet addresses
✅ **Data Export**: Export data in CSV and PDF formats
✅ **Wallet Verification**: Verify NFT ownership in connected wallets
✅ **Responsive Design**: The interface works on different screen sizes

## Production Notes

In the production version of this application:
- The check-in process would connect to the Luma API using API keys to fetch real attendee data
- Real NFTs would be minted on the Polkadot blockchain
- Wallet verification would query the blockchain for true ownership verification
- The QR code would direct attendees to a check-in page connected to the event

## Troubleshooting

- If you see errors connecting to the blockchain, make sure your Polkadot.js extension is properly installed
- If transactions take time, this is normal blockchain behavior - just wait a moment
- If you need to reset, you can refresh the page and reconnect your wallet

Thank you for verifying our application! 

## License

MIT / Apache 2.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.