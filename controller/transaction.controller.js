const Transaction = require('../models/transaction.model');
const Account = require('../models/account.model');
const { transferFunds,getNameEnquiry} = require('../services/nibbs.service');

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

        if(senderAccount.balance < amount){
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        const transferResponse = await transferFunds({
            fromAccount: senderAccountNumber,
            toAccount: receiverAccountNumber,
            amount
        });

        if(transferResponse.status !== 'SUCCESS'){
            return res.status(400).json({ message: 'Transfer failed', details: transferResponse });
        }

        senderAccount.balance -= amount;
        await senderAccount.save();
       
        const transaction = new Transaction({
            accountId: senderAccount._id,
            transactionId: transferResponse.transactionId,
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
    }
};