const express = require('express')
const route = express.Router()
const {Transfer}=require('../controller/transaction.controller')
const auth=require('../middleware/auth')

route.post('/transfer', auth, Transfer)

module.exports = route