const express = require("express")
const mongoose = require("mongoose")
const authRouter = require("./authRouter")
const testsRouter = require("./testsRouter")
const PORT = process.env.PORT || 5000
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())
app.use("/auth", authRouter)
app.use("/tests", testsRouter)

const start = async() =>{
    try{
        await mongoose.connect("mongodb+srv://qwerty:qwerty123@cluster0.lrtst.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
        app.listen(PORT, ()=>console.log(`server started on port ${PORT}`))
    }
    catch(e){
        console.log(e)
    }
}

start()