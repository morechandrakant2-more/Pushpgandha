const express = require("express");
const corsMiddleware = require("./middleware/corsMiddleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", reportRoutes);

module.exports = app;