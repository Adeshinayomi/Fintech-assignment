const Customer = require('../models/customer.model')
const BVN = require('../models/bvn.model')
const NIN = require('../models/nin.model')
const Account = require('../models/account.model')
const {insertBvn,insertNin,createAccount}=require('../services/nibbs.service')

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
      address,
      kyc
    } = req.body;

    if(!firstName || !lastName || !email || !phoneNumber || !password || !dateOfBirth || !address){
        res.status(400).json({message:"All field are required"})
    }

    
    if (!kyc || !kyc.type || !kyc.value) { 
        return res.status(400).json({ success: false, message: "KYC information is required", });
    }


    const existingCustomer= await Customer.findOne({$or: [{ email }, { phoneNumber }]})

    if(existingCustomer){
        res.status(409).json({message:'user exists already'})
    }

    const existingKyc = await Customer.findOne({ "kyc.value": kyc.value, }); 
    if (existingKyc) { 
        return res.status(409).json({ 
            success: false,
            message: `${kyc.type} is already linked to a customer`, 
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
      address, 
      kyc: { 
        type: kyc.type, 
        value: kyc.value,
      },
      onboardingStatus: "pending",
      accountStatus: "pending",
    });

    if (kyc.type === "BVN") {
        kycResponse = await insertBvn({ 
            bvn: kyc.value, firstName, lastName, dob: dateOfBirth, phone: phoneNumber,
        }); 
    }else { 
        kycResponse = await insertNin({ nin: kyc.value, firstName, lastName, dob: dateOfBirth, }); 
    }

    // Check KYC response
    if (!kycResponse || !kycResponse.success) {
        await Customer.findByIdAndUpdate(customer.customerId, { onboardingStatus: "failed", })

        return res.status(400).json({ success: false, message: `${kyc.type} verification failed`, }); 
    } 

    
    //  Update customer KYC status 
    await Customer.findByIdAndUpdate(customer.customerId, { onboardingStatus: "kyc_verified", });

    await kyc.type.create({
        customerId: customer.customerId,
        bvn: kyc.value, 
        firstName: kycResponse.firstName, 
        lastName: kycResponse.lastName,
        dob:kycResponse.dob,
        phone: kycResponse.phone, 
        verificationStatus: "verified", verifiedAt: new Date(),
    })

    // 9. Create account using verified KYC 
    const accountResponse = await createAccount({
        kycType: kyc.type, 
        kycID: kycResponse.value, 
        dob: kycResponse.dob, 
    });

    if (!accountResponse || !accountResponse.account) {
        await Customer.findByIdAndUpdate(customer._id, { onboardingStatus: "failed", }); 
        
        return res.status(400).json({ success: false, message: "KYC verified but account creation failed", });
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