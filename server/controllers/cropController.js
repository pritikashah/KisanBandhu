const mongoose = require("mongoose");

const Crop = require("../models/Crop");
const Farm = require("../models/Farm");

const createCrop = async (req, res) => {
  try {
    const {
      farmId,
      name,
      season,
      sowingDate,
      expectedHarvestDate,
      expectedYield,
      expectedSalePrice,
      status,
      notes,
    } = req.body;

    if (
      !farmId ||
      !name ||
      !season ||
      !sowingDate
    ) {
      return res.status(400).json({
        message:
          "Farm ID, crop name, season, and sowing date are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res.status(400).json({
        message: "Invalid farm ID.",
      });
    }

    if (
      !["Kharif", "Rabi", "Zaid", "Other"].includes(season)
    ) {
      return res.status(400).json({
        message:
          "Season must be Kharif, Rabi, Zaid, or Other.",
      });
    }

    if (
      status &&
      !["planned", "growing", "harvested", "cancelled"].includes(
        status
      )
    ) {
      return res.status(400).json({
        message:
          "Status must be planned, growing, harvested, or cancelled.",
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

    if (expectedHarvestDate) {
      const sowing = new Date(sowingDate);
      const harvest = new Date(expectedHarvestDate);

      if (
        Number.isNaN(sowing.getTime()) ||
        Number.isNaN(harvest.getTime())
      ) {
        return res.status(400).json({
          message: "Invalid sowing date or expected harvest date.",
        });
      }

      if (harvest < sowing) {
        return res.status(400).json({
          message:
            "Expected harvest date cannot be before sowing date.",
        });
      }
    }

    if (expectedYield) {
      if (
        typeof expectedYield.value !== "number" ||
        expectedYield.value < 0
      ) {
        return res.status(400).json({
          message:
            "Expected yield value must be a non-negative number.",
        });
      }

      if (
        !expectedYield.unit ||
        !["kg", "quintal"].includes(expectedYield.unit)
      ) {
        return res.status(400).json({
          message:
            "Expected yield unit must be kg or quintal.",
        });
      }
    }

    if (
      expectedSalePrice !== undefined &&
      (typeof expectedSalePrice !== "number" ||
        expectedSalePrice < 0)
    ) {
      return res.status(400).json({
        message:
          "Expected sale price must be a non-negative number.",
      });
    }

    const crop = await Crop.create({
      userId: req.user.userId,
      farmId,
      name: name.trim(),
      season,
      sowingDate,
      expectedHarvestDate,
      expectedYield,
      expectedSalePrice,
      status: status || "planned",
      notes: notes ? notes.trim() : undefined,
    });

    return res.status(201).json({
      message: "Crop created successfully.",
      crop,
    });
  } catch (error) {
    console.error("Create crop error:", error);

    return res.status(500).json({
      message: "Server error while creating crop.",
    });
  }
};

const getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find({
      userId: req.user.userId,
      status: {
        $ne: "cancelled",
      },
    })
      .populate("farmId", "name location")
      .sort({
        sowingDate: -1,
      });

    return res.status(200).json({
      message: "Crops fetched successfully.",
      count: crops.length,
      crops,
    });
  } catch (error) {
    console.error("Get all crops error:", error);

    return res.status(500).json({
      message: "Server error while fetching crops.",
    });
  }
};

const getCropsByFarm = async (req, res) => {
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
      isActive: true,
    });

    if (!farm) {
      return res.status(404).json({
        message:
          "Farm not found or you are not authorized to access this farm.",
      });
    }

    const crops = await Crop.find({
      farmId,
      userId: req.user.userId,
      status: {
        $ne: "cancelled",
      },
    }).sort({
      sowingDate: -1,
    });

    return res.status(200).json({
      message: "Farm crops fetched successfully.",
      farm: {
        id: farm._id,
        name: farm.name,
      },
      count: crops.length,
      crops,
    });
  } catch (error) {
    console.error("Get farm crops error:", error);

    return res.status(500).json({
      message: "Server error while fetching farm crops.",
    });
  }
};

const getCropById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid crop ID.",
      });
    }

    const crop = await Crop.findOne({
      _id: id,
      userId: req.user.userId,
      status: {
        $ne: "cancelled",
      },
    }).populate("farmId", "name location");

    if (!crop) {
      return res.status(404).json({
        message: "Crop not found.",
      });
    }

    return res.status(200).json({
      message: "Crop fetched successfully.",
      crop,
    });
  } catch (error) {
    console.error("Get crop by ID error:", error);

    return res.status(500).json({
      message: "Server error while fetching crop.",
    });
  }
};

const updateCrop = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid crop ID.",
      });
    }

    const {
      farmId,
      name,
      season,
      sowingDate,
      expectedHarvestDate,
      expectedYield,
      expectedSalePrice,
      status,
      notes,
    } = req.body;

    if (
      !farmId ||
      !name ||
      !season ||
      !sowingDate
    ) {
      return res.status(400).json({
        message:
          "Farm ID, crop name, season, and sowing date are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res.status(400).json({
        message: "Invalid farm ID.",
      });
    }

    if (
      !["Kharif", "Rabi", "Zaid", "Other"].includes(season)
    ) {
      return res.status(400).json({
        message:
          "Season must be Kharif, Rabi, Zaid, or Other.",
      });
    }

    if (
      !["planned", "growing", "harvested", "cancelled"].includes(
        status
      )
    ) {
      return res.status(400).json({
        message:
          "Status must be planned, growing, harvested, or cancelled.",
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

    if (expectedHarvestDate) {
      const sowing = new Date(sowingDate);
      const harvest = new Date(expectedHarvestDate);

      if (
        Number.isNaN(sowing.getTime()) ||
        Number.isNaN(harvest.getTime())
      ) {
        return res.status(400).json({
          message: "Invalid sowing date or expected harvest date.",
        });
      }

      if (harvest < sowing) {
        return res.status(400).json({
          message:
            "Expected harvest date cannot be before sowing date.",
        });
      }
    }

    if (expectedYield) {
      if (
        typeof expectedYield.value !== "number" ||
        expectedYield.value < 0
      ) {
        return res.status(400).json({
          message:
            "Expected yield value must be a non-negative number.",
        });
      }

      if (
        !expectedYield.unit ||
        !["kg", "quintal"].includes(expectedYield.unit)
      ) {
        return res.status(400).json({
          message:
            "Expected yield unit must be kg or quintal.",
        });
      }
    }

    if (
      expectedSalePrice !== undefined &&
      (typeof expectedSalePrice !== "number" ||
        expectedSalePrice < 0)
    ) {
      return res.status(400).json({
        message:
          "Expected sale price must be a non-negative number.",
      });
    }

    const crop = await Crop.findOneAndUpdate(
      {
        _id: id,
        userId: req.user.userId,
        status: {
          $ne: "cancelled",
        },
      },
      {
        $set: {
          farmId,
          name: name.trim(),
          season,
          sowingDate,
          expectedHarvestDate,
          expectedYield,
          expectedSalePrice,
          status,
          notes: notes ? notes.trim() : undefined,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("farmId", "name location");

    if (!crop) {
      return res.status(404).json({
        message: "Crop not found.",
      });
    }

    return res.status(200).json({
      message: "Crop updated successfully.",
      crop,
    });
  } catch (error) {
    console.error("Update crop error:", error);

    return res.status(500).json({
      message: "Server error while updating crop.",
    });
  }
};

const deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid crop ID.",
      });
    }

    const crop = await Crop.findOne({
      _id: id,
      userId: req.user.userId,
      status: {
        $ne: "cancelled",
      },
    });

    if (!crop) {
      return res.status(404).json({
        message: "Crop not found.",
      });
    }

    crop.status = "cancelled";

    await crop.save();

    return res.status(200).json({
      message: "Crop deleted successfully.",
      cropId: crop._id,
    });
  } catch (error) {
    console.error("Delete crop error:", error);

    return res.status(500).json({
      message: "Server error while deleting crop.",
    });
  }
};

module.exports = {
  createCrop,
  getAllCrops,
  getCropsByFarm,
  getCropById,
  updateCrop,
  deleteCrop,
};