const Menu = require("../models/menu");


// ==========================================
// CREATE MENU ITEM
// ADMIN ONLY
// ==========================================

const createMenuItem = async (req, res) => {
    try {

        const {
            name,
            category,
            description,
            price,
            image
        } = req.body;


        if (!name || !category || price === undefined) {
            return res.status(400).json({
                message: "Name, category and price are required"
            });
        }


        if (price < 0) {
            return res.status(400).json({
                message: "Price cannot be negative"
            });
        }


        const menuItem = await Menu.create({
            name,
            category,
            description,
            price,
            image
        });


        res.status(201).json({
            message: "Menu item created successfully",

            menuItem
        });

    } catch (error) {

        console.error(
            "Create menu item error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// GET ALL MENU ITEMS
// PUBLIC / CUSTOMER / STAFF / ADMIN
// ==========================================

const getAllMenuItems = async (req, res) => {
    try {

        const menuItems = await Menu.find()
            .sort({ createdAt: -1 });


        res.status(200).json({
            menuItems
        });

    } catch (error) {

        console.error(
            "Get menu items error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// GET SINGLE MENU ITEM
// ==========================================

const getMenuItemById = async (req, res) => {
    try {

        const menuItem =
            await Menu.findById(req.params.id);


        if (!menuItem) {
            return res.status(404).json({
                message: "Menu item not found"
            });
        }


        res.status(200).json({
            menuItem
        });

    } catch (error) {

        console.error(
            "Get menu item error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// UPDATE MENU ITEM
// ADMIN ONLY
// ==========================================

const updateMenuItem = async (req, res) => {
    try {

        const {
            name,
            category,
            description,
            price,
            image
        } = req.body;


        const menuItem =
            await Menu.findById(req.params.id);


        if (!menuItem) {
            return res.status(404).json({
                message: "Menu item not found"
            });
        }


        if (name !== undefined) {
            menuItem.name = name;
        }


        if (category !== undefined) {
            menuItem.category = category;
        }


        if (description !== undefined) {
            menuItem.description = description;
        }


        if (price !== undefined) {

            if (price < 0) {
                return res.status(400).json({
                    message: "Price cannot be negative"
                });
            }

            menuItem.price = price;
        }


        if (image !== undefined) {
            menuItem.image = image;
        }


        await menuItem.save();


        res.status(200).json({

            message:
                "Menu item updated successfully",

            menuItem

        });

    } catch (error) {

        console.error(
            "Update menu item error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// ENABLE / DISABLE MENU ITEM
// ADMIN ONLY
// ==========================================

const toggleMenuAvailability = async (req, res) => {
    try {

        const menuItem =
            await Menu.findById(req.params.id);


        if (!menuItem) {
            return res.status(404).json({
                message: "Menu item not found"
            });
        }


        menuItem.isAvailable =
            !menuItem.isAvailable;


        await menuItem.save();


        res.status(200).json({

            message:
                menuItem.isAvailable
                    ? "Menu item enabled successfully"
                    : "Menu item disabled successfully",

            isAvailable:
                menuItem.isAvailable

        });

    } catch (error) {

        console.error(
            "Toggle menu availability error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// DELETE MENU ITEM
// ADMIN ONLY
// ==========================================

const deleteMenuItem = async (req, res) => {
    try {

        const menuItem =
            await Menu.findById(req.params.id);


        if (!menuItem) {
            return res.status(404).json({
                message: "Menu item not found"
            });
        }


        await Menu.findByIdAndDelete(
            req.params.id
        );


        res.status(200).json({
            message: "Menu item deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete menu item error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createMenuItem,
    getAllMenuItems,
    getMenuItemById,
    updateMenuItem,
    toggleMenuAvailability,
    deleteMenuItem
};