const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const staffRoutes = require("./routes/staffRoutes");
const menuRoutes = require("./routes/menuRoutes");
const tableRoutes = require("./routes/tableRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reportRoutes = require("./routes/reportRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

require("dotenv").config();

const connectDB =
    require("./config/db");

const authRoutes =
    require("./routes/authRoutes");


const app = express();


// ==========================================
// DATABASE
// ==========================================

connectDB();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true
    })
);


app.use(express.json());


app.use(
    express.urlencoded({
        extended: true
    })
);


app.use(cookieParser());




// ==========================================
// API ROUTES
// ==========================================

app.get("/api", (req, res) => {

    res.json({
        message:
            "Restaurant POS API is running"
    });

});


app.use(
    "/api/auth",
    authRoutes
);

app.use("/api/users", userRoutes);

app.use("/api/staff", staffRoutes);

app.use("/api/menu", menuRoutes);

app.use("/api/tables", tableRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/reports", reportRoutes);

app.use( "/api/settings",settingsRoutes);

// ==========================================
// FRONTEND
// ==========================================

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);


// ==========================================
// SERVER
// ==========================================

const PORT =
    process.env.PORT || 3000;


app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});