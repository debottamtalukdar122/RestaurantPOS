const API_URL = "/api";


// ==================================================
// GLOBAL DATA
// ==================================================

let allOrders = [];
let currentPeriod = "month";


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
                data.message || "Failed to load orders"
            );

        }


        return data.orders || [];


    } catch (error) {

        console.error(
            "Get orders error:",
            error
        );

        throw error;
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
                data.message || "Failed to load tables"
            );

        }


        return data.tables || [];


    } catch (error) {

        console.error(
            "Get tables error:",
            error
        );

        throw error;
    }
}



// ==================================================
// GET SALES REPORT
// ==================================================

async function getSalesReport() {

    try {

        const response = await fetch(
            `${API_URL}/reports/sales`,
            {
                method: "GET",
                credentials: "include"
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load sales report"
            );

        }


        return data;


    } catch (error) {

        console.error(
            "Sales report error:",
            error
        );

        throw error;
    }
}



// ==================================================
// DATE FILTER
// ==================================================

function filterOrdersByPeriod(orders, period) {

    if (period === "all") {

        return orders;
    }


    const now = new Date();


    return orders.filter(order => {

        const orderDate =
            new Date(order.createdAt);


        if (period === "today") {

            return (
                orderDate.getDate() === now.getDate() &&
                orderDate.getMonth() === now.getMonth() &&
                orderDate.getFullYear() === now.getFullYear()
            );

        }


        if (period === "week") {

            const startOfWeek =
                new Date(now);

            const day =
                startOfWeek.getDay();

            startOfWeek.setDate(
                now.getDate() - day
            );

            startOfWeek.setHours(
                0, 0, 0, 0
            );


            return orderDate >= startOfWeek;

        }


        if (period === "month") {

            return (
                orderDate.getMonth() === now.getMonth() &&
                orderDate.getFullYear() === now.getFullYear()
            );

        }


        return true;

    });

}



// ==================================================
// FORMAT CURRENCY
// ==================================================

function formatCurrency(amount) {

    return "₹" +
        Number(amount || 0).toLocaleString("en-IN");

}



// ==================================================
// GET COMPLETED ORDERS
// ==================================================

function getCompletedOrders(orders) {

    /*
        Your Order model uses "served"
        as the final successful order status.

        So for the dashboard/report UI,
        we treat "served" as completed.
    */

    return orders.filter(
        order => order.status === "served"
    );

}



// ==================================================
// UPDATE SUMMARY CARDS
// ==================================================

function updateSummary(orders) {

    const completedOrders =
        getCompletedOrders(orders);


    const pendingOrders =
        orders.filter(order =>
            [
                "pending",
                "confirmed",
                "preparing",
                "ready"
            ].includes(order.status)
        );


    const cancelledOrders =
        orders.filter(
            order => order.status === "cancelled"
        );


    // ------------------------------------------
    // TOTAL REVENUE
    // ------------------------------------------

    const totalRevenue =
        completedOrders.reduce(
            (total, order) =>
                total + Number(order.totalAmount || 0),
            0
        );


    // ------------------------------------------
    // TOTAL ORDERS
    // ------------------------------------------

    const totalOrders =
        orders.length;


    // ------------------------------------------
    // AVERAGE ORDER
    // ------------------------------------------

    const averageOrder =
        completedOrders.length > 0
            ? totalRevenue / completedOrders.length
            : 0;


    // ------------------------------------------
    // UPDATE HTML
    // ------------------------------------------

    document.getElementById(
        "totalRevenue"
    ).textContent =
        formatCurrency(totalRevenue);


    document.getElementById(
        "totalOrders"
    ).textContent =
        totalOrders;


    document.getElementById(
        "completedOrders"
    ).textContent =
        completedOrders.length;


    document.getElementById(
        "pendingOrders"
    ).textContent =
        pendingOrders.length;


    document.getElementById(
        "cancelledOrders"
    ).textContent =
        cancelledOrders.length;


    document.getElementById(
        "averageOrder"
    ).textContent =
        formatCurrency(averageOrder);


    // ------------------------------------------
    // STATUS PERCENTAGES
    // ------------------------------------------

    const total =
        orders.length;


    let completedPercentage = 0;
    let pendingPercentage = 0;
    let cancelledPercentage = 0;


    if (total > 0) {

        completedPercentage =
            Math.round(
                (completedOrders.length / total) * 100
            );


        pendingPercentage =
            Math.round(
                (pendingOrders.length / total) * 100
            );


        cancelledPercentage =
            Math.round(
                (cancelledOrders.length / total) * 100
            );
    }


    document.getElementById(
        "completedPercentage"
    ).textContent =
        `${completedPercentage}%`;


    document.getElementById(
        "pendingPercentage"
    ).textContent =
        `${pendingPercentage}%`;


    document.getElementById(
        "cancelledPercentage"
    ).textContent =
        `${cancelledPercentage}%`;

}



// ==================================================
// UPDATE AVAILABLE TABLES
// ==================================================

function updateAvailableTables(tables) {

    const availableTables =
        tables.filter(
            table => table.status === "available"
        );


    document.getElementById(
        "availableTables"
    ).textContent =
        availableTables.length;

}



// ==================================================
// RECENT ORDERS
// ==================================================

function updateRecentOrders(orders) {

    const table =
        document.getElementById(
            "recentOrdersTable"
        );


    table.innerHTML = "";


    // Latest 5 orders

    const recentOrders =
        [...orders]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .slice(0, 5);


    if (recentOrders.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5"
                    style="text-align:center;">
                    No orders found
                </td>
            </tr>
        `;

        return;
    }


    recentOrders.forEach(order => {

        const row =
            document.createElement("tr");


        // --------------------------------------
        // ORDER ID
        // --------------------------------------

        const orderId =
            order._id
                ? order._id.slice(-6).toUpperCase()
                : "N/A";


        // --------------------------------------
        // CUSTOMER
        // --------------------------------------

        const customerName =
            order.customer?.name ||
            "Walk-in Customer";


        // --------------------------------------
        // TABLE
        // --------------------------------------

        const tableNumber =
            order.table?.tableNumber !== undefined
                ? `Table ${order.table.tableNumber}`
                : "N/A";


        // --------------------------------------
        // STATUS
        // --------------------------------------

        let displayStatus =
            order.status;


        if (order.status === "served") {

            displayStatus =
                "Completed";

        } else {

            displayStatus =
                order.status.charAt(0).toUpperCase() +
                order.status.slice(1);

        }


        const statusClass =
            order.status === "served"
                ? "completed"
                : order.status === "cancelled"
                    ? "cancelled"
                    : "pending";


        row.innerHTML = `

            <td>
                #${orderId}
            </td>

            <td>
                ${customerName}
            </td>

            <td>
                ${tableNumber}
            </td>

            <td>
                ${formatCurrency(order.totalAmount)}
            </td>

            <td>
                <span class="status ${statusClass}">
                    ${displayStatus}
                </span>
            </td>

        `;


        table.appendChild(row);

    });

}



// ==================================================
// SALES CHART
// ==================================================

function updateSalesChart(orders) {

    const chart =
        document.getElementById(
            "salesChart"
        );


    chart.innerHTML = "";


    const now =
        new Date();


    const dailySales = {};


    // ------------------------------------------
    // CREATE LAST 7 DAYS
    // ------------------------------------------

    for (let i = 6; i >= 0; i--) {

        const date =
            new Date(now);


        date.setDate(
            now.getDate() - i
        );


        const key =
            date.toISOString()
                .split("T")[0];


        dailySales[key] = 0;

    }


    // ------------------------------------------
    // ADD SALES
    // ------------------------------------------

    orders.forEach(order => {

        if (order.status !== "served") {
            return;
        }


        const date =
            new Date(order.createdAt);


        const key =
            date.toISOString()
                .split("T")[0];


        if (
            dailySales[key] !== undefined
        ) {

            dailySales[key] +=
                Number(order.totalAmount || 0);

        }

    });


    const values =
        Object.values(dailySales);


    const maxValue =
        Math.max(...values, 1);


    // ------------------------------------------
    // CREATE BARS
    // ------------------------------------------

    Object.entries(dailySales)
        .forEach(([date, amount]) => {

            const dateObject =
                new Date(date);


            const dayName =
                dateObject.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );


            const height =
                amount === 0
                    ? 5
                    : Math.max(
                        (amount / maxValue) * 100,
                        10
                    );


            const barContainer =
                document.createElement(
                    "div"
                );


            barContainer.className =
                "bar-container";


            barContainer.innerHTML = `

                <div
                    class="bar"
                    style="height:${height}%"
                    title="${formatCurrency(amount)}"
                >

                    <span>
                        ${dayName}
                    </span>

                </div>

            `;


            chart.appendChild(
                barContainer
            );

        });

}



// ==================================================
// UPDATE REPORT
// ==================================================

function updateReport() {

    const filteredOrders =
        filterOrdersByPeriod(
            allOrders,
            currentPeriod
        );


    updateSummary(
        filteredOrders
    );


    updateRecentOrders(
        filteredOrders
    );


    updateSalesChart(
        filteredOrders
    );

}



// ==================================================
// DATE FILTER EVENT
// ==================================================

const reportDate =
    document.getElementById(
        "reportDate"
    );


if (reportDate) {

    reportDate.addEventListener(
        "change",
        () => {

            currentPeriod =
                reportDate.value;


            updateReport();

        }
    );

}



// ==================================================
// INITIALIZE REPORT
// ==================================================

async function loadReports() {

    try {

        const [
            orders,
            tables
        ] = await Promise.all([

            getOrders(),

            getTables()

        ]);


        allOrders =
            orders;


        updateAvailableTables(
            tables
        );


        updateReport();


        console.log(
            "Reports loaded successfully"
        );


    } catch (error) {

        console.error(
            "Failed to load reports:",
            error
        );


        alert(
            error.message ||
            "Failed to load reports"
        );

    }

}



// ==================================================
// START
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    loadReports
);