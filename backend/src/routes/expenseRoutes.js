const express = require("express");

const {
    createExpense,
    getExpenses
} = require("../controllers/expenseController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/trips/:tripId/expenses",
    authenticateToken,
    createExpense
);

router.get(
    "/trips/:tripId/expenses",
    authenticateToken,
    getExpenses
);

module.exports = router;