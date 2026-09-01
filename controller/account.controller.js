const Account = require("../models/account.model");
const { getNameEnquiry} = require("../services/nibbs.service");

const getAccountName = async (req, res) => {
  try {
    const { accountNumber} = req.params.Account;
    const result= await getNameEnquiry(accountNumber);

    res.status(200).json({ name: result.name });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching name enquiry.' });
  }
};
