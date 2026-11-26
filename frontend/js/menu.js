const API_URL = "/api";


// ======================================================
// ELEMENTS
// ======================================================

const productsGrid = document.getElementById("productsGrid");
const emptyState = document.getElementById("emptyState");

const searchProduct = document.getElementById("searchProduct");
const productCount = document.getElementById("productCount");

const categoryTabs = document.getElementById("categoryTabs");

const addProductBtn = document.getElementById("addProductBtn");
const addCategoryBtn = document.getElementById("addCategoryBtn");


// Product Modal

const productModal = document.getElementById("productModal");
const closeProductModal =
    document.getElementById("closeProductModal");

const productForm =
    document.getElementById("productForm");

const productModalTitle =
    document.getElementById("productModalTitle");


// Product fields

const editProductId =
    document.getElementById("editProductId");

const productName =
    document.getElementById("productName");

const productPrice =
    document.getElementById("productPrice");

const productCategory =
    document.getElementById("productCategory");

const productImage =
    document.getElementById("productImage");


// Category Modal

const categoryModal =
    document.getElementById("categoryModal");

const closeCategoryModal =
    document.getElementById("closeCategoryModal");

const categoryForm =
    document.getElementById("categoryForm");

const categoryName =
    document.getElementById("categoryName");


// Logout

const logoutBtn =
    document.querySelector(".logout-btn");


// ======================================================
// VARIABLES
// ======================================================

let products = [];

let categories = [];

let selectedCategory = "All";


// ======================================================
// GET ALL PRODUCTS
// ======================================================

async function getProducts() {

    try {

        const response = await fetch(
            `${API_URL}/menu`
        );

        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Failed to load products"
            );

        }


        products = data.menuItems || [];


        generateCategories();

        renderProducts();

    } catch (error) {

        console.error(
            "Get products error:",
            error
        );

        alert(
            error.message ||
            "Unable to load menu"
        );

    }

}


// ======================================================
// GENERATE CATEGORIES
// ======================================================
function generateCategories() {

    const categorySet = new Set();


    // Categories from products
    products.forEach(product => {

        if (product.category) {

            categorySet.add(
                product.category
            );

        }

    });


    // Categories saved in localStorage
    const savedCategories =
        JSON.parse(
            localStorage.getItem("menuCategories")
        ) || [];


    savedCategories.forEach(category => {

        // "All" is NOT a real category
        if (
            category &&
            category.toLowerCase() !== "all"
        ) {

            categorySet.add(category);

        }

    });


    categories = [
        ...categorySet
    ];


    renderCategoryTabs();

    populateCategorySelect();

}


// ======================================================
// RENDER CATEGORY TABS
// ======================================================

function renderCategoryTabs() {

    categoryTabs.innerHTML = "";


    // ALL BUTTON

    const allButton =
        document.createElement("button");

    allButton.className =
        "category-tab";


    if (selectedCategory === "All") {

        allButton.classList.add("active");

    }


    allButton.textContent = "All";


    allButton.addEventListener(
        "click",
        () => {

            selectedCategory = "All";

            renderCategoryTabs();

            renderProducts();

        }
    );


    categoryTabs.appendChild(
        allButton
    );


    // OTHER CATEGORIES

    categories.forEach(category => {

        const button =
            document.createElement("button");

        button.className =
            "category-tab";


        if (
            selectedCategory === category
        ) {

            button.classList.add("active");

        }


        button.textContent =
            category;


        button.addEventListener(
            "click",
            () => {

                selectedCategory =
                    category;

                renderCategoryTabs();

                renderProducts();

            }
        );


        categoryTabs.appendChild(
            button
        );

    });

}


// ======================================================
// POPULATE CATEGORY SELECT
// ======================================================

function populateCategorySelect() {

    productCategory.innerHTML = "";


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent = category;

        productCategory.appendChild(
            option
        );

    });

}


// ======================================================
// RENDER PRODUCTS
// ======================================================

function renderProducts() {

    productsGrid.innerHTML = "";


    const searchText =
        searchProduct.value
            .trim()
            .toLowerCase();


    const filteredProducts =
        products.filter(product => {


            // Category filter

            const categoryMatch =
                selectedCategory === "All" ||
                product.category ===
                selectedCategory;


            // Search filter

            const searchMatch =
                product.name
                    .toLowerCase()
                    .includes(searchText);


            return (
                categoryMatch &&
                searchMatch
            );

        });


    // Product count

    productCount.textContent =
        `${filteredProducts.length} Products`;


    // Empty state

    if (filteredProducts.length === 0) {

        emptyState.style.display =
            "block";

        return;

    }


    emptyState.style.display =
        "none";


    // Create cards

    filteredProducts.forEach(product => {

        const card =
            createProductCard(product);

        productsGrid.appendChild(card);

    });

}


// ======================================================
// CREATE PRODUCT CARD
// ======================================================

function createProductCard(product) {

    const card =
        document.createElement("div");

    card.className =
        "product-card";


    // ==================================================
    // IMAGE
    // ==================================================

    if (product.image) {

        const image =
            document.createElement("img");

        image.className =
            "product-image";

        image.src =
            product.image;

        image.alt =
            product.name;


        // If image fails

        image.onerror = function () {

            this.style.display =
                "none";

        };


        card.appendChild(image);

    } else {

        const imagePlaceholder =
            document.createElement("div");

        imagePlaceholder.className =
            "product-image no-image";

        imagePlaceholder.innerHTML =
            `<i class="fa-solid fa-utensils"></i>`;


        card.appendChild(
            imagePlaceholder
        );

    }


    // ==================================================
    // ACTION BUTTONS
    // ==================================================

    const actions =
        document.createElement("div");

    actions.className =
        "product-actions";


    // EDIT BUTTON

    const editButton =
        document.createElement("button");

    editButton.className =
        "card-action";

    editButton.innerHTML =
        `<i class="fa-solid fa-pen"></i>`;

    editButton.title =
        "Edit product";


    editButton.addEventListener(
        "click",
        () => {

            openEditProductModal(product);

        }
    );


    // TOGGLE BUTTON

    const toggleButton =
        document.createElement("button");

    toggleButton.className =
        "card-action";


    toggleButton.innerHTML =
        product.isAvailable
            ? `<i class="fa-solid fa-eye-slash"></i>`
            : `<i class="fa-solid fa-eye"></i>`;


    toggleButton.title =
        product.isAvailable
            ? "Disable product"
            : "Enable product";


    toggleButton.addEventListener(
        "click",
        () => {

            toggleProduct(
                product._id
            );

        }
    );


    // DELETE BUTTON

    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "card-action";

    deleteButton.innerHTML =
        `<i class="fa-solid fa-trash"></i>`;

    deleteButton.title =
        "Delete product";


    deleteButton.addEventListener(
        "click",
        () => {

            deleteProduct(
                product._id
            );

        }
    );


    actions.appendChild(
        editButton
    );

    actions.appendChild(
        toggleButton
    );

    actions.appendChild(
        deleteButton
    );


    card.appendChild(
        actions
    );


    // ==================================================
    // PRODUCT INFO
    // ==================================================

    const info =
        document.createElement("div");

    info.className =
        "product-info";


    // Product name

    const name =
        document.createElement("h3");

    name.className =
        "product-name";

    name.textContent =
        product.name;


    // Category

    const category =
        document.createElement("p");

    category.className =
        "product-category";

    category.textContent =
        product.category;


    // Bottom section

    const bottom =
        document.createElement("div");

    bottom.className =
        "product-bottom";


    // Price

    const price =
        document.createElement("span");

    price.className =
        "product-price";

    price.textContent =
        `₹${Number(product.price).toFixed(2)}`;


    // Availability

    const availability =
        document.createElement("span");

    availability.className =
        "food-type";


    if (product.isAvailable) {

        availability.classList.add(
            "veg"
        );

        availability.textContent =
            "Available";

    } else {

        availability.classList.add(
            "non-veg"
        );

        availability.textContent =
            "Unavailable";

    }


    bottom.appendChild(price);

    bottom.appendChild(
        availability
    );


    info.appendChild(name);

    info.appendChild(category);

    info.appendChild(bottom);


    card.appendChild(info);


    return card;

}


// ======================================================
// SEARCH
// ======================================================

searchProduct.addEventListener(
    "input",
    () => {

        renderProducts();

    }
);


// ======================================================
// OPEN ADD PRODUCT MODAL
// ======================================================

addProductBtn.addEventListener(
    "click",
    () => {

        openAddProductModal();

    }
);


// ======================================================
// OPEN ADD PRODUCT MODAL FUNCTION
// ======================================================

function openAddProductModal() {

    productModalTitle.textContent =
        "Add Product";


    editProductId.value =
        "";


    productForm.reset();


    // Select first category

    if (categories.length > 0) {

        productCategory.value =
            categories[0];

    }


    productModal.classList.add(
        "show"
    );

}


// ======================================================
// OPEN EDIT PRODUCT MODAL
// ======================================================

function openEditProductModal(product) {

    productModalTitle.textContent =
        "Edit Product";


    editProductId.value =
        product._id;


    productName.value =
        product.name;


    productPrice.value =
        product.price;


    productCategory.value =
        product.category;


    productImage.value =
        product.image || "";


    // Food type

    const foodType =
        document.querySelector(
            `input[name="foodType"][value="${product.foodType || "Veg"}"]`
        );


    if (foodType) {

        foodType.checked =
            true;

    }


    productModal.classList.add(
        "show"
    );

}


// ======================================================
// CLOSE PRODUCT MODAL
// ======================================================

closeProductModal.addEventListener(
    "click",
    () => {

        productModal.classList.remove(
            "show"
        );

    }
);


// ======================================================
// PRODUCT FORM SUBMIT
// ======================================================

productForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const name =
            productName.value.trim();

        const price =
            Number(productPrice.value);

        const category =
            productCategory.value;

        const image =
            productImage.value.trim();


        if (!name) {

            alert(
                "Product name is required"
            );

            return;

        }


        if (price < 0) {

            alert(
                "Price cannot be negative"
            );

            return;

        }


        if (!category) {

            alert(
                "Please select a category"
            );

            return;

        }


        const productId =
            editProductId.value;


        // ==============================================
        // EDIT
        // ==============================================

        if (productId) {

            await updateProduct(
                productId,
                {
                    name,
                    category,
                    price,
                    image
                }
            );

        }

        // ==============================================
        // CREATE
        // ==============================================

        else {

            await createProduct(
                {
                    name,
                    category,
                    price,
                    image
                }
            );

        }

    }
);


// ======================================================
// CREATE PRODUCT
// ======================================================

async function createProduct(productData) {

    try {

        const response =
            await fetch(
                `${API_URL}/menu`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body:
                        JSON.stringify(
                            productData
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to create product"
            );

        }


        alert(
            "Product added successfully!"
        );


        productModal.classList.remove(
            "show"
        );


        await getProducts();


    } catch (error) {

        console.error(
            "Create product error:",
            error
        );

        alert(
            error.message
        );

    }

}


// ======================================================
// UPDATE PRODUCT
// ======================================================

async function updateProduct(
    productId,
    productData
) {

    try {

        const response =
            await fetch(
                `${API_URL}/menu/${productId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body:
                        JSON.stringify(
                            productData
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update product"
            );

        }


        alert(
            "Product updated successfully!"
        );


        productModal.classList.remove(
            "show"
        );


        await getProducts();


    } catch (error) {

        console.error(
            "Update product error:",
            error
        );

        alert(
            error.message
        );

    }

}


// ======================================================
// TOGGLE PRODUCT AVAILABILITY
// ======================================================

async function toggleProduct(productId) {

    try {

        const response =
            await fetch(
                `${API_URL}/menu/${productId}/toggle`,
                {
                    method: "PATCH",

                    credentials: "include"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to change availability"
            );

        }


        await getProducts();


    } catch (error) {

        console.error(
            "Toggle product error:",
            error
        );

        alert(
            error.message
        );

    }

}


// ======================================================
// DELETE PRODUCT
// ======================================================

async function deleteProduct(productId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/menu/${productId}`,
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
                "Failed to delete product"
            );

        }


        alert(
            "Product deleted successfully!"
        );


        await getProducts();


    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );

        alert(
            error.message
        );

    }

}


// ======================================================
// ADD CATEGORY
// ======================================================

addCategoryBtn.addEventListener(
    "click",
    () => {

        categoryName.value = "";

        categoryModal.classList.add(
            "show"
        );

    }
);


// ======================================================
// CLOSE CATEGORY MODAL
// ======================================================

closeCategoryModal.addEventListener(
    "click",
    () => {

        categoryModal.classList.remove(
            "show"
        );

    }
);


// ======================================================
// CATEGORY FORM
// ======================================================

categoryForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const name =
            categoryName.value.trim();


        if (!name) {

            return;

        }


        // Check duplicate

        const exists =
            categories.some(
                category =>
                    category.toLowerCase() ===
                    name.toLowerCase()
            );


        if (exists) {

            alert(
                "Category already exists"
            );

            return;

        }


        // Save locally

        const savedCategories =
            JSON.parse(
                localStorage.getItem(
                    "menuCategories"
                )
            ) || [];


        savedCategories.push(name);


        localStorage.setItem(
            "menuCategories",
            JSON.stringify(
                savedCategories
            )
        );


        // Update UI

        categories.push(name);


        renderCategoryTabs();

        populateCategorySelect();


        categoryModal.classList.remove(
            "show"
        );


        alert(
            "Category added successfully!"
        );

    }
);


// ======================================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ======================================================

productModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            productModal
        ) {

            productModal.classList.remove(
                "show"
            );

        }

    }
);


categoryModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            categoryModal
        ) {

            categoryModal.classList.remove(
                "show"
            );

        }

    }
);


// ======================================================
// LOGOUT
// ======================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
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


                if (!response.ok) {

                    throw new Error(
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

                alert(
                    "Logout failed"
                );

            }

        }
    );

}


// ======================================================
// INITIAL LOAD
// ======================================================

getProducts();