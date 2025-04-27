import axios from 'axios';

// In production, these would be environment variables
const LUMA_API_BASE = 'https://api.lu.ma/v1';
const LUMA_OAUTH_URL = 'https://lu.ma/oauth/authorize';
const LUMA_API_KEY = process.env.REACT_APP_LUMA_API_KEY || '';

// Create an API client with proper authentication
const lumaClient = axios.create({
  baseURL: LUMA_API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

/**
 * Initiates OAuth flow to connect to Luma
 * In production, this would redirect to Luma's OAuth page
 */
export const initiateOAuthFlow = () => {
  // This is placeholder code for the OAuth flow
  // In production, we would redirect to Luma's OAuth endpoint
  const clientId = process.env.REACT_APP_LUMA_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/luma/callback`;
  const scope = 'read:events,write:events,read:attendees,write:webhooks';
  
  const authUrl = `${LUMA_OAUTH_URL}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  
  // In production, we would redirect to this URL
  console.log('Auth URL:', authUrl);
  
  // Mock implementation for development
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, token: 'mock_oauth_token' });
    }, 1500);
  });
};

/**
 * Completes OAuth flow by exchanging authorization code for access token
 */
export const completeOAuthFlow = (code) => {
  // In production, this would exchange the code for an access token
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expires_in: 3600
      });
    }, 1000);
  });
};

/**
 * Fetches events from the connected Luma account
 */
export const fetchLumaEvents = async () => {
  // In production, this would call the Luma API
  // return await lumaClient.get('/events');
  
  // Mock implementation for development
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          events: [
            {
              id: 'luma-123',
              name: 'Polkadot Meetup Berlin',
              date: '2025-05-15',
              location: 'Berlin, Germany',
              description: 'Join us for a meetup all about Polkadot!',
              capacity: 100
            },
            {
              id: 'luma-456',
              name: 'Web3 Developer Conference',
              date: '2025-06-22',
              location: 'London, UK',
              description: 'A conference for Web3 developers',
              capacity: 250
            },
            {
              id: 'luma-789',
              name: 'Blockchain Workshop',
              date: '2025-07-10',
              location: 'Paris, France',
              description: 'Hands-on workshop on blockchain technology',
              capacity: 50
            }
          ]
        }
      });
    }, 1000);
  });
};

/**
 * Configures a webhook in Luma for event check-ins
 */
export const configureWebhook = async (eventId, webhookUrl) => {
  // In production, this would call the Luma API
  // return await lumaClient.post('/webhooks', {
  //   event_id: eventId,
  //   url: webhookUrl,
  //   events: ['check_in.created']
  // });
  
  // Mock implementation for development
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          id: 'webhook-123',
          url: webhookUrl,
          events: ['check_in.created'],
          created_at: new Date().toISOString()
        }
      });
    }, 1000);
  });
};

/**
 * Tests the webhook configuration by simulating a check-in
 */
export const testWebhook = async (eventId) => {
  // In production, this would call a different endpoint
  // return await lumaClient.post('/webhooks/test', {
  //   event_id: eventId
  // });
  
  // Mock implementation for development
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          success: true,
          message: 'Test webhook delivered successfully'
        }
      });
    }, 1500);
  });
};

export default {
  initiateOAuthFlow,
  completeOAuthFlow,
  fetchLumaEvents,
  configureWebhook,
  testWebhook
}; 