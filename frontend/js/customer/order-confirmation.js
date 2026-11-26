const API_URL = "/api";


// ==================================================
// GET ORDER ID
// ==================================================

function getOrderId() {

    return localStorage.getItem(
        "lastOrderId"
    );

}


// ==================================================
// FORMAT MONEY
// ==================================================

function formatMoney(amount) {

    return `₹${Number(
        amount || 0
    ).toFixed(2)}`;

}


// ==================================================
// CAPITALIZE
// ==================================================

function capitalize(value) {

    if (!value) {
        return "";
    }


    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


// ==================================================
// LOAD ORDER
// ==================================================

async function loadOrder() {

    const orderId =
        getOrderId();


    if (!orderId) {

        alert(
            "Order information not found."
        );


        window.location.href =
            "menu.html";


        return;

    }


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


        console.log(
            "Order details:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load order"
            );

        }


        const order =
            data.order;


        if (!order) {

            throw new Error(
                "Order not found"
            );

        }


        displayOrder(
            order
        );


    } catch (error) {

        console.error(
            "Load order error:",
            error
        );


        alert(
            error.message ||
            "Unable to load order"
        );

    }

}


// ==================================================
// DISPLAY ORDER
// ==================================================

function displayOrder(order) {


    // ==========================================
    // ORDER ID
    // ==========================================

    const orderIdElement =
        document.getElementById(
            "orderId"
        );


    if (orderIdElement) {

        orderIdElement.textContent =
            order._id || "-";

    }


    // ==========================================
    // STATUS
    // ==========================================

    const statusElement =
        document.getElementById(
            "orderStatus"
        );


    if (statusElement) {

        const status =
            order.status ||
            "pending";


        statusElement.textContent =
            capitalize(
                status
            );


        statusElement.className =
            `status ${status}`;

    }


    // ==========================================
    // TIME
    // ==========================================

    const orderTime =
        document.getElementById(
            "orderTime"
        );


    if (
        orderTime &&
        order.createdAt
    ) {

        const date =
            new Date(
                order.createdAt
            );


        orderTime.textContent =
            date.toLocaleString();

    }


    // ==========================================
    // TABLE
    // ==========================================

    const tableNumber =
        document.getElementById(
            "tableNumber"
        );


    const table =
        order.table;


    if (tableNumber) {

        if (table) {

            tableNumber.textContent =
                table.tableName ||
                `Table ${table.tableNumber}`;

        } else {

            tableNumber.textContent =
                "Table";

        }

    }


    // ==========================================
    // ITEMS
    // ==========================================

    const itemsContainer =
        document.getElementById(
            "orderItems"
        );


    const items =
        order.items || [];


    if (!itemsContainer) {
        return;
    }


    if (
        items.length === 0
    ) {

        itemsContainer.innerHTML = `

            <p>
                No items found.
            </p>

        `;

    } else {

        itemsContainer.innerHTML =

            items.map(
                item => {

                    const quantity =
                        Number(
                            item.quantity ||
                            0
                        );


                    const price =
                        Number(
                            item.price ||
                            0
                        );


                    const subtotal =
                        Number(
                            item.subtotal ??
                            (
                                price *
                                quantity
                            )
                        );


                    // ==================================
                    // IMAGE
                    // ==================================

                    let imageHTML = "";


                    if (item.image) {

                        imageHTML = `

                            <img
                                src="${escapeHTML(
                                    item.image
                                )}"
                                alt="${escapeHTML(
                                    item.name ||
                                    "Food"
                                )}"
                                class="order-food-image"
                                onerror="this.style.display='none'"
                            >

                        `;

                    } else {

                        imageHTML = `

                            <div
                                class="order-food-placeholder"
                            >

                                <i
                                    class="fa-solid fa-utensils"
                                ></i>

                            </div>

                        `;

                    }


                    return `

                        <div
                            class="order-item"
                        >

                            <div
                                class="item-left"
                            >

                                ${imageHTML}


                                <div
                                    class="item-details"
                                >

                                    <h4>
                                        ${escapeHTML(
                                            item.name ||
                                            "Food Item"
                                        )}
                                    </h4>


                                    <p>

                                        ${quantity}
                                        ×
                                        ${formatMoney(
                                            price
                                        )}

                                    </p>

                                </div>

                            </div>


                            <strong
                                class="item-price"
                            >

                                ${formatMoney(
                                    subtotal
                                )}

                            </strong>

                        </div>

                    `;

                }
            ).join("");

    }


    // ==========================================
    // TOTAL
    // ==========================================

    const totalAmount =
        document.getElementById(
            "totalAmount"
        );


    if (totalAmount) {

        totalAmount.textContent =
            formatMoney(
                order.totalAmount
            );

    }

}


// ==================================================
// ESCAPE HTML
// ==================================================

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// ==================================================
// ORDER MORE
// ==================================================

const menuButton =
    document.getElementById(
        "menuBtn"
    );


if (menuButton) {

    menuButton.addEventListener(
        "click",
        () => {

            const tableId =
                localStorage.getItem(
                    "selectedTable"
                );


            if (tableId) {

                window.location.href =
                    `menu.html?table=${tableId}`;

            } else {

                window.location.href =
                    "menu.html";

            }

        }
    );

}


// ==================================================
// BACK TO HOME
// ==================================================

const homeButton =
    document.getElementById(
        "homeBtn"
    );


if (homeButton) {

    homeButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "tables.html";

        }
    );

}


// ==================================================
// PAGE LOAD
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadOrder();

    }
);