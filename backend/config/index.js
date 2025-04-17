/**
 * Application configuration
 */
const config = {
    // Server configuration
    server: {
      port: process.env.PORT || 3000,
      env: process.env.NODE_ENV || 'development'
    },

    // Database configuration
    database: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/polkadot_attendance',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    },

    // Polkadot configuration
    polkadot: {
      nodeUrl: process.env.POLKADOT_NODE_URL || 'wss://rpc.polkadot.io',
      contractAddress: process.env.CONTRACT_ADDRESS,
      adminMnemonic: process.env.ADMIN_MNEMONIC,
      abiPath: process.env.ABI_PATH || '../contracts/build/AttendanceNFT.json'
    },

    // Luma API configuration
    luma: {
      apiUrl: process.env.LUMA_API_URL || 'https://api.lu.ma/v1',
      apiKey: process.env.LUMA_API_KEY,
      webhookSecret: process.env.LUMA_WEBHOOK_SECRET
    },

    // JWT configuration for authentication
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key-for-development',
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    },

    // Wallet configuration
    wallet: {
      encryptionKey: process.env.WALLET_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    },

    // Logging configuration
    logging: {
      level: process.env.LOG_LEVEL || 'info'
    }
  };

  module.exports = config;