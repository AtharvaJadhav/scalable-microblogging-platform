import winston from 'winston';

const logFormat = winston.format.printf((info) => {
  // Use type assertion to assure TypeScript about the presence of these properties
  const { level, message, timestamp } = info as { level: string; message: string; timestamp: string };
  return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'MM/DD/YYYY HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'MM/DD/YYYY HH:mm:ss' }),
      logFormat
    )
  }));
}

export default logger;
