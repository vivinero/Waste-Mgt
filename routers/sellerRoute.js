const sellerRouter = require("express").Router()
const userValidation = require("../middlewares/sellerValidation")
const {authenticate} = require("../middlewares/authentication")

const { signUp, login, reverifyUser, signOut, forgotPassword, resetPassword, verifyUser } = require("../controllers/sellerControls")
sellerRouter.post("/sign-up", userValidation, signUp)
sellerRouter.post("/verify-User/:id/:token", verifyUser)
sellerRouter.post("/reverify-user", reverifyUser)
sellerRouter.post("/log-in", login)
sellerRouter.post("/sign-out", authenticate, signOut)
sellerRouter.get("/forget-Password", forgotPassword)
sellerRouter.put("/reset-Password/:id", resetPassword)



module.exports = sellerRouter