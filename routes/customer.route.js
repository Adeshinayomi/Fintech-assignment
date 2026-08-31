const express = require('express')
const route = express.Router()
const {onboardCustomer}=require('../controller/customer.controller')

route.post('/onboard-customer', onboardCustomer)

module.exports = route