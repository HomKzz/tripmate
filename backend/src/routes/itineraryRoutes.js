const express = require("express");

const {
    createItinerary,
    getItineraries,
    updateItinerary,
    deleteItinerary
} = require("../controllers/itineraryController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// สร้าง Itinerary
router.post(
    "/trips/:tripId/itineraries",
    authenticateToken,
    createItinerary
);

// ดู Itinerary ของ Trip
router.get(
    "/trips/:tripId/itineraries",
    authenticateToken,
    getItineraries
);

// แก้ไข
router.put(
    "/itineraries/:id",
    authenticateToken,
    updateItinerary
);

// ลบ
router.delete(
    "/itineraries/:id",
    authenticateToken,
    deleteItinerary
);


module.exports = router;