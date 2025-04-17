const { v4: uuidv4 } = require('uuid');
const db = require('../utils/db');
const logger = require('../utils/logger');

/**
 * Repository for managing NFT minting records
 */
class MintRepository {
  /**
   * Record a new NFT mint
   * @param {Object} mintData - Data about the minted NFT
   * @returns {Promise<Object>} - Created record
   */
  async recordMint(mintData) {
    try {
      const record = {
        id: uuidv4(),
        tokenId: mintData.tokenId,
        eventId: mintData.eventId,
        attendeeEmail: mintData.attendeeEmail,
        walletAddress: mintData.walletAddress,
        mintedAt: mintData.mintedAt || new Date(),
        createdAt: new Date()
      };

      await db.collection('nft_mints').insertOne(record);
      logger.info(`Recorded mint for token ID: ${mintData.tokenId}, attendee: ${mintData.attendeeEmail}`);

      return record;
    } catch (error) {
      logger.error(`Error recording mint: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find a mint record for an attendee at a specific event
   * @param {string} eventId - Event ID
   * @param {string} attendeeEmail - Attendee email
   * @returns {Promise<Object>} - Mint record if found
   */
  async findMintRecord(eventId, attendeeEmail) {
    try {
      const record = await db.collection('nft_mints').findOne({
        eventId,
        attendeeEmail
      });

      return record;
    } catch (error) {
      logger.error(`Error finding mint record: ${error.message}`);
      return null;
    }
  }

  /**
   * Get all NFTs minted for an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} - List of mint records
   */
  async getMintsByEvent(eventId) {
    try {
      const records = await db.collection('nft_mints')
        .find({ eventId })
        .sort({ mintedAt: -1 })
        .toArray();

      return records;
    } catch (error) {
      logger.error(`Error fetching mints for event: ${error.message}`);
      return [];
    }
  }

  /**
   * Get all NFTs minted for an attendee
   * @param {string} attendeeEmail - Attendee email
   * @returns {Promise<Array>} - List of mint records
   */
  async getMintsByAttendee(attendeeEmail) {
    try {
      const records = await db.collection('nft_mints')
        .find({ attendeeEmail })
        .sort({ mintedAt: -1 })
        .toArray();

      return records;
    } catch (error) {
      logger.error(`Error fetching mints for attendee: ${error.message}`);
      return [];
    }
  }
}

module.exports = new MintRepository();