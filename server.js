
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const decisionRoutes = require("./routes/decisionRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to DecisionTrack API",
    status: "Server is running",
  });
});

// API routes
app.use("/api/decisions", decisionRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler (must be last)
app.use(errorMiddleware);

// Start server only after MongoDB connects
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`DecisionTrack API running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}`);
      console.log(`Decisions API: http://localhost:${PORT}/api/decisions`);
    });
  } catch (error) {
    console.error("Failed to start DecisionTrack:", error.message);
    process.exit(1);
  }
};

startServer();
