const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth"); // ✅ Auth middleware

const {
  getReport,
  downloadCSV,
  downloadPDF
} = require("../controllers/reportController");

// ✅ Protect all report routes
router.get("/report", auth, getReport);
router.get("/report/csv", auth, downloadCSV);
router.get("/report/pdf/:flat/:year/:quarter", auth, downloadPDF);

module.exports = router;