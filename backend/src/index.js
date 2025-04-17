// backend/src/index.js - Main application file

const express = require('express');
const cors = require('cors');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { ContractPromise } = require('@polkadot/api-contract');
const bodyParser = require('body-parser');
const config = require('../config');
const lumaRouter = require('./luma/router');
const adminRouter = require('./admin/router');
const walletRouter = require('./wallet/router');
const logger = require('./utils/logger');
const nftService = require('./nft/nftService');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Global API connection
let api = null;
let contract = null;

// Initialize Polkadot API connection
async function initPolkadotConnection() {
  try {
    logger.info('Connecting to Polkadot node...');
    const wsProvider = new WsProvider(config.polkadot.nodeUrl);
    api = await ApiPromise.create({ provider: wsProvider });

    const contractAddress = config.polkadot.contractAddress;
    const abi = require(config.polkadot.abiPath);
    contract = new ContractPromise(api, abi, contractAddress);

    logger.info(`Connected to Polkadot node: ${config.polkadot.nodeUrl}`);
    logger.info(`Contract loaded at: ${contractAddress}`);

    // Initialize NFT Service with API and contract
    await nftService.initialize(api, contract);

    return true;
  } catch (error) {
    logger.error(`Failed to connect to Polkadot node: ${error.message}`);
    return false;
  }
}

// Setup routes
app.use('/api/luma', lumaRouter);
app.use('/api/admin', adminRouter);
app.use('/api/wallet', walletRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    polkadotConnected: api ? true : false,
    contractLoaded: contract ? true : false
  });
});

// Start the server
async function startServer() {
  const connected = await initPolkadotConnection();
  if (!connected) {
    logger.error('Failed to connect to blockchain. Exiting...');
    process.exit(1);
  }

  const PORT = process.env.PORT || config.server.port || 3000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down server...');
  if (api) {
    await api.disconnect();
    logger.info('Disconnected from Polkadot node');
  }
  process.exit(0);
});

// Start the server
startServer();