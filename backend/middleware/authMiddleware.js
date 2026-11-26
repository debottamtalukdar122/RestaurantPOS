const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {

    try {

        const token = req.cookies.accessToken;


        if (!token) {

            return res.status(401).json({
                message: "Authentication required"
            });
        }


        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );


        const user = await User.findById(
            decoded.userId
        );


        if (!user) {

            return res.status(401).json({
                message: "User not found"
            });
        }


        if (!user.isActive) {

            return res.status(403).json({
                message: "Account disabled"
            });
        }


        if (
            decoded.tokenVersion !==
            user.tokenVersion
        ) {

            return res.status(401).json({
                message: "Token revoked"
            });
        }


        req.user = {
            userId: user._id,
            role: user.role
        };


        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired access token"
        });
    }
};


module.exports = authenticate;