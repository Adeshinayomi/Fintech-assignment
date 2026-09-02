const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
    {
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
        },
        transactionId: {
            type: String,
            unique: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        receiverAccountNumber: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['PENDING', 'SUCCESS', 'FAILED'],
            default: 'PENDING',
        },
        type: {
            type: String,
            enum: ['credit', 'debit'],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Transaction', transactionSchema);