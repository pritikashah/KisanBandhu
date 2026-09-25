const mongoose = require("mongoose");

const Harvest = require("../models/Harvest");
const Farm = require("../models/Farm");
const Crop = require("../models/Crop");

const {
  normalizeDecimalString,
  multiplyDecimalStrings,
} = require("../utils/decimalUtils");

const createHarvest = async (req, res) => {
  try {
    const {
      farmId,
      cropId,
      harvestDate,
      quantity,
      salePricePerUnit,
      buyerName,
      notes,
    } = req.body;

    if (
      !farmId ||
      !cropId ||
      !harvestDate ||
      !quantity ||
      salePricePerUnit === undefined
    ) {
      return res.status(400).json({
        message:
          "Farm ID, crop ID, harvest date, quantity, and sale price are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res.status(400).json({
        message: "Invalid farm ID.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(cropId)) {
      return res.status(400).json({
        message: "Invalid crop ID.",
      });
    }

    if (
      typeof quantity.value !== "number" ||
      quantity.value <= 0
    ) {
      return res.status(400).json({
        message:
          "Quantity value must be greater than 0.",
      });
    }

    if (
      !quantity.unit ||
      !["kg", "quintal"].includes(quantity.unit)
    ) {
      return res.status(400).json({
        message:
          "Quantity unit must be kg or quintal.",
      });
    }

    let normalizedSalePrice;

    try {
      normalizedSalePrice =
        normalizeDecimalString(
          salePricePerUnit
        );
    } catch {
      return res.status(400).json({
        message:
          "Sale price must be a valid positive decimal number.",
      });
    }

    if (Number(normalizedSalePrice) <= 0) {
      return res.status(400).json({
        message:
          "Sale price must be greater than 0.",
      });
    }

    const parsedHarvestDate = new Date(
      harvestDate
    );

    if (
      Number.isNaN(parsedHarvestDate.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid harvest date.",
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

    const grossRevenue =
      multiplyDecimalStrings(
        quantity.value,
        normalizedSalePrice
      );

    const harvest = await Harvest.create({
      userId: req.user.userId,
      farmId,
      cropId,
      harvestDate: parsedHarvestDate,
      quantity,
      salePricePerUnit:
        mongoose.Types.Decimal128.fromString(
          normalizedSalePrice
        ),
      grossRevenue:
        mongoose.Types.Decimal128.fromString(
          grossRevenue
        ),
      buyerName: buyerName
        ? buyerName.trim()
        : undefined,
      notes: notes
        ? notes.trim()
        : undefined,
    });

    return res.status(201).json({
      message: "Harvest created successfully.",
      harvest: {
        ...harvest.toObject(),
        salePricePerUnit:
          harvest.salePricePerUnit.toString(),
        grossRevenue:
          harvest.grossRevenue.toString(),
      },
    });
  } catch (error) {
    console.error("Create harvest error:", error);

    return res.status(500).json({
      message:
        "Server error while creating harvest.",
    });
  }
};

const getHarvests = async (req, res) => {
  try {
    const {
      farmId,
      cropId,
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

    if (startDate || endDate) {
      filter.harvestDate = {};

      if (startDate) {
        const start = new Date(startDate);

        if (Number.isNaN(start.getTime())) {
          return res.status(400).json({
            message: "Invalid start date.",
          });
        }

        filter.harvestDate.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);

        if (Number.isNaN(end.getTime())) {
          return res.status(400).json({
            message: "Invalid end date.",
          });
        }

        filter.harvestDate.$lte = end;
      }
    }

    const harvests = await Harvest.find(filter)
      .populate("farmId", "name")
      .populate("cropId", "name season status")
      .sort({
        harvestDate: -1,
      });

    const formattedHarvests = harvests.map(
      (harvest) => ({
        ...harvest.toObject(),
        salePricePerUnit:
          harvest.salePricePerUnit.toString(),
        grossRevenue:
          harvest.grossRevenue.toString(),
      })
    );

    return res.status(200).json({
      message: "Harvests fetched successfully.",
      count: formattedHarvests.length,
      harvests: formattedHarvests,
    });
  } catch (error) {
    console.error("Get harvests error:", error);

    return res.status(500).json({
      message:
        "Server error while fetching harvests.",
    });
  }
};

const getHarvestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid harvest ID.",
      });
    }

    const harvest = await Harvest.findOne({
      _id: id,
      userId: req.user.userId,
    })
      .populate("farmId", "name location")
      .populate("cropId", "name season status");

    if (!harvest) {
      return res.status(404).json({
        message: "Harvest not found.",
      });
    }

    return res.status(200).json({
      message: "Harvest fetched successfully.",
      harvest: {
        ...harvest.toObject(),
        salePricePerUnit:
          harvest.salePricePerUnit.toString(),
        grossRevenue:
          harvest.grossRevenue.toString(),
      },
    });
  } catch (error) {
    console.error("Get harvest error:", error);

    return res.status(500).json({
      message:
        "Server error while fetching harvest.",
    });
  }
};

const updateHarvest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid harvest ID.",
      });
    }

    const {
      farmId,
      cropId,
      harvestDate,
      quantity,
      salePricePerUnit,
      buyerName,
      notes,
    } = req.body;

    if (
      !farmId ||
      !cropId ||
      !harvestDate ||
      !quantity ||
      salePricePerUnit === undefined
    ) {
      return res.status(400).json({
        message:
          "Farm ID, crop ID, harvest date, quantity, and sale price are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res.status(400).json({
        message: "Invalid farm ID.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(cropId)) {
      return res.status(400).json({
        message: "Invalid crop ID.",
      });
    }

    if (
      typeof quantity.value !== "number" ||
      quantity.value <= 0
    ) {
      return res.status(400).json({
        message:
          "Quantity value must be greater than 0.",
      });
    }

    if (
      !quantity.unit ||
      !["kg", "quintal"].includes(quantity.unit)
    ) {
      return res.status(400).json({
        message:
          "Quantity unit must be kg or quintal.",
      });
    }

    let normalizedSalePrice;

    try {
      normalizedSalePrice =
        normalizeDecimalString(
          salePricePerUnit
        );
    } catch {
      return res.status(400).json({
        message:
          "Sale price must be a valid positive decimal number.",
      });
    }

    if (Number(normalizedSalePrice) <= 0) {
      return res.status(400).json({
        message:
          "Sale price must be greater than 0.",
      });
    }

    const parsedHarvestDate = new Date(
      harvestDate
    );

    if (
      Number.isNaN(parsedHarvestDate.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid harvest date.",
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

    const grossRevenue =
      multiplyDecimalStrings(
        quantity.value,
        normalizedSalePrice
      );

    const harvest =
      await Harvest.findOneAndUpdate(
        {
          _id: id,
          userId: req.user.userId,
        },
        {
          $set: {
            farmId,
            cropId,
            harvestDate: parsedHarvestDate,
            quantity,
            salePricePerUnit:
              mongoose.Types.Decimal128.fromString(
                normalizedSalePrice
              ),
            grossRevenue:
              mongoose.Types.Decimal128.fromString(
                grossRevenue
              ),
            buyerName: buyerName
              ? buyerName.trim()
              : undefined,
            notes: notes
              ? notes.trim()
              : undefined,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!harvest) {
      return res.status(404).json({
        message: "Harvest not found.",
      });
    }

    return res.status(200).json({
      message: "Harvest updated successfully.",
      harvest: {
        ...harvest.toObject(),
        salePricePerUnit:
          harvest.salePricePerUnit.toString(),
        grossRevenue:
          harvest.grossRevenue.toString(),
      },
    });
  } catch (error) {
    console.error("Update harvest error:", error);

    return res.status(500).json({
      message:
        "Server error while updating harvest.",
    });
  }
};

const deleteHarvest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid harvest ID.",
      });
    }

    const harvest =
      await Harvest.findOneAndDelete({
        _id: id,
        userId: req.user.userId,
      });

    if (!harvest) {
      return res.status(404).json({
        message: "Harvest not found.",
      });
    }

    return res.status(200).json({
      message: "Harvest deleted successfully.",
      harvestId: harvest._id,
    });
  } catch (error) {
    console.error("Delete harvest error:", error);

    return res.status(500).json({
      message:
        "Server error while deleting harvest.",
    });
  }
};

module.exports = {
  createHarvest,
  getHarvests,
  getHarvestById,
  updateHarvest,
  deleteHarvest,
};