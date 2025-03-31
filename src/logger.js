const { createLogger, transports, format } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { ElasticsearchTransport } = require('winston-elasticsearch'); // Importa correctamente

// Cliente de Elasticsearch
const esTransportOptions = {
  level: 'info', // Nivel mínimo de logs que se enviarán a ES
  clientOpts: {
    node: 'https://localhost:9200', // URL de tu Elasticsearch
    auth: {
      username: 'elastic', // Usuario de Elasticsearch
      password: 'JozxjqcHD=+4BSqdkgi6' // Contraseña generada
    },
    tls: {
      rejectUnauthorized: false // Para evitar problemas con SSL en desarrollo
    }
  },
  indexPrefix: 'api-logs', // Prefijo del índice en Elasticsearch
  flushInterval: 5000, // Cada 5s envía los logs
};

// Transporte para Elasticsearch
const esTransport = new ElasticsearchTransport(esTransportOptions);

// Configuración del transporte para archivos rotativos
const fileRotateTransport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json()
  )
});

// Configuración del logger principal
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...metadata }) => {
          return `[${timestamp}] ${level}: ${message} ${JSON.stringify(metadata)}`;
        })
      )
    }),
    fileRotateTransport, // Guarda logs en archivos rotativos
    esTransport // Enviar logs a Elasticsearch
  ]
});

module.exports = logger;