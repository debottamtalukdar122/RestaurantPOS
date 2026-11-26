const API_URL = "/api";


// ==================================================
// GLOBAL VARIABLES
// ==================================================

let menuItems = [];

let selectedCategory = "all";


// ==================================================
// GET TABLE ID FROM URL
// ==================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const tableId =
    urlParams.get("table");


// ==================================================
// CART
// ==================================================

let cart =
    JSON.parse(
        localStorage.getItem("restaurantCart")
    ) || [];


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
// LOAD MENU
// ==================================================

async function loadMenu() {

    try {

        showLoading();


        const response =
            await fetch(
                `${API_URL}/menu`,
                {
                    method: "GET"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load menu"
            );
        }


        // ------------------------------------------
        // GET MENU ITEMS FROM BACKEND
        // ------------------------------------------

        menuItems =
            data.menuItems ||
            [];


        // ------------------------------------------
        // ONLY AVAILABLE ITEMS
        // ------------------------------------------

        menuItems =
            menuItems.filter(
                item =>
                    item.isAvailable !== false
            );


        createCategories();

        renderMenu();

        hideLoading();


    } catch (error) {

        console.error(
            "Load menu error:",
            error
        );


        hideLoading();

        showEmpty();


        alert(
            error.message ||
            "Failed to load menu"
        );
    }
}



// ==================================================
// CREATE CATEGORY BUTTONS
// ==================================================

function createCategories() {

    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    const categories = [
        ...new Set(
            menuItems
                .map(item => item.category)
                .filter(Boolean)
        )
    ];


    categoryFilter.innerHTML = `

        <button
            class="category-btn active"
            data-category="all"
        >
            All
        </button>

    `;


    categories.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "category-btn";


            button.dataset.category =
                category;


            button.textContent =
                category;


            categoryFilter.appendChild(
                button
            );

        }
    );
}



// ==================================================
// RENDER MENU
// ==================================================

function renderMenu() {

    const menuGrid =
        document.getElementById(
            "menuGrid"
        );


    const searchInput =
        document.getElementById(
            "searchMenu"
        );


    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    menuGrid.innerHTML = "";


    const filteredItems =
        menuItems.filter(
            item => {


                // Category filter

                const categoryMatch =
                    selectedCategory === "all" ||
                    item.category ===
                    selectedCategory;


                // Search filter

                const searchMatch =
                    !searchText ||

                    item.name
                        ?.toLowerCase()
                        .includes(searchText) ||

                    item.description
                        ?.toLowerCase()
                        .includes(searchText);


                return (
                    categoryMatch &&
                    searchMatch
                );

            }
        );


    if (filteredItems.length === 0) {

        showEmpty();

        return;
    }


    hideEmpty();


    filteredItems.forEach(
        item => {

            const card =
                createMenuCard(item);


            menuGrid.appendChild(card);

        }
    );
}



// ==================================================
// CREATE MENU CARD
// ==================================================

function createMenuCard(item) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "menu-card";


    // ------------------------------------------
    // IMAGE
    // ------------------------------------------

    let imageHTML = `

        <i class="fa-solid fa-utensils"></i>

    `;


    if (item.image) {

        imageHTML = `

            <img
                src="${item.image}"
                alt="${item.name}"
            >

        `;
    }


    // ------------------------------------------
    // CARD
    // ------------------------------------------

    card.innerHTML = `

        <div class="menu-image">

            ${imageHTML}

        </div>


        <div class="menu-content">


            ${
                item.category
                    ? `
                        <div class="menu-category">
                            ${item.category}
                        </div>
                    `
                    : ""
            }


            <h2 class="menu-name">
                ${item.name}
            </h2>


            <p class="menu-description">

                ${
                    item.description ||
                    "Delicious food prepared fresh for you."
                }

            </p>


            <div class="menu-bottom">

                <span class="menu-price">

                    ₹${Number(
                        item.price || 0
                    ).toFixed(2)}

                </span>


                <button
                    class="add-btn"
                    data-id="${item._id}"
                >

                    <i class="fa-solid fa-plus"></i>

                    Add

                </button>

            </div>


        </div>

    `;


    // ------------------------------------------
    // ADD BUTTON
    // ------------------------------------------

    const addButton =
        card.querySelector(
            ".add-btn"
        );


    addButton.addEventListener(
        "click",
        () => {

            addToCart(item);

        }
    );


    return card;
}



// ==================================================
// ADD TO CART
// ==================================================

function addToCart(item) {

    const existingItem =
        cart.find(
            cartItem =>
                cartItem.menuItemId ===
                item._id
        );


    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({

            menuItemId:
                item._id,

            name:
                item.name,

            price:
                Number(item.price),

            quantity:
                1

        });

    }


    saveCart();

    updateCartUI();


    alert(
        `${item.name} added to cart`
    );
}



// ==================================================
// UPDATE CART UI
// ==================================================

function updateCartUI() {

    const cartCount =
        document.getElementById(
            "cartCount"
        );


    const cartItemsText =
        document.getElementById(
            "cartItemsText"
        );


    const cartTotal =
        document.getElementById(
            "cartTotal"
        );


    const cartBar =
        document.getElementById(
            "cartBar"
        );


    // Total quantity

    const totalQuantity =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );


    // Total price

    const totalPrice =
        cart.reduce(
            (total, item) =>
                total +
                (
                    item.price *
                    item.quantity
                ),
            0
        );


    cartCount.textContent =
        totalQuantity;


    cartItemsText.textContent =
        `${totalQuantity} ${
            totalQuantity === 1
                ? "item"
                : "items"
        }`;


    cartTotal.textContent =
        `₹${totalPrice.toFixed(2)}`;


    if (totalQuantity > 0) {

        cartBar.style.display =
            "flex";

    } else {

        cartBar.style.display =
            "none";
    }
}



// ==================================================
// SEARCH
// ==================================================

const searchMenu =
    document.getElementById(
        "searchMenu"
    );


searchMenu.addEventListener(
    "input",
    () => {

        renderMenu();

    }
);



// ==================================================
// CATEGORY FILTER
// ==================================================

document
    .getElementById("categoryFilter")
    .addEventListener(
        "click",
        event => {


            if (
                !event.target.classList
                    .contains("category-btn")
            ) {

                return;
            }


            document
                .querySelectorAll(
                    ".category-btn"
                )
                .forEach(
                    button =>
                        button.classList
                            .remove("active")
                );


            event.target.classList
                .add("active");


            selectedCategory =
                event.target.dataset.category;


            renderMenu();

        }
    );



// ==================================================
// GO TO CART
// ==================================================

function goToCart() {

    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );

        return;
    }


    if (!tableId) {

        alert(
            "Table information is missing."
        );

        return;
    }


    window.location.href =
        `cart.html?table=${tableId}`;
}


document
    .getElementById("cartBtn")
    .addEventListener(
        "click",
        goToCart
    );


document
    .getElementById("viewCartBtn")
    .addEventListener(
        "click",
        goToCart
    );



// ==================================================
// TABLE DISPLAY
// ==================================================

function displayTable() {

    const tableElement =
        document.getElementById(
            "tableNumber"
        );


    if (tableId) {

        tableElement.textContent =
            tableId;

    } else {

        tableElement.textContent =
            "Not specified";
    }
}



// ==================================================
// LOADING
// ==================================================

function showLoading() {

    document.getElementById(
        "loading"
    ).style.display = "block";


    document.getElementById(
        "menuGrid"
    ).style.display = "none";
}


function hideLoading() {

    document.getElementById(
        "loading"
    ).style.display = "none";


    document.getElementById(
        "menuGrid"
    ).style.display = "grid";
}



// ==================================================
// EMPTY STATE
// ==================================================

function showEmpty() {

    document.getElementById(
        "emptyState"
    ).style.display = "block";


    document.getElementById(
        "menuGrid"
    ).style.display = "none";
}


function hideEmpty() {

    document.getElementById(
        "emptyState"
    ).style.display = "none";


    document.getElementById(
        "menuGrid"
    ).style.display = "grid";
}



// ==================================================
// PAGE LOAD
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        displayTable();

        updateCartUI();

        loadMenu();

    }
);