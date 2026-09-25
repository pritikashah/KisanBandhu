const mongoose = require("mongoose");

const harvestSchema = new mongoose.Schema(
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

    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crop",
      required: true,
    },

    harvestDate: {
      type: Date,
      required: true,
    },

    quantity: {
      value: {
        type: Number,
        required: true,
        min: 0,
      },

      unit: {
        type: String,
        required: true,
        enum: ["kg", "quintal"],
      },
    },

    salePricePerUnit: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },

    grossRevenue: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },

    buyerName: {
      type: String,
      trim: true,
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

harvestSchema.index({
  cropId: 1,
  harvestDate: -1,
});

harvestSchema.index({
  farmId: 1,
  harvestDate: -1,
});

module.exports = mongoose.model("Harvest", harvestSchema);