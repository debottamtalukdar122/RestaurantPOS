const Order = require("../models/order");


// ==========================================
// SALES REPORT
// ==========================================

const getSalesReport = async (req, res) => {
    try {

        const orders = await Order.find({
            status: "completed",
            paymentStatus: "paid"
        }).sort({ createdAt: -1 });


        const totalOrders = orders.length;

        const totalSales = orders.reduce(
            (total, order) => total + order.totalAmount,
            0
        );


        res.status(200).json({
            totalOrders,
            totalSales,
            orders
        });


    } catch (error) {

        console.error(
            "Sales report error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    getSalesReport
};