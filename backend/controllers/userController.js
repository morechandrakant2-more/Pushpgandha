const db = require("../config/db");
const fs = require("fs");
const csv = require("csv-parser");

exports.addUser = (req, res) => {
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
      u.name, u.flat, u.sinkingFund, u.maintenance,
      u.municipalTax, u.water, u.electricity,
      u.parking, u.insurance, u.service,
      u.interest, u.nonOccupancy, u.training,
      u.year, u.quarter,
      u.adjustments, u.adjustmentRemark, u.penaltyCharges
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
          u.name, u.flat, u.sinkingFund, u.maintenance,
          u.municipalTax, u.water, u.electricity,
          u.parking, u.insurance, u.service,
          u.interest, u.nonOccupancy, u.training,
          u.year || "", u.quarter || "",
          u.adjustments || 0,
          u.adjustmentRemark || "",
          u.penaltyCharges || 0
        );
      });

      fs.unlinkSync(req.file.path);
      res.json({ success: true, added: results.length });
    });
};