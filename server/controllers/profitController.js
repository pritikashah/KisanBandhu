const mongoose = require("mongoose");

const Crop = require("../models/Crop");
const Farm = require("../models/Farm");
const Expense = require("../models/Expense");
const Harvest = require("../models/Harvest");

const {
  subtractDecimalStrings,
} = require("../utils/decimalUtils");

const getDecimalString = (value) => {
  if (value === undefined || value === null) {
    return "0";
  }

  return value.toString();
};

const calculateProfit = (
  totalRevenue,
  totalExpense
) => {
  return subtractDecimalStrings(
    totalRevenue,
    totalExpense
  );
};

const getOverallProfit = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(
      req.user.userId
    );

    const expenseResult =
      await Expense.aggregate([
        {
          $match: {
            userId,
          },
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

    const revenueResult =
      await Harvest.aggregate([
        {
          $match: {
            userId,
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$grossRevenue",
            },
          },
        },
      ]);

    const totalExpense =
      expenseResult.length > 0
        ? getDecimalString(
            expenseResult[0].totalExpense
          )
        : "0";

    const totalRevenue =
      revenueResult.length > 0
        ? getDecimalString(
            revenueResult[0].totalRevenue
          )
        : "0";

    const profit = calculateProfit(
      totalRevenue,
      totalExpense
    );

    return res.status(200).json({
      message:
        "Overall profit analysis fetched successfully.",
      totalRevenue,
      totalExpense,
      profit,
    });
  } catch (error) {
    console.error(
      "Get overall profit error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while calculating overall profit.",
    });
  }
};

const getFarmProfit = async (req, res) => {
  try {
    const { farmId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res.status(400).json({
        message: "Invalid farm ID.",
      });
    }

    const farm = await Farm.findOne({
      _id: farmId,
      userId: req.user.userId,
    });

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found.",
      });
    }

    const objectFarmId =
      new mongoose.Types.ObjectId(farmId);

    const expenseResult =
      await Expense.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(
              req.user.userId
            ),
            farmId: objectFarmId,
          },
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

    const revenueResult =
      await Harvest.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(
              req.user.userId
            ),
            farmId: objectFarmId,
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$grossRevenue",
            },
          },
        },
      ]);

    const totalExpense =
      expenseResult.length > 0
        ? getDecimalString(
            expenseResult[0].totalExpense
          )
        : "0";

    const totalRevenue =
      revenueResult.length > 0
        ? getDecimalString(
            revenueResult[0].totalRevenue
          )
        : "0";

    const profit = calculateProfit(
      totalRevenue,
      totalExpense
    );

    return res.status(200).json({
      message:
        "Farm profit analysis fetched successfully.",
      farm: {
        id: farm._id,
        name: farm.name,
      },
      totalRevenue,
      totalExpense,
      profit,
    });
  } catch (error) {
    console.error(
      "Get farm profit error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while calculating farm profit.",
    });
  }
};

const getCropProfit = async (req, res) => {
  try {
    const { cropId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cropId)) {
      return res.status(400).json({
        message: "Invalid crop ID.",
      });
    }

    const crop = await Crop.findOne({
      _id: cropId,
      userId: req.user.userId,
    });

    if (!crop) {
      return res.status(404).json({
        message: "Crop not found.",
      });
    }

    const objectCropId =
      new mongoose.Types.ObjectId(cropId);

    const expenseResult =
      await Expense.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(
              req.user.userId
            ),
            cropId: objectCropId,
          },
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

    const revenueResult =
      await Harvest.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(
              req.user.userId
            ),
            cropId: objectCropId,
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$grossRevenue",
            },
          },
        },
      ]);

    const totalExpense =
      expenseResult.length > 0
        ? getDecimalString(
            expenseResult[0].totalExpense
          )
        : "0";

    const totalRevenue =
      revenueResult.length > 0
        ? getDecimalString(
            revenueResult[0].totalRevenue
          )
        : "0";

    const profit = calculateProfit(
      totalRevenue,
      totalExpense
    );

    return res.status(200).json({
      message:
        "Crop profit analysis fetched successfully.",
      crop: {
        id: crop._id,
        name: crop.name,
        status: crop.status,
      },
      totalRevenue,
      totalExpense,
      profit,
    });
  } catch (error) {
    console.error(
      "Get crop profit error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while calculating crop profit.",
    });
  }
};

module.exports = {
  getOverallProfit,
  getFarmProfit,
  getCropProfit,
};