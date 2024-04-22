const sellerModel = require("../models/sellerModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const dynamicHtml = require("../helpers/html")
const {sendEmail} = require("../helpers/email")
const { errorMonitor } = require("nodemailer/lib/xoauth2")

exports.signUp = async (req, res) => {
    try {
        //get requirement for registration
        const {firstName, lastName, email, password, confirmPassword} = req.body
        const emailExist = await sellerModel.findOne({email})
        //check if email already exist
        if (emailExist) {
            return res.status(400).json({
                errorMonitor: "This email already exist" 
            })
        }
        //confirm if the password corresponds
        if (confirmPassword !== password) {
            return res.status(400).json({
                error: "Password does not match"
            })
        }
        //hash password both passwords
        const saltPass = bcrypt.genSaltSync(12)
        const hashPass = bcrypt.hashSync(password&&confirmPassword, saltPass)

        //register the user
        const seller = await sellerModel.create({
            firstName: firstName,
            lastName:lastName,
            email: email.toLowerCase(),
            password: hashPass,
            confirmPassword: hashPass
        })

        //generate a token for the user
        const token = jwt.sign({
            userId: seller._id,
            email: seller.email,
            firstName: seller.firstName,
            lastName: seller.lastName
        }, process.env.jwtSecret, {expiresIn: "6000s"})

        //send email verification to the user
        const name = `${seller.firstName.toUpperCase()} . ${seller.lastName.slice(0, 1).toUpperCase()}`
        const link = `${req.protocol}://${req.get('host')}/verify-user/${seller.id}/${token}`
        const html = dynamicHtml(link, name)
        sendEmail({
        email:seller.email,
        subject:"Click on the button below to verify your email", 
        html
        })

        //throw a failure message
        if (!seller) {
            return res.status(400).json({
                error: "Error creating your account"
            })
        }
        //return a success message
        res.status(200).json({
            message: `Welcome ${seller.firstName.toUpperCase()} ${seller.lastName.slice(0,1).toUpperCase()}, you have successfully registered`,
            data: seller
        })

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

exports.login = async (req, res) => {
    try {
        //go into the body
        const { email, password } = req.body
        const userExist = await sellerModel.find({email: email.toLowerCase()})
        if (!userExist) {
            return res.status(400).json({
                error: "This user does not exist"
            })
        }
        //check for password
        const checkPassword = bcrypt.compareSync(password, userExist.password)
        if (!checkPassword) {
            return res.status(400).json({
                error: "Password doesnot match"
            })
        }
        const token = jwt.sign({
            userId: userExist._id,
            email: userExist.email,
        }, process.env.jwtSecret, {expiresIn: "2ds"})

        res.status(200).json({
            message: `Dear ${firstName.userExist} you have successfully logged in`,
            token
        })
    } catch (error) {
       res.status(500).json({
            error: error.message
       }) 
    }
}