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

exports.verifyUser = async (req,res)=>{
    try{
       
          const  id = req.params.id
          const token = req.params.token
          
          await jwt.verify(token, process.env.jwtSecret )

       const updatedUser = await sellerModel.findByIdAndUpdate(id, {isVerified: true}, {new: true})
       res.redirect ("https://swiftlaundry-app-beta.vercel.app/VerifyUser")

   
       res.status(200).json({
           message:`user with emmail:${updatedUser.email} is now verified`,
           data: updatedUser
       })
    }catch(err){
       res.status(500).json({
           error: err.message
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

exports.reverifyUser = async (req, res) => {
    try {
        const {email} = req.body
        const newUser = await sellerModel.findOne({email})
        if (!newUser) {
           return res.status(400).json({
            error: `seller with ${newUser.email} does not exist `
           }) 
        }
        // generate token
        const token = jwt.sign({
            userId: newUser._id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName
        }, process.env.jwtSecret, {expiresIn: "6000s"})

        //send verification email to the user
        const name = `${newUser.firstName.toUpperCase()} . ${newUser.lastName.slice(0,1).toUpperCase()}`
        const link = `${req.protocol}://${req.get('host')}/verify-user/${newUser.id}/${token}`
        const html = dynamicHtml(link, name)
        sendEmail({
        email:newUser.email,
        subject:"Click on the button below to verify your email", 
        html
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
       }) 
    }
}

exports.signOut = async (req, res)=> {
    try {
        const token = req.headers.authorization.split(' ')[1]
        //check if token exist
        if (!token) {
            return res.status(400).json({
                error: "Authorization failed: token not found"
            })
        }
        // get the user's id
        const userId = req.user.userId
        //find the user
        const user = await sellerModel.findById(userId)
        //push the user in blacklist and save
        user.blacklist.push(token)
        await user.save()
        //success message
        res.status(200).json({
            message: "This user has successfully logged out"
        })
    } catch (error) {
        res.status(400).json({
            error: error.message
        })
    }
}

exports.forgotPassword = async(req, res)=> {
    try {
        const checkUser = await sellerModel.findOne( {email: req.body.email} )
        if (!checkUser) {
            return res.status(400).json({
                error: "Email does not exist"
            })
        }else{
            const name = checkUser.firstName + ' ' + checkUser.lastName
            const subject = "Kindly reset your password"
            const link = `http://localhost:${port}/user-reset/${checkUser.id}`
            const html = resetFunc(name, link)
            sendEmail({
                email: checkUser.email,
                html,
                subject
            })
            return res.status(200).json({
                message: "Kindly check your email to reset your password",
            })
        }
    } catch (error) {
        res.status(400).json({
            error: error.message
        })
    }
}

exports.resetPassword = async(req, res)=> {
    try {
        //get id from the params
        const id = req.params.id
        //include password in the body
        const password = req.body.password
        //check if password exist
        if (!password) {
            return res.status(400).json({
                error: "Password cannot be empty"
            })
        }
    //salt password
    const saltPass = bcrypt.genSaltSync(12)
    const hashPass = bcrypt.hashSync(password, saltPass)

    const reset = await sellerModel.findByIdAndUpdate(id, {password: hashPass}, {new: true})
    //success response
    res.status(200).json({
        message: "Password reset successfully"
    })
        
    } catch (error) {
        res.status(400).json({
            error: error.message
        })
    }
}