const Account = require("../models/account.model");
const { getNameEnquiry,getAccountBalance} = require("../services/nibbs.service");

const getAccountName = async (req, res) => {
  try {
    const { accountNumber} = req.params;
    const result= await getNameEnquiry(accountNumber);

    res.status(200).json({ name: result.accountName });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching name enquiry.' });
  }
};

const getBalance = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const result = await getAccountBalance(accountNumber);

    res.status(200).json({ balance: result.balance });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching account balance.' });
  }
};

module.exports = {
  getAccountName,
  getBalance
};