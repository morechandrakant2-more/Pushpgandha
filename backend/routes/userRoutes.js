const express = require("express");
const router = express.Router();
const { addUser, uploadCSV } = require("../controllers/userController");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

router.post("/users", addUser);
router.post("/upload", upload.single("file"), uploadCSV);

module.exports = router;