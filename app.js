const express = require("express")
const app = express()
const connectDB = require('./config/database.config')
const customerRoute = require('./routes/customer.route')
const accountRoute = require('./routes/account.route')
const dotenv = require("dotenv")
dotenv.config()

app.use(express.json())
app.use('/customers', customerRoute)
app.use('/accounts', accountRoute)

app.listen(process.env.PORT,()=>{
    connectDB()
    console.log(`Server is running on Port:${process.env.PORT}`)
})