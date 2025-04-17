const axios = require('axios');
const config = require('../../config');
const logger = require('../utils/logger');
const nftService = require('../nft/nftService');
const walletService = require('../wallet/service');
const eventRepository = require('../admin/eventRepository');

/**
 * Luma API Service
 * Handles integration with Luma's event platform
 */
class LumaService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: config.luma.apiUrl,
      headers: {
        'Authorization': `Bearer ${config.luma.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Handle check-in webhook from Luma
   * @param {Object} data - Check-in data from Luma
   * @returns {Promise<Object>} - Result of the operation
   */
  async handleCheckIn(data) {
    try {
      logger.info(`Received check-in for attendee: ${data.attendeeId}`);

      // Validate the check-in data
      if (!this.validateCheckInData(data)) {
        logger.error('Invalid check-in data received');
        return { success: false, message: 'Invalid check-in data' };
      }

      // Get event details from our database
      const event = await eventRepository.getEventByLumaId(data.eventId);
      if (!event) {
        logger.error(`Event not found: ${data.eventId}`);
        return { success: false, message: 'Event not configured in the system' };
      }

      // Get attendee details from Luma
      const attendee = await this.getAttendeeDetails(data.eventId, data.attendeeId);
      if (!attendee) {
        logger.error(`Could not fetch attendee details: ${data.attendeeId}`);
        return { success: false, message: 'Could not fetch attendee details' };
      }

      // Get or create wallet for the attendee
      const walletAddress = await walletService.getOrCreateWallet(attendee.email);
      if (!walletAddress) {
        logger.error(`Could not get or create wallet for attendee: ${attendee.email}`);
        return { success: false, message: 'Could not prepare wallet for NFT delivery' };
      }

      // Check if NFT was already minted for this attendee at this event
      const alreadyMinted = await nftService.checkAlreadyMinted(event.id, attendee.email);
      if (alreadyMinted) {
        logger.info(`NFT already minted for attendee: ${attendee.email} at event: ${event.id}`);
        return { success: true, message: 'NFT already minted', alreadyMinted: true };
      }

      // Mint the NFT for the attendee
      const mintResult = await nftService.mintAttendanceNFT({
        to: walletAddress,
        eventName: event.name,
        eventDate: event.date,
        eventLocation: event.location,
        eventId: event.id,
        tokenUri: this.generateTokenUri(event, attendee),
        attendeeEmail: attendee.email
      });

      if (mintResult.success) {
        logger.info(`Successfully minted NFT for attendee: ${attendee.email}, token ID: ${mintResult.tokenId}`);

        // Send success notification to attendee
        await this.sendSuccessNotification(attendee, event, mintResult.tokenId);

        return {
          success: true,
          message: 'NFT minted successfully',
          tokenId: mintResult.tokenId
        };
      } else {
        logger.error(`Failed to mint NFT: ${mintResult.message}`);
        return { success: false, message: mintResult.message };
      }
    } catch (error) {
      logger.error(`Error handling check-in: ${error.message}`);
      return { success: false, message: `Error processing check-in: ${error.message}` };
    }
  }

  /**
   * Validate check-in data from Luma
   * @param {Object} data - Check-in data
   * @returns {boolean} - Whether data is valid
   */
  validateCheckInData(data) {
    return data &&
           data.eventId &&
           data.attendeeId &&
           data.checkInTime;
  }

  /**
   * Get attendee details from Luma API
   * @param {string} eventId - Luma Event ID
   * @param {string} attendeeId - Luma Attendee ID
   * @returns {Promise<Object>} - Attendee details
   */
  async getAttendeeDetails(eventId, attendeeId) {
    try {
      const response = await this.apiClient.get(
        `/events/${eventId}/attendees/${attendeeId}`
      );

      if (response.status === 200 && response.data) {
        return {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          checkInStatus: response.data.checkInStatus,
          registrationDate: response.data.registrationDate
        };
      }

      return null;
    } catch (error) {
      logger.error(`Error fetching attendee details: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate token URI for the NFT metadata
   * @param {Object} event - Event details
   * @param {Object} attendee - Attendee details
   * @returns {string} - Token URI for metadata
   */
  generateTokenUri(event, attendee) {
    // In a production environment, this would generate and store
    // metadata on IPFS or another decentralized storage
    // For this implementation, we'll return a placeholder
    return `ipfs://placeholder/${event.id}/${attendee.id}`;
  }

  /**
   * Send success notification to attendee
   * @param {Object} attendee - Attendee details
   * @param {Object} event - Event details
   * @param {number} tokenId - NFT token ID
   * @returns {Promise<boolean>} - Whether notification was sent
   */
  async sendSuccessNotification(attendee, event, tokenId) {
    // In a production system, this would send an email or notification
    // through Luma's API or a separate notification service
    logger.info(`Would send notification to ${attendee.email} for NFT ${tokenId}`);
    return true;
  }
}

module.exports = new LumaService();