const mongoose = require("mongoose");

const Reminder = require("../models/Reminder");
const Farm = require("../models/Farm");
const Crop = require("../models/Crop");

const validStatuses = [
  "pending",
  "completed",
  "cancelled",
];

const validateRelatedRecords = async ({
  farmId,
  cropId,
  userId,
}) => {
  if (farmId) {
    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return {
        valid: false,
        status: 400,
        message: "Invalid farm ID.",
      };
    }

    const farm = await Farm.findOne({
      _id: farmId,
      userId,
      isActive: true,
    });

    if (!farm) {
      return {
        valid: false,
        status: 404,
        message:
          "Farm not found or you are not authorized to use this farm.",
      };
    }
  }

  if (cropId) {
    if (!mongoose.Types.ObjectId.isValid(cropId)) {
      return {
        valid: false,
        status: 400,
        message: "Invalid crop ID.",
      };
    }

    const cropFilter = {
      _id: cropId,
      userId,
      status: {
        $ne: "cancelled",
      },
    };

    if (farmId) {
      cropFilter.farmId = farmId;
    }

    const crop = await Crop.findOne(cropFilter);

    if (!crop) {
      return {
        valid: false,
        status: 404,
        message:
          "Crop not found or crop does not belong to the selected farm.",
      };
    }
  }

  return {
    valid: true,
  };
};

const createReminder = async (req, res) => {
  try {
    const {
      farmId,
      cropId,
      title,
      description,
      remindAt,
    } = req.body;

    if (!title || !remindAt) {
      return res.status(400).json({
        message:
          "Reminder title and remindAt are required.",
      });
    }

    const parsedRemindAt = new Date(remindAt);

    if (Number.isNaN(parsedRemindAt.getTime())) {
      return res.status(400).json({
        message: "Invalid reminder date and time.",
      });
    }

    const validation =
      await validateRelatedRecords({
        farmId,
        cropId,
        userId: req.user.userId,
      });

    if (!validation.valid) {
      return res.status(validation.status).json({
        message: validation.message,
      });
    }

    const reminder = await Reminder.create({
      userId: req.user.userId,
      farmId: farmId || undefined,
      cropId: cropId || undefined,
      title: title.trim(),
      description: description
        ? description.trim()
        : undefined,
      remindAt: parsedRemindAt,
      status: "pending",
    });

    return res.status(201).json({
      message: "Reminder created successfully.",
      reminder,
    });
  } catch (error) {
    console.error(
      "Create reminder error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while creating reminder.",
    });
  }
};

const getReminders = async (req, res) => {
  try {
    const {
      status,
      farmId,
      cropId,
      upcoming,
    } = req.query;

    const filter = {
      userId: req.user.userId,
    };

    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid reminder status.",
        });
      }

      filter.status = status;
    }

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

    if (upcoming === "true") {
      filter.status = "pending";
      filter.remindAt = {
        $gte: new Date(),
      };
    }

    const reminders = await Reminder.find(filter)
      .populate("farmId", "name")
      .populate("cropId", "name season status")
      .sort({
        remindAt: 1,
      });

    return res.status(200).json({
      message: "Reminders fetched successfully.",
      count: reminders.length,
      reminders,
    });
  } catch (error) {
    console.error(
      "Get reminders error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching reminders.",
    });
  }
};

const getReminderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid reminder ID.",
      });
    }

    const reminder = await Reminder.findOne({
      _id: id,
      userId: req.user.userId,
    })
      .populate("farmId", "name location")
      .populate("cropId", "name season status");

    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found.",
      });
    }

    return res.status(200).json({
      message: "Reminder fetched successfully.",
      reminder,
    });
  } catch (error) {
    console.error(
      "Get reminder error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching reminder.",
    });
  }
};

const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid reminder ID.",
      });
    }

    const {
      farmId,
      cropId,
      title,
      description,
      remindAt,
      status,
    } = req.body;

    if (!title || !remindAt || !status) {
      return res.status(400).json({
        message:
          "Reminder title, remindAt, and status are required.",
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid reminder status.",
      });
    }

    const parsedRemindAt = new Date(remindAt);

    if (Number.isNaN(parsedRemindAt.getTime())) {
      return res.status(400).json({
        message: "Invalid reminder date and time.",
      });
    }

    const validation =
      await validateRelatedRecords({
        farmId,
        cropId,
        userId: req.user.userId,
      });

    if (!validation.valid) {
      return res.status(validation.status).json({
        message: validation.message,
      });
    }

    let completedAt;

    if (status === "completed") {
      completedAt = new Date();
    } else {
      completedAt = null;
    }

    const reminder =
      await Reminder.findOneAndUpdate(
        {
          _id: id,
          userId: req.user.userId,
        },
        {
          $set: {
            farmId: farmId || undefined,
            cropId: cropId || undefined,
            title: title.trim(),
            description: description
              ? description.trim()
              : undefined,
            remindAt: parsedRemindAt,
            status,
            completedAt,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found.",
      });
    }

    return res.status(200).json({
      message: "Reminder updated successfully.",
      reminder,
    });
  } catch (error) {
    console.error(
      "Update reminder error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while updating reminder.",
    });
  }
};

const completeReminder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid reminder ID.",
      });
    }

    const reminder =
      await Reminder.findOneAndUpdate(
        {
          _id: id,
          userId: req.user.userId,
          status: {
            $ne: "cancelled",
          },
        },
        {
          $set: {
            status: "completed",
            completedAt: new Date(),
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found.",
      });
    }

    return res.status(200).json({
      message:
        "Reminder marked as completed successfully.",
      reminder,
    });
  } catch (error) {
    console.error(
      "Complete reminder error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while completing reminder.",
    });
  }
};

const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid reminder ID.",
      });
    }

    const reminder =
      await Reminder.findOneAndDelete({
        _id: id,
        userId: req.user.userId,
      });

    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found.",
      });
    }

    return res.status(200).json({
      message: "Reminder deleted successfully.",
      reminderId: reminder._id,
    });
  } catch (error) {
    console.error(
      "Delete reminder error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while deleting reminder.",
    });
  }
};

module.exports = {
  createReminder,
  getReminders,
  getReminderById,
  updateReminder,
  completeReminder,
  deleteReminder,
};