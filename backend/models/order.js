const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        // ==========================================
        // TABLE
        // ==========================================

        table: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Table",
            required: true
        },


        // ==========================================
        // CUSTOMER
        // ==========================================

        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },


        // ==========================================
        // SEATS BOOKED
        // ==========================================

        seatsBooked: {
            type: Number,
            required: true,
            min: 1
        },


        // ==========================================
        // ITEMS
        // ==========================================

        items: [
            {
                menuItem: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Menu",
                    required: true
                },

                name: {
                    type: String,
                    required: true
                },

                image: {
                    type: String,
                    default: ""
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0
                },

                subtotal: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],


        // ==========================================
        // PRICE
        // ==========================================

        subtotal: {
            type: Number,
            required: true,
            min: 0
        },

        tax: {
            type: Number,
            required: true,
            min: 0
        },

        serviceCharge: {
            type: Number,
            required: true,
            min: 0
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },


        // ==========================================
        // ORDER STATUS
        // ==========================================

        status: {
            type: String,

            enum: [
                "pending",
                "confirmed",
                "preparing",
                "ready",
                "served",
                "cancelled"
            ],

            default: "pending"
        },


        // ==========================================
        // PAYMENT
        // ==========================================

        paymentStatus: {
            type: String,

            enum: [
                "pending",
                "paid"
            ],

            default: "pending"
        }
    },

    {
        timestamps: true
    }
);


module.exports =
    mongoose.models.Order ||
    mongoose.model("Order", orderSchema);