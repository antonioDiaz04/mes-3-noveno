const { createLogger, format, transports } = require("winston");

// Función para formatear el log de la petición HTTP
const httpLogFormat = format.printf((info) => {
  const { timestamp, level, message, ...meta } = info;
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...meta,
  });
});

const logger  = createLogger({
  format: format.combine(
    format.timestamp(), // Obtener el tiempo
    httpLogFormat
  ),

  transports: [
    new transports.File({
      maxsize: 5120000,
      maxFiles: 100,
      filename: `${__dirname}/../logs/log-api.log`, // ruta de donde se guardaran los errores (el archivo log)
    }),
    new transports.Console({
      level: "debug",
    }),
  ],
});

// Registrar la petición HTTP
const logHttpRequest = (req, res, responseTime) => {
  const { method, originalUrl, query, body, ip, headers } = req;
  const { statusCode } = res;

  logger.info("HTTP Request", {
    timestamp: new Date().toISOString(),
    method,
    endpoint: originalUrl,
    queryParams: query,
    userId: req.user ? req.user.id : null, // Asumiendo que el usuario está en req.user
    ip,
    userAgent: headers["user-agent"],
    requestBody: body,
    responseStatus: statusCode,
    responseTime: `${responseTime}ms`,

  });
};

module.exports = { logger, logHttpRequest };