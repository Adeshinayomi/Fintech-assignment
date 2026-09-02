const express = require('express')
const route = express.Router()
const {Transfer, getTransactionStatus,getTransactionHistory}=require('../controller/transaction.controller')
const auth=require('../middleware/auth')

route.post('/transfer', auth, Transfer)
route.get('/transaction-status/:transactionId', auth, getTransactionStatus)
route.get('/history', auth, getTransactionHistory)

module.exports = route