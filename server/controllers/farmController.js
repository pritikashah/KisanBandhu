const mongoose = require("mongoose");
const Farm = require("../models/Farm");

const createFarm = async (req, res) => {
  try {
    const {
      name,
      location,
      area,
      soilType,
      irrigationSource,
    } = req.body;

    if (!name || !area || !soilType) {
      return res.status(400).json({
        message: "Farm name, area, and soil type are required.",
      });
    }

    if (
      typeof area.value !== "number" ||
      area.value <= 0
    ) {
      return res.status(400).json({
        message: "Area value must be greater than 0.",
      });
    }

    if (
      !area.unit ||
      !["acre", "hectare", "bigha"].includes(area.unit)
    ) {
      return res.status(400).json({
        message: "Area unit must be acre, hectare, or bigha.",
      });
    }

    const farm = await Farm.create({
      userId: req.user.userId,
      name: name.trim(),
      location,
      area: {
        value: area.value,
        unit: area.unit,
      },
      soilType: soilType.trim(),
      irrigationSource: irrigationSource
        ? irrigationSource.trim()
        : undefined,
      isActive: true,
    });

    return res.status(201).json({
      message: "Farm created successfully.",
      farm,
    });
  } catch (error) {
    console.error("Create farm error:", error);

    return res.status(500).json({
      message: "Server error while creating farm.",
    });
  }
};

const getFarms = async (req, res) => {
  try {
    const farms = await Farm.find({
      userId: req.user.userId,
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Farms fetched successfully.",
      count: farms.length,
      farms,
    });
  } catch (error) {
    console.error("Get farms error:", error);

    return res.status(500).json({
      message: "Server error while fetching farms.",
    });
  }
};

const getFarmById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid farm ID.",
      });
    }

    const farm = await Farm.findOne({
      _id: id,
      userId: req.user.userId,
      isActive: true,
    });

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found.",
      });
    }

    return res.status(200).json({
      message: "Farm fetched successfully.",
      farm,
    });
  } catch (error) {
    console.error("Get farm by ID error:", error);

    return res.status(500).json({
      message: "Server error while fetching farm.",
    });
  }
};

const updateFarm = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid farm ID.",
      });
    }

    const {
      name,
      location,
      area,
      soilType,
      irrigationSource,
    } = req.body;

    if (!name || !area || !soilType) {
      return res.status(400).json({
        message: "Farm name, area, and soil type are required.",
      });
    }

    if (
      typeof area.value !== "number" ||
      area.value <= 0
    ) {
      return res.status(400).json({
        message: "Area value must be greater than 0.",
      });
    }

    if (
      !area.unit ||
      !["acre", "hectare", "bigha"].includes(area.unit)
    ) {
      return res.status(400).json({
        message: "Area unit must be acre, hectare, or bigha.",
      });
    }

    const farm = await Farm.findOneAndUpdate(
      {
        _id: id,
        userId: req.user.userId,
        isActive: true,
      },
      {
        $set: {
          name: name.trim(),
          location,
          area: {
            value: area.value,
            unit: area.unit,
          },
          soilType: soilType.trim(),
          irrigationSource: irrigationSource
            ? irrigationSource.trim()
            : undefined,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found.",
      });
    }

    return res.status(200).json({
      message: "Farm updated successfully.",
      farm,
    });
  } catch (error) {
    console.error("Update farm error:", error);

    return res.status(500).json({
      message: "Server error while updating farm.",
    });
  }
};

const deleteFarm = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid farm ID.",
      });
    }

    const farm = await Farm.findOne({
      _id: id,
      userId: req.user.userId,
      isActive: true,
    });

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found.",
      });
    }

    farm.isActive = false;
    await farm.save();

    return res.status(200).json({
      message: "Farm deleted successfully.",
      farmId: farm._id,
    });
  } catch (error) {
    console.error("Delete farm error:", error);

    return res.status(500).json({
      message: "Server error while deleting farm.",
    });
  }
};

module.exports = {
  createFarm,
  getFarms,
  getFarmById,
  updateFarm,
  deleteFarm,
};