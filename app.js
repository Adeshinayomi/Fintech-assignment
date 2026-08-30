const express = require("express")
const app = express()
const dotenv = require("dotenv")
dotenv.config()

app.use(express.json())


app.listen(process.env.PORT,()=>{
    console.log(`Server is running on Port:${process.env.PORT}`)
})