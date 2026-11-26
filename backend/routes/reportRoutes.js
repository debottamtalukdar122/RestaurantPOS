const express = require("express");

const {
    getSalesReport
} = require("../controllers/reportController");

const authenticate =
    require("../middleware/authMiddleware");

const authorize =
    require("../middleware/roleMiddleware");

const router = express.Router();


// ==========================================
// SALES REPORT
// ADMIN / STAFF
// ==========================================

router.get(
    "/sales",
    authenticate,
    authorize("admin", "staff"),
    getSalesReport
);


module.exports = router;