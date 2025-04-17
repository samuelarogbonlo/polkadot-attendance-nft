const { v4: uuidv4 } = require('uuid');
const db = require('../utils/db');
const logger = require('../utils/logger');

/**
 * Repository for managing event data
 */
class EventRepository {
  /**
   * Create a new event
   * @param {Object} eventData - Event data
   * @returns {Promise<Object>} - Created event
   */
  async createEvent(eventData) {
    try {
      const event = {
        id: uuidv4(),
        name: eventData.name,
        date: eventData.date,
        location: eventData.location,
        lumaEventId: eventData.lumaEventId,
        description: eventData.description || '',
        organizer: eventData.organizer,
        imageUrl: eventData.imageUrl || '',
        active: eventData.active !== false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('events').insertOne(event);
      logger.info(`Created event: ${event.name} (ID: ${event.id})`);

      return event;
    } catch (error) {
      logger.error(`Error creating event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an existing event
   * @param {string} eventId - Event ID to update
   * @param {Object} eventData - Updated event data
   * @returns {Promise<Object>} - Updated event
   */
  async updateEvent(eventId, eventData) {
    try {
      const updateData = {
        ...eventData,
        updatedAt: new Date()
      };

      delete updateData.id; // Cannot update ID
      delete updateData.createdAt; // Cannot update creation timestamp

      const result = await db.collection('events').findOneAndUpdate(
        { id: eventId },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!result.value) {
        throw new Error('Event not found');
      }

      logger.info(`Updated event: ${result.value.name} (ID: ${eventId})`);

      return result.value;
    } catch (error) {
      logger.error(`Error updating event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get event by ID
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} - Event data
   */
  async getEvent(eventId) {
    try {
      const event = await db.collection('events').findOne({ id: eventId });
      return event;
    } catch (error) {
      logger.error(`Error fetching event: ${error.message}`);
      return null;
    }
  }

  /**
   * Get event by Luma Event ID
   * @param {string} lumaEventId - Luma Event ID
   * @returns {Promise<Object>} - Event data
   */
  async getEventByLumaId(lumaEventId) {
    try {
      const event = await db.collection('events').findOne({ lumaEventId });
      return event;
    } catch (error) {
      logger.error(`Error fetching event by Luma ID: ${error.message}`);
      return null;
    }
  }

  /**
   * Get all events
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} - List of events
   */
  async getAllEvents(filters = {}) {
    try {
      const query = {};

      // Apply filters
      if (filters.active !== undefined) {
        query.active = filters.active;
      }

      if (filters.organizer) {
        query.organizer = filters.organizer;
      }

      // Apply date range filters if provided
      if (filters.startDate || filters.endDate) {
        query.date = {};

        if (filters.startDate) {
          query.date.$gte = filters.startDate;
        }

        if (filters.endDate) {
          query.date.$lte = filters.endDate;
        }
      }

      const events = await db.collection('events')
        .find(query)
        .sort({ date: -1 })
        .toArray();

      return events;
    } catch (error) {
      logger.error(`Error fetching events: ${error.message}`);
      return [];
    }
  }

  /**
   * Delete an event
   * @param {string} eventId - Event ID to delete
   * @returns {Promise<boolean>} - Whether deletion was successful
   */
  async deleteEvent(eventId) {
    try {
      const result = await db.collection('events').deleteOne({ id: eventId });

      if (result.deletedCount === 0) {
        return false;
      }

      logger.info(`Deleted event with ID: ${eventId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting event: ${error.message}`);
      return false;
    }
  }

  /**
   * Get event statistics
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} - Event statistics
   */
  async getEventStats(eventId) {
    try {
      const event = await this.getEvent(eventId);
      if (!event) {
        return null;
      }

      // Get NFT minting stats for this event
      const totalMints = await db.collection('nft_mints').countDocuments({ eventId });

      // Get recent mints
      const recentMints = await db.collection('nft_mints')
        .find({ eventId })
        .sort({ mintedAt: -1 })
        .limit(10)
        .toArray();

      return {
        eventId,
        eventName: event.name,
        totalMints,
        recentMints
      };
    } catch (error) {
      logger.error(`Error fetching event stats: ${error.message}`);
      return null;
    }
  }
}

module.exports = new EventRepository();
