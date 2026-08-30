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

    firstName: String,
    lastName: String,
    dob: Date,
    phone: String,

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "failed"],
      default: "pending",
    },

    verifiedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bvn", bvnSchema);