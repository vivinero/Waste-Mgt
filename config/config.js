const mongoose = require("mongoose")
require("dotenv").config()

const db = process.env.APILINK

mongoose.connect(db).then(()=> {
    console.log(`Database Successful`)
}).catch((e)=>{
    console.log(e.message)
})