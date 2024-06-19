module.exports = {
  user: "booksapi_user", // Replace with your SQL Server login username aka the security login thingy
  password: "22Y289292y06", // Replace with your SQL Server login password
  server: "localhost",
  database: "bed_db", //Your database name!
  trustServerCertificate: true,
  options: {
    port: 1433, // Default SQL Server port
    connectionTimeout: 60000, // Connection timeout in milliseconds
  },
};
