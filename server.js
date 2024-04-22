const express = require("express")
require("./config/config")
const sellerRouter = require("./routers/sellerRoute")
// const orderRouter = require("./routers/orderRouter")
const PORT = process.env.PORT

// create an app instance of express
const app = express()
app.use(express.json())
app.use(sellerRouter)
// check if the server is connected
app.listen(PORT,()=>{
    console.log(`server is connected on port: ${PORT}`);
})