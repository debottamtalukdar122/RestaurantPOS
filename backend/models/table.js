const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
    {
        // ==========================================
        // TABLE NUMBER
        // ==========================================

        tableNumber: {
            type: Number,
            required: true,
            unique: true
        },


        // ==========================================
        // TABLE NAME
        // ==========================================

        tableName: {
            type: String,
            required: true,
            trim: true
        },


        // ==========================================
        // CAPACITY
        // ==========================================

        capacity: {
            type: Number,
            required: true,
            min: 1
        },


        // ==========================================
        // OCCUPIED SEATS
        // ==========================================

        occupiedSeats: {
            type: Number,
            default: 0,
            min: 0
        },


        // ==========================================
        // STATUS
        // ==========================================

        status: {
            type: String,

            enum: [
                "available",
                "partially_occupied",
                "occupied",
                "reserved"
            ],

            default: "available"
        },


        // ==========================================
        // QR
        // ==========================================

        qrCode: {
            type: String,
            default: ""
        }
    },

    {
        timestamps: true
    }
);


module.exports =
    mongoose.models.Table ||
    mongoose.model("Table", tableSchema);