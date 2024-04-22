const mongoose = require("mongoose")
const sellerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    }, 
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    isVerified:{
        type: Boolean,
        default: false
    }
}, {timestamps: true})

const sellerModel = mongoose.model("Seller", sellerSchema)
module.exports = sellerModel