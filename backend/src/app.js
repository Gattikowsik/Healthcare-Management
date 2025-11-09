const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const mappingRoutes = require("./routes/mappingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const issueRoutes = require("./routes/issueRoutes");

dotenv.config();
const app = express();

// CORS configuration - Allow multiple origins
const allowedOrigins = [
  "http://localhost:3000",  // Local development
  "http://localhost",       // Docker frontend (port 80)
  "http://localhost:80",    // Docker frontend (explicit port)
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/mappings", mappingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/issues", issueRoutes);

app.get("/", (req, res) => {
  res.send("Healthcare Backend is running");
});

module.exports = app;

