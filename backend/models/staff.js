const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            default: "",
            trim: true
        },

        salary: {
            type: Number,
            default: 0,
            min: 0
        },

        // ==========================================
        // AUTHENTICATION ROLE
        // ==========================================
        // KEEP THIS AS "staff"
        // This is NOT the restaurant job position.

        role: {
            type: String,
            enum: ["staff"],
            default: "staff"
        },

        // ==========================================
        // RESTAURANT JOB ROLE
        // ==========================================

        staffRole: {
            type: String,
            enum: [
                "manager",
                "cashier",
                "chef",
                "waiter"
            ],
            required: true,
            default: "waiter"
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.models.Staff ||
    mongoose.model("Staff", staffSchema);