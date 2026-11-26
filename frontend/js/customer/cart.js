const API_URL = "/api";


// ==================================================
// DOM ELEMENTS
// ==================================================

const cartItemsContainer =
    document.getElementById(
        "cartItems"
    );

const emptyCart =
    document.getElementById(
        "emptyCart"
    );

const itemCount =
    document.getElementById(
        "itemCount"
    );

const summaryItems =
    document.getElementById(
        "summaryItems"
    );

const subtotalElement =
    document.getElementById(
        "subtotal"
    );

const taxElement =
    document.getElementById(
        "tax"
    );

const serviceChargeElement =
    document.getElementById(
        "serviceCharge"
    );

const totalElement =
    document.getElementById(
        "total"
    );

const tableNumberElement =
    document.getElementById(
        "tableNumber"
    );

const placeOrderBtn =
    document.getElementById(
        "placeOrderBtn"
    );

const backMenuBtn =
    document.getElementById(
        "backMenuBtn"
    );

const emptyCartMenuBtn =
    document.getElementById(
        "emptyCartMenuBtn"
    );

const successModal =
    document.getElementById(
        "successModal"
    );

const orderIdElement =
    document.getElementById(
        "orderId"
    );

const successMenuBtn =
    document.getElementById(
        "successMenuBtn"
    );



// ==================================================
// CART
// ==================================================

let cart =
    JSON.parse(
        localStorage.getItem(
            "restaurantCart"
        )
    ) || [];


// ==================================================
// FORMAT MONEY
// ==================================================

function formatMoney(amount) {

    return `₹${Number(
        amount || 0
    ).toFixed(2)}`;

}



// ==================================================
// GET TABLE
// ==================================================

function getTableId() {

    return localStorage.getItem(
        "selectedTable"
    );

}



// ==================================================
// GET SEATS
// ==================================================

function getSelectedSeats() {

    return Number(
        localStorage.getItem(
            "selectedSeats"
        ) || 1
    );

}



// ==================================================
// LOAD TABLE INFORMATION
// ==================================================

async function loadTableInfo() {

    const tableId =
        getTableId();


    if (!tableId) {

        tableNumberElement.textContent =
            "No table selected";

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/tables/${tableId}`,
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
                "Failed to load table"
            );

        }


        const table =
            data.table;


        if (!table) {

            throw new Error(
                "Table not found"
            );

        }


        const availableSeats =
            Math.max(
                Number(table.capacity || 0) -
                Number(table.occupiedSeats || 0),
                0
            );


        tableNumberElement.textContent =
            `${table.tableName || `Table ${table.tableNumber}`} • ${getSelectedSeats()} seat(s)`;



        // Save latest information

        localStorage.setItem(
            "selectedTableInfo",
            JSON.stringify({

                id:
                    table._id,

                tableNumber:
                    table.tableNumber,

                tableName:
                    table.tableName,

                capacity:
                    table.capacity,

                occupiedSeats:
                    table.occupiedSeats || 0,

                availableSeats,

                seatsSelected:
                    getSelectedSeats()

            })
        );


    } catch (error) {

        console.error(
            "Load table error:",
            error
        );

        tableNumberElement.textContent =
            "Table information unavailable";

    }

}



// ==================================================
// SAVE CART
// ==================================================

function saveCart() {

    localStorage.setItem(
        "restaurantCart",
        JSON.stringify(cart)
    );

}



// ==================================================
// RENDER CART
// ==================================================

function renderCart() {

    cartItemsContainer.innerHTML =
        "";


    if (
        cart.length === 0
    ) {

        emptyCart.style.display =
            "block";

        placeOrderBtn.disabled =
            true;

        updateSummary();

        return;

    }


    emptyCart.style.display =
        "none";

    placeOrderBtn.disabled =
        false;


    cart.forEach(
        (item, index) => {

            const itemDiv =
                document.createElement(
                    "div"
                );


            itemDiv.className =
                "cart-item";


            const subtotal =
                Number(item.price || 0) *
                Number(item.quantity || 0);


            itemDiv.innerHTML = `

                <div>

                    <h3>
                        ${escapeHTML(
                            item.name || "Food"
                        )}
                    </h3>

                    <p>
                        ${formatMoney(
                            item.price
                        )}
                        ×
                        ${item.quantity}
                    </p>

                </div>


                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:10px;
                    "
                >

                    <button
                        class="quantity-btn"
                        data-index="${index}"
                        data-action="decrease"
                    >
                        −
                    </button>


                    <strong>
                        ${item.quantity}
                    </strong>


                    <button
                        class="quantity-btn"
                        data-index="${index}"
                        data-action="increase"
                    >
                        +
                    </button>


                    <strong
                        style="margin-left:15px;"
                    >
                        ${formatMoney(
                            subtotal
                        )}
                    </strong>


                    <button
                        class="remove-btn"
                        data-index="${index}"
                        data-action="remove"
                    >
                        <i
                            class="fa-solid fa-trash"
                        ></i>
                    </button>

                </div>

            `;


            cartItemsContainer.appendChild(
                itemDiv
            );

        }
    );


    updateSummary();

}



// ==================================================
// UPDATE SUMMARY
// ==================================================

function updateSummary() {

    const totalItems =
        cart.reduce(
            (total, item) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );


    const subtotal =
        cart.reduce(
            (total, item) =>
                total +
                (
                    Number(item.price || 0) *
                    Number(item.quantity || 0)
                ),
            0
        );


    // ==========================================
    // TAX
    // ==========================================

    const tax =
        subtotal * 0.05;


    // ==========================================
    // SERVICE CHARGE
    // ==========================================

    const serviceCharge =
        subtotal * 0.05;


    // ==========================================
    // TOTAL
    // ==========================================

    const total =
        subtotal +
        tax +
        serviceCharge;


    itemCount.textContent =
        `${totalItems} ${
            totalItems === 1
                ? "item"
                : "items"
        }`;


    summaryItems.textContent =
        totalItems;


    subtotalElement.textContent =
        formatMoney(
            subtotal
        );


    taxElement.textContent =
        formatMoney(
            tax
        );


    serviceChargeElement.textContent =
        formatMoney(
            serviceCharge
        );


    totalElement.textContent =
        formatMoney(
            total
        );

}



// ==================================================
// CART BUTTON ACTIONS
// ==================================================

cartItemsContainer.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) {
            return;
        }


        const index =
            Number(
                button.dataset.index
            );


        const action =
            button.dataset.action;


        if (
            !Number.isInteger(index) ||
            !cart[index]
        ) {

            return;

        }


        // Increase

        if (
            action === "increase"
        ) {

            cart[index].quantity++;

        }


        // Decrease

        else if (
            action === "decrease"
        ) {

            cart[index].quantity--;


            if (
                cart[index].quantity <= 0
            ) {

                cart.splice(
                    index,
                    1
                );

            }

        }


        // Remove

        else if (
            action === "remove"
        ) {

            cart.splice(
                index,
                1
            );

        }


        saveCart();

        renderCart();

    }
);



// ==================================================
// PLACE ORDER
// ==================================================

placeOrderBtn.addEventListener(
    "click",
    async () => {

        if (
            cart.length === 0
        ) {

            alert(
                "Your cart is empty."
            );

            return;

        }


        const tableId =
            getTableId();


        if (!tableId) {

            alert(
                "Please select a table first."
            );

            window.location.href =
                "tables.html";

            return;

        }


        const seats =
            getSelectedSeats();


        if (
            !seats ||
            seats < 1
        ) {

            alert(
                "Please select your seats."
            );

            return;

        }


        try {

            placeOrderBtn.disabled =
                true;

            placeOrderBtn.innerHTML =
                `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Placing Order...
                `;


            // ======================================
            // PREPARE ITEMS
            // ======================================

            const items =
                cart.map(
                    item => ({

                        menuItemId:
                            item.menuItemId ||
                            item._id,

                        quantity:
                            Number(
                                item.quantity
                            )

                    })
                );


            // ======================================
            // CREATE ORDER
            // ======================================

            const response =
                await fetch(
                    `${API_URL}/orders`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials: "include",

                        body:
                            JSON.stringify({

                                tableId,

                                seats,

                                items

                            })
                    }
                );


            const data =
                await response.json();


            console.log(
                "Order response:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to place order"
                );

            }


            // ======================================
            // SAVE ORDER ID
            // ======================================

            localStorage.setItem(
                "lastOrderId",
                data.order._id
            );


            // ======================================
            // CLEAR CART
            // ======================================

            localStorage.removeItem(
                "restaurantCart"
            );


            // ======================================
            // GO TO CONFIRMATION
            // ======================================

            window.location.href =
                "order-confirmation.html";


        } catch (error) {

            console.error(
                "Place order error:",
                error
            );


            alert(
                error.message ||
                "Failed to place order"
            );


        } finally {

            placeOrderBtn.disabled =
                false;

            placeOrderBtn.innerHTML =
                `
                <i class="fa-solid fa-check"></i>
                Place Order
                `;

        }

    }
);



// ==================================================
// BACK TO MENU
// ==================================================

backMenuBtn.addEventListener(
    "click",
    () => {

        const tableId =
            getTableId();


        if (tableId) {

            window.location.href =
                `menu.html?table=${tableId}`;

        }

        else {

            window.location.href =
                "tables.html";

        }

    }
);



// ==================================================
// EMPTY CART → MENU
// ==================================================

emptyCartMenuBtn.addEventListener(
    "click",
    () => {

        const tableId =
            getTableId();


        if (tableId) {

            window.location.href =
                `menu.html?table=${tableId}`;

        }

        else {

            window.location.href =
                "tables.html";

        }

    }
);



// ==================================================
// SUCCESS MODAL
// ==================================================

if (successMenuBtn) {

    successMenuBtn.addEventListener(
        "click",
        () => {

            const tableId =
                getTableId();


            if (tableId) {

                window.location.href =
                    `menu.html?table=${tableId}`;

            }

            else {

                window.location.href =
                    "tables.html";

            }

        }
    );

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
// INITIALIZE
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadTableInfo();

        renderCart();

    }
);