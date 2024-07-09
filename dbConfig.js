require('dotenv').config();

module.exports = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
  options: {
    port: parseInt(process.env.DB_PORT, 10),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10),
  },
};
