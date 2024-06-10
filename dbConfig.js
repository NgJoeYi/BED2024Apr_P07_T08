module.exports = {
    user: "BED2024Apr_login", // Replace with your SQL Server login username
    password: "28D685372b05", // Replace with your SQL Server login password
    server: "localhost",
    database: "BED2024Apr_db",
    trustServerCertificate: true,
    options: {
      port: 1433, // Default SQL Server port
      connectionTimeout: 60000, // Connection timeout in milliseconds
    },
  };
