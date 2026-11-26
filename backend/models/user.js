const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },

    email:{
        type: String,
        required:true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password:{
        type: String,
        required: true
    },

    role:{
        type: String,
        enum: ["admin", "staff", "customer"],
        default: "customer"
    },

    isActive:{
        type: Boolean,
        default: true
    },

    tokenVersion: {
        type: Number,
        default: 0
    },

    resetPasswordToken: {
        type: String,
        default: null
    },

    resetPasswordExpires: {
        type: Date,
        default: null
    },

}, 
{
    timestamps: true
}

);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);