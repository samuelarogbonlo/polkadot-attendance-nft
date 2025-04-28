import { initPolkadot, getSigner } from './wallet';
import { BN } from '@polkadot/util';

/**
 * BlockchainService - Handles all blockchain interactions
 */
class BlockchainService {
  constructor() {
    this.initialized = false;
    this.api = null;
    this.contract = null;
  }

  /**
   * Initialize the blockchain connection
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) return;
    
    try {
      const { api, contract } = await initPolkadot();
      this.api = api;
      this.contract = contract;
      this.initialized = true;
      
      console.log('Blockchain service initialized');
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  /**
   * Retrieve events from the blockchain
   * @returns {Promise<Array>} List of events
   */
  async getEvents() {
    await this.init();
    
    try {
      // Get event count first
      const { result, output } = await this.contract.query.getEventCount(
        localStorage.getItem('wallet_address'),
        { value: 0, gasLimit: -1 }
      );
      
      if (result.isErr) {
        throw new Error('Failed to get event count');
      }
      
      const eventCount = output.toNumber();
      const events = [];
      
      // Now get each event by ID
      for (let i = 1; i <= eventCount; i++) {
        const { result: eventResult, output: eventOutput } = await this.contract.query.getEvent(
          localStorage.getItem('wallet_address'),
          { value: 0, gasLimit: -1 },
          i
        );
        
        if (eventResult.isOk && eventOutput.isSome) {
          const eventInfo = eventOutput.unwrap();
          events.push({
            id: `event-${i}`, // Format ID as string to match existing code
            name: eventInfo.name.toString(),
            date: eventInfo.date.toString(),
            location: eventInfo.location.toString(),
            organizer: eventInfo.organizer.toString(),
            created_at: new Date().toISOString() // Approximate date
          });
        }
      }
      
      return events;
    } catch (error) {
      console.error('Error fetching events from blockchain:', error);
      // Fall back to localStorage if blockchain query fails
      const storedEvents = localStorage.getItem('mock_events');
      if (storedEvents) {
        return JSON.parse(storedEvents);
      }
      return [];
    }
  }

  /**
   * Get NFTs owned by the current user from blockchain
   * @returns {Promise<Array>} List of NFTs
   */
  async getNFTs() {
    await this.init();
    
    const walletAddress = localStorage.getItem('wallet_address');
    if (!walletAddress) {
      return [];
    }
    
    try {
      // Query owned NFT IDs
      const { result, output } = await this.contract.query.getOwnedNfts(
        walletAddress,
        { value: 0, gasLimit: -1 },
        walletAddress
      );
      
      if (result.isErr) {
        throw new Error('Failed to get NFT IDs');
      }
      
      const nftIds = output.toArray().map(id => id.toNumber());
      const nfts = [];
      
      // Fetch each NFT by ID
      for (const id of nftIds) {
        const { result: nftResult, output: nftOutput } = await this.contract.query.getNft(
          walletAddress,
          { value: 0, gasLimit: -1 },
          id
        );
        
        if (nftResult.isOk && nftOutput.isSome) {
          const nft = nftOutput.unwrap();
          let metadata = {};
          
          try {
            metadata = JSON.parse(nft.metadata.toString());
          } catch (e) {
            console.warn('Failed to parse NFT metadata:', e);
            metadata = {
              name: `NFT #${id}`,
              description: 'No description available',
              image: 'https://via.placeholder.com/300'
            };
          }
          
          nfts.push({
            id: `nft-${id}`,
            owner: nft.owner.toString(),
            event_id: `event-${nft.event_id.toNumber()}`,
            metadata,
            created_at: new Date().toISOString() // Approximate date
          });
        }
      }
      
      return nfts;
    } catch (error) {
      console.error('Error fetching NFTs from blockchain:', error);
      // Fall back to localStorage if blockchain query fails
      const storedNfts = localStorage.getItem('mock_nfts');
      if (storedNfts) {
        return JSON.parse(storedNfts);
      }
      return [];
    }
  }

  /**
   * Create an event on the blockchain
   * @param {Object} eventData - Event data to create
   * @returns {Promise<Object>} Created event
   */
  async createEvent(eventData) {
    await this.init();
    
    try {
      const callerAddress = localStorage.getItem('wallet_address');
      const signer = await getSigner(callerAddress);
      
      // Create gas limit
      const gasLimit = this.api.registry.createType('WeightV2', {
        refTime: new BN(1000000000),
        proofSize: new BN(1000000),
      });
      
      // Send transaction
      const txResult = await this.contract.tx
        .createEvent({ gasLimit }, eventData.name, eventData.date, eventData.location)
        .signAndSend(callerAddress, { signer });
      
      // In a real implementation, we'd wait for the event to be created and get the ID
      // For now, we're simulating this with a timestamp
      const eventId = `event-${Date.now()}`;
      
      return {
        id: eventId,
        ...eventData,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating event on blockchain:', error);
      throw error;
    }
  }
}

export const blockchainService = new BlockchainService();
export default blockchainService; 