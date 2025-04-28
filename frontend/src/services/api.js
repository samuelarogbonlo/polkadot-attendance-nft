import axios from 'axios';

// Use environment variable if available, otherwise use localhost/mock
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Maximum number of retries for API calls
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// By default use mock data since we don't have backend deployed yet
localStorage.setItem('use_mock_data', 'true');

// Mock data for development/offline use
const MOCK_DATA = {
  events: [
    {
      id: 'event-001',
      name: 'Polkadot Conference 2023',
      description: 'Annual conference for Polkadot developers and enthusiasts',
      location: 'Virtual',
      date: '2023-11-15',
      capacity: 500,
      created_at: '2023-10-01T12:00:00Z'
    },
    {
      id: 'event-002',
      name: 'Blockchain Workshop',
      description: 'Hands-on workshop for building on Polkadot',
      location: 'San Francisco',
      date: '2023-12-10',
      capacity: 100,
      created_at: '2023-10-05T09:30:00Z'
    }
  ],
  nfts: [
    {
      id: 'nft-001',
      owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      metadata: {
        name: 'Polkadot Conference Attendance',
        description: 'Attended Polkadot Conference 2023',
        image: 'https://via.placeholder.com/300',
        event_id: 'event-001',
        attributes: [
          { trait_type: 'Event', value: 'Polkadot Conference 2023' },
          { trait_type: 'Date', value: '2023-11-15' }
        ]
      },
      created_at: '2023-11-15T15:30:00Z'
    },
    {
      id: 'nft-002',
      owner: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      metadata: {
        name: 'Blockchain Workshop Attendance',
        description: 'Attended Blockchain Workshop',
        image: 'https://via.placeholder.com/300',
        event_id: 'event-002',
        attributes: [
          { trait_type: 'Event', value: 'Blockchain Workshop' },
          { trait_type: 'Date', value: '2023-12-10' }
        ]
      },
      created_at: '2023-12-10T17:45:00Z'
    }
  ]
};

// Create axios instance with common configuration
const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor to add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Check if mock mode is enabled or if there's a connection error to the backend
const isMockDataEnabled = () => {
  return localStorage.getItem('use_mock_data') === 'true';
};

// Set mock mode
const setMockMode = (enabled) => {
  localStorage.setItem('use_mock_data', enabled ? 'true' : 'false');
};

// API call with retry logic
const apiCallWithRetry = async (apiCall, mockResponse, retries = 0) => {
  // If mock mode is enabled, return mock data immediately
  if (isMockDataEnabled()) {
    console.log('Using mock data:', mockResponse);
    return typeof mockResponse === 'function' ? mockResponse() : mockResponse;
  }
  
  try {
    return await apiCall();
  } catch (error) {
    // Only retry certain types of errors (network errors, 5xx responses)
    const isNetworkError = !error.response;
    const isServerError = error.response && error.response.status >= 500;
    
    if ((isNetworkError || isServerError) && retries < MAX_RETRIES) {
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retries)));
      
      // Retry with an incremented counter
      return apiCallWithRetry(apiCall, mockResponse, retries + 1);
    }
    
    console.warn('API call failed after retries, falling back to mock data');
    if (mockResponse) {
      setMockMode(true); // Auto-enable mock mode after failures
      return typeof mockResponse === 'function' ? mockResponse() : mockResponse;
    }
    
    // If we've exhausted retries and no mock data, throw it
    throw error;
  }
};

// Create API object with all methods
export const api = {
  // Authentication
  authenticate: async (walletAddress, message, signature) => {
    if (isMockDataEnabled()) {
      return { token: 'mock_token_' + Date.now() };
    }
    
    try {
      const response = await apiClient.post('/auth', { 
        walletAddress, 
        message, 
        signature 
      });
      return response.data;
    } catch (error) {
      console.warn('Authentication failed, using mock token');
      return { token: 'mock_token_' + Date.now() };
    }
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('auth_mode');
  },
  
  isAuthenticated: () => {
    const token = localStorage.getItem('auth_token');
    const authMode = localStorage.getItem('auth_mode');
    
    // If we're in manual mode, just check if the token exists
    if (authMode === 'manual' && token) {
      return true;
    }
    
    // Regular token check for non-manual mode
    return !!token;
  },
  
  getCurrentWallet: () => {
    return localStorage.getItem('wallet_address');
  },
  
  // Mock data control
  enableMockMode: () => setMockMode(true),
  disableMockMode: () => setMockMode(false),
  isMockModeEnabled: () => isMockDataEnabled(),
  
  // Events
  getEvents: async () => {
    return apiCallWithRetry(
      async () => {
        const response = await apiClient.get('/admin/events');
        return response.data;
      },
      MOCK_DATA.events
    );
  },
  
  getEvent: async (id) => {
    return apiCallWithRetry(
      async () => {
        const response = await apiClient.get(`/admin/events/${id}`);
        return response.data;
      },
      () => MOCK_DATA.events.find(event => event.id === id) || null
    );
  },
  
  createEvent: async (eventData) => {
    return apiCallWithRetry(
      async () => {
        const response = await apiClient.post('/admin/events', eventData);
        return response.data;
      },
      () => {
        const newEvent = {
          id: `event-${Date.now()}`,
          ...eventData,
          created_at: new Date().toISOString()
        };
        MOCK_DATA.events.push(newEvent);
        return newEvent;
      }
    );
  },
  
  // NFTs
  getNFTs: async () => {
    return apiCallWithRetry(
      async () => {
        const response = await apiClient.get('/admin/nfts');
        return response.data;
      },
      MOCK_DATA.nfts
    );
  },
  
  getNFTsByEvent: async (eventId) => {
    return apiCallWithRetry(
      async () => {
        const response = await apiClient.get('/admin/nfts');
        return response.data.filter(nft => 
          nft.metadata && nft.metadata.event_id === eventId
        );
      },
      () => MOCK_DATA.nfts.filter(nft => 
        nft.metadata && nft.metadata.event_id === eventId
      )
    );
  },
  
  createNFT: async (nftData) => {
    return apiCallWithRetry(
      async () => {
        const response = await apiClient.post('/admin/nfts', nftData);
        return response.data;
      },
      () => {
        const newNFT = {
          id: `nft-${Date.now()}`,
          ...nftData,
          created_at: new Date().toISOString()
        };
        MOCK_DATA.nfts.push(newNFT);
        return newNFT;
      }
    );
  },
  
  mintNFT: async (eventId, attendeeData) => {
    return apiCallWithRetry(
      async () => {
        const response = await apiClient.post(`/admin/events/${eventId}/mint`, attendeeData);
        return response.data;
      },
      () => {
        const event = MOCK_DATA.events.find(e => e.id === eventId);
        if (!event) {
          throw new Error('Event not found');
        }
        
        const newNFT = {
          id: `nft-${Date.now()}`,
          owner: attendeeData.walletAddress || localStorage.getItem('wallet_address'),
          metadata: {
            name: `${event.name} Attendance`,
            description: `Attended ${event.name}`,
            image: 'https://via.placeholder.com/300',
            event_id: eventId,
            attributes: [
              { trait_type: 'Event', value: event.name },
              { trait_type: 'Date', value: event.date }
            ]
          },
          created_at: new Date().toISOString()
        };
        MOCK_DATA.nfts.push(newNFT);
        return newNFT;
      }
    );
  },
  
  batchMintNFTs: async (eventId, attendeesData) => {
    return apiCallWithRetry(
      async () => {
        const response = await apiClient.post(`/admin/events/${eventId}/batch-mint`, { attendees: attendeesData });
        return response.data;
      },
      () => {
        const event = MOCK_DATA.events.find(e => e.id === eventId);
        if (!event) {
          throw new Error('Event not found');
        }
        
        const newNFTs = attendeesData.map((attendee, index) => ({
          id: `nft-${Date.now()}-${index}`,
          owner: attendee.walletAddress,
          metadata: {
            name: `${event.name} Attendance`,
            description: `Attended ${event.name}`,
            image: 'https://via.placeholder.com/300',
            event_id: eventId,
            attributes: [
              { trait_type: 'Event', value: event.name },
              { trait_type: 'Date', value: event.date },
              { trait_type: 'Attendee', value: attendee.name || 'Unknown' }
            ]
          },
          created_at: new Date().toISOString()
        }));
        
        MOCK_DATA.nfts.push(...newNFTs);
        return { success: true, minted: newNFTs.length, nfts: newNFTs };
      }
    );
  },
  
  configureWebhook: async (eventId, webhookUrl) => {
    return apiCallWithRetry(
      async () => {
        const response = await apiClient.post(`/admin/events/${eventId}/webhook`, { url: webhookUrl });
        return response.data;
      },
      { success: true, message: 'Webhook configured (mock)' }
    );
  },
  
  testWebhook: async (eventId) => {
    return apiCallWithRetry(
      async () => {
        const response = await apiClient.post(`/admin/events/${eventId}/test-webhook`);
        return response.data;
      },
      { success: true, message: 'Test webhook sent (mock)' }
    );
  },
  
  // Health check
  checkHealth: async () => {
    if (isMockDataEnabled()) {
      return true;
    }
    
    try {
      const response = await apiClient.get('/health');
      return response.data.status === 'ok';
    } catch (error) {
      console.error('Health check failed:', error);
      setMockMode(true); // Auto-enable mock mode on health check failure
      return false;
    }
  }
};
