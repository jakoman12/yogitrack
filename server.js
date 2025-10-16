const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const instructorRoutes = require("./routes/instructorRoutes.cjs")
const classRoutes = require("./routes/classRoutes.cjs")
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

//routes
app.use("/api/instructor", instructorRoutes);
app.use("/api/class", classRoutes);

// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error", err));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
