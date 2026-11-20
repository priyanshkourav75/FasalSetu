const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error("Missing MONGO_URI. Add it to backend/.env or your hosting environment.");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET. Add it to backend/.env or your hosting environment.");
  process.exit(1);
}

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow server-to-server and local development requests without an Origin header.
    if (!origin || allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV !== "production" && (origin === "http://localhost" || origin.startsWith("http://localhost:")))) {
      return callback(null, true);
    }
    return callback(new Error("This website origin is not allowed by CORS."));
  }
}));
app.use(express.json({ limit: "1mb" }));

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.json({ service: "FasalSetu API", status: "ok" });
});
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully.");
    app.listen(port, () => {
      console.log(`FasalSetu API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  });
