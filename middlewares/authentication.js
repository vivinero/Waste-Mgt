const sellerModel = require("../models/sellerModel");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const authenticate = async (req, res, next) => {
    try {
        // Get the token and split it from the bearer
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(404).json({
                error: "Authorization failed: token not found"
            });
        }
        // Check the validity of the token
        const decodedToken = jwt.verify(token, process.env.jwtSecret);
        
        // Find user by ID in userModel
        let user = await sellerModel.findById(decodedToken.userId);
        if (!user) {
            // If not found, find in sellerModel
            user = await sellerModel.findById(decodedToken.userId);
        }
        
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }
        
        // Determine if the user is an admin based on the model they are retrieved from
        const isAdmin = user.isAdmin || (user.Seller && user.Seller.isAdmin);

        // Check if the token is blacklisted
        if (user.blackList.includes(token)) {
            return res.status(400).json({
                error: "Unable to perform this action: User is logged out"
            });
        }

        // Store the user object along with the isAdmin flag in the request object
        req.user = {
            userId: user._id,
            isAdmin: isAdmin
        };
        
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({
                error: "Session Timeout"
            });
        }
        res.status(500).json({
            error: error.message
        });
    }
};

const authenticateAdmin = async (req, res, next) => {
    try {
        await authenticate(req, res, () => {
            if (req.user.isAdmin) {
                next();
            } else {
                return res.status(403).json({
                    error: "Unauthorized access: Admin privileges required"
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = { authenticate, authenticateAdmin };