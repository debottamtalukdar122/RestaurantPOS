const Table = require("../models/table");
const Order = require("../models/order");
const QRCode = require("qrcode");


// ==================================================
// CALCULATE TABLE OCCUPANCY
// ==================================================

async function calculateTableOccupancy(table) {

    /*
     * ONLY ACTIVE ORDERS OCCUPY SEATS.
     *
     * pending     -> occupies seats
     * preparing   -> occupies seats
     *
     * completed   -> DOES NOT occupy seats
     * cancelled   -> DOES NOT occupy seats
     */

    const orders =
        await Order.find({

            table:
                table._id,

            status: {
                $in: [
                    "pending",
                    "preparing"
                ]
            }

        }).select(
            "seatsBooked"
        );


    let occupiedSeats =
        0;


    for (
        const order of orders
    ) {

        occupiedSeats +=
            Number(
                order.seatsBooked || 0
            );

    }


    const capacity =
        Number(
            table.capacity || 0
        );


    const availableSeats =
        Math.max(
            capacity -
            occupiedSeats,
            0
        );


    let status;


    // ==========================================
    // ACTIVE ORDERS EXIST
    // ==========================================

    if (
        occupiedSeats >=
        capacity
    ) {

        status =
            "occupied";

    }

    else if (
        occupiedSeats > 0
    ) {

        status =
            "partially_occupied";

    }


    // ==========================================
    // NO ACTIVE ORDERS
    // ==========================================

    else {

        /*
         * If the admin manually reserved the table,
         * keep it reserved.
         */

        if (
            table.status ===
            "reserved"
        ) {

            status =
                "reserved";

        }

        else {

            status =
                "available";

        }

    }


    return {

        occupiedSeats,

        availableSeats,

        status

    };

}



// ==================================================
// CREATE TABLE
// ==================================================

const createTable = async (
    req,
    res
) => {

    try {

        const {
            tableNumber,
            tableName,
            capacity
        } = req.body;


        if (
            tableNumber === undefined ||
            !tableName ||
            capacity === undefined
        ) {

            return res.status(400).json({

                message:
                    "Table number, table name and capacity are required"

            });

        }


        const existingTable =
            await Table.findOne({

                tableNumber

            });


        if (existingTable) {

            return res.status(409).json({

                message:
                    "Table number already exists"

            });

        }


        const table =
            await Table.create({

                tableNumber,

                tableName,

                capacity,

                occupiedSeats:
                    0,

                status:
                    "available"

            });


        res.status(201).json({

            message:
                "Table created successfully",

            table

        });


    }

    catch (error) {

        console.error(
            "Create table error:",
            error
        );


        res.status(500).json({

            message:
                "Server error"

        });

    }

};



// ==================================================
// GET ALL TABLES
// ==================================================

const getAllTables = async (
    req,
    res
) => {

    try {

        const tables =
            await Table.find()
                .sort({

                    tableNumber:
                        1

                });


        const result =
            await Promise.all(

                tables.map(
                    async table => {

                        const occupancy =
                            await calculateTableOccupancy(
                                table
                            );


                        table.occupiedSeats =
                            occupancy.occupiedSeats;


                        table.status =
                            occupancy.status;


                        await table.save();


                        return {

                            _id:
                                table._id,

                            tableNumber:
                                table.tableNumber,

                            tableName:
                                table.tableName,

                            capacity:
                                table.capacity,

                            occupiedSeats:
                                occupancy.occupiedSeats,

                            availableSeats:
                                occupancy.availableSeats,

                            status:
                                occupancy.status,

                            qrCode:
                                table.qrCode

                        };

                    }

                )

            );


        res.status(200).json({

            tables:
                result

        });


    }

    catch (error) {

        console.error(
            "Get tables error:",
            error
        );


        res.status(500).json({

            message:
                "Server error"

        });

    }

};



// ==================================================
// GET SINGLE TABLE
// ==================================================

const getTableById = async (
    req,
    res
) => {

    try {

        const table =
            await Table.findById(
                req.params.id
            );


        if (!table) {

            return res.status(404).json({

                message:
                    "Table not found"

            });

        }


        const occupancy =
            await calculateTableOccupancy(
                table
            );


        table.occupiedSeats =
            occupancy.occupiedSeats;


        table.status =
            occupancy.status;


        await table.save();


        res.status(200).json({

            table: {

                _id:
                    table._id,

                tableNumber:
                    table.tableNumber,

                tableName:
                    table.tableName,

                capacity:
                    table.capacity,

                occupiedSeats:
                    occupancy.occupiedSeats,

                availableSeats:
                    occupancy.availableSeats,

                status:
                    occupancy.status,

                qrCode:
                    table.qrCode

            }

        });


    }

    catch (error) {

        console.error(
            "Get table error:",
            error
        );


        res.status(500).json({

            message:
                "Server error"

        });

    }

};



// ==================================================
// UPDATE TABLE
// ==================================================

const updateTable = async (
    req,
    res
) => {

    try {

        const {
            tableNumber,
            tableName,
            capacity
        } = req.body;


        const table =
            await Table.findById(
                req.params.id
            );


        if (!table) {

            return res.status(404).json({

                message:
                    "Table not found"

            });

        }


        // ==========================================
        // UPDATE TABLE NUMBER
        // ==========================================

        if (
            tableNumber !== undefined
        ) {

            const duplicate =
                await Table.findOne({

                    tableNumber,

                    _id: {
                        $ne:
                            req.params.id
                    }

                });


            if (duplicate) {

                return res.status(409).json({

                    message:
                        "Table number already exists"

                });

            }


            table.tableNumber =
                tableNumber;

        }


        // ==========================================
        // UPDATE TABLE NAME
        // ==========================================

        if (
            tableName !== undefined
        ) {

            table.tableName =
                tableName;

        }


        // ==========================================
        // UPDATE CAPACITY
        // ==========================================

        if (
            capacity !== undefined
        ) {

            const occupancy =
                await calculateTableOccupancy(
                    table
                );


            if (
                Number(capacity) <
                occupancy.occupiedSeats
            ) {

                return res.status(400).json({

                    message:
                        "Capacity cannot be less than occupied seats"

                });

            }


            table.capacity =
                Number(
                    capacity
                );

        }


        // ==========================================
        // RECALCULATE OCCUPANCY
        // ==========================================

        const occupancy =
            await calculateTableOccupancy(
                table
            );


        table.occupiedSeats =
            occupancy.occupiedSeats;


        table.status =
            occupancy.status;


        await table.save();


        res.status(200).json({

            message:
                "Table updated successfully",

            table

        });


    }

    catch (error) {

        console.error(
            "Update table error:",
            error
        );


        res.status(500).json({

            message:
                "Server error"

        });

    }

};



// ==================================================
// UPDATE TABLE STATUS
// ==================================================

const updateTableStatus = async (
    req,
    res
) => {

    try {

        const {
            status
        } = req.body;


        const table =
            await Table.findById(
                req.params.id
            );


        if (!table) {

            return res.status(404).json({

                message:
                    "Table not found"

            });

        }


        // ==========================================
        // RESERVED
        // ==========================================

        if (
            status ===
            "reserved"
        ) {

            const occupancy =
                await calculateTableOccupancy(
                    table
                );


            if (
                occupancy.occupiedSeats >
                0
            ) {

                return res.status(400).json({

                    message:
                        "Cannot reserve a table with occupied seats"

                });

            }


            table.status =
                "reserved";


            table.occupiedSeats =
                0;


            await table.save();


            return res.status(200).json({

                message:
                    "Table reserved successfully",

                table

            });

        }


        // ==========================================
        // AVAILABLE
        // ==========================================

        if (
            status ===
            "available"
        ) {

            const occupancy =
                await calculateTableOccupancy(
                    table
                );


            if (
                occupancy.occupiedSeats >
                0
            ) {

                return res.status(400).json({

                    message:
                        `${occupancy.occupiedSeats} seat(s) are still occupied`

                });

            }


            table.status =
                "available";


            table.occupiedSeats =
                0;


            await table.save();


            return res.status(200).json({

                message:
                    "Table is available",

                table

            });

        }


        // ==========================================
        // OCCUPIED / PARTIALLY OCCUPIED
        // ==========================================

        return res.status(400).json({

            message:
                "Occupied status is calculated automatically from active orders"

        });

    }

    catch (error) {

        console.error(
            "Update table status error:",
            error
        );


        res.status(500).json({

            message:
                "Server error"

        });

    }

};



// ==================================================
// GENERATE QR
// ==================================================

const generateTableQR = async (
    req,
    res
) => {

    try {

        const table =
            await Table.findById(
                req.params.id
            );


        if (!table) {

            return res.status(404).json({

                message:
                    "Table not found"

            });

        }


        const frontendURL =
            process.env.CLIENT_URL ||
            "http://localhost:3000";


        const tableURL =
            `${frontendURL}/menu?table=${table._id}`;


        const qrCode =
            await QRCode.toDataURL(
                tableURL
            );


        table.qrCode =
            qrCode;


        await table.save();


        res.status(200).json({

            message:
                "QR code generated successfully",

            qrCode,

            tableURL

        });

    }

    catch (error) {

        console.error(
            "Generate table QR error:",
            error
        );


        res.status(500).json({

            message:
                "Server error"

        });

    }

};



// ==================================================
// DELETE TABLE
// ==================================================

const deleteTable = async (
    req,
    res
) => {

    try {

        const table =
            await Table.findById(
                req.params.id
            );


        if (!table) {

            return res.status(404).json({

                message:
                    "Table not found"

            });

        }


        const occupancy =
            await calculateTableOccupancy(
                table
            );


        if (
            occupancy.occupiedSeats >
            0
        ) {

            return res.status(400).json({

                message:
                    "Cannot delete table while seats are occupied"

            });

        }


        await Table.findByIdAndDelete(
            req.params.id
        );


        res.status(200).json({

            message:
                "Table deleted successfully"

        });

    }

    catch (error) {

        console.error(
            "Delete table error:",
            error
        );


        res.status(500).json({

            message:
                "Server error"

        });

    }

};



// ==================================================
// EXPORTS
// ==================================================

module.exports = {

    createTable,

    getAllTables,

    getTableById,

    updateTable,

    updateTableStatus,

    generateTableQR,

    deleteTable

};