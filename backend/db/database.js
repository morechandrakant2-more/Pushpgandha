const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("❌ DB Error:", err);
  } else {
    console.log("✅ Connected to SQLite DB");
  }
});

// Create table
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
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
      training TEXT
    )`,
    (err) => {
      if (err) console.error(err);
      else console.log("✅ Users table ready");
    }
  );
});

module.exports = db;
