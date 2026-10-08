const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    summary: {
      type: String,
      required: true,
      trim: true,
    },

    eligibility: {
      type: String,
      required: true,
      trim: true,
    },

    benefits: {
      type: String,
      required: true,
      trim: true,
    },

    applicationUrl: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
      default: null,
    },

    tags: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

schemeSchema.index({
  title: "text",
  summary: "text",
  eligibility: "text",
  tags: "text",
});

schemeSchema.index({
  isActive: 1,
  state: 1,
  updatedAt: -1,
});

module.exports = mongoose.model(
  "Scheme",
  schemeSchema
);