const { Keyring } = require('@polkadot/keyring');
const { ContractPromise } = require('@polkadot/api-contract');
const { BN } = require('@polkadot/util');
const logger = require('../utils/logger');
const config = require('../../config');
const mintRepository = require('./mintRepository');

/**
 * Service for interacting with the NFT smart contract
 */
class NFTService {
  constructor() {
    this.api = null;
    this.contract = null;
    this.adminAccount = null;
  }

  /**
   * Initialize the NFT service with Polkadot API and contract
   * @param {ApiPromise} api - Polkadot API instance
   * @param {ContractPromise} contract - Contract instance
   */
  async initialize(api, contract) {
    this.api = api;
    this.contract = contract;

    // Set up admin account for signing transactions
    const keyring = new Keyring({ type: 'sr25519' });
    this.adminAccount = keyring.addFromMnemonic(config.polkadot.adminMnemonic);

    logger.info(`NFT Service initialized with admin account: ${this.adminAccount.address}`);

    // Verify contract access
    const isAuthorized = await this.checkMintingAuthorization();
    if (!isAuthorized) {
      logger.error('Admin account is not authorized to mint NFTs');
      throw new Error('Admin account is not authorized to mint NFTs');
    }

    logger.info('NFT Service ready - Admin account authorized to mint');
  }

  /**
   * Check if admin account is authorized to mint NFTs
   * @returns {Promise<boolean>} - Whether admin is authorized
   */
  async checkMintingAuthorization() {
    try {
      // Call the contract's is_authorized_minter function
      const { result, output } = await this.contract.query.isAuthorizedMinter(
        this.adminAccount.address,
        { gasLimit: -1 },
        this.adminAccount.address
      );

      if (result.isOk && output) {
        return output.toPrimitive();
      }

      return false;
    } catch (error) {
      logger.error(`Error checking minting authorization: ${error.message}`);
      return false;
    }
  }

  /**
   * Mint an attendance NFT for an attendee
   * @param {Object} params - Minting parameters
   * @returns {Promise<Object>} - Result of minting operation
   */
  async mintAttendanceNFT(params) {
    try {
      if (!this.api || !this.contract || !this.adminAccount) {
        throw new Error('NFT Service not properly initialized');
      }

      // Prepare contract call parameters
      const value = 0;
      const gasLimit = -1; // Use automatic gas estimation

      logger.info(`Minting NFT for attendee wallet: ${params.to}`);

      // Call the mint_attendance_nft function on the smart contract
      const tx = await this.contract.tx.mintAttendanceNft(
        { value, gasLimit },
        params.to,
        params.eventName,
        params.eventDate,
        params.eventLocation,
        params.eventId,
        params.tokenUri
      );

      // Sign and send the transaction
      const txResult = await new Promise((resolve, reject) => {
        tx.signAndSend(this.adminAccount, ({ status, events, dispatchError }) => {
          if (status.isInBlock || status.isFinalized) {
            // Check for errors
            if (dispatchError) {
              if (dispatchError.isModule) {
                const decoded = this.api.registry.findMetaError(dispatchError.asModule);
                const { docs, name, section } = decoded;
                reject(new Error(`${section}.${name}: ${docs.join(' ')}`));
              } else {
                reject(new Error(dispatchError.toString()));
              }
            }

            // Find the successful minting event
            let mintEvent = null;
            events.forEach(({ event }) => {
              if (event.method === 'Mint') {
                const [to, tokenId, eventId] = event.data;
                mintEvent = { to, tokenId: tokenId.toNumber(), eventId: eventId.toString() };
              }
            });

            if (mintEvent) {
              // Store minting record in database
              mintRepository.recordMint({
                tokenId: mintEvent.tokenId,
                eventId: params.eventId,
                attendeeEmail: params.attendeeEmail,
                walletAddress: params.to,
                mintedAt: new Date()
              });

              resolve({ success: true, tokenId: mintEvent.tokenId });
            } else {
              reject(new Error('Mint event not found in transaction'));
            }
          }

          if (status.isError) {
            reject(new Error('Transaction failed'));
          }
        });
      });

      return txResult;
    } catch (error) {
      logger.error(`Error minting NFT: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Check if an NFT was already minted for an attendee at a specific event
   * @param {string} eventId - Event ID
   * @param {string} attendeeEmail - Attendee email
   * @returns {Promise<boolean>} - Whether NFT was already minted
   */
  async checkAlreadyMinted(eventId, attendeeEmail) {
    try {
      const record = await mintRepository.findMintRecord(eventId, attendeeEmail);
      return !!record;
    } catch (error) {
      logger.error(`Error checking minting status: ${error.message}`);
      return false;
    }
  }

  /**
   * Get NFT details by token ID
   * @param {number} tokenId - NFT token ID
   * @returns {Promise<Object>} - NFT details
   */
  async getNFTDetails(tokenId) {
    try {
      // Call the token_metadata function on the contract
      const { result, output } = await this.contract.query.tokenMetadata(
        this.adminAccount.address,
        { gasLimit: -1 },
        tokenId
      );

      if (result.isOk && output) {
        const metadata = output.toPrimitive();
        return {
          tokenId,
          eventInfo: metadata.event_info,
          tokenUri: metadata.token_uri,
          createdAt: new Date(metadata.created_at)
        };
      }

      return null;
    } catch (error) {
      logger.error(`Error fetching NFT details: ${error.message}`);
      return null;
    }
  }
}

module.exports = new NFTService();
