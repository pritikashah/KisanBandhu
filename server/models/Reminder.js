const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
    },

    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crop",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    remindAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

reminderSchema.index({
  userId: 1,
  status: 1,
  remindAt: 1,
});

reminderSchema.index({
  status: 1,
  remindAt: 1,
});

module.exports = mongoose.model(
  "Reminder",
  reminderSchema
);