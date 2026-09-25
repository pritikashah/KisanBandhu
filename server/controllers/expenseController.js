const mongoose = require("mongoose");

const Expense = require("../models/Expense");
const Farm = require("../models/Farm");
const Crop = require("../models/Crop");

const {
  normalizeDecimalString,
} = require("../utils/decimalUtils");

const validCategories = [
  "seeds",
  "fertilizer",
  "pesticide",
  "labour",
  "irrigation",
  "machinery",
  "transport",
  "other",
];

const createExpense = async (req, res) => {
  try {
    const {
      farmId,
      cropId,
      category,
      amount,
      expenseDate,
      description,
      receiptUrl,
    } = req.body;

    if (
      !farmId ||
      !category ||
      amount === undefined ||
      !expenseDate
    ) {
      return res.status(400).json({
        message:
          "Farm ID, category, amount, and expense date are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res.status(400).json({
        message: "Invalid farm ID.",
      });
    }

    if (
      cropId &&
      !mongoose.Types.ObjectId.isValid(cropId)
    ) {
      return res.status(400).json({
        message: "Invalid crop ID.",
      });
    }

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message:
          "Invalid expense category.",
      });
    }

    let normalizedAmount;

    try {
      normalizedAmount =
        normalizeDecimalString(amount);
    } catch {
      return res.status(400).json({
        message:
          "Amount must be a valid positive decimal number.",
      });
    }

    if (Number(normalizedAmount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0.",
      });
    }

    const parsedExpenseDate = new Date(expenseDate);

    if (Number.isNaN(parsedExpenseDate.getTime())) {
      return res.status(400).json({
        message: "Invalid expense date.",
      });
    }

    const farm = await Farm.findOne({
      _id: farmId,
      userId: req.user.userId,
      isActive: true,
    });

    if (!farm) {
      return res.status(404).json({
        message:
          "Farm not found or you are not authorized to use this farm.",
      });
    }

    if (cropId) {
      const crop = await Crop.findOne({
        _id: cropId,
        userId: req.user.userId,
        farmId,
        status: {
          $ne: "cancelled",
        },
      });

      if (!crop) {
        return res.status(404).json({
          message:
            "Crop not found or crop does not belong to the selected farm.",
        });
      }
    }

    const expense = await Expense.create({
      userId: req.user.userId,
      farmId,
      cropId: cropId || undefined,
      category,
      amount: mongoose.Types.Decimal128.fromString(
        normalizedAmount
      ),
      expenseDate: parsedExpenseDate,
      description: description
        ? description.trim()
        : undefined,
      receiptUrl: receiptUrl
        ? receiptUrl.trim()
        : undefined,
    });

    return res.status(201).json({
      message: "Expense created successfully.",
      expense: {
        ...expense.toObject(),
        amount: expense.amount.toString(),
      },
    });
  } catch (error) {
    console.error("Create expense error:", error);

    return res.status(500).json({
      message:
        "Server error while creating expense.",
    });
  }
};

const getExpenses = async (req, res) => {
  try {
    const {
      farmId,
      cropId,
      category,
      startDate,
      endDate,
    } = req.query;

    const filter = {
      userId: req.user.userId,
    };

    if (farmId) {
      if (!mongoose.Types.ObjectId.isValid(farmId)) {
        return res.status(400).json({
          message: "Invalid farm ID.",
        });
      }

      filter.farmId = farmId;
    }

    if (cropId) {
      if (!mongoose.Types.ObjectId.isValid(cropId)) {
        return res.status(400).json({
          message: "Invalid crop ID.",
        });
      }

      filter.cropId = cropId;
    }

    if (category) {
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          message: "Invalid expense category.",
        });
      }

      filter.category = category;
    }

    if (startDate || endDate) {
      filter.expenseDate = {};

      if (startDate) {
        const start = new Date(startDate);

        if (Number.isNaN(start.getTime())) {
          return res.status(400).json({
            message: "Invalid start date.",
          });
        }

        filter.expenseDate.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);

        if (Number.isNaN(end.getTime())) {
          return res.status(400).json({
            message: "Invalid end date.",
          });
        }

        filter.expenseDate.$lte = end;
      }
    }

    const expenses = await Expense.find(filter)
      .populate("farmId", "name")
      .populate("cropId", "name season status")
      .sort({
        expenseDate: -1,
      });

    const formattedExpenses = expenses.map(
      (expense) => ({
        ...expense.toObject(),
        amount: expense.amount.toString(),
      })
    );

    return res.status(200).json({
      message: "Expenses fetched successfully.",
      count: formattedExpenses.length,
      expenses: formattedExpenses,
    });
  } catch (error) {
    console.error("Get expenses error:", error);

    return res.status(500).json({
      message:
        "Server error while fetching expenses.",
    });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid expense ID.",
      });
    }

    const expense = await Expense.findOne({
      _id: id,
      userId: req.user.userId,
    })
      .populate("farmId", "name location")
      .populate("cropId", "name season status");

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found.",
      });
    }

    return res.status(200).json({
      message: "Expense fetched successfully.",
      expense: {
        ...expense.toObject(),
        amount: expense.amount.toString(),
      },
    });
  } catch (error) {
    console.error("Get expense error:", error);

    return res.status(500).json({
      message:
        "Server error while fetching expense.",
    });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid expense ID.",
      });
    }

    const {
      farmId,
      cropId,
      category,
      amount,
      expenseDate,
      description,
      receiptUrl,
    } = req.body;

    if (
      !farmId ||
      !category ||
      amount === undefined ||
      !expenseDate
    ) {
      return res.status(400).json({
        message:
          "Farm ID, category, amount, and expense date are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res.status(400).json({
        message: "Invalid farm ID.",
      });
    }

    if (
      cropId &&
      !mongoose.Types.ObjectId.isValid(cropId)
    ) {
      return res.status(400).json({
        message: "Invalid crop ID.",
      });
    }

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: "Invalid expense category.",
      });
    }

    let normalizedAmount;

    try {
      normalizedAmount =
        normalizeDecimalString(amount);
    } catch {
      return res.status(400).json({
        message:
          "Amount must be a valid positive decimal number.",
      });
    }

    if (Number(normalizedAmount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0.",
      });
    }

    const parsedExpenseDate = new Date(expenseDate);

    if (Number.isNaN(parsedExpenseDate.getTime())) {
      return res.status(400).json({
        message: "Invalid expense date.",
      });
    }

    const farm = await Farm.findOne({
      _id: farmId,
      userId: req.user.userId,
      isActive: true,
    });

    if (!farm) {
      return res.status(404).json({
        message:
          "Farm not found or you are not authorized to use this farm.",
      });
    }

    if (cropId) {
      const crop = await Crop.findOne({
        _id: cropId,
        userId: req.user.userId,
        farmId,
        status: {
          $ne: "cancelled",
        },
      });

      if (!crop) {
        return res.status(404).json({
          message:
            "Crop not found or crop does not belong to the selected farm.",
        });
      }
    }

    const expense = await Expense.findOneAndUpdate(
      {
        _id: id,
        userId: req.user.userId,
      },
      {
        $set: {
          farmId,
          cropId: cropId || undefined,
          category,
          amount:
            mongoose.Types.Decimal128.fromString(
              normalizedAmount
            ),
          expenseDate: parsedExpenseDate,
          description: description
            ? description.trim()
            : undefined,
          receiptUrl: receiptUrl
            ? receiptUrl.trim()
            : undefined,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found.",
      });
    }

    return res.status(200).json({
      message: "Expense updated successfully.",
      expense: {
        ...expense.toObject(),
        amount: expense.amount.toString(),
      },
    });
  } catch (error) {
    console.error("Update expense error:", error);

    return res.status(500).json({
      message:
        "Server error while updating expense.",
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid expense ID.",
      });
    }

    const expense = await Expense.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found.",
      });
    }

    return res.status(200).json({
      message: "Expense deleted successfully.",
      expenseId: expense._id,
    });
  } catch (error) {
    console.error("Delete expense error:", error);

    return res.status(500).json({
      message:
        "Server error while deleting expense.",
    });
  }
};

const getExpenseSummary = async (req, res) => {
  try {
    const { farmId, startDate, endDate } = req.query;

    const match = {
      userId: new mongoose.Types.ObjectId(
        req.user.userId
      ),
    };

    if (farmId) {
      if (!mongoose.Types.ObjectId.isValid(farmId)) {
        return res.status(400).json({
          message: "Invalid farm ID.",
        });
      }

      match.farmId =
        new mongoose.Types.ObjectId(farmId);
    }

    if (startDate || endDate) {
      match.expenseDate = {};

      if (startDate) {
        const start = new Date(startDate);

        if (Number.isNaN(start.getTime())) {
          return res.status(400).json({
            message: "Invalid start date.",
          });
        }

        match.expenseDate.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);

        if (Number.isNaN(end.getTime())) {
          return res.status(400).json({
            message: "Invalid end date.",
          });
        }

        match.expenseDate.$lte = end;
      }
    }

    const summary = await Expense.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: "$category",
          totalAmount: {
            $sum: "$amount",
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          totalAmount: -1,
        },
      },
    ]);

    const total = await Expense.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: null,
          totalExpense: {
            $sum: "$amount",
          },
        },
      },
    ]);

    return res.status(200).json({
      message: "Expense summary fetched successfully.",
      totalExpense:
        total.length > 0
          ? total[0].totalExpense.toString()
          : "0",
      byCategory: summary.map((item) => ({
        category: item._id,
        totalAmount:
          item.totalAmount.toString(),
        count: item.count,
      })),
    });
  } catch (error) {
    console.error(
      "Get expense summary error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching expense summary.",
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
};