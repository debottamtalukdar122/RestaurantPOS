// ==================================================
// DASHBOARD
// ==================================================

const API_URL = "/api";


// ==================================================
// GET CURRENT USER
// ==================================================

async function getCurrentUser() {

    try {

        const response = await fetch(
            `${API_URL}/auth/me`,
            {
                method: "GET",
                credentials: "include"
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Authentication failed"
            );

        }


        return data.user || data;

    } catch (error) {

        console.error(
            "Get current user error:",
            error
        );

        return null;

    }

}


// ==================================================
// GET ORDERS
// ==================================================

async function getOrders() {

    try {

        const response = await fetch(
            `${API_URL}/orders`,
            {
                method: "GET",
                credentials: "include"
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load orders"
            );

        }


        return data.orders || [];

    } catch (error) {

        console.error(
            "Get orders error:",
            error
        );

        return [];

    }

}


// ==================================================
// GET TABLES
// ==================================================

async function getTables() {

    try {

        const response = await fetch(
            `${API_URL}/tables`,
            {
                method: "GET",
                credentials: "include"
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load tables"
            );

        }


        return data.tables || [];

    } catch (error) {

        console.error(
            "Get tables error:",
            error
        );

        return [];

    }

}


// ==================================================
// ELEMENTS
// ==================================================

const profile =
    document.getElementById("profile");


const logoutBtn =
    document.getElementById("logoutBtn");


const manageMenu =
    document.getElementById("manageMenu");


const viewOrders =
    document.getElementById("viewOrders");


const manageTables =
    document.getElementById("manageTables");


const printQR =
    document.getElementById("printQR");


const seeAllOrders =
    document.getElementById("seeAllOrders");


const recentOrdersContainer =
    document.getElementById("recentOrders");


const dashboardSearch =
    document.getElementById("dashboardSearch");


// ==================================================
// DISPLAY USER
// ==================================================

function displayUser(user) {

    if (!user) {

        window.location.href =
            "login.html";

        return;

    }


    const name =
        user.name ||
        user.username ||
        user.email ||
        "User";


    const role =
        user.role ||
        "customer";


    if (profile) {

        profile.textContent =
            name
                .charAt(0)
                .toUpperCase();


        profile.title =
            `${name} (${role})`;

    }


    console.log(
        "Logged in user:",
        user
    );

}


// ==================================================
// CHECK TODAY
// ==================================================

function isToday(date) {

    if (!date) {

        return false;

    }


    const today =
        new Date();


    const targetDate =
        new Date(date);


    return (

        today.getFullYear() ===
        targetDate.getFullYear()

        &&

        today.getMonth() ===
        targetDate.getMonth()

        &&

        today.getDate() ===
        targetDate.getDate()

    );

}


// ==================================================
// FORMAT MONEY
// ==================================================

function formatMoney(amount) {

    return `₹${Number(
        amount || 0
    ).toLocaleString("en-IN")}`;

}


// ==================================================
// FORMAT STATUS
// ==================================================

function formatStatus(status) {

    if (!status) {

        return "Pending";

    }


    return status
        .charAt(0)
        .toUpperCase() +
        status.slice(1);

}


// ==================================================
// FORMAT TIME
// ==================================================

function formatTime(date) {

    if (!date) {

        return "-";

    }


    const orderDate =
        new Date(date);


    return orderDate.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ==================================================
// GET TABLE NAME
// ==================================================

function getTableName(order) {

    if (!order.table) {

        return "Table";

    }


    if (
        typeof order.table === "object"
    ) {

        return (
            order.table.tableName ||

            `Table ${
                order.table.tableNumber || "-"
            }`
        );

    }


    return "Table";

}


// ==================================================
// UPDATE DASHBOARD CARDS
// ==================================================

function updateDashboard(
    orders,
    tables
) {


    // ------------------------------------------
    // TODAY'S ORDERS
    // ------------------------------------------

    const todaysOrders =
        orders.filter(
            order =>
                isToday(
                    order.createdAt
                )
        );


    const todayOrdersElement =
        document.getElementById(
            "todayOrders"
        );


    if (todayOrdersElement) {

        todayOrdersElement.textContent =
            todaysOrders.length;

    }



    // ------------------------------------------
    // REVENUE
    // ------------------------------------------

    const revenue =
        todaysOrders.reduce(
            (
                total,
                order
            ) => {


                // If paymentStatus exists,
                // only paid orders count.

                if (

                    order.paymentStatus &&

                    order.paymentStatus !== "paid"

                ) {

                    return total;

                }


                return (

                    total +

                    Number(
                        order.totalAmount || 0
                    )

                );

            },
            0
        );


    const revenueElement =
        document.getElementById(
            "revenue"
        );


    if (revenueElement) {

        revenueElement.textContent =
            formatMoney(revenue);

    }



    // ------------------------------------------
    // PENDING ORDERS
    // ------------------------------------------

    const pendingOrders =
        orders.filter(
            order => {

                const status =
                    String(
                        order.status || ""
                    )
                    .toLowerCase();


                return (

                    status === "pending" ||

                    status === "preparing"

                );

            }
        );


    const pendingElement =
        document.getElementById(
            "pendingOrders"
        );


    if (pendingElement) {

        pendingElement.textContent =
            pendingOrders.length;

    }



    // ------------------------------------------
    // TOTAL TABLES
    // ------------------------------------------

    const totalTablesElement =
        document.getElementById(
            "totalTables"
        );


    if (totalTablesElement) {

        totalTablesElement.textContent =
            tables.length;

    }



    // ------------------------------------------
    // TABLE INFORMATION
    // ------------------------------------------

    const availableTables =
        tables.filter(
            table =>
                table.status ===
                "available"
        ).length;


    const tableInfo =
        document.getElementById(
            "tableInfo"
        );


    if (tableInfo) {

        tableInfo.innerHTML = `

            <i class="fa-solid fa-chair"></i>

            ${availableTables} available

        `;

    }

}


// ==================================================
// DISPLAY RECENT ORDERS
// ==================================================

function displayRecentOrders(
    orders
) {


    if (!recentOrdersContainer) {

        return;

    }


    // ------------------------------------------
    // NO ORDERS
    // ------------------------------------------

    if (
        !orders ||
        orders.length === 0
    ) {

        recentOrdersContainer.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="loading-orders"
                >

                    <i class="fa-solid fa-receipt"></i>

                    No orders found.

                </td>

            </tr>

        `;

        return;

    }



    // ------------------------------------------
    // SORT BY NEWEST
    // ------------------------------------------

    const recentOrders =
        [...orders]
            .sort(
                (
                    a,
                    b
                ) => {

                    return (

                        new Date(
                            b.createdAt || 0
                        )

                        -

                        new Date(
                            a.createdAt || 0
                        )

                    );

                }
            )
            .slice(0, 6);



    // ------------------------------------------
    // CREATE ROWS
    // ------------------------------------------

    recentOrdersContainer.innerHTML =

        recentOrders
            .map(
                order => {


                    const status =
                        String(
                            order.status ||
                            "pending"
                        )
                        .toLowerCase();


                    const orderId =
                        order._id
                            ? `#${String(
                                order._id
                            ).slice(-6)}`
                            : "#------";


                    return `

                        <tr>


                            <td>

                                <span class="order-id">

                                    ${orderId}

                                </span>

                            </td>


                            <td>

                                <span class="order-table">

                                    ${getTableName(
                                        order
                                    )}

                                </span>

                            </td>


                            <td>

                                <span class="order-amount">

                                    ${formatMoney(
                                        order.totalAmount
                                    )}

                                </span>

                            </td>


                            <td>

                                <span
                                    class="status ${status}"
                                >

                                    ${formatStatus(
                                        status
                                    )}

                                </span>

                            </td>


                            <td>

                                ${formatTime(
                                    order.createdAt
                                )}

                            </td>


                        </tr>

                    `;

                }
            )
            .join("");

}


// ==================================================
// SEARCH RECENT ORDERS
// ==================================================

function searchOrders(
    searchText
) {

    const rows =
        document.querySelectorAll(
            "#recentOrders tr"
        );


    const text =
        searchText
            .toLowerCase()
            .trim();


    rows.forEach(
        row => {

            if (
                row
                    .querySelector(
                        ".order-id"
                    ) === null
            ) {

                return;

            }


            const rowText =
                row.textContent
                    .toLowerCase();


            row.style.display =
                rowText.includes(text)
                    ? ""
                    : "none";

        }
    );

}


// ==================================================
// LOGOUT
// ==================================================

async function logout() {

    try {

        const response =
            await fetch(
                `${API_URL}/auth/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        console.log(
            "Logout:",
            data
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    } finally {

        localStorage.removeItem(
            "user"
        );


        localStorage.removeItem(
            "selectedTable"
        );


        localStorage.removeItem(
            "lastOrderId"
        );


        window.location.href =
            "login.html";

    }

}


// ==================================================
// QUICK ACTIONS
// ==================================================


// MANAGE MENU

if (manageMenu) {

    manageMenu.addEventListener(
        "click",
        () => {

            window.location.href =
                "menu.html";

        }
    );

}


// VIEW ORDERS

if (viewOrders) {

    viewOrders.addEventListener(
        "click",
        () => {

            window.location.href =
                "orders.html";

        }
    );

}


// MANAGE TABLES

if (manageTables) {

    manageTables.addEventListener(
        "click",
        () => {

            window.location.href =
                "tables.html";

        }
    );

}


// PRINT QR

if (printQR) {

    printQR.addEventListener(
        "click",
        () => {

            window.location.href =
                "tables.html";

        }
    );

}


// VIEW ALL ORDERS

if (seeAllOrders) {

    seeAllOrders.addEventListener(
        "click",
        () => {

            window.location.href =
                "orders.html";

        }
    );

}


// LOGOUT

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        logout
    );

}


// SEARCH

if (dashboardSearch) {

    dashboardSearch.addEventListener(
        "input",
        () => {

            searchOrders(
                dashboardSearch.value
            );

        }
    );

}


// ==================================================
// INITIALIZE DASHBOARD
// ==================================================

async function initializeDashboard() {

    console.log(
        "Loading dashboard..."
    );


    // ------------------------------------------
    // CURRENT USER
    // ------------------------------------------

    const user =
        await getCurrentUser();


    if (!user) {

        window.location.href =
            "login.html";

        return;

    }


    displayUser(user);



    // ------------------------------------------
    // GET ORDERS + TABLES
    // ------------------------------------------

    const [
        orders,
        tables
    ] = await Promise.all([

        getOrders(),

        getTables()

    ]);


    console.log(
        "Orders:",
        orders
    );


    console.log(
        "Tables:",
        tables
    );



    // ------------------------------------------
    // UPDATE CARDS
    // ------------------------------------------

    updateDashboard(
        orders,
        tables
    );



    // ------------------------------------------
    // RECENT ORDERS
    // ------------------------------------------

    displayRecentOrders(
        orders
    );

}


// ==================================================
// START
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);