const mongoose = require("mongoose");

const bvnSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    bvn: {
      type: String,
      required: true,
      unique: true,
    },

    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    dob: {
      type: Date,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    verificationStatus: {
      type: String,
      enum: ["verified", "failed"],
      required: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bvn", bvnSchema);