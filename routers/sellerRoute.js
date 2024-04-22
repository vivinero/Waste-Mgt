const sellerRouter = require("express").Router()
const userValidation = require("../middlewares/sellerValidation")

const { signUp } = require("../controllers/sellerControls")
sellerRouter.post("/sign-up", userValidation, signUp)



module.exports = sellerRouter