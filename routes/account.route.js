const express = require('express')
const route = express.Router()
const {getAccountName,getBalance}=require('../controller/account.controller')
const auth=require('../middleware/auth')

route.get('/getAccountName', auth, getAccountName)
route.get('/getAccountBalance', auth, getBalance)

module.exports = route