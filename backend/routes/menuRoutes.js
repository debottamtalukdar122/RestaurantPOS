const express = require("express");

const {
    createMenuItem,
    getAllMenuItems,
    getMenuItemById,
    updateMenuItem,
    toggleMenuAvailability,
    deleteMenuItem
} = require("../controllers/menuController");

const authenticate =
    require("../middleware/authMiddleware");

const roleMiddleware =
    require("../middleware/roleMiddleware");

const router = express.Router();


// ==========================================
// GET ALL MENU ITEMS
// PUBLIC
// ==========================================

router.get(
    "/",
    getAllMenuItems
);


// ==========================================
// GET SINGLE MENU ITEM
// PUBLIC
// ==========================================

router.get(
    "/:id",
    getMenuItemById
);


// ==========================================
// CREATE MENU ITEM
// ADMIN ONLY
// ==========================================

router.post(
    "/",
    authenticate,
    roleMiddleware("admin"),
    createMenuItem
);


// ==========================================
// UPDATE MENU ITEM
// ADMIN ONLY
// ==========================================

router.put(
    "/:id",
    authenticate,
    roleMiddleware("admin"),
    updateMenuItem
);


// ==========================================
// ENABLE / DISABLE MENU ITEM
// ADMIN ONLY
// ==========================================

router.patch(
    "/:id/toggle",
    authenticate,
    roleMiddleware("admin"),
    toggleMenuAvailability
);


// ==========================================
// DELETE MENU ITEM
// ADMIN ONLY
// ==========================================

router.delete(
    "/:id",
    authenticate,
    roleMiddleware("admin"),
    deleteMenuItem
);


module.exports = router;