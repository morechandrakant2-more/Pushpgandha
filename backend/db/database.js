const Database = require("better-sqlite3");

// Create / connect DB
const db = new Database("database.db");

// Create table (runs once)
try {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      flat TEXT,
      sinkingFund TEXT,
      maintenance TEXT,
      municipalTax TEXT,
      water TEXT,
      electricity TEXT,
      parking TEXT,
      insurance TEXT,
      service TEXT,
      interest TEXT,
      nonOccupancy TEXT,
      training TEXT,
      year TEXT,
      quarter TEXT
    )
  `).run();

  console.log("✅ Connected to SQLite DB");
  console.log("✅ Users table ready");

} catch (err) {
  console.error("❌ DB Error:", err);
}

module.exports = db;