const express = require("express");

const {
    createTrip,
    getTrips,
    getTripById,
    updateTrip,
    deleteTrip,
    getTripMembers,
    addTripMember,
    removeTripMember,
    leaveTrip,
    createTripInvite,
    getTripInviteInfo,
    acceptTripInvite,
    updateTripMemberRole
} = require("../controllers/tripController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Trip
router.get("/", authenticateToken, getTrips);
router.post("/", authenticateToken, createTrip);

// Members
router.get(
    "/:tripId/members",
    authenticateToken,
    getTripMembers
);

router.post(
    "/:tripId/members",
    authenticateToken,
    addTripMember
);
router.get(
    "/:tripId/invite",
    authenticateToken,
    createTripInvite
);
router.get(
    "/invite/:token",
    getTripInviteInfo
);
router.post(
    "/invite/:token/accept",
    authenticateToken,
    acceptTripInvite
);
router.patch(
    "/:tripId/members/:userId/role",
    authenticateToken,
    updateTripMemberRole
);
router.delete(
    "/:tripId/members/me",
    authenticateToken,
    leaveTrip
);

router.delete(
    "/:tripId/members/:userId",
    authenticateToken,
    removeTripMember
);

// Trip by ID
router.get("/:id", authenticateToken, getTripById);
router.put("/:id", authenticateToken, updateTrip);
router.delete("/:id", authenticateToken, deleteTrip);

module.exports = router;