const express = require("express");
const router = express.Router();

const { addUser, uploadCSV } = require("../controllers/userController");
const multer = require("multer");
const auth = require("../middleware/auth"); // ✅ Auth middleware

const upload = multer({ dest: "uploads/" });

// ✅ Protected Routes (only logged-in users can access)
router.post("/users", auth, addUser);
router.post("/upload", auth, upload.single("file"), uploadCSV);

module.exports = router;