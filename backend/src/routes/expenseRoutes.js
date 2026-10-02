const express = require("express");

const {
    createExpense,
    getExpenses,
    getExpenseSplits,
    saveExpenseSplits
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

router.get(
    "/trips/:tripId/expense-splits",
    authenticateToken,
    getExpenseSplits
);

router.put(
    "/expenses/:expenseId/splits",
    authenticateToken,
    saveExpenseSplits
);

module.exports = router;