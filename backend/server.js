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
app.use(cors());
app.use(express.json());

// DEBUG LOG
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// ---------------- ADD USER ----------------
app.post("/api/users", (req, res) => {
  const u = req.body;

  if (!u.name || !u.flat) {
    return res.status(400).json({ error: "Name & Flat required" });
  }

  db.run(
    `INSERT INTO users (
      name, flat, sinkingFund, maintenance, municipalTax,
      water, electricity, parking, insurance, service,
      interest, nonOccupancy, training,
      year, quarter
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      u.name, u.flat, u.sinkingFund, u.maintenance,
      u.municipalTax, u.water, u.electricity, u.parking,
      u.insurance, u.service, u.interest, u.nonOccupancy,
      u.training, u.year, u.quarter
    ],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ success: true, id: this.lastID });
    }
  );
});

// ---------------- GET REPORT ----------------
app.get("/api/report", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// ---------------- BULK UPLOAD ----------------
const upload = multer({ dest: "uploads/" });

app.post("/api/upload", upload.single("file"), (req, res) => {
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      const stmt = db.prepare(`
        INSERT INTO users (
          name, flat, sinkingFund, maintenance, municipalTax,
          water, electricity, parking, insurance, service,
          interest, nonOccupancy, training,
          year, quarter
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      results.forEach((u) => {
        stmt.run([
          u.name, u.flat, u.sinkingFund, u.maintenance,
          u.municipalTax, u.water, u.electricity, u.parking,
          u.insurance, u.service, u.interest, u.nonOccupancy,
          u.training, u.year || "", u.quarter || ""
        ]);
      });

      stmt.finalize();
      fs.unlinkSync(req.file.path);

      res.json({ success: true, added: results.length });
    });
});

// ---------------- CSV DOWNLOAD ----------------
app.get("/api/report/csv", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    const parser = new Parser();
    const csvData = parser.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment("report.csv");
    res.send(csvData);
  });
});

// ---------------- PDF DOWNLOAD ----------------
app.get("/api/report/pdf/:flat/:year/:quarter", (req, res) => {
  const { flat, year, quarter } = req.params;

  const doc = new PDFDocument({ margin: 30 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=flat_${flat}_${year}_${quarter}.pdf`
  );

  doc.pipe(res);

  // ✅ LOAD FONT HERE
  doc.font(path.join(__dirname, "fonts", "NotoSansDevanagari-Regular.ttf"));

  // ✅ LETTERHEAD (CORRECT PLACE)
  doc.fillColor("red")
    .fontSize(18)
    .text("पुष्पगंधा को-ऑप. हाउसिंग सोसायटी लि., ठाणे.", { align: "center" });

  doc.fillColor("black")
    .fontSize(10)
    .text("( रजि. नं. टी. एन. एच. एस. जी. टी. सी. १९४५/१९६६ - ६७ )", { align: "center" });

  doc.moveDown(0.5);
  doc.text(
    "एफ - २, सेक्टर - २, श्रीनगर पोलिस चौकी समोर, श्रीनगर, वागळे इस्टेट, ठाणे - ४०० ६०४.",
    { align: "center" }
  );

  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

  doc.moveDown();

  doc.moveDown();

// ✅ DATE HERE
const currentDate = new Date().toLocaleDateString("en-GB");

doc.fontSize(10).text(`Date: ${currentDate}`, {
  align: "right",
});

doc.moveDown();

  // ---- TITLE ----
  doc.fontSize(16).text("Maintenance Bill", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Flat: ${flat}`);
  doc.text(`Year: ${year}`);
  doc.text(`Quarter: ${quarter}`);
  doc.moveDown();

  // ---- FETCH DATA ----
  db.all(
    `SELECT * FROM users WHERE flat = ? AND year = ? AND quarter = ?`,
    [flat, year, quarter],
    (err, rows) => {
      if (rows.length === 0) {
        doc.text("No data found.");
        doc.end();
        return;
      }

      rows.forEach((u, i) => {
        doc.moveDown();
        //doc.fontSize(14).text(`Member ${i + 1}`, { underline: true });

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
        doc.text(`TOTAL: ${total}`);
      });

      doc.end();
    }
  );
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});