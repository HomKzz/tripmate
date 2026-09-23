require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api", itineraryRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "TripMate API is working"
    });
});

app.get("/api/health/db", (req, res) => {
    db.query("SELECT 1 AS result", (err, results) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Database connection failed"
            });
        }

        res.json({
            success: true,
            message: "Database connected",
            data: results
        });
    });
});

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});