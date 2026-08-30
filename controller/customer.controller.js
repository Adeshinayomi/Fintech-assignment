const Customer = require('../models/customer.model')
const Bvn = require('../models/bvn.model')
const Account = require('../models/account.model')
const {insertBvn,createAccount}=require('../services/nibbs.service')

const bcrypt= require('bcrypt')

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

    const existingCustomer= await Customer.findOne({$or: [{ email }, { phoneNumber }]})

    if(existingCustomer){
        res.status(409).json({message:'user exists already'})
    }

    const existingBvn = await Bvn.findOne({ bvn });

    if (existingBvn) {
      return res.status(409).json({
        success: false,
        message: "BVN is already linked to a customer",
      });
    }


    const salt = await bcrypt.genSalt(10)
    const hashpassword = await bcrypt.hash(password,salt)

    const customer = await Customer.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password:hashpassword,
      dateOfBirth,
      onboardingStatus: "pending",
      accountStatus: "pending",
    });

   // Send BVN information to NIBSS
    const bvnResponse = await insertBvn({
      bvn,
      firstName,
      lastName,
      dob: dateOfBirth,
      phone: phoneNumber,
    });

    // Check NIBSS response
    if (!bvnResponse.success || !bvnResponse.data) {
      await Customer.findByIdAndUpdate(customer._id, {
        onboardingStatus: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "BVN verification failed",
      });
    }

    const bvnData = bvnResponse.data;

    // Save verified BVN
    const bvnRecord = await Bvn.create({
      customerId: customer._id,
      bvn: bvnData.bvn,
      firstName: bvnData.firstName,
      lastName: bvnData.lastName,
      dob: bvnData.dob,
      phone: bvnData.phone,
      verificationStatus: "verified",
      verifiedAt: new Date(),
    });

    // Update onboarding status
    await Customer.findByIdAndUpdate(customer._id, {
      onboardingStatus: "bvn_verified",
    });

    // Create account using BVN
    const accountResponse = await createAccount({
      bvn: bvnData.bvn,
      dob: bvnData.dob,
    });

    if (!accountResponse.account) {
      await Customer.findByIdAndUpdate(customer._id, {
        onboardingStatus: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "BVN verified but account creation failed",
      });
    }

    const accountData = accountResponse.account;

    // Save account
    const account = await Account.create({
      customerId: customer._id,
      bvnId: bvnRecord._id,
      accountNumber: accountData.accountNumber,
      accountName: accountData.accountName,
      bankCode: accountData.bankCode,
      fintechId: accountData.fintechId,
      kycType: accountData.kycType,
      kycID: accountData.kycID,
      balance: accountData.balance,
      status: "active",
    });

    // Mark customer as fully onboarded
    await Customer.findByIdAndUpdate(customer._id, {
      onboardingStatus: "completed",
      accountStatus: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Customer onboarded successfully",

      customer: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        onboardingStatus: "completed",
      },

      account: {
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        bankCode: account.bankCode,
        balance: account.balance,
        status: account.status,
      },
    });
  } catch (error) {
    console.error("Onboarding error:", error);

    return res.status(500).json({
      success: false,
      message: "Customer onboarding failed",
    });
  }
};

module.exports = {
  onboardCustomer,
};