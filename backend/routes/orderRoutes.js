const express = require("express");

const {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder
} = require("../controllers/orderController");

const authenticate =
    require("../middleware/authMiddleware");

const authorize =
    require("../middleware/roleMiddleware");

const router = express.Router();


// ==========================================
// CREATE ORDER
// CUSTOMER / STAFF / ADMIN
// ==========================================

router.post(
    "/",
    authenticate,
    authorize("customer", "staff", "admin"),
    createOrder
);


// ==========================================
// GET ALL ORDERS
// STAFF / ADMIN
// ==========================================

router.get(
    "/",
    authenticate,
    authorize("staff", "admin"),
    getAllOrders
);


// ==========================================
// GET SINGLE ORDER
// CUSTOMER / STAFF / ADMIN
// ==========================================

router.get(
    "/:id",
    authenticate,
    authorize("customer", "staff", "admin"),
    getOrderById
);


// ==========================================
// UPDATE ORDER STATUS
// STAFF / ADMIN
// ==========================================

router.put(
    "/:id/status",
    authenticate,
    authorize("staff", "admin"),
    updateOrderStatus
);


// ==========================================
// UPDATE PAYMENT STATUS
// STAFF / ADMIN
// ==========================================

router.put(
    "/:id/payment",
    authenticate,
    authorize("staff", "admin"),
    updatePaymentStatus
);


// ==========================================
// DELETE ORDER
// ADMIN ONLY
// ==========================================

router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    deleteOrder
);


module.exports = router;