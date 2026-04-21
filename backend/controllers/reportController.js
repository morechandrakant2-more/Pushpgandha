const db = require("../config/db");
const { Parser } = require("json2csv");
const generatePDF = require("../utils/pdfGenerator");

exports.getReport = (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM users").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.downloadCSV = (req, res) => {
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
};

exports.downloadPDF = (req, res) => {
  generatePDF(req, res);
};