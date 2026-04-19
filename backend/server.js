const express = require("express");
const cors = require("cors");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const path = require("path");

const app = express();
const db = require("./db/database");

// ---------------- MIDDLEWARE ----------------
app.use(cors({ origin: "*" }));
app.use(express.json());

// ---------------- DEBUG ----------------
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// ---------------- LOGIN ----------------
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {}; // ✅ FIX

  if (!username || !password) {
    return res.status(400).json({ error: "Username & password required" });
  }

  try {
    const user = db
      .prepare("SELECT * FROM admin WHERE user_name = ?")
      .get(username);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.user_pass !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.json({ token: "my-secret-token" });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------- ADD USER ----------------
app.post("/api/users", (req, res) => {
  const u = req.body;

  if (!u.name || !u.flat) {
    return res.status(400).json({ error: "Name & Flat required" });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO users (
        name, flat, sinkingFund, maintenance, municipalTax,
        water, electricity, parking, insurance, service,
        interest, nonOccupancy, training, year, quarter,
        adjustments, adjustmentRemark, penaltyCharges
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      u.name,
      u.flat,
      u.sinkingFund,
      u.maintenance,
      u.municipalTax,
      u.water,
      u.electricity,
      u.parking,
      u.insurance,
      u.service,
      u.interest,
      u.nonOccupancy,
      u.training,
      u.year,
      u.quarter,
      u.adjustments,          // ✅ NEW
      u.adjustmentRemark,    // ✅ NEW
      u.penaltyCharges        // ✅ NEW
    );

    res.json({ success: true, id: result.lastInsertRowid });

  } catch (err) {
    console.error("❌ INSERT ERROR:", err);
    res.status(500).json(err);
  }
});

// ---------------- GET REPORT ----------------
app.get("/api/report", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM users").all();
    res.json(rows);
  } catch (err) {
    console.error("❌ FETCH ERROR:", err);
    res.status(500).json(err);
  }
});

// ---------------- BULK UPLOAD ----------------
const upload = multer({ dest: "uploads/" });

app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      const stmt = db.prepare(`
        INSERT INTO users (
          name, flat, sinkingFund, maintenance, municipalTax,
          water, electricity, parking, insurance, service,
          interest, nonOccupancy, training, year, quarter,
          adjustments, adjustmentRemark, penaltyCharges
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      results.forEach((u) => {
        stmt.run(
          u.name,
          u.flat,
          u.sinkingFund,
          u.maintenance,
          u.municipalTax,
          u.water,
          u.electricity,
          u.parking,
          u.insurance,
          u.service,
          u.interest,
          u.nonOccupancy,
          u.training,
          u.year || "",
          u.quarter || "",
          u.adjustments || 0,
          u.adjustmentRemark || "",
          u.penaltyCharges || 0
        );
      });

      fs.unlinkSync(req.file.path);
      res.json({ success: true, added: results.length });
    });
});

// ---------------- CSV DOWNLOAD ----------------
app.get("/api/report/csv", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM users").all();
    const parser = new Parser();
    const csvData = parser.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment("report.csv");
    res.send(csvData);

  } catch (err) {
    res.status(500).json(err);
  }
});

// ---------------- PDF DOWNLOAD ----------------
app.get("/api/report/pdf/:flat/:year/:quarter", (req, res) => {
  const { flat, year, quarter } = req.params;

  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=flat_${flat}_${year}_${quarter}.pdf`
  );

  doc.pipe(res);

  // ----------- HEADER -----------
  doc.fontSize(16).text("Maintenance Bill", { align: "center" });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Flat: ${flat}`);
  doc.text(`Year: ${year}`);
  doc.text(`Quarter: ${quarter}`);
  doc.moveDown();

  try {
    const rows = db.prepare(`
      SELECT * FROM users
      WHERE flat = ? AND year = ? AND quarter = ?
    `).all(flat, year, quarter);

    if (rows.length === 0) {
      doc.text("No data found.");
      doc.end();
      return;
    }

    rows.forEach((u) => {
      doc.moveDown();

      doc.text(`Name: ${u.name}`);
      doc.text(`Sinking Fund: ${u.sinkingFund}`);
      doc.text(`Maintenance: ${u.maintenance}`);
      doc.text(`Municipal Tax: ${u.municipalTax}`);
      doc.text(`Water: ${u.water}`);
      doc.text(`Electricity: ${u.electricity}`);
      doc.text(`Parking: ${u.parking}`);
      doc.text(`Insurance: ${u.insurance}`);
      doc.text(`Service: ${u.service}`);
      doc.text(`Interest: ${u.interest}`);
      doc.text(`Non-Occupancy: ${u.nonOccupancy}`);
      doc.text(`Training: ${u.training}`);

      // ✅ NEW FIELDS IN PDF
      doc.text(`Adjustments: ${u.adjustments}`);
      doc.text(`Adjustment Remark: ${u.adjustmentRemark}`);
      doc.text(`Penalty Charges: ${u.penaltyCharges}`);

      const total =
        Number(u.sinkingFund || 0) +
        Number(u.maintenance || 0) +
        Number(u.municipalTax || 0) +
        Number(u.water || 0) +
        Number(u.electricity || 0) +
        Number(u.parking || 0) +
        Number(u.insurance || 0) +
        Number(u.service || 0) +
        Number(u.interest || 0) +
        Number(u.nonOccupancy || 0) +
        Number(u.training || 0) +
        Number(u.adjustments || 0) +
        Number(u.penaltyCharges || 0);

      doc.moveDown();
      doc.fontSize(13).text(`TOTAL: ${total}`);
    });

    doc.end();

  } catch (err) {
    console.error(err);
    doc.text("Error generating PDF");
    doc.end();
  }
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});