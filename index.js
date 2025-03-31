const app = require("./src/app.js");
const process = require("process");
const esClient = require('./config/elasticsearch'); // Importar el cliente de Elasticsearch

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`El servidor está corriendo perfectamente en el puerto ${PORT}`);

  // Enviar un log a Elasticsearch
  esClient.index({
    index: 'app-logs',
    document: {
      timestamp: new Date(),
      level: 'info',
      message: `Servidor iniciado en el puerto ${PORT}`,
    },
  }).then(response => {
    console.log('Log enviado a Elasticsearch:', response);
  }).catch(error => {
    console.error('Error al enviar log a Elasticsearch:', error);
  });
});