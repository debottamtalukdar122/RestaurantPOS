const Order = require("../models/order");
const Menu = require("../models/menu");
const Table = require("../models/table");


// ==================================================
// RECALCULATE TABLE OCCUPANCY
// ==================================================

async function recalculateTable(tableId) {

    const table =
        await Table.findById(tableId);


    if (!table) {
        return null;
    }


    // ==========================================
    // FIND ALL ACTIVE ORDERS
    // ==========================================

    const orders =
        await Order.find({

            table: tableId,

            status: {
                // $ne: "cancelled"
                $in: [
                    "pending",
                    
                    "preparing"
                    
                ]
            }

        }).select("seatsBooked");


    // ==========================================
    // ADD ALL BOOKED SEATS
    // ==========================================

    let occupiedSeats = 0;


    for (const order of orders) {

        occupiedSeats +=
            Number(
                order.seatsBooked || 0
            );

    }


    // ==========================================
    // CALCULATE AVAILABLE
    // ==========================================

    const capacity =
        Number(table.capacity);


    const availableSeats =
        Math.max(
            capacity - occupiedSeats,
            0
        );


    // ==========================================
    // AUTOMATIC STATUS
    // ==========================================

    let status = "available";


    if (occupiedSeats >= capacity) {

        status = "occupied";

    }

    else if (occupiedSeats > 0) {

        status = "partially_occupied";

    }


    // ==========================================
    // SAVE TABLE
    // ==========================================

    table.occupiedSeats =
        occupiedSeats;

    table.status =
        status;


    await table.save();


    return {
        table,
        occupiedSeats,
        availableSeats,
        status
    };

}



// ==================================================
// CREATE ORDER
// ==================================================

const createOrder = async (req, res) => {

    try {

        const {
            tableId,
            seats,
            items
        } = req.body;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            !tableId ||
            !seats ||
            !Array.isArray(items) ||
            items.length === 0
        ) {

            return res.status(400).json({

                message:
                    "Table, seats and items are required"

            });

        }


        const requestedSeats =
            Number(seats);


        if (
            !Number.isInteger(
                requestedSeats
            ) ||
            requestedSeats < 1
        ) {

            return res.status(400).json({

                message:
                    "Invalid number of seats"

            });

        }


        // ==========================================
        // FIND TABLE
        // ==========================================

        const table =
            await Table.findById(
                tableId
            );


        if (!table) {

            return res.status(404).json({

                message:
                    "Table not found"

            });

        }


        // ==========================================
        // RECALCULATE BEFORE ORDER
        // ==========================================

        const current =
            await recalculateTable(
                tableId
            );


        if (!current) {

            return res.status(404).json({

                message:
                    "Table not found"

            });

        }


        // ==========================================
        // CHECK RESERVED
        // ==========================================

        if (
            current.status === "reserved"
        ) {

            return res.status(400).json({

                message:
                    "This table is reserved"

            });

        }


        // ==========================================
        // CHECK AVAILABLE SEATS
        // ==========================================

        if (
            requestedSeats >
            current.availableSeats
        ) {

            return res.status(400).json({

                message:
                    `Only ${current.availableSeats} seat(s) are available`

            });

        }


        // ==========================================
        // PROCESS ITEMS
        // ==========================================

        const orderItems = [];

        let subtotal = 0;


        for (
            const item of items
        ) {

            const menuItem =
                await Menu.findById(
                    item.menuItemId
                );


            if (!menuItem) {

                return res.status(404).json({

                    message:
                        `Menu item not found: ${item.menuItemId}`

                });

            }


            if (
                !menuItem.isAvailable
            ) {

                return res.status(400).json({

                    message:
                        `${menuItem.name} is currently unavailable`

                });

            }


            const quantity =
                Number(
                    item.quantity
                );


            if (
                !Number.isInteger(
                    quantity
                ) ||
                quantity < 1
            ) {

                return res.status(400).json({

                    message:
                        "Quantity must be at least 1"

                });

            }


            const itemSubtotal =
                menuItem.price *
                quantity;


            orderItems.push({

                menuItem:
                    menuItem._id,

                name:
                    menuItem.name,

                image:
                    menuItem.image || "",

                quantity,

                price:
                    menuItem.price,

                subtotal:
                    itemSubtotal

            });


            subtotal +=
                itemSubtotal;

        }


        // ==========================================
        // TAX
        // ==========================================

        const tax =
            subtotal * 0.05;


        // ==========================================
        // SERVICE CHARGE
        // ==========================================

        const serviceCharge =
            subtotal * 0.05;


        // ==========================================
        // FINAL TOTAL
        // ==========================================

        const totalAmount =
            subtotal +
            tax +
            serviceCharge;


        // ==========================================
        // CREATE ORDER
        // ==========================================

        const order =
            await Order.create({

                table:
                    tableId,

                customer:
                    req.user
                        ? req.user.userId
                        : null,

                seatsBooked:
                    requestedSeats,

                items:
                    orderItems,

                subtotal,

                tax,

                serviceCharge,

                totalAmount

            });


        // ==========================================
        // RECALCULATE AFTER ORDER
        // ==========================================

        const updated =
            await recalculateTable(
                tableId
            );


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(201).json({

            message:
                "Order created successfully",

            order,

            table: {

                id:
                    tableId,

                capacity:
                    updated.table.capacity,

                occupiedSeats:
                    updated.occupiedSeats,

                availableSeats:
                    updated.availableSeats,

                status:
                    updated.status

            }

        });


    } catch (error) {

        console.error(
            "Create order error:",
            error
        );


        res.status(500).json({

            message:
                "Server error"

        });

    }

};



// ==================================================
// GET ALL ORDERS
// ==================================================

const getAllOrders = async (req, res) => {

    try {

        const orders =
            await Order.find()

                .populate(
                    "table",
                    "tableNumber tableName capacity occupiedSeats status"
                )

                .populate(
                    "customer",
                    "name email"
                )

                .sort({
                    createdAt: -1
                });


        res.status(200).json({

            orders

        });


    } catch (error) {

        console.error(
            "Get orders error:",
            error
        );


        res.status(500).json({

            message:
                "Server error"

        });

    }

};



// ==================================================
// GET SINGLE ORDER
// ==================================================

const getOrderById = async (req, res) => {

    try {

        const order =
            await Order.findById(
                req.params.id
            )

            .populate(
                "table",
                "tableNumber tableName capacity occupiedSeats status"
            )

            .populate(
                "customer",
                "name email"
            );


        if (!order) {

            return res.status(404).json({

                message:
                    "Order not found"

            });

        }


        res.status(200).json({

            order

        });


    } catch (error) {

        console.error(
            "Get order error:",
            error
        );


        res.status(500).json({

            message:
                "Server error"

        });

    }

};


// ==========================================
// UPDATE ORDER STATUS
// ADMIN / STAFF
// ==========================================

const updateOrderStatus = async (req, res) => {
    try {

        const { status } = req.body;


        const allowedStatuses = [
            "pending",
            "confirmed",
            "preparing",
            "ready",
            "served",
            "cancelled"
        ];


        // ------------------------------------------
        // CHECK VALID STATUS
        // ------------------------------------------

        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({
                message: "Invalid order status"
            });

        }


        // ------------------------------------------
        // FIND ORDER
        // ------------------------------------------

        const order =
            await Order.findById(req.params.id);


        if (!order) {

            return res.status(404).json({
                message: "Order not found"
            });

        }


        // ------------------------------------------
        // SERVED REQUIRES PAYMENT
        // ------------------------------------------

        if (
            status === "served" &&
            order.paymentStatus !== "paid"
        ) {

            return res.status(400).json({

                message:
                    "Order cannot be marked as served until payment is completed."

            });

        }


        // ------------------------------------------
        // UPDATE STATUS
        // ------------------------------------------

        order.status = status;

        await order.save();


        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------

        res.status(200).json({

            message:
                "Order status updated successfully",

            order

        });


    } catch (error) {

        console.error(
            "Update order status error:",
            error
        );


        res.status(500).json({

            message: "Server error"

        });

    }
};



// ==================================================
// UPDATE PAYMENT
// ==================================================

const updatePaymentStatus = async (
    req,
    res
) => {

    try {

        const {
            paymentStatus
        } = req.body;


        if (
            ![
                "pending",
                "paid"
            ].includes(
                paymentStatus
            )
        ) {

            return res.status(400).json({

                message:
                    "Invalid payment status"

            });

        }


        const order =
            await Order.findById(
                req.params.id
            );


        if (!order) {

            return res.status(404).json({

                message:
                    "Order not found"

            });

        }


        order.paymentStatus =
            paymentStatus;


        await order.save();


        res.status(200).json({

            message:
                "Payment status updated successfully",

            order

        });


    } catch (error) {

        console.error(
            "Update payment status error:",
            error
        );


        res.status(500).json({

            message:
                "Server error"

        });

    }

};



// ==================================================
// DELETE ORDER
// ==================================================

const deleteOrder = async (
    req,
    res
) => {

    try {

        const order =
            await Order.findById(
                req.params.id
            );


        if (!order) {

            return res.status(404).json({

                message:
                    "Order not found"

            });

        }


        const tableId =
            order.table;


        await Order.findByIdAndDelete(
            req.params.id
        );


        // ==========================================
        // RECALCULATE
        // ==========================================

        await recalculateTable(
            tableId
        );


        res.status(200).json({

            message:
                "Order deleted successfully"

        });


    } catch (error) {

        console.error(
            "Delete order error:",
            error
        );


        res.status(500).json({

            message:
                "Server error"

        });

    }

};



module.exports = {

    createOrder,

    getAllOrders,

    getOrderById,

    updateOrderStatus,

    updatePaymentStatus,

    deleteOrder

};