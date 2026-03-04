import winston from "winston";

// Create logger instance
const logger = winston.createLogger({
	level: process.env.NODE_ENV === "production" ? "info" : "debug",
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.errors({ stack: true }),
		winston.format.json(),
	),
	defaultMeta: { service: "foodbridge" },
	transports: [
		// Console transport for development
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple(),
			),
		}),
		// File transport for errors
		...(process.env.NODE_ENV === "production"
			? [
					new winston.transports.File({
						filename: "logs/error.log",
						level: "error",
					}),
					new winston.transports.File({
						filename: "logs/combined.log",
					}),
				]
			: []),
	],
});

// Helper functions for common log patterns
export const logError = (message: string, error: any, metadata?: any) => {
	logger.error(message, {
		error: error instanceof Error ? error.message : error,
		stack: error instanceof Error ? error.stack : undefined,
		...metadata,
	});
};

export const logInfo = (message: string, metadata?: any) => {
	logger.info(message, metadata);
};

export const logWarning = (message: string, metadata?: any) => {
	logger.warn(message, metadata);
};

export const logDebug = (message: string, metadata?: any) => {
	logger.debug(message, metadata);
};

export const logAudit = (action: string, userId: string, metadata?: any) => {
	logger.info("AUDIT", {
		action,
		userId,
		timestamp: new Date().toISOString(),
		...metadata,
	});
};

export default logger;
