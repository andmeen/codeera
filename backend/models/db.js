const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "Afm123@",
  database: process.env.DB_NAME || "codeera_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// اختبار الاتصال مرة وحدة عند التشغيل
pool.getConnection()
  .then(() => console.log("✅ Connected to MySQL database"))
  .catch(err => console.error("❌ Database connection failed:", err));

module.exports = pool;