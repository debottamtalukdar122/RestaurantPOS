const Settings = require("../models/settings");


// ==========================================
// GET SETTINGS
// ADMIN / STAFF
// ==========================================

const getSettings = async (req, res) => {

    try {

        let settings = await Settings.findOne();


        // Create default settings
        // if none exists

        if (!settings) {

            settings = await Settings.create({
                restaurantName: "My Restaurant"
            });

        }


        res.status(200).json({
            settings
        });


    } catch (error) {

        console.error(
            "Get settings error:",
            error
        );


        res.status(500).json({
            message: "Server error"
        });

    }

};



// ==========================================
// UPDATE SETTINGS
// ADMIN ONLY
// ==========================================

const updateSettings = async (req, res) => {

    try {

        let settings =
            await Settings.findOne();


        // Create settings if
        // none exists

        if (!settings) {

            settings =
                await Settings.create({
                    restaurantName:
                        "My Restaurant"
                });

        }


        // ======================================
        // GET DATA FROM REQUEST
        // ======================================

        const {
            restaurantName,
            address,
            phone,
            email,
            gstNumber,
            gstMode,
            currency,
            taxRate,
            serviceCharge,
            openingTime,
            closingTime
        } = req.body;



        // ======================================
        // RESTAURANT INFORMATION
        // ======================================

        if (restaurantName !== undefined) {

            settings.restaurantName =
                restaurantName;

        }


        if (address !== undefined) {

            settings.address =
                address;

        }


        if (phone !== undefined) {

            settings.phone =
                phone;

        }


        if (email !== undefined) {

            settings.email =
                email;

        }



        // ======================================
        // GST INFORMATION
        // ======================================

        if (gstNumber !== undefined) {

            settings.gstNumber =
                gstNumber;

        }


        if (gstMode !== undefined) {

            if (
                ![
                    "exclusive",
                    "inclusive"
                ].includes(gstMode)
            ) {

                return res.status(400).json({
                    message:
                        "Invalid GST mode"
                });

            }


            settings.gstMode =
                gstMode;

        }



        // ======================================
        // BILLING
        // ======================================

        if (currency !== undefined) {

            settings.currency =
                currency;

        }


        if (taxRate !== undefined) {

            if (taxRate < 0) {

                return res.status(400).json({
                    message:
                        "Tax rate cannot be negative"
                });

            }


            settings.taxRate =
                taxRate;

        }


        if (serviceCharge !== undefined) {

            if (serviceCharge < 0) {

                return res.status(400).json({
                    message:
                        "Service charge cannot be negative"
                });

            }


            settings.serviceCharge =
                serviceCharge;

        }



        // ======================================
        // RESTAURANT TIMING
        // ======================================

        if (openingTime !== undefined) {

            settings.openingTime =
                openingTime;

        }


        if (closingTime !== undefined) {

            settings.closingTime =
                closingTime;

        }



        // ======================================
        // SAVE
        // ======================================

        await settings.save();



        // ======================================
        // RESPONSE
        // ======================================

        res.status(200).json({

            message:
                "Settings updated successfully",

            settings

        });


    } catch (error) {

        console.error(
            "Update settings error:",
            error
        );


        res.status(500).json({
            message: "Server error"
        });

    }

};



module.exports = {
    getSettings,
    updateSettings
};