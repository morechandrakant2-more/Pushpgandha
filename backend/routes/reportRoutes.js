const express = require("express");
const router = express.Router();

const {
  getReport,
  downloadCSV,
  downloadPDF
} = require("../controllers/reportController");

router.get("/report", getReport);
router.get("/report/csv", downloadCSV);
router.get("/report/pdf/:flat/:year/:quarter", downloadPDF);

module.exports = router;