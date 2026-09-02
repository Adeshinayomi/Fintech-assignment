const Transaction = require('../models/transaction.model');
const Account = require('../models/account.model');
const { transferFunds,getNameEnquiry,transactionStatus} = require('../services/nibbs.service');

const Transfer= async (req, res) => {
    try {
        const { senderAccountNumber, receiverAccountNumber, amount } = req.body;
        if (!senderAccountNumber || !receiverAccountNumber || !amount) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const senderAccount = await Account.findOne({ accountNumber: senderAccountNumber });
        if (!senderAccount) {
            return res.status(400).json({ message: 'Invalid request' });
        }

        const receiverAccount = await getNameEnquiry(receiverAccountNumber);
        if (!receiverAccount) {
            return res.status(404).json({ message: 'Account not found' });
        }

        if(senderAccount.balance < Number(amount)){
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        const transferResponse = await transferFunds({
            from: senderAccountNumber,
            to: receiverAccountNumber,
            amount
        });

        if(transferResponse.status !== 'SUCCESS'){
            return res.status(400).json({ message: 'Transfer failed', details: transferResponse });
        }

        senderAccount.balance -= Number(amount);
        await senderAccount.save();
       
        const receiverAccountInDb = await Account.findOne({ accountNumber: receiverAccountNumber });

        if (receiverAccountInDb) {
            receiverAccountInDb.balance += Number(amount);
            await receiverAccountInDb.save();
        }

        const transaction = new Transaction({
            accountId: senderAccount._id,
            transactionId: transferResponse.reference,
            amount,
            receiverAccountNumber: receiverAccountNumber,
            status: transferResponse.status,
            type: 'debit',
        });
        await transaction.save();


        res.status(200).json({
            message: 'Transfer successful',
            transaction
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error('Transfer error:', error);
    }
};

const getTransactionStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;
        if (!transactionId) {
            return res.status(400).json({ message: 'Transaction ID is required' });
        }

        const statusResponse = await transactionStatus(transactionId);

        res.status(200).json({ message: 'Transaction status retrieved', statusResponse });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error('Transaction status error:', error);
    }
};
const getTransactionHistory = async (req, res) => {
    try {
        const { accountId } = req.params;
        
        if (!accountId) {
            return res.status(400).json({ message: 'Account ID is required' });
        }

        const transactions = await Transaction.find({ accountId }).sort({ createdAt: -1 });

        res.status(200).json({ message: 'Transaction history retrieved', transactions });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error('Transaction history error:', error);
    }
};

module.exports = {
    Transfer,
    getTransactionStatus,
    getTransactionHistory
};