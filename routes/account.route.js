const express = require('express')
const route = express.Router()
const {getAccountName,getBalance}=require('../controller/account.controller')
const auth=require('../middleware/auth')

route.get('/getAccountName/:accountNumber', auth, getAccountName)
route.get('/getAccountBalance/:accountNumber', auth, getBalance)

module.exports = route