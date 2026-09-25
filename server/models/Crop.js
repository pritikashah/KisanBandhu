const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    season: {
      type: String,
      required: true,
      enum: ["Kharif", "Rabi", "Zaid", "Other"],
    },

    sowingDate: {
      type: Date,
      required: true,
    },

    expectedHarvestDate: {
      type: Date,
    },

    expectedYield: {
      value: {
        type: Number,
        min: 0,
      },

      unit: {
        type: String,
        enum: ["kg", "quintal"],
      },
    },

    expectedSalePrice: {
      type: Number,
      min: 0,
    },

    status: {
      type: String,
      required: true,
      enum: ["planned", "growing", "harvested", "cancelled"],
      default: "planned",
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

cropSchema.index({
  farmId: 1,
  status: 1,
  sowingDate: -1,
});

cropSchema.index({
  userId: 1,
  expectedHarvestDate: 1,
});

module.exports = mongoose.model("Crop", cropSchema);