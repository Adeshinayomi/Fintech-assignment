const Customer = require('../models/customer.model')
const Bvn = require('../models/bvn.model')
const Account = require('../models/account.model')

const {insertBvn,createAccount}=require('../services/nibbs.service')

const onboardCustomer = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      dateOfBirth,
      bvn,
    } = req.body;

    // 1. Create customer
    const customer = await Customer.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      dateOfBirth,
    });

    // 2. Verify BVN with NIBSS
    const bvnResponse = await insertBvn({
      bvn,
      firstName,
      lastName,
      dob: dateOfBirth,
      phone: phoneNumber,
    });

    // 3. Save BVN
    const bvnRecord = await Bvn.create({
      customerId: customer._id,
      bvn,
      firstName,
      lastName,
      dob: dateOfBirth,
      phone: phoneNumber,
      verificationStatus: "verified",
      verifiedAt: new Date(),
    });

    // 4. Create account using BVN
    const accountResponse = await createAccount({
      bvn,
      dob: dateOfBirth,
    });

    // 5. Save account
    const account = await Account.create({
      customerId: customer._id,
      bvnId: bvnRecord._id,

      // TEMPORARY — adjust to actual NIBSS response
      accountNumber: accountResponse.accountNumber,
      accountName: accountResponse.accountName,
      accountType: accountResponse.accountType,
      currency: "NGN",
      status: "active",
    });

    // 6. Return result
    return res.status(201).json({
      success: true,
      message: "Customer onboarded successfully",
      customer,
      bvn: bvnRecord,
      account,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Customer onboarding failed",
      error: error.message,
    });
  }
};

module.exports = {
  onboardCustomer,
};