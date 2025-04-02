const { createLogger, format, transports } = require("winston");
const path = require("path");
const DailyRotateFile = require('winston-daily-rotate-file');

// 1. Filtro para excluir favicon.ico
const excludeFavicon = format((info) => {
  const isFavicon = info.endpoint?.includes('favicon.ico') || 
                   info.message?.includes('favicon.ico');
  return isFavicon ? false : info;
});

// 2. Configuración de archivos rotativos
const fileRotateTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../logs/logs-application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    excludeFavicon(),
    format.json()
  )
});

// 3. Configuración del logger principal
const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(info => {
          const { timestamp, level, message, ...meta } = info;
          return `${timestamp} [${level}]: ${message} ${JSON.stringify(meta)}`;
        })
      )
    }),
    fileRotateTransport
  ],
  exceptionHandlers: [
    new transports.File({ 
      filename: path.join(__dirname, '../logs/exceptions.log')
    })
  ]
});

// 4. Función para registrar peticiones HTTP
const logHttpRequest = (req, res, responseTime, level = 'info') => {
  // Excluir favicon y otros recursos estáticos
  const excluded = ['favicon.ico', '.css', '.js', '.png', '.jpg', '.svg'];
  if (excluded.some(ext => req.originalUrl.includes(ext))) {
    return;
  }

  const { method, originalUrl, query, body, ip, headers } = req;
  const { statusCode } = res;

  logger.log(level, 'HTTP Request', {
    method,
    endpoint: originalUrl,
    queryParams: query || {},
    userId: req.user?.id || null,
    ip,
    userAgent: headers['user-agent'],
    requestBody: body || {},
    responseStatus: statusCode,
    responseTime: `${responseTime}ms`
  });
};

module.exports = { logger, logHttpRequest };
