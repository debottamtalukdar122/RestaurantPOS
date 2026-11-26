const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
    {
        restaurantName: {
            type: String,
            required: true,
            default: "My Restaurant"
        },

        address: {
            type: String,
            default: ""
        },

        phone: {
            type: String,
            default: ""
        },

        email: {
            type: String,
            default: ""
        },

        gstNumber: {
            type: String,
            default: ""
        },

        gstMode: {
            type: String,
            enum: ["exclusive", "inclusive"],
            default: "exclusive"
        },

        currency: {
            type: String,
            default: "INR"
        },

        taxRate: {
            type: Number,
            default: 0,
            min: 0
        },

        serviceCharge: {
            type: Number,
            default: 0,
            min: 0
        },

        openingTime: {
            type: String,
            default: "10:00"
        },

        closingTime: {
            type: String,
            default: "22:00"
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.models.Settings ||
    mongoose.model("Settings", settingsSchema);