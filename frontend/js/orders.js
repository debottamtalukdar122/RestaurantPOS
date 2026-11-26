// =====================================================
// ORDERS MANAGEMENT
// =====================================================

const API_URL = "/api";


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let allOrders = [];

let currentStatus = "All";


// =====================================================
// DOM ELEMENTS
// =====================================================

const ordersTable =
    document.getElementById("ordersTable");

const orderCount =
    document.getElementById("orderCount");

const emptyState =
    document.getElementById("emptyState");

const searchOrder =
    document.getElementById("searchOrder");

const tabs =
    document.querySelectorAll(".tab");


// =====================================================
// LOAD ALL ORDERS
// =====================================================

async function loadOrders() {

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


        allOrders = data.orders || [];


        renderOrders();


    } catch (error) {

        console.error(
            "Load orders error:",
            error
        );


        alert(error.message);

    }
}


// =====================================================
// RENDER ORDERS
// =====================================================

function renderOrders() {

    if (!ordersTable) return;


    ordersTable.innerHTML = "";


    const searchText =
        searchOrder
            ? searchOrder.value
                .trim()
                .toLowerCase()
            : "";


    let filteredOrders =
        allOrders.filter(order => {


            // -----------------------------
            // STATUS FILTER
            // -----------------------------

            if (currentStatus !== "All") {

                if (
                    currentStatus === "Completed"
                ) {

                    if (
                        order.status !== "served"
                    ) {
                        return false;
                    }

                } else {

                    if (
                        order.status !==
                        currentStatus.toLowerCase()
                    ) {
                        return false;
                    }

                }

            }


            // -----------------------------
            // SEARCH FILTER
            // -----------------------------

            if (searchText) {

                const orderId =
                    order._id
                        ? order._id.toLowerCase()
                        : "";


                const tableNumber =
                    order.table?.tableNumber
                        ? String(
                            order.table.tableNumber
                        ).toLowerCase()
                        : "";


                const tableName =
                    order.table?.tableName
                        ? String(
                            order.table.tableName
                        ).toLowerCase()
                        : "";


                const customerName =
                    order.customer?.name
                        ? order.customer.name.toLowerCase()
                        : "";


                const customerEmail =
                    order.customer?.email
                        ? order.customer.email.toLowerCase()
                        : "";


                const itemNames =
                    order.items
                        ?.map(item => item.name)
                        .join(" ")
                        .toLowerCase() || "";


                const matchesSearch =

                    orderId.includes(searchText) ||

                    tableNumber.includes(searchText) ||

                    tableName.includes(searchText) ||

                    customerName.includes(searchText) ||

                    customerEmail.includes(searchText) ||

                    itemNames.includes(searchText);


                if (!matchesSearch) {
                    return false;
                }

            }


            return true;

        });


    // =================================================
    // UPDATE COUNT
    // =================================================

    if (orderCount) {

        orderCount.textContent =
            `${filteredOrders.length} ${
                filteredOrders.length === 1
                    ? "Order"
                    : "Orders"
            }`;

    }


    // =================================================
    // EMPTY STATE
    // =================================================

    if (filteredOrders.length === 0) {

        emptyState.style.display = "block";

        return;

    }


    emptyState.style.display = "none";


    // =================================================
    // CREATE TABLE ROWS
    // =================================================

    filteredOrders.forEach(order => {

        const row =
            document.createElement("tr");


        // -----------------------------
        // ORDER ID
        // -----------------------------

        const shortOrderId =
            order._id
                ? order._id.slice(-6).toUpperCase()
                : "N/A";


        // -----------------------------
        // TABLE
        // -----------------------------

        let tableText = "N/A";


        if (order.table) {

            if (order.table.tableNumber) {

                tableText =
                    `Table ${order.table.tableNumber}`;

            } else if (order.table.tableName) {

                tableText =
                    order.table.tableName;

            }

        }


        // -----------------------------
        // CUSTOMER
        // -----------------------------

        const customerName =
            order.customer?.name ||
            "Guest";


        // -----------------------------
        // ITEMS
        // -----------------------------

        const itemCount =
            order.items
                ? order.items.reduce(
                    (total, item) =>
                        total + item.quantity,
                    0
                )
                : 0;


        // -----------------------------
        // AMOUNT
        // -----------------------------

        const amount =
            Number(order.totalAmount || 0)
                .toFixed(2);


        // -----------------------------
        // STATUS
        // -----------------------------

        const status =
            order.status || "pending";


        const statusText =
            formatStatus(status);


        // -----------------------------
        // TIME
        // -----------------------------

        const time =
            formatDate(order.createdAt);


        // =================================================
        // ROW HTML
        // =================================================

        row.innerHTML = `

            <td>
                <strong>
                    #${escapeHTML(shortOrderId)}
                </strong>
            </td>


            <td>
                ${escapeHTML(tableText)}
            </td>


            <td>
                ${escapeHTML(customerName)}
            </td>


            <td>
                ${itemCount}
                ${
                    itemCount === 1
                        ? "item"
                        : "items"
                }
            </td>


            <td>
                <strong>
                    ₹${amount}
                </strong>
            </td>


            <td>

                <span
                    class="status-badge status-${escapeHTML(status)}">

                    ${escapeHTML(statusText)}

                </span>

            </td>


            <td>
                ${escapeHTML(time)}
            </td>


            <td>

                <div class="order-actions">

                    <button
                        class="action-btn view-btn"
                        data-id="${order._id}"
                        title="View Order">

                        <i class="fa-solid fa-eye"></i>

                    </button>


                    <button
                        class="action-btn status-btn"
                        data-id="${order._id}"
                        title="Update Status">

                        <i class="fa-solid fa-rotate"></i>

                    </button>


                    <button
                        class="action-btn payment-btn"
                        data-id="${order._id}"
                        title="Update Payment">

                        <i class="fa-solid fa-credit-card"></i>

                    </button>


                    <button
                        class="action-btn delete-btn"
                        data-id="${order._id}"
                        title="Delete Order">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>

        `;


        ordersTable.appendChild(row);

    });

}


// =====================================================
// FORMAT STATUS
// =====================================================

function formatStatus(status) {

    const statusMap = {

        pending: "Pending",

        confirmed: "Confirmed",

        preparing: "Preparing",

        ready: "Ready",

        served: "Completed",

        cancelled: "Cancelled"

    };


    return statusMap[status] || status;

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(date) {

    if (!date) {
        return "N/A";
    }


    const dateObject =
        new Date(date);


    if (isNaN(dateObject.getTime())) {
        return "N/A";
    }


    return dateObject.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// =====================================================
// VIEW ORDER
// =====================================================

async function viewOrder(orderId) {

    try {

        const response =
            await fetch(
                `${API_URL}/orders/${orderId}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to get order"
            );

        }


        const order =
            data.order;


        let itemsText = "";


        order.items.forEach(item => {

            itemsText +=
                `${item.name} × ${item.quantity} = ₹${item.subtotal}\n`;

        });


        alert(
            `ORDER DETAILS\n\n` +

            `Order ID: #${order._id.slice(-6).toUpperCase()}\n` +

            `Table: ${
                order.table?.tableNumber
                    ? "Table " +
                      order.table.tableNumber
                    : order.table?.tableName ||
                      "N/A"
            }\n` +

            `Customer: ${
                order.customer?.name ||
                "Guest"
            }\n\n` +

            `ITEMS:\n${itemsText}\n` +

            `Total: ₹${order.totalAmount}\n` +

            `Order Status: ${
                formatStatus(order.status)
            }\n` +

            `Payment: ${
                formatStatus(order.paymentStatus)
            }\n` +

            `Created: ${
                formatDate(order.createdAt)
            }`
        );


    } catch (error) {

        console.error(
            "View order error:",
            error
        );


        alert(error.message);

    }

}


// =====================================================
// UPDATE ORDER STATUS
// =====================================================

async function updateOrderStatus(orderId) {

    const status =
        prompt(
            "Enter new status:\n\n" +
            "pending\n" +
            "confirmed\n" +
            "preparing\n" +
            "ready\n" +
            "served\n" +
            "cancelled"
        );


    if (!status) {
        return;
    }


    const newStatus =
        status.trim().toLowerCase();


    const allowedStatuses = [

        "pending",
        "confirmed",
        "preparing",
        "ready",
        "served",
        "cancelled"

    ];


    if (
        !allowedStatuses.includes(
            newStatus
        )
    ) {

        alert(
            "Invalid status.\n\n" +
            "Use: pending, confirmed, preparing, ready, served or cancelled."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/orders/${orderId}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update status"
            );

        }


        alert(
            "Order status updated successfully."
        );


        await loadOrders();


    } catch (error) {

        console.error(
            "Update order status error:",
            error
        );


        alert(error.message);

    }

}


// =====================================================
// UPDATE PAYMENT STATUS
// =====================================================

async function updatePaymentStatus(orderId) {

    const paymentStatus =
        prompt(
            "Enter payment status:\n\n" +
            "pending\n" +
            "paid"
        );


    if (!paymentStatus) {
        return;
    }


    const newPaymentStatus =
        paymentStatus
            .trim()
            .toLowerCase();


    if (
        !["pending", "paid"]
            .includes(newPaymentStatus)
    ) {

        alert(
            "Invalid payment status.\n\n" +
            "Use: pending or paid."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/orders/${orderId}/payment`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        paymentStatus:
                            newPaymentStatus
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update payment status"
            );

        }


        alert(
            "Payment status updated successfully."
        );


        await loadOrders();


    } catch (error) {

        console.error(
            "Update payment status error:",
            error
        );


        alert(error.message);

    }

}


// =====================================================
// DELETE ORDER
// =====================================================

async function deleteOrder(orderId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this order?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/orders/${orderId}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete order"
            );

        }


        alert(
            "Order deleted successfully."
        );


        await loadOrders();


    } catch (error) {

        console.error(
            "Delete order error:",
            error
        );


        alert(error.message);

    }

}


// =====================================================
// TAB FILTER
// =====================================================

tabs.forEach(tab => {

    tab.addEventListener(
        "click",
        () => {


            // Remove active class
            tabs.forEach(item => {

                item.classList.remove(
                    "active"
                );

            });


            // Add active class
            tab.classList.add("active");


            currentStatus =
                tab.dataset.status;


            renderOrders();

        }
    );

});


// =====================================================
// SEARCH
// =====================================================

if (searchOrder) {

    searchOrder.addEventListener(
        "input",
        () => {

            renderOrders();

        }
    );

}


// =====================================================
// ACTION BUTTONS
// =====================================================

if (ordersTable) {

    ordersTable.addEventListener(
        "click",
        (event) => {


            const button =
                event.target.closest(
                    "button"
                );


            if (!button) {
                return;
            }


            const orderId =
                button.dataset.id;


            if (!orderId) {
                return;
            }


            // VIEW
            if (
                button.classList.contains(
                    "view-btn"
                )
            ) {

                viewOrder(orderId);

            }


            // UPDATE STATUS
            else if (
                button.classList.contains(
                    "status-btn"
                )
            ) {

                updateOrderStatus(
                    orderId
                );

            }


            // UPDATE PAYMENT
            else if (
                button.classList.contains(
                    "payment-btn"
                )
            ) {

                updatePaymentStatus(
                    orderId
                );

            }


            // DELETE
            else if (
                button.classList.contains(
                    "delete-btn"
                )
            ) {

                deleteOrder(orderId);

            }

        }
    );

}


// =====================================================
// LOGOUT
// =====================================================

const logoutButton =
    document.querySelector(
        ".logout-btn"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

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


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Logout failed"
                    );

                }


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                alert(error.message);

            }

        }
    );

}


// =====================================================
// SECURITY HELPER
// =====================================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =====================================================
// INITIAL LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadOrders();

    }
);