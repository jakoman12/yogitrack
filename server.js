const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const instructorRoutes = require("./routes/instructorRoutes.cjs")
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use(express.static("public"));

//routes
app.use("/api/instructors", instructorRoutes);

// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
