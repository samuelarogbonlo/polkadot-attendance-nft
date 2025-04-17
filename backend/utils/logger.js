const winston = require('winston');
const config = require('../config');

/**
 * Application logger
 */
const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'polkadot-attendance' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Add file transport in production
if (config.server.env === 'production') {
  logger.add(new winston.transports.File({
    filename: 'error.log',
    level: 'error',
    dirname: 'logs'
  }));

  logger.add(new winston.transports.File({
    filename: 'combined.log',
    dirname: 'logs'
  }));
}

module.exports = logger;