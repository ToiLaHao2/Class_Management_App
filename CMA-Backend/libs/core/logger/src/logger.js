const winston = require('winston');
const { appConfig } = require('@core/config');

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Format In Console Coder nhin cho dep
const devFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
});

// Format JSON khi dua len Production (AWS, Goolge Cloud, Datadog...)
const prodFormat = combine(
    timestamp(),
    errors({ stack: true }),
    winston.format.json()
);

const logger = winston.createLogger({
    level: appConfig.env === 'development' ? 'debug' : 'info',
    format: appConfig.env === 'development' ? combine(colorize(), timestamp({ format: 'HH:mm:ss' }), errors({ stack: true }), devFormat) : prodFormat,
    defaultMeta: { service: 'cma-backend' },
    transports: [
        new winston.transports.Console()
    ],
});

// Neu chay tren Prod, ghi them log ra file
if (appConfig.env === 'production') {
    logger.add(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
    logger.add(new winston.transports.File({ filename: 'logs/combined.log' }));
}

module.exports = logger;
