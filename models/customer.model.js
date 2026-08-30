const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
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
      street: String,
      city: String,
      state: String,
      country: {
        type: String,
        default: "Nigeria",
      },
    },

    accountStatus: {
      type: String,
      enum: ["active", "suspended", "pending", "closed"],
      default: "pending",
    },

    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
    },

    bvn: {
      type: String,
      unique: true,
      sparse: true,
    },

    nin: {
      type: String,
      unique: true,
      sparse: true,
    },

    profilePicture: {
      type: String,
      default: null,
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