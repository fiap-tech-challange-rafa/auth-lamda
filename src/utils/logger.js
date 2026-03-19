const logger = require('winston');

const logLevel = process.env.LOG_LEVEL || 'info';

const loggerInstance = logger.createLogger({
  level: logLevel,
  format: logger.format.combine(
    logger.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logger.format.errors({ stack: true }),
    logger.format.json()
  ),
  defaultMeta: { service: 'auth-lambda' },
  transports: [
    new logger.transports.Console({
      format: logger.format.combine(
        logger.format.colorize(),
        logger.format.printf(
          ({ level, message, timestamp, ...meta }) =>
            `${timestamp} [${level}]: ${message} ${JSON.stringify(meta)}`
        )
      ),
    }),
  ],
});

module.exports = loggerInstance;
