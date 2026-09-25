const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      village: {
        type: String,
        trim: true,
      },

      district: {
        type: String,
        trim: true,
      },

      state: {
        type: String,
        trim: true,
      },

      country: {
        type: String,
        trim: true,
      },

      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },
    },

    area: {
      value: {
        type: Number,
        required: true,
        min: 0,
      },

      unit: {
        type: String,
        required: true,
        enum: ["acre", "hectare", "bigha"],
      },
    },

    soilType: {
      type: String,
      required: true,
      trim: true,
    },

    irrigationSource: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

farmSchema.index({
  userId: 1,
  isActive: 1,
  createdAt: -1,
});

farmSchema.index({
  "location.district": 1,
  "location.state": 1,
});

module.exports = mongoose.model("Farm", farmSchema);