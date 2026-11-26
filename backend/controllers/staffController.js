const bcrypt = require("bcrypt");

const Staff = require("../models/staff");
const User = require("../models/User");


// ==================================================
// VALID STAFF ROLES
// ==================================================

const VALID_STAFF_ROLES = [
    "manager",
    "cashier",
    "chef",
    "waiter"
];


// ==================================================
// NORMALIZE STAFF ROLE
// ==================================================

function normalizeStaffRole(role) {

    if (!role) {
        return null;
    }

    return String(role)
        .trim()
        .toLowerCase();

}


// ==================================================
// CREATE STAFF
// ==================================================

const createStaff = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            phone,
            salary,
            staffRole
        } = req.body;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            !name ||
            !email ||
            !password ||
            !phone ||
            salary === undefined ||
            !staffRole
        ) {

            return res.status(400).json({
                message:
                    "Name, email, password, phone, salary and staff role are required"
            });

        }


        // ==========================================
        // NORMALIZE ROLE
        // ==========================================

        const normalizedStaffRole =
            normalizeStaffRole(staffRole);


        if (
            !VALID_STAFF_ROLES.includes(
                normalizedStaffRole
            )
        ) {

            return res.status(400).json({
                message:
                    "Invalid staff role"
            });

        }


        // ==========================================
        // CHECK USER
        // ==========================================

        const existingUser =
            await User.findOne({
                email
            });


        if (existingUser) {

            return res.status(409).json({
                message:
                    "An account with this email already exists"
            });

        }


        // ==========================================
        // CHECK STAFF
        // ==========================================

        const existingStaff =
            await Staff.findOne({
                email
            });


        if (existingStaff) {

            return res.status(409).json({
                message:
                    "Staff already exists"
            });

        }


        // ==========================================
        // SALARY
        // ==========================================

        const staffSalary =
            Number(salary);


        if (
            Number.isNaN(staffSalary) ||
            staffSalary < 0
        ) {

            return res.status(400).json({
                message:
                    "Invalid salary"
            });

        }


        // ==========================================
        // HASH PASSWORD
        // ==========================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                12
            );


        // ==========================================
        // CREATE USER ACCOUNT
        // ==========================================
        //
        // IMPORTANT:
        // This MUST remain "staff".
        //
        // Authentication depends on this.
        //

        const user =
            await User.create({

                name,

                email,

                password:
                    hashedPassword,

                role:
                    "staff",

                isActive:
                    true

            });


        // ==========================================
        // CREATE STAFF PROFILE
        // ==========================================

        let staff;

        try {

            staff =
                await Staff.create({

                    name,

                    email,

                    password:
                        hashedPassword,

                    phone,

                    salary:
                        staffSalary,

                    // Authentication role
                    role:
                        "staff",

                    // Restaurant job role
                    staffRole:
                        normalizedStaffRole,

                    isActive:
                        true

                });

        } catch (staffError) {

            // If Staff creation fails,
            // remove the User we just created.

            await User.findByIdAndDelete(
                user._id
            );

            throw staffError;

        }


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(201).json({

            message:
                "Staff created successfully",

            staff: {

                id:
                    staff._id,

                name:
                    staff.name,

                email:
                    staff.email,

                phone:
                    staff.phone,

                salary:
                    staff.salary,

                role:
                    staff.role,

                staffRole:
                    staff.staffRole,

                isActive:
                    staff.isActive

            }

        });


    } catch (error) {

        console.error(
            "Create staff error:",
            error
        );


        res.status(500).json({
            message:
                "Server error"
        });

    }

};


// ==================================================
// GET ALL STAFF
// ==================================================

const getAllStaff = async (req, res) => {

    try {

        const staff =
            await Staff.find()
                .select("-password")
                .sort({
                    createdAt: -1
                });


        res.status(200).json({
            staff
        });


    } catch (error) {

        console.error(
            "Get staff error:",
            error
        );


        res.status(500).json({
            message:
                "Server error"
        });

    }

};


// ==================================================
// GET SINGLE STAFF
// ==================================================

const getStaffById = async (req, res) => {

    try {

        const staff =
            await Staff.findById(
                req.params.id
            )
            .select("-password");


        if (!staff) {

            return res.status(404).json({
                message:
                    "Staff not found"
            });

        }


        res.status(200).json({
            staff
        });


    } catch (error) {

        console.error(
            "Get staff by ID error:",
            error
        );


        res.status(500).json({
            message:
                "Server error"
        });

    }

};


// ==================================================
// UPDATE STAFF
// ==================================================

const updateStaff = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            salary,
            staffRole
        } = req.body;


        const staff =
            await Staff.findById(
                req.params.id
            );


        if (!staff) {

            return res.status(404).json({
                message:
                    "Staff not found"
            });

        }


        // ==========================================
        // FIND USER ACCOUNT
        // ==========================================

        const user =
            await User.findOne({
                email: staff.email,
                role: "staff"
            });


        // ==========================================
        // NAME
        // ==========================================

        if (name !== undefined) {

            staff.name =
                name;


            if (user) {

                user.name =
                    name;

            }

        }


        // ==========================================
        // EMAIL
        // ==========================================

        if (email !== undefined) {

            const duplicateStaff =
                await Staff.findOne({

                    email,

                    _id: {
                        $ne:
                            req.params.id
                    }

                });


            if (duplicateStaff) {

                return res.status(409).json({
                    message:
                        "Email already exists"
                });

            }


            const duplicateUser =
                await User.findOne({

                    email,

                    _id: {
                        $ne:
                            user?._id
                    }

                });


            if (duplicateUser) {

                return res.status(409).json({
                    message:
                        "Email already exists"
                });

            }


            staff.email =
                email;


            if (user) {

                user.email =
                    email;

            }

        }


        // ==========================================
        // PHONE
        // ==========================================

        if (phone !== undefined) {

            staff.phone =
                phone;

        }


        // ==========================================
        // SALARY
        // ==========================================

        if (salary !== undefined) {

            const newSalary =
                Number(salary);


            if (
                Number.isNaN(newSalary) ||
                newSalary < 0
            ) {

                return res.status(400).json({
                    message:
                        "Invalid salary"
                });

            }


            staff.salary =
                newSalary;

        }


        // ==========================================
        // RESTAURANT STAFF ROLE
        // ==========================================

        if (staffRole !== undefined) {

            const normalizedStaffRole =
                normalizeStaffRole(
                    staffRole
                );


            if (
                !VALID_STAFF_ROLES.includes(
                    normalizedStaffRole
                )
            ) {

                return res.status(400).json({
                    message:
                        "Invalid staff role"
                });

            }


            staff.staffRole =
                normalizedStaffRole;

        }


        // ==========================================
        // SAVE
        // ==========================================

        await staff.save();


        if (user) {

            await user.save();

        }


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(200).json({

            message:
                "Staff updated successfully",

            staff: {

                id:
                    staff._id,

                name:
                    staff.name,

                email:
                    staff.email,

                phone:
                    staff.phone,

                salary:
                    staff.salary,

                role:
                    staff.role,

                staffRole:
                    staff.staffRole,

                isActive:
                    staff.isActive

            }

        });


    } catch (error) {

        console.error(
            "Update staff error:",
            error
        );


        res.status(500).json({
            message:
                "Server error"
        });

    }

};


// ==================================================
// ENABLE / DISABLE STAFF
// ==================================================

const toggleStaffStatus = async (
    req,
    res
) => {

    try {

        const staff =
            await Staff.findById(
                req.params.id
            );


        if (!staff) {

            return res.status(404).json({
                message:
                    "Staff not found"
            });

        }


        // ==========================================
        // TOGGLE STAFF
        // ==========================================

        staff.isActive =
            !staff.isActive;


        await staff.save();


        // ==========================================
        // ALSO TOGGLE USER ACCOUNT
        // ==========================================

        const user =
            await User.findOne({
                email: staff.email,
                role: "staff"
            });


        if (user) {

            user.isActive =
                staff.isActive;


            await user.save();

        }


        res.status(200).json({

            message:
                staff.isActive
                    ? "Staff enabled successfully"
                    : "Staff disabled successfully",

            isActive:
                staff.isActive

        });


    } catch (error) {

        console.error(
            "Toggle staff error:",
            error
        );


        res.status(500).json({
            message:
                "Server error"
        });

    }

};


// ==================================================
// DELETE STAFF
// ==================================================

const deleteStaff = async (
    req,
    res
) => {

    try {

        const staff =
            await Staff.findById(
                req.params.id
            );


        if (!staff) {

            return res.status(404).json({
                message:
                    "Staff not found"
            });

        }


        // ==========================================
        // DELETE USER ACCOUNT
        // ==========================================

        await User.findOneAndDelete({

            email:
                staff.email,

            role:
                "staff"

        });


        // ==========================================
        // DELETE STAFF PROFILE
        // ==========================================

        await Staff.findByIdAndDelete(
            req.params.id
        );


        res.status(200).json({

            message:
                "Staff deleted successfully"

        });


    } catch (error) {

        console.error(
            "Delete staff error:",
            error
        );


        res.status(500).json({
            message:
                "Server error"
        });

    }

};


// ==================================================
// EXPORT
// ==================================================

module.exports = {

    createStaff,

    getAllStaff,

    getStaffById,

    updateStaff,

    toggleStaffStatus,

    deleteStaff

};