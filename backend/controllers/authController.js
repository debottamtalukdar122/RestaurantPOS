const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const Staff = require("../models/staff");


// ==========================================
// COOKIE OPTIONS
// ==========================================

const accessCookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000
};

const refreshCookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
};


// ==========================================
// GENERATE ACCESS TOKEN
// ==========================================

const generateAccessToken = (user) => {

    return jwt.sign(
        {
            userId: user._id,
            role: user.role,
            tokenVersion: user.tokenVersion
        },

        process.env.JWT_ACCESS_SECRET,

        {
            expiresIn: "15m"
        }
    );
};


// ==========================================
// GENERATE REFRESH TOKEN
// ==========================================

const generateRefreshToken = (user) => {

    return jwt.sign(
        {
            userId: user._id,
            tokenVersion: user.tokenVersion
        },

        process.env.JWT_REFRESH_SECRET,

        {
            expiresIn: "7d"
        }
    );
};


// ==========================================
// REGISTER CUSTOMER
// ==========================================

const register = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({
                message: "All fields are required"
            });
        }


        if (password.length < 6) {

            return res.status(400).json({
                message: "Password must contain at least 6 characters"
            });
        }


        const existingUser = await User.findOne({
            email
        });


        if (existingUser) {

            return res.status(409).json({
                message: "An account with this email already exists"
            });
        }


        const hashedPassword = await bcrypt.hash(
            password,
            12
        );


        const user = await User.create({

            name,

            email,

            password: hashedPassword,

            role: "customer"
        });


        res.status(201).json({

            message: "Registration successful",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// ==========================================
// LOGIN
// ==========================================

const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // ======================================
        // VALIDATION
        // ======================================

        if (!email || !password) {

            return res.status(400).json({
                message:
                    "Email and password are required"
            });

        }


        // ======================================
        // CHECK USER COLLECTION FIRST
        // ======================================

        let user = await User.findOne({
            email: email.toLowerCase().trim()
        });


        // ======================================
        // USER EXISTS
        // ADMIN / STAFF / CUSTOMER
        // ======================================

        if (user) {

            // -------------------------------
            // CHECK ACTIVE
            // -------------------------------

            if (!user.isActive) {

                return res.status(403).json({
                    message:
                        "Your account has been disabled"
                });

            }


            // -------------------------------
            // CHECK PASSWORD
            // -------------------------------

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!passwordMatch) {

                return res.status(401).json({
                    message:
                        "Invalid email or password"
                });

            }

        }


        // ======================================
        // USER DOES NOT EXIST
        // CHECK OLD STAFF COLLECTION
        // ======================================

        else {

            const oldStaff =
                await Staff.findOne({
                    email:
                        email.toLowerCase().trim()
                });


            // -------------------------------
            // STAFF NOT FOUND
            // -------------------------------

            if (!oldStaff) {

                return res.status(401).json({
                    message:
                        "Invalid email or password"
                });

            }


            // -------------------------------
            // CHECK STAFF ACTIVE
            // -------------------------------

            if (!oldStaff.isActive) {

                return res.status(403).json({
                    message:
                        "Your account has been disabled"
                });

            }


            // -------------------------------
            // CHECK STAFF PASSWORD
            // -------------------------------

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    oldStaff.password
                );


            if (!passwordMatch) {

                return res.status(401).json({
                    message:
                        "Invalid email or password"
                });

            }


            // ==================================
            // MIGRATE OLD STAFF
            // Staff → User
            // ==================================

            user = await User.create({

                name:
                    oldStaff.name,

                email:
                    oldStaff.email,

                password:
                    oldStaff.password,

                role:
                    "staff",

                isActive:
                    oldStaff.isActive

            });


            console.log(
                "Old staff migrated to User:",
                user.email
            );

        }


        // ======================================
        // GENERATE ACCESS TOKEN
        // ======================================

        const accessToken =
            generateAccessToken(user);


        // ======================================
        // GENERATE REFRESH TOKEN
        // ======================================

        const refreshToken =
            generateRefreshToken(user);


        // ======================================
        // ACCESS TOKEN COOKIE
        // ======================================

        res.cookie(
            "accessToken",
            accessToken,
            accessCookieOptions
        );


        // ======================================
        // REFRESH TOKEN COOKIE
        // ======================================

        res.cookie(
            "refreshToken",
            refreshToken,
            refreshCookieOptions
        );


        // ======================================
        // RESPONSE
        // ======================================

        res.status(200).json({

            message:
                "Login successful",

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role

            }

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        res.status(500).json({
            message:
                "Server error"
        });

    }

};


// ==========================================
// REFRESH ACCESS TOKEN
// ==========================================

const refreshToken = async (req, res) => {

    try {

        const token = req.cookies.refreshToken;


        if (!token) {

            return res.status(401).json({
                message: "Refresh token missing"
            });
        }


        const decoded = jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET
        );


        const user = await User.findById(
            decoded.userId
        );


        if (!user) {

            return res.status(401).json({
                message: "User not found"
            });
        }


        if (
            decoded.tokenVersion !==
            user.tokenVersion
        ) {

            return res.status(401).json({
                message: "Refresh token revoked"
            });
        }


        if (!user.isActive) {

            return res.status(403).json({
                message: "Account disabled"
            });
        }


        const newAccessToken =
            generateAccessToken(user);


        res.cookie(
            "accessToken",
            newAccessToken,
            accessCookieOptions
        );


        res.json({
            message: "Access token refreshed"
        });

    } catch (error) {

        res.status(401).json({
            message: "Invalid or expired refresh token"
        });
    }
};


// ==========================================
// LOGOUT
// ==========================================

const logout = async (req, res) => {

    try {

        if (req.user) {

            await User.findByIdAndUpdate(
                req.user.userId,
                {
                    $inc: {
                        tokenVersion: 1
                    }
                }
            );
        }


        res.clearCookie("accessToken");

        res.clearCookie("refreshToken");


        res.json({
            message: "Logout successful"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Logout failed"
        });
    }
};


// ==========================================
// CURRENT USER
// ==========================================

const getMe = async (req, res) => {

    try {

        const user = await User.findById(
            req.user.userId
        ).select("-password");


        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });
        }


        res.json({
            user
        });

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// FORGOT PASSWORD
// ==========================================

const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;


        if (!email) {

            return res.status(400).json({
                message: "Email is required"
            });
        }


        const user = await User.findOne({
            email
        });


        /*
        Don't reveal whether an email exists.
        */

        if (!user) {

            return res.json({
                message:
                    "If an account exists, a password reset link has been generated."
            });
        }


        const resetToken =
            crypto.randomBytes(32).toString("hex");


        const hashedToken =
            crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");


        user.resetPasswordToken =
            hashedToken;


        user.resetPasswordExpires =
            Date.now() + 15 * 60 * 1000;


        await user.save();


        const resetURL =
            `${process.env.CLIENT_URL}/pages/reset-password.html?token=${resetToken}`;


        console.log(
            "PASSWORD RESET URL:",
            resetURL
        );


        res.json({

            message:
                "If an account exists, a password reset link has been generated."

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// RESET PASSWORD
// ==========================================

const resetPassword = async (req, res) => {

    try {

        const { token, password } = req.body;


        if (!token || !password) {

            return res.status(400).json({
                message: "Token and password are required"
            });
        }


        if (password.length < 6) {

            return res.status(400).json({
                message:
                    "Password must contain at least 6 characters"
            });
        }


        const hashedToken =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        const user = await User.findOne({

            resetPasswordToken: hashedToken,

            resetPasswordExpires: {
                $gt: Date.now()
            }

        });


        if (!user) {

            return res.status(400).json({
                message:
                    "Invalid or expired reset token"
            });
        }


        user.password =
            await bcrypt.hash(password, 12);


        user.resetPasswordToken = null;

        user.resetPasswordExpires = null;


        /*
        This invalidates existing refresh tokens.
        */

        user.tokenVersion += 1;


        await user.save();


        res.json({
            message:
                "Password reset successful"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {

    register,
    login,
    refreshToken,
    logout,
    getMe,
    forgotPassword,
    resetPassword
};