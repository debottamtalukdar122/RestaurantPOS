const express = require("express");

const {
    getSettings,
    updateSettings
} = require("../controllers/settingsController");

const authenticate =
    require("../middleware/authMiddleware");

const authorize =
    require("../middleware/roleMiddleware");

const router = express.Router();


// ==========================================
// GET SETTINGS
// ADMIN + STAFF
// ==========================================

router.get(
    "/",
    authenticate,
    authorize("admin", "staff"),
    getSettings
);


// ==========================================
// UPDATE SETTINGS
// ADMIN ONLY
// ==========================================

router.put(
    "/",
    authenticate,
    authorize("admin"),
    updateSettings
);


module.exports = router;