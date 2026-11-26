const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);



require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User =
    require("../models/User");


const createAdmin = async () => {

    try {

        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log(
            "Connected to MongoDB Atlas"
        );


        const existingAdmin =
            await User.findOne({
                role: "admin"
            });


        if (existingAdmin) {

            console.log(
                "Admin already exists"
            );

            process.exit(0);
        }


        const password =
            await bcrypt.hash(
                "Admin@123",
                12
            );


        const admin =
            await User.create({

                name: "Restaurant Admin",

                email: "admin@restaurant.com",

                password,

                role: "admin"

            });


        console.log(
            "Admin created successfully"
        );


        console.log(
            "Email:",
            admin.email
        );

        console.log(
            "Password: Admin@123"
        );


        process.exit(0);

    } catch (error) {

        console.error(error);

        process.exit(1);
    }
};


createAdmin();