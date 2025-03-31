const { createLogger, format, transports } = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');
const esClient = require('../../config/elasticsearch'); // Asegúrate de que esta ruta sea correcta

// Configuración del transporte de Elasticsearch
const esTransport = new ElasticsearchTransport({
  level: 'info',
  client: esClient,
  indexPrefix: 'app-logs', // Nombre del índice en Elasticsearch
});

// Configuración del logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/app.log' }),
    new transports.Console(),
    esTransport // Agregar transporte de Elasticsearch
  ]
});

module.exports = logger;