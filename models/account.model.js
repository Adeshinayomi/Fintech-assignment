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

    accountName: String,

    accountType: String,

    currency: {
      type: String,
      default: "NGN",
    },

    status: {
      type: String,
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);