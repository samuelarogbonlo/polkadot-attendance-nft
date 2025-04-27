/**
 * Notification Service for handling check-in alerts and summary reports
 */

// Default notification settings
const defaultSettings = {
  email: {
    enabled: true,
    largeCheckInThreshold: 10, // Send alert when X check-ins happen within threshold period
    checkInThresholdPeriod: 5 * 60 * 1000, // 5 minutes in ms
    dailySummary: true,
    weeklySummary: true
  },
  push: {
    enabled: false,
    largeCheckInThreshold: 5,
    checkInThresholdPeriod: 5 * 60 * 1000, // 5 minutes in ms
    dailySummary: false,
    weeklySummary: true
  },
  ui: {
    enabled: true,
    showAllCheckIns: true,
    largeCheckInThreshold: 5,
    checkInThresholdPeriod: 5 * 60 * 1000 // 5 minutes in ms
  }
};

// Store check-in history for detecting large influxes
let checkInHistory = [];

// Store subscribed callbacks
const subscribers = {
  checkIn: [],
  summary: [],
  alert: []
};

/**
 * Initialize notification settings with user preferences
 * @param {Object} userSettings - User's notification preferences
 */
export const initializeSettings = (userSettings = {}) => {
  // In production, this would merge user settings from backend/localStorage
  const settings = {
    email: { ...defaultSettings.email, ...userSettings.email },
    push: { ...defaultSettings.push, ...userSettings.push },
    ui: { ...defaultSettings.ui, ...userSettings.ui }
  };
  
  return settings;
};

/**
 * Handle a new check-in event
 * @param {Object} checkInData - Data from the check-in webhook
 */
export const handleCheckIn = (checkInData) => {
  // Record check-in for detecting large influxes
  const timestamp = new Date();
  checkInHistory.push({
    ...checkInData,
    timestamp
  });
  
  // Clean up old history
  const oldestToKeep = new Date(timestamp.getTime() - 24 * 60 * 60 * 1000); // Keep 24 hours
  checkInHistory = checkInHistory.filter(record => record.timestamp >= oldestToKeep);
  
  // Notify subscribers of new check-in
  notifySubscribers('checkIn', checkInData);
  
  // Check for large influx of check-ins
  const settings = initializeSettings();
  checkForLargeInflux(settings);
};

/**
 * Check for large influx of check-ins within threshold period
 * @param {Object} settings - Notification settings
 */
const checkForLargeInflux = (settings) => {
  const now = new Date();
  
  // Check email alerts
  if (settings.email.enabled) {
    const emailThresholdTime = new Date(now.getTime() - settings.email.checkInThresholdPeriod);
    const recentCheckInsEmail = checkInHistory.filter(
      record => record.timestamp >= emailThresholdTime
    );
    
    if (recentCheckInsEmail.length >= settings.email.largeCheckInThreshold) {
      sendEmailAlert(recentCheckInsEmail);
    }
  }
  
  // Check push notifications
  if (settings.push.enabled) {
    const pushThresholdTime = new Date(now.getTime() - settings.push.checkInThresholdPeriod);
    const recentCheckInsPush = checkInHistory.filter(
      record => record.timestamp >= pushThresholdTime
    );
    
    if (recentCheckInsPush.length >= settings.push.largeCheckInThreshold) {
      sendPushNotification(recentCheckInsPush);
    }
  }
  
  // Check UI notifications
  if (settings.ui.enabled) {
    const uiThresholdTime = new Date(now.getTime() - settings.ui.checkInThresholdPeriod);
    const recentCheckInsUI = checkInHistory.filter(
      record => record.timestamp >= uiThresholdTime
    );
    
    if (recentCheckInsUI.length >= settings.ui.largeCheckInThreshold) {
      const alertData = {
        type: 'large_influx',
        checkIns: recentCheckInsUI,
        count: recentCheckInsUI.length,
        timestamp: now
      };
      
      notifySubscribers('alert', alertData);
    }
  }
};

/**
 * Send email alert for large check-in influx
 * @param {Array} checkIns - Recent check-in data
 */
const sendEmailAlert = (checkIns) => {
  // In production, this would call an API to send an email
  console.log(`[Email Alert] ${checkIns.length} check-ins in the last few minutes!`);
  
  const eventNames = [...new Set(checkIns.map(checkIn => checkIn.eventName))];
  const eventString = eventNames.join(', ');
  
  notifySubscribers('alert', {
    type: 'email_sent',
    medium: 'email',
    message: `Email alert sent: ${checkIns.length} check-ins for ${eventString}`,
    timestamp: new Date()
  });
};

/**
 * Send push notification for large check-in influx
 * @param {Array} checkIns - Recent check-in data
 */
const sendPushNotification = (checkIns) => {
  // In production, this would call a push notification service
  console.log(`[Push Notification] ${checkIns.length} new check-ins!`);
  
  notifySubscribers('alert', {
    type: 'push_sent',
    medium: 'push',
    message: `Push notification sent: ${checkIns.length} new check-ins`,
    timestamp: new Date()
  });
};

/**
 * Generate and send a daily summary report
 */
export const sendDailySummary = () => {
  // Get the last 24 hours of check-ins
  const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const dailyCheckIns = checkInHistory.filter(record => record.timestamp >= oneDayAgo);
  
  // Group by event
  const eventSummary = groupCheckInsByEvent(dailyCheckIns);
  
  const summaryData = {
    type: 'daily',
    checkIns: dailyCheckIns,
    eventSummary,
    totalCount: dailyCheckIns.length,
    timestamp: new Date()
  };
  
  // In production, this would call an API to send the summary email
  console.log(`[Daily Summary] ${dailyCheckIns.length} check-ins across ${Object.keys(eventSummary).length} events`);
  
  notifySubscribers('summary', summaryData);
  
  return summaryData;
};

/**
 * Generate and send a weekly summary report
 */
export const sendWeeklySummary = () => {
  // Get the last 7 days of check-ins
  const oneWeekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
  const weeklyCheckIns = checkInHistory.filter(record => record.timestamp >= oneWeekAgo);
  
  // Group by event
  const eventSummary = groupCheckInsByEvent(weeklyCheckIns);
  
  // Group by day
  const dailySummary = groupCheckInsByDay(weeklyCheckIns);
  
  const summaryData = {
    type: 'weekly',
    checkIns: weeklyCheckIns,
    eventSummary,
    dailySummary,
    totalCount: weeklyCheckIns.length,
    timestamp: new Date()
  };
  
  // In production, this would call an API to send the summary email
  console.log(`[Weekly Summary] ${weeklyCheckIns.length} check-ins across ${Object.keys(eventSummary).length} events`);
  
  notifySubscribers('summary', summaryData);
  
  return summaryData;
};

/**
 * Group check-ins by event
 * @param {Array} checkIns - Check-in data
 * @returns {Object} - Summary by event
 */
const groupCheckInsByEvent = (checkIns) => {
  const eventSummary = {};
  
  checkIns.forEach(checkIn => {
    const eventName = checkIn.eventName || 'Unknown Event';
    
    if (!eventSummary[eventName]) {
      eventSummary[eventName] = {
        count: 0,
        checkIns: []
      };
    }
    
    eventSummary[eventName].count += 1;
    eventSummary[eventName].checkIns.push(checkIn);
  });
  
  return eventSummary;
};

/**
 * Group check-ins by day
 * @param {Array} checkIns - Check-in data
 * @returns {Object} - Summary by day
 */
const groupCheckInsByDay = (checkIns) => {
  const dailySummary = {};
  
  checkIns.forEach(checkIn => {
    const day = checkIn.timestamp.toISOString().split('T')[0];
    
    if (!dailySummary[day]) {
      dailySummary[day] = {
        count: 0,
        checkIns: []
      };
    }
    
    dailySummary[day].count += 1;
    dailySummary[day].checkIns.push(checkIn);
  });
  
  return dailySummary;
};

/**
 * Subscribe to notification events
 * @param {String} event - Event type: 'checkIn', 'summary', or 'alert'
 * @param {Function} callback - Function to call when event occurs
 * @returns {Function} - Unsubscribe function
 */
export const subscribe = (event, callback) => {
  if (!subscribers[event]) {
    subscribers[event] = [];
  }
  
  subscribers[event].push(callback);
  
  // Return unsubscribe function
  return () => {
    subscribers[event] = subscribers[event].filter(cb => cb !== callback);
  };
};

/**
 * Notify all subscribers of an event
 * @param {String} event - Event type
 * @param {Object} data - Event data
 */
const notifySubscribers = (event, data) => {
  if (!subscribers[event]) return;
  
  subscribers[event].forEach(callback => {
    try {
      callback(data);
    } catch (error) {
      console.error(`Error in ${event} notification subscriber:`, error);
    }
  });
};

export default {
  initializeSettings,
  handleCheckIn,
  sendDailySummary,
  sendWeeklySummary,
  subscribe
}; 