const mysql = require("mysql2");

// const db = mysql.createConnection({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASS || "Afm123@",
//   database: process.env.DB_NAME || "codeera_db"
// });

const connection = mysql.createConnection({
  host: 'ballast.proxy.rlwy.net',
  user: 'root',
  password: 'MNwICssIYtfGXdGJGWciMBARyHAwlyyX',
  database: 'codeera_db',
  port: 10694
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Error connecting to MySQL:", err);
    return;
  }
  console.log("✅ Connected to MySQL");
});

module.exports = connection;