const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
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
    },

    category: {
      type: String,
      required: true,
      enum: [
        "seeds",
        "fertilizer",
        "pesticide",
        "labour",
        "irrigation",
        "machinery",
        "transport",
        "other",
      ],
    },

    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },

    expenseDate: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    receiptUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({
  userId: 1,
  expenseDate: -1,
});

expenseSchema.index({
  farmId: 1,
  expenseDate: -1,
});

expenseSchema.index({
  cropId: 1,
  expenseDate: -1,
});

module.exports = mongoose.model("Expense", expenseSchema);