const express = require("express");
const cors = require("cors");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

const app = express();
const db = require("./db/database");

// ---------------- MIDDLEWARE ----------------
app.use(cors());
app.use(express.json());

// 🔥 DEBUG LOG
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// ---------------- ADD USER (SQLITE) ----------------
app.post("/api/users", (req, res) => {
  const u = req.body;

  console.log("🔥 USER RECEIVED:", u);

  if (!u.name) {
    return res.status(400).json({ error: "Name is required" });
  }

  db.run(
    `INSERT INTO users (
      name, flat, sinkingFund, maintenance, municipalTax,
      water, electricity, parking, insurance, service,
      interest, nonOccupancy, training
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
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
      u.training
    ],
    function (err) {
      if (err) {
        console.error("❌ INSERT ERROR:", err);
        return res.status(500).json(err);
      }

      console.log("✅ INSERTED ID:", this.lastID);

      res.json({
        success: true,
        id: this.lastID,
      });
    }
  );
});

// ---------------- GET REPORT (FROM DB) ----------------
app.get("/api/report", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      console.error("❌ FETCH ERROR:", err);
      return res.status(500).json(err);
    }

    res.json(rows);
  });
});

// ---------------- BULK UPLOAD (CSV → DB) ----------------
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
          interest, nonOccupancy, training
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      results.forEach((u) => {
        stmt.run([
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
          u.training
        ]);
      });

      stmt.finalize();

      fs.unlinkSync(req.file.path);

      console.log(`📂 Bulk uploaded: ${results.length} records`);

      res.json({
        success: true,
        added: results.length,
      });
    });
});

// ---------------- CSV DOWNLOAD ----------------
app.get("/api/report/csv", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json(err);

    const parser = new Parser();
    const csvData = parser.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment("report.csv");
    res.send(csvData);
  });
});

// ---------------- PDF DOWNLOAD ----------------

app.get("/api/report/pdf/:flat", (req, res) => {
  const flat = req.params.flat;

  const doc = new PDFDocument({ margin: 30 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=flat_${flat}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(18).text("User Report", { align: "center" });
  doc.moveDown();

  db.get("SELECT * FROM users WHERE flat = ?", [flat], (err, u) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    if (!u) {
      doc.text("No user found for this flat.");
      doc.end();
      return;
    }

    // ---- USER DATA ----
    doc.fontSize(14).text(`Flat: ${u.flat}`, { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(`Name: ${u.name}`);
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

    // ---- TOTAL ----
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
      Number(u.training || 0);

    doc.moveDown();
    doc.fontSize(12).text(`TOTAL: ${total}`);

    doc.end();
  });
});

// ---------------- START SERVER ----------------
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});