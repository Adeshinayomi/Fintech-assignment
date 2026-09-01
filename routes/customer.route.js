const express = require('express')
const route = express.Router()
const {onboardCustomer,customerLogin}=require('../controller/customer.controller')

route.post('/onboard-customer', onboardCustomer)
route.post('/login', customerLogin)

module.exports = route