const express = require("express");

const {

    createTable,

    getAllTables,

    getTableById,

    updateTable,

    updateTableStatus,

    generateTableQR,

    deleteTable

} = require("../controllers/tableController");


const authenticate =
    require("../middleware/authMiddleware");


const authorize =
    require("../middleware/roleMiddleware");


const router =
    express.Router();


// ==========================================
// GET ALL TABLES
// PUBLIC
// ==========================================

router.get(
    "/",
    getAllTables
);


// ==========================================
// GET SINGLE TABLE
// PUBLIC
// ==========================================

router.get(
    "/:id",
    getTableById
);


// ==========================================
// CREATE TABLE
// ADMIN ONLY
// ==========================================

router.post(
    "/",
    authenticate,
    authorize("admin"),
    createTable
);


// ==========================================
// UPDATE TABLE
// ADMIN ONLY
// ==========================================

router.put(
    "/:id",
    authenticate,
    authorize("admin"),
    updateTable
);


// ==========================================
// UPDATE TABLE STATUS
// ADMIN / STAFF
// ==========================================

router.patch(
    "/:id/status",
    authenticate,
    authorize("admin", "staff"),
    updateTableStatus
);


// ==========================================
// GENERATE QR
// ADMIN ONLY
// ==========================================

router.post(
    "/:id/qr",
    authenticate,
    authorize("admin"),
    generateTableQR
);


// ==========================================
// DELETE TABLE
// ADMIN ONLY
// ==========================================

router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    deleteTable
);


module.exports = router;