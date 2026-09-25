const express = require("express");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} = require("../controllers/expenseController");

const {
  getOverallProfit,
  getFarmProfit,
  getCropProfit,
} = require("../controllers/profitController");

const router = express.Router();

router.post("/", protect, createExpense);

router.get("/", protect, getExpenses);

router.get("/summary", protect, getExpenseSummary);

router.get(
  "/profit/overall",
  protect,
  getOverallProfit
);

router.get(
  "/profit/farm/:farmId",
  protect,
  getFarmProfit
);

router.get(
  "/profit/crop/:cropId",
  protect,
  getCropProfit
);

router.get("/:id", protect, getExpenseById);

router.put("/:id", protect, updateExpense);

router.delete("/:id", protect, deleteExpense);

module.exports = router;