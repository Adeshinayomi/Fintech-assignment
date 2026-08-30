const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    bvnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bvn",
      required: true,
    },

    accountNumber: {
      type: String,
      required: true,
      unique: true,
    },

    accountName: {
      type: String,
      required: true,
    },

    bankCode: {
      type: String,
      required: true,
    },

    fintechId: {
      type: String,
      required: true,
    },

    kycType: {
      type: String,
      required: true,
    },

    kycID: {
      type: String,
      required: true,
    },

    balance: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "blocked", "closed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Account", accountSchema);