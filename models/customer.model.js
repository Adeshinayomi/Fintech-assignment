const mongoose = require("mongoose");
const crypto = require("crypto");

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      unique: true,
      immutable: true,
      default: () =>
        `CUS-${crypto.randomBytes(6).toString("hex").toUpperCase()}`,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    address: {
      street: {
        type: String,
        trim: true,
      },

      city: {
        type: String,
        trim: true,
      },

      state: {
        type: String,
        trim: true,
      },

      country: {
        type: String,
        default: "Nigeria",
        trim: true,
      },
    },

    kyc: {
      type: {
        type: String,
        enum: ["BVN", "NIN"],
        required: true,
      },

      value: {
        type: String,
        required: true,
      },
    },

    onboardingStatus: {
      type: String,
      enum: [
        "pending",
        "kyc_verified",
        "completed",
        "failed",
      ],
      default: "pending",
    },

    accountStatus: {
      type: String,
      enum: [
        "pending",
        "active",
        "suspended",
        "closed",
      ],
      default: "pending",
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;

