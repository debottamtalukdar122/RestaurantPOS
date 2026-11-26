const express = require("express");

const authenticate =
    require("../middleware/authMiddleware");

const User =
    require("../models/user");

const router = express.Router();


// ==========================================
// GET CURRENT USER
// ==========================================

router.get("/me", authenticate, async (req, res) => {

    try {

        const user = await User.findById(
            req.user.userId
        ).select("-password");


        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        res.status(200).json({
            user
        });

    } catch (error) {

        console.error(
            "Get user error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
});


module.exports = router;