const Account = require("../models/account.model");
const { getNameEnquiry,getAccountBalance} = require("../services/nibbs.service");

const getAccountName = async (req, res) => {
  try {
    const accountOwner = req.customer;
    console.log("Account Owner:", accountOwner);
    const customerAccount = await Account.findOne({ customerId: accountOwner.id });

    if (!customerAccount) {
      return res.status(404).json({ message: 'Account not found for the customer' });
    }

    const result= await getNameEnquiry(customerAccount.accountNumber);

    res.status(200).json({ name: result.accountName });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching name enquiry.' });
  }
};

const getBalance = async (req, res) => {
  try {
    const owner = req.customer;
    const customerAccount = await Account.findOne({ customerId: owner.id });
    if (!customerAccount) {
      return res.status(404).json({ message: 'Account not found for the customer' });
    }
    const result = await getAccountBalance(customerAccount.accountNumber);

    res.status(200).json({ balance: result.balance });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching account balance.' });
  }
};

module.exports = {
  getAccountName,
  getBalance
};