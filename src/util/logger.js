const { createLogger, format, transports } = require("winston");
const Log = require("../Models/loggerModel.js");

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

const logger = createLogger({
  format: format.combine(
    format.timestamp(), // Obtener el tiempo
    httpLogFormat
  ),

  //Codigo para guardar los errores en un archivo
  transports: [
    new transports.File({
      maxsize: 5120000,
      maxFiles: 100,
      filename: `${__dirname}/../logs/log-api.log`, // ruta de donde se guardaran los errores (el archivo log)
    }),
  ],
});

const logHttpRequest = async (req, res, responseTime) => {
  const { method, originalUrl, query, body, ip, headers } = req;
  const { statusCode } = res;

  try {
    const logEntry = new Log({
      timestamp: new Date(),
      level: "info",
      message: "HTTP Request",
      method,
      endpoint: originalUrl,
      queryParams: query,
      userId: req.user ? req.user.id : null, 
      ip,
      userAgent: headers["user-agent"],
      requestBody: body,
      responseStatus: statusCode,
      responseTime: `${responseTime}ms`,
    });

    await logEntry.save();
  } catch (error) {
    
    logger.error("Error al verificar el CAPTCHA:", error.message);
    console.error("Error guardando el log en MongoDB:", error);
  }
};

module.exports = { logger, logHttpRequest };
