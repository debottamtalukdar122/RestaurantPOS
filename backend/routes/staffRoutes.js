const express = require("express");

const {
    createStaff,
    getAllStaff,
    getStaffById,
    updateStaff,
    toggleStaffStatus,
    deleteStaff
} = require("../controllers/staffController");

const authenticate =
    require("../middleware/authMiddleware");

const roleMiddleware =
    require("../middleware/roleMiddleware");


const router = express.Router();


// ==========================================
// STAFF MANAGEMENT
// ADMIN ONLY
// ==========================================

// Create staff
router.post(
    "/",
    authenticate,
    roleMiddleware("admin"),
    createStaff
);


// Get all staff
router.get(
    "/",
    authenticate,
    roleMiddleware("admin"),
    getAllStaff
);


// Get one staff
router.get(
    "/:id",
    authenticate,
    roleMiddleware("admin"),
    getStaffById
);


// Update staff
router.put(
    "/:id",
    authenticate,
    roleMiddleware("admin"),
    updateStaff
);


// Enable / Disable staff
router.patch(
    "/:id/toggle",
    authenticate,
    roleMiddleware("admin"),
    toggleStaffStatus
);


// Delete staff
router.delete(
    "/:id",
    authenticate,
    roleMiddleware("admin"),
    deleteStaff
);


module.exports = router;