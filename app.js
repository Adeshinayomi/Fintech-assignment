const express = require("express")
const app = express()
const connectDB = require('./config/database.config')
const dotenv = require("dotenv")
dotenv.config()

app.use(express.json())


app.listen(process.env.PORT,()=>{
    connectDB()
    console.log(`Server is running on Port:${process.env.PORT}`)
})