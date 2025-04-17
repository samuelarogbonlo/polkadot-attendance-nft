const express = require('express');
const router = express.Router();
const eventRepository = require('./eventRepository');
const mintRepository = require('../nft/mintRepository');
const logger = require('../utils/logger');
const { authorize } = require('../utils/auth');

// Get all events
router.get('/events', authorize('admin'), async (req, res) => {
  try {
    const filters = {
      active: req.query.active === 'true',
      organizer: req.query.organizer,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const events = await eventRepository.getAllEvents(filters);

    return res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    logger.error(`Error fetching events: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get a specific event
router.get('/events/:eventId', authorize('admin'), async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await eventRepository.getEvent(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    return res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    logger.error(`Error fetching event: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create a new event
router.post('/events', authorize('admin'), async (req, res) => {
  try {
    const {
      name,
      date,
      location,
      lumaEventId,
      description,
      organizer,
      imageUrl,
      active
    } = req.body;

    // Validate required fields
    if (!name || !date || !location || !lumaEventId || !organizer) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if event with this Luma ID already exists
    const existingEvent = await eventRepository.getEventByLumaId(lumaEventId);
    if (existingEvent) {
      return res.status(409).json({
        success: false,
        message: 'Event with this Luma ID already exists',
        eventId: existingEvent.id
      });
    }

    const event = await eventRepository.createEvent({
      name,
      date,
      location,
      lumaEventId,
      description,
      organizer,
      imageUrl,
      active
    });

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    logger.error(`Error creating event: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update an event
router.put('/events/:eventId', authorize('admin'), async (req, res) => {
  try {
    const { eventId } = req.params;
    const updateData = req.body;

    // Prevent changing lumaEventId to avoid data integrity issues
    if (updateData.lumaEventId) {
      delete updateData.lumaEventId;
    }

    const event = await eventRepository.updateEvent(eventId, updateData);

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    logger.error(`Error updating event: ${error.message}`);

    if (error.message === 'Event not found') {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete an event
router.delete('/events/:eventId', authorize('admin'), async (req, res) => {
  try {
    const { eventId } = req.params;

    const result = await eventRepository.deleteEvent(eventId);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting event: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get event statistics
router.get('/events/:eventId/stats', authorize('admin'), async (req, res) => {
  try {
    const { eventId } = req.params;

    const stats = await eventRepository.getEventStats(eventId);
    if (!stats) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    return res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error(`Error fetching event stats: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get minted NFTs for an event
router.get('/events/:eventId/nfts', authorize('admin'), async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verify event exists
    const event = await eventRepository.getEvent(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get NFTs minted for this event
    const mints = await mintRepository.getMintsByEvent(eventId);

    return res.status(200).json({
      success: true,
      eventName: event.name,
      totalMints: mints.length,
      mints
    });
  } catch (error) {
    logger.error(`Error fetching event NFTs: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;