const express = require("express");

const {
    register,
    login,
    refreshToken,
    logout,
    getMe,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");

const authenticate =
    require("../middleware/authMiddleware");


const router = express.Router();


// Public routes

router.post("/register", register);

router.post("/login", login);

router.post(
    "/refresh",
    refreshToken
);

router.post(
    "/forgot-password",
    forgotPassword
);

router.post(
    "/reset-password",
    resetPassword
);


// Protected routes

router.post(
    "/logout",
    authenticate,
    logout
);

router.get(
    "/me",
    authenticate,
    getMe
);


module.exports = router;