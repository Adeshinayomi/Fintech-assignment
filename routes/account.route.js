const express = require('express')
const route = express.Router()
const {getAccountName}=require('../controller/account.controller')
const auth=require('../middleware/auth')

route.get('/getAccountName/:accountNumber', auth, getAccountName)

module.exports = route