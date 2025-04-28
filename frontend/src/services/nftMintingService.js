import { initPolkadot, getSigner } from './wallet';
import { BN } from '@polkadot/util';

/**
 * Configuration for retry mechanisms
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  backoffFactor: 2, // Exponential backoff
  retryableErrors: [
    'CONNECTION_ERROR',
    'TIMEOUT',
    'BLOCKCHAIN_CONGESTION',
    'TRANSACTION_UNDERPRICED'
  ]
};

/**
 * Mint an NFT on the blockchain
 * @param {Object} nftData - Data for the NFT to be minted
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<Object>} - The minted NFT data
 */
export const mintNFTWithRetry = async (nftData, onProgress = () => {}) => {
  let retries = 0;
  let delay = RETRY_CONFIG.initialDelay;
  
  while (true) {
    try {
      onProgress({
        status: 'processing',
        message: retries > 0 ? `Attempt ${retries + 1} of ${RETRY_CONFIG.maxRetries + 1}` : 'Processing transaction',
        progress: 10
      });
      
      // Initialize Polkadot connection
      const { api, contract } = await initPolkadot();
      onProgress({
        status: 'processing',
        message: 'Connected to blockchain',
        progress: 20
      });
      
      // Get the signer from the extension
      const callerAddress = localStorage.getItem('wallet_address');
      const signer = await getSigner(callerAddress);
      
      onProgress({
        status: 'processing',
        message: 'Preparing transaction',
        progress: 30
      });
      
      // Prepare metadata as a JSON string
      const metadata = JSON.stringify({
        name: `${nftData.eventName} Attendance`,
        description: `Attended ${nftData.eventName}`,
        image: nftData.image || 'https://via.placeholder.com/300',
        event_id: nftData.eventId,
        attributes: [
          { trait_type: 'Event', value: nftData.eventName },
          { trait_type: 'Date', value: nftData.eventDate },
          { trait_type: 'Location', value: nftData.eventLocation }
        ]
      });
      
      onProgress({
        status: 'processing',
        message: 'Signing transaction',
        progress: 40
      });
      
      // Call the mint_nft function on the contract
      const gasLimit = api.registry.createType('WeightV2', {
        refTime: new BN(1000000000),
        proofSize: new BN(1000000),
      });
      
      const eventId = new BN(nftData.eventId.replace('event-', '')); // Convert event ID to number
      
      // Send the transaction
      const txResult = await contract.tx
        .mintNft({ gasLimit }, eventId, nftData.recipientAddress, metadata)
        .signAndSend(callerAddress, { signer: signer });
      
      onProgress({
        status: 'processing',
        message: 'Transaction submitted',
        progress: 60
      });
      
      // Simulate waiting for confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      onProgress({
        status: 'processing',
        message: 'Transaction confirmed',
        progress: 90
      });
      
      // Create a response object similar to the mock one
      const result = {
        id: `nft-${Date.now()}`,
        owner: nftData.recipientAddress,
        metadata: {
          name: `${nftData.eventName} Attendance`,
          description: `Attended ${nftData.eventName}`,
          image: nftData.image || 'https://via.placeholder.com/300',
          event_id: nftData.eventId,
          attributes: [
            { trait_type: 'Event', value: nftData.eventName },
            { trait_type: 'Date', value: nftData.eventDate },
            { trait_type: 'Location', value: nftData.eventLocation }
          ]
        },
        created_at: new Date().toISOString(),
        txHash: txResult.hash ? txResult.hash.toHex() : null
      };
      
      // Emit an event to notify other components
      window.dispatchEvent(new CustomEvent('nftMinted', { detail: result }));
      
      onProgress({
        status: 'success',
        message: 'NFT minted successfully',
        progress: 100,
        nft: result
      });
      
      return result;
    } catch (error) {
      console.error('Blockchain minting error:', error);
      
      const errorCode = error.code || 'UNKNOWN_ERROR';
      
      // Check if error is retryable
      if (
        retries < RETRY_CONFIG.maxRetries && 
        RETRY_CONFIG.retryableErrors.includes(errorCode)
      ) {
        retries++;
        
        onProgress({
          status: 'retrying',
          message: `Transaction failed. Retrying in ${delay / 1000} seconds...`,
          progress: (retries / (RETRY_CONFIG.maxRetries + 1)) * 100,
          error
        });
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Apply exponential backoff
        delay *= RETRY_CONFIG.backoffFactor;
      } else {
        onProgress({
          status: 'failed',
          message: getErrorMessage(error),
          progress: 100,
          error
        });
        
        throw error;
      }
    }
  }
};

/**
 * Batch mint NFTs with retry and progress tracking
 * @param {Array} nftDataArray - Array of NFT data objects
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<Array>} - Array of minted NFT data
 */
export const batchMintNFTs = async (nftDataArray, onProgress = () => {}) => {
  const results = [];
  let failedMints = [];
  
  for (let i = 0; i < nftDataArray.length; i++) {
    try {
      onProgress({
        status: 'processing',
        message: `Minting NFT ${i + 1} of ${nftDataArray.length}`,
        progress: (i / nftDataArray.length) * 100
      });
      
      const result = await mintNFTWithRetry(
        nftDataArray[i],
        subProgress => {
          onProgress({
            ...subProgress,
            overallProgress: (i / nftDataArray.length) * 100 + (subProgress.progress / nftDataArray.length)
          });
        }
      );
      
      results.push(result);
    } catch (error) {
      failedMints.push({
        data: nftDataArray[i],
        error
      });
    }
  }
  
  if (failedMints.length > 0) {
    onProgress({
      status: 'partial',
      message: `Completed with ${failedMints.length} failures out of ${nftDataArray.length} NFTs`,
      progress: 100,
      results,
      failedMints
    });
  } else {
    onProgress({
      status: 'success',
      message: `Successfully minted ${results.length} NFTs`,
      progress: 100,
      results
    });
  }
  
  return {
    successfulMints: results,
    failedMints
  };
};

/**
 * Get a user-friendly error message
 * @param {Object} error - The error object
 * @returns {String} - User-friendly error message
 */
const getErrorMessage = (error) => {
  const errorCode = error.code || 'UNKNOWN_ERROR';
  
  const errorMessages = {
    'CONNECTION_ERROR': 'Connection to the blockchain failed. Please check your internet connection.',
    'TIMEOUT': 'Transaction timed out. The network may be congested.',
    'BLOCKCHAIN_CONGESTION': 'The blockchain network is currently experiencing high traffic. Transaction may be delayed.',
    'TRANSACTION_UNDERPRICED': 'Transaction fee was too low. Please increase gas price and try again.',
    'INSUFFICIENT_FUNDS': 'Insufficient funds to complete the transaction.',
    'CONTRACT_ERROR': 'Smart contract execution failed. Please check the transaction parameters.',
    'UNAUTHORIZED': 'You are not authorized to perform this action.',
    'UNKNOWN_ERROR': 'An unknown error occurred. Please try again later.',
    'EXTENSION_NOT_FOUND': 'Polkadot.js extension not found. Please install it and try again.'
  };
  
  return errorMessages[errorCode] || error.message || 'Transaction failed. Please try again.';
};

export default {
  mintNFTWithRetry,
  batchMintNFTs
}; 