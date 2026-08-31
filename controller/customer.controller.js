const Customer = require('../models/customer.model')
const BVN = require('../models/bvn.model')
const NIN = require('../models/nin.model')
const Account = require('../models/account.model')
const {insertBvn,insertNin,createAccount}=require('../services/nibbs.service')

const bcrypt= require('bcrypt')

const onboardCustomer = async (req, res) => {
  let customer;
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      dateOfBirth,
      address,
      kyc
    } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password || !dateOfBirth || !address) {
        return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    if (typeof address !== "object" || Array.isArray(address)) {
      return res.status(400).json({ success: false, message: "address must be an object" });
    }

    if (!kyc || !kyc.type || !kyc.value) { 
        return res.status(400).json({ success: false, message: "KYC information is required", });
    }

    const kycType = String(kyc.type).toUpperCase();
    if (!['BVN', 'NIN'].includes(kycType)) {
      return res.status(400).json({ success: false, message: "KYC type must be BVN or NIN" });
    }

    if (Number.isNaN(new Date(dateOfBirth).getTime())) {
      return res.status(400).json({ success: false, message: "dateOfBirth must be a valid date" });
    }


    const existingCustomer= await Customer.findOne({$or: [{ email }, { phoneNumber }]})

    if(existingCustomer){
        return res.status(409).json({ success: false, message: 'Email or phone number is already registered' });
    }

    const existingKyc = await Customer.findOne({ "kyc.type": kycType, "kyc.value": kyc.value });
    if (existingKyc) { 
        return res.status(409).json({ 
            success: false,
            message: `${kycType} is already linked to a customer`,
        });
    }


    const salt = await bcrypt.genSalt(10)
    const hashpassword = await bcrypt.hash(password,salt)

    customer = await Customer.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password:hashpassword,
      dateOfBirth,
      address, 
      kyc: { 
        type: kycType,
        value: kyc.value,
      },
      onboardingStatus: "pending",
      accountStatus: "pending",
    });

    const kycResponse = kycType === "BVN"
      ? await insertBvn({
            bvn: kyc.value, firstName, lastName, dob: dateOfBirth, phone: phoneNumber,
        })
      : await insertNin({ nin: kyc.value, firstName, lastName, dob: dateOfBirth, phone: phoneNumber });

    // Check KYC response
    if (!kycResponse || !kycResponse.success) {
        await Customer.findByIdAndUpdate(customer._id, { onboardingStatus: "failed", })

        return res.status(400).json({ success: false, message: `${kycType} verification failed` });
    } 

    
    //  Update customer KYC status 
    await Customer.findByIdAndUpdate(customer._id, { onboardingStatus: "kyc_verified", });

    const KycModel = kycType === "BVN" ? BVN : NIN;
    const kycRecord = await KycModel.create({
        customerId: customer._id,
        [kycType === "BVN" ? "bvn" : "nin"]: kyc.value,
        firstName: kycResponse.firstName || firstName,
        lastName: kycResponse.lastName || lastName,
        dob: kycResponse.dob || dateOfBirth,
        phone: kycResponse.phone || phoneNumber,
        verificationStatus: "verified", verifiedAt: new Date(),
    });

    // 9. Create account using verified KYC 
    const accountResponse = await createAccount({
        kycType:kycType.toLowerCase(),
        kycID: kyc.value,
        dob: kycResponse.dob || dateOfBirth,
    });

    if (!accountResponse || !accountResponse.account) {
        await Customer.findByIdAndUpdate(customer._id, { onboardingStatus: "failed", }); 
        
        return res.status(400).json({ success: false, message: "KYC verified but account creation failed", });
    }

    const accountData = accountResponse.account;

    // Save account
    const account = await Account.create({
      customerId: customer._id,
      kycRecordId: kycRecord._id,
      kycModel: kycType === "BVN" ? "Bvn" : "Nin",
      accountNumber: accountData.accountNumber,
      accountName: accountData.accountName,
      bankCode: accountData.bankCode,
      fintechId: accountData.fintechId,
      kycType: accountData.kycType || kycType,
      kycID: accountData.kycID || kyc.value,
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