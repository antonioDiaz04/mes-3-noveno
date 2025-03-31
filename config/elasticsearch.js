const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: 'https://localhost:9200', // URL de tu Elasticsearch
  auth: {
    username: 'elastic', // Usuario
    password: 'JozxjqcHD=+4BSqdkgi6' // Contraseña generada
  },
  tls: {
    rejectUnauthorized: false // Para evitar problemas con certificados SSL en desarrollo
  }
});

// Probar conexión
async function testConnection() {
  try {
    const info = await client.info();
    console.log('Conectado a Elasticsearch:', info);
  } catch (error) {
    console.error('Error conectando a Elasticsearch:', error);
  }
}

testConnection();

module.exports = client;
