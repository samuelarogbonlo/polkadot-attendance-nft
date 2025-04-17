const express = require('express');
const router = express.Router();
const lumaService = require('./service');
const logger = require('../utils/logger');
const { authorize } = require('../utils/auth');

// Webhook endpoint for Luma check-ins
router.post('/webhook/check-in', async (req, res) => {
  try {
    // Verify webhook signature (in production, implement webhook verification)
    // verify(req);

    const result = await lumaService.handleCheckIn(req.body);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    logger.error(`Error in check-in webhook: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal server error processing check-in'
    });
  }
});

// Manually trigger check-in (for testing or admin use)
router.post('/manual-check-in', authorize('admin'), async (req, res) => {
  try {
    const { eventId, attendeeId } = req.body;

    if (!eventId || !attendeeId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: eventId, attendeeId'
      });
    }

    const result = await lumaService.handleCheckIn({
      eventId,
      attendeeId,
      checkInTime: new Date().toISOString()
    });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    logger.error(`Error in manual check-in: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal server error processing manual check-in'
    });
  }
});

module.exports = router;