const esClient = require('./config/elasticsearch');

esClient.info()
  .then(response => console.log('Conexión exitosa:', response))
  .catch(error => console.error('Error al conectar con Elasticsearch:', error));