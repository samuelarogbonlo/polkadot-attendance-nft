const { MongoClient } = require('mongodb');
const config = require('../config');
const logger = require('./logger');

let client;
let db;

/**
 * Connect to MongoDB
 * @returns {Promise<Object>} - MongoDB database instance
 */
async function connect() {
  try {
    if (db) return db;

    client = new MongoClient(config.database.uri, config.database.options);
    await client.connect();

    // Get database name from URI or use default
    const dbName = new URL(config.database.uri).pathname.substring(1) || 'polkadot_attendance';
    db = client.db(dbName);

    logger.info(`Connected to MongoDB: ${config.database.uri}`);

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await disconnect();
      process.exit(0);
    });

    return db;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnect() {
  if (client) {
    await client.close();
    logger.info('Disconnected from MongoDB');
  }
}

/**
 * Get MongoDB collection
 * @param {string} name - Collection name
 * @returns {Object} - MongoDB collection
 */
function collection(name) {
  if (!db) {
    throw new Error('Database not connected');
  }

  return db.collection(name);
}

// Connect on module import
connect().catch(err => {
  logger.error(`Failed to connect to MongoDB: ${err.message}`);
  process.exit(1);
});

module.exports = {
  connect,
  disconnect,
  collection,
  client: () => client,
  db: () => db
};