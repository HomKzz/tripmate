const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const { createTripPlan } = require("../controllers/aiController");

const router = express.Router();

router.post("/plan", authenticateToken, createTripPlan);

module.exports = router;
