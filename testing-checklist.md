# Polkadot Attendance NFT Platform Testing Checklist

Use this checklist to verify all features are working correctly. Mark each item as it is confirmed.

## Authentication & Wallet Integration

- [ ] **Wallet Connection**
  - Navigate to https://polkadot-attendance-nft.netlify.app
  - Click "Connect Wallet" button
  - Confirm the Polkadot.js extension popup appears
  - Grant permission to the app
  - Verify your account address appears in the header

- [ ] **Authentication Persistence**
  - After connecting wallet, refresh the page
  - Verify you remain logged in
  - Click "Logout" button
  - Confirm you're redirected to the login screen

## Event Management

- [ ] **Event Creation**
  - Go to Admin → Events tab
  - Fill out the event creation form:
    - Name: "Polkadot Demo Event"
    - Date: Select a future date
    - Location: "Virtual"
    - Capacity: 100
  - Click the "Create Event" button
  - Verify the new event appears in the event list below

- [ ] **Event Listing & Details**
  - Confirm the event list shows your newly created event
  - Check that the event details match what you entered
  - Verify the event creation date is displayed correctly

## NFT Management

- [ ] **NFT Listing View**
  - Go to Admin → NFTs tab
  - Verify the list loads (may be empty if no NFTs created yet)
  - Check that the table headers and layout render correctly

- [ ] **Mock Check-in & NFT Minting**
  - Go to Admin → Demo Tools tab
  - In the Mock Check-in Simulator:
    - Enter the event ID from your created event
    - Use "attendee123" for Attendee ID
    - Keep default values for other fields
  - Click "Simulate Check-in" button
  - Wait for the success message to appear
  - Go to the NFTs tab and confirm a new NFT was created
  - Verify the NFT metadata contains correct event information

- [ ] **NFT Viewing in Gallery**
  - Navigate to the Gallery page
  - Verify the NFT you created appears
  - Check that the NFT image loads correctly
  - Confirm the event name is displayed with the NFT

## User Interface

- [ ] **Theme Switching**
  - Locate the theme toggle in the top-right corner of the header
  - Click it to switch between dark and light modes
  - Verify colors update throughout the entire application
  - Refresh the page and confirm your theme preference is saved

- [ ] **Font Size Adjustment**
  - Find the font size controls in the header (A- / A+)
  - Test small, medium, and large options
  - Verify text throughout the app changes size accordingly
  - Refresh the page and confirm size preference is maintained

- [ ] **Responsive Layout**
  - Visit the site on a desktop browser and check layout
  - Resize browser window to tablet size (~768px width)
  - Verify the UI adjusts appropriately
  - Resize to mobile size (~375px width)
  - Confirm all features remain accessible at each size

## Gallery Features

- [ ] **Public Gallery**
  - Navigate to the Public Gallery page
  - Verify any created NFTs are visible
  - Check that the grid layout displays properly
  - Test the filtering options if available

- [ ] **QR Code Generation**
  - In the NFT Gallery, locate your minted NFT
  - Find the QR code associated with it
  - Verify the QR code is generated and displayed
  - Scan the QR code with a mobile device to verify it leads to the correct link

## Data Visualization

- [ ] **NFT Analytics**
  - Look for charts or statistics on the Admin dashboard
  - Verify charts render correctly without errors
  - Confirm data shown matches your test activities

## Error Handling

- [ ] **Form Validation**
  - Go to the Event Creation form
  - Try submitting with the name field empty
  - Verify an error message appears
  - Fill in the name and try submitting with an invalid date
  - Confirm appropriate validation errors display

- [ ] **API Error Handling**
  - Temporarily disconnect from the internet
  - Attempt to perform an operation requiring API access
  - Verify a user-friendly error message appears
  - Reconnect to the internet and confirm functionality returns

## Debug & Admin Features

- [ ] **System Status Indicators**
  - Look for indicators showing system status (mock mode, connection status)
  - Verify they reflect the current state correctly

- [ ] **Mock Data Mode**
  - If available, locate the toggle for mock/live data
  - Switch between modes and verify behavior changes
  - Confirm data appears in mock mode even when offline

## Integration Tests

- [ ] **End-to-End Workflow**
  - Create a new event
  - Use the Mock Check-in Simulator to check in an attendee
  - Verify an NFT is minted
  - View the NFT in the gallery
  - Confirm all details are correct throughout the process

## Performance & Accessibility

- [ ] **Loading States**
  - Navigate between pages and observe loading indicators
  - Verify they appear during data fetching operations
  - Confirm they disappear once content is loaded

- [ ] **Accessibility Testing**
  - Try navigating the entire application using only keyboard
  - Verify all interactive elements can be accessed and used
  - Check that images have appropriate alt text
  - Confirm color contrast is sufficient in both light and dark modes

## Notes:
- Add any issues encountered during testing here
- Document any workarounds used

## Testing Completion

- [ ] All tests passed
- [ ] Issues documented and reported
- [ ] Application ready for presentation

Tested by: _________________
Date: _________________ 