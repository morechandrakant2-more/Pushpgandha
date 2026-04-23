const db = require("../config/db");
const fs = require("fs");
const csv = require("csv-parser");
const { generateBillNo } = require("../utils/billHelper");


exports.addUser = (req, res) => {
  const u = req.body;

  if (!u.name || !u.flat) {
    return res.status(400).json({ error: "Name & Flat required" });
  }

  try {

    const billNo = generateBillNo(u.year, u.quarter, u.flat);

    // ✅ NEW: capture logged-in user + timestamp
    const createdAt = new Date().toISOString();
    const createdBy = req.user?.name || "unknown";

    const stmt = db.prepare(`
      INSERT INTO maintenance (
        name, flat, sinkingFund, maintenance, municipalTax,
        water, electricity, parking, insurance, service,
        interest, nonOccupancy, training, year, quarter,
        bill_no,
        adjustments, adjustmentRemark, penaltyCharges,
        created_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      u.name, u.flat, u.sinkingFund, u.maintenance,
      u.municipalTax, u.water, u.electricity,
      u.parking, u.insurance, u.service,
      u.interest, u.nonOccupancy, u.training,
      u.year, u.quarter,
      billNo,
      u.adjustments, u.adjustmentRemark, u.penaltyCharges,
      createdAt,
      createdBy
    );

    res.json({ success: true, id: result.lastInsertRowid });

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};



exports.uploadCSV = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
  try {
    const sample = results[0];

    if (!sample) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "CSV is empty" });
    }

    // ✅ STRICT CHECK (STOP EVERYTHING)
    const exists = db.prepare(`
      SELECT 1 FROM maintenance
      WHERE year = ? AND quarter = ?
      LIMIT 1
    `).get(sample.year, sample.quarter);

    if (exists) {
      fs.unlinkSync(req.file.path);

      console.log("❌ DUPLICATE UPLOAD BLOCKED");

      return res.status(400).json({
        error: `Maintenance data for ${sample.year} ${sample.quarter} is already uploaded`
      });
    }

    // 🚨 ONLY REACH HERE IF SAFE

    const stmt = db.prepare(`
      INSERT INTO maintenance (
        name, flat, sinkingFund, maintenance, municipalTax,
        water, electricity, parking, insurance, service,
        interest, nonOccupancy, training, year, quarter,
        bill_no,
        adjustments, adjustmentRemark, penaltyCharges,
        created_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    results.forEach((u) => {
      const billNo = generateBillNo(u.year, u.quarter, u.flat);

      const createdAt = new Date().toISOString();
      const createdBy = req.user?.name || "bulk_upload";

      stmt.run(
        u.name, u.flat, u.sinkingFund, u.maintenance,
        u.municipalTax, u.water, u.electricity,
        u.parking, u.insurance, u.service,
        u.interest, u.nonOccupancy, u.training,
        u.year || "", u.quarter || "",
        billNo,
        u.adjustments || 0,
        u.adjustmentRemark || "",
        u.penaltyCharges || 0,
        createdAt,
        createdBy
      );
    });

    fs.unlinkSync(req.file.path);

    return res.json({ success: true, added: results.length });

  } catch (err) {
    console.error("UPLOAD ERROR 👉", err);

    if (req.file?.path) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }

    return res.status(500).json({ error: "Upload failed" });
  }
});
};