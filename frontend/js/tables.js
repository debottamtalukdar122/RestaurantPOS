const API_URL = "/api";


// =====================================================
// GLOBAL DATA
// =====================================================

let tables = [];

let currentStatus = "All";



// =====================================================
// DOM ELEMENTS
// =====================================================

const tablesGrid =
    document.getElementById(
        "tablesGrid"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );

const searchTable =
    document.getElementById(
        "searchTable"
    );

const availableCount =
    document.getElementById(
        "availableCount"
    );

const occupiedCount =
    document.getElementById(
        "occupiedCount"
    );

const reservedCount =
    document.getElementById(
        "reservedCount"
    );

const totalCount =
    document.getElementById(
        "totalCount"
    );

const filterTabs =
    document.querySelectorAll(
        ".filter-tab"
    );

const addTableBtn =
    document.getElementById(
        "addTableBtn"
    );

const tableModal =
    document.getElementById(
        "tableModal"
    );

const closeModal =
    document.getElementById(
        "closeModal"
    );

const modalTitle =
    document.getElementById(
        "modalTitle"
    );

const tableForm =
    document.getElementById(
        "tableForm"
    );

const editTableId =
    document.getElementById(
        "editTableId"
    );

const tableNumber =
    document.getElementById(
        "tableNumber"
    );

const tableSeats =
    document.getElementById(
        "tableSeats"
    );

const tableStatus =
    document.getElementById(
        "tableStatus"
    );

const logoutBtn =
    document.querySelector(
        ".logout-btn"
    );



// =====================================================
// LOAD TABLES
// =====================================================

async function loadTables() {

    try {

        const response =
            await fetch(
                `${API_URL}/tables`,
                {
                    method:
                        "GET",

                    credentials:
                        "include"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load tables"
            );

        }


        tables =
            data.tables || [];


        updateSummary();

        renderTables();


    } catch (error) {

        console.error(
            "Load tables error:",
            error
        );


        alert(
            error.message
        );

    }

}



// =====================================================
// UPDATE SUMMARY
// =====================================================

function updateSummary() {

    const available =
        tables.filter(
            table =>
                table.status ===
                "available"
        ).length;


    const occupied =
        tables.filter(
            table =>
                table.status ===
                    "occupied" ||
                table.status ===
                    "partially_occupied"
        ).length;


    const reserved =
        tables.filter(
            table =>
                table.status ===
                "reserved"
        ).length;


    availableCount.textContent =
        available;


    occupiedCount.textContent =
        occupied;


    reservedCount.textContent =
        reserved;


    totalCount.textContent =
        tables.length;

}



// =====================================================
// RENDER TABLES
// =====================================================

function renderTables() {

    tablesGrid.innerHTML =
        "";


    const searchText =
        searchTable.value
            .trim()
            .toLowerCase();


    const filteredTables =
        tables.filter(
            table => {

                // ======================================
                // STATUS FILTER
                // ======================================

                if (
                    currentStatus !==
                    "All"
                ) {

                    /*
                     * The Occupied tab should include
                     * both fully and partially occupied
                     * tables.
                     */

                    if (
                        currentStatus.toLowerCase() ===
                        "occupied"
                    ) {

                        if (
                            table.status !==
                                "occupied" &&
                            table.status !==
                                "partially_occupied"
                        ) {

                            return false;

                        }

                    }

                    else if (
                        table.status !==
                        currentStatus.toLowerCase()
                    ) {

                        return false;

                    }

                }



                // ======================================
                // SEARCH
                // ======================================

                if (
                    searchText
                ) {

                    const number =
                        String(
                            table.tableNumber
                        )
                        .toLowerCase();


                    const name =
                        table.tableName
                            ? table.tableName
                                .toLowerCase()
                            : "";


                    if (
                        !number.includes(
                            searchText
                        ) &&
                        !name.includes(
                            searchText
                        )
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );


    if (
        filteredTables.length ===
        0
    ) {

        emptyState.style.display =
            "block";

        return;

    }


    emptyState.style.display =
        "none";


    filteredTables.forEach(
        table => {

            const card =
                createTableCard(
                    table
                );


            tablesGrid.appendChild(
                card
            );

        }
    );

}



// =====================================================
// CREATE TABLE CARD
// =====================================================

function createTableCard(table) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "table-card";


    const capacity =
        Number(
            table.capacity || 0
        );


    const occupiedSeats =
        Number(
            table.occupiedSeats || 0
        );


    const availableSeats =
        Math.max(
            capacity -
            occupiedSeats,
            0
        );


    const status =
        table.status ||
        "available";


    const statusText =
        formatStatus(
            status
        );


    card.innerHTML = `

        <div class="table-top">

            <div class="table-icon">

                <i
                    class="fa-solid fa-table"
                ></i>

            </div>


            <span
                class="table-status ${status}"
            >
                ${statusText}
            </span>

        </div>


        <h2 class="table-number">

            ${escapeHTML(
                table.tableName ||
                `Table ${table.tableNumber}`
            )}

        </h2>


        <p class="seats">

            <i
                class="fa-solid fa-users"
            ></i>

            ${capacity}

            ${
                capacity === 1
                    ? "Seat"
                    : "Seats"
            }

        </p>


        <div
            style="
                margin-top:8px;
                margin-bottom:15px;
                color:#777;
                font-size:14px;
            "
        >

            <strong>
                ${occupiedSeats}
            </strong>

            occupied

            &nbsp; / &nbsp;

            <strong>
                ${availableSeats}
            </strong>

            available

        </div>


        <div class="table-bottom">

            <div class="table-actions">


                <!-- EDIT -->

                <button
                    class="table-action edit-table-btn"
                    data-id="${table._id}"
                    title="Edit Table"
                >

                    <i
                        class="fa-solid fa-pen"
                    ></i>

                </button>



                <!-- STATUS -->

                <button
                    class="table-action status-table-btn"
                    data-id="${table._id}"
                    title="Change Status"
                >

                    <i
                        class="fa-solid fa-rotate"
                    ></i>

                </button>



                <!-- QR -->

                <button
                    class="table-action qr-table-btn"
                    data-id="${table._id}"
                    title="Generate QR"
                >

                    <i
                        class="fa-solid fa-qrcode"
                    ></i>

                </button>



                <!-- DELETE -->

                <button
                    class="table-action delete-table-btn"
                    data-id="${table._id}"
                    title="Delete Table"
                >

                    <i
                        class="fa-solid fa-trash"
                    ></i>

                </button>

            </div>

        </div>

    `;


    return card;

}



// =====================================================
// FORMAT STATUS
// =====================================================

function formatStatus(status) {

    const statusMap = {

        available:
            "Available",

        partially_occupied:
            "Partially Occupied",

        occupied:
            "Occupied",

        reserved:
            "Reserved"

    };


    return (
        statusMap[status] ||
        "Unknown"
    );

}



// =====================================================
// SEARCH
// =====================================================

if (searchTable) {

    searchTable.addEventListener(
        "input",
        () => {

            renderTables();

        }
    );

}



// =====================================================
// STATUS FILTER
// =====================================================

filterTabs.forEach(
    tab => {

        tab.addEventListener(
            "click",
            () => {

                filterTabs.forEach(
                    button => {

                        button.classList.remove(
                            "active"
                        );

                    }
                );


                tab.classList.add(
                    "active"
                );


                currentStatus =
                    tab.dataset.status;


                renderTables();

            }
        );

    }
);



// =====================================================
// OPEN ADD TABLE MODAL
// =====================================================

if (addTableBtn) {

    addTableBtn.addEventListener(
        "click",
        () => {

            modalTitle.textContent =
                "Add Table";


            editTableId.value =
                "";


            tableForm.reset();


            tableStatus.value =
                "Available";


            tableModal.classList.add(
                "show"
            );

        }
    );

}



// =====================================================
// OPEN EDIT MODAL
// =====================================================

function openEditModal(table) {

    modalTitle.textContent =
        "Edit Table";


    editTableId.value =
        table._id;


    tableNumber.value =
        table.tableName ||
        `Table ${table.tableNumber}`;


    tableSeats.value =
        table.capacity;


    tableStatus.value =
        capitalize(
            table.status
        );


    tableModal.classList.add(
        "show"
    );

}



// =====================================================
// CLOSE MODAL
// =====================================================

if (closeModal) {

    closeModal.addEventListener(
        "click",
        () => {

            tableModal.classList.remove(
                "show"
            );

        }
    );

}



// =====================================================
// CLOSE OUTSIDE
// =====================================================

if (tableModal) {

    tableModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                tableModal
            ) {

                tableModal.classList.remove(
                    "show"
                );

            }

        }
    );

}



// =====================================================
// FORM SUBMIT
// =====================================================

if (tableForm) {

    tableForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const inputValue =
                tableNumber.value.trim();


            const capacity =
                Number(
                    tableSeats.value
                );


            const status =
                tableStatus.value
                    .toLowerCase();


            if (!inputValue) {

                alert(
                    "Table name or number is required"
                );

                return;

            }


            if (
                !capacity ||
                capacity < 1
            ) {

                alert(
                    "Number of seats must be at least 1"
                );

                return;

            }


            const numberMatch =
                inputValue.match(
                    /\d+/
                );


            if (!numberMatch) {

                alert(
                    "Please enter a table number.\nExample: Table 1"
                );

                return;

            }


            const number =
                Number(
                    numberMatch[0]
                );


            let name =
                inputValue;


            if (
                !/^table\s+/i.test(
                    name
                )
            ) {

                name =
                    `Table ${name}`;

            }


            const id =
                editTableId.value;


            if (!id) {

                await createTable(
                    number,
                    name,
                    capacity
                );

            }

            else {

                await updateTable(
                    id,
                    number,
                    name,
                    capacity,
                    status
                );

            }

        }
    );

}



// =====================================================
// CREATE TABLE
// =====================================================

async function createTable(
    number,
    name,
    capacity
) {

    try {

        const response =
            await fetch(
                `${API_URL}/tables`,
                {

                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "include",

                    body:
                        JSON.stringify({

                            tableNumber:
                                number,

                            tableName:
                                name,

                            capacity:
                                capacity

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to create table"
            );

        }


        alert(
            "Table created successfully!"
        );


        tableModal.classList.remove(
            "show"
        );


        await loadTables();


    } catch (error) {

        console.error(
            "Create table error:",
            error
        );


        alert(
            error.message
        );

    }

}



// =====================================================
// UPDATE TABLE
// =====================================================

async function updateTable(
    id,
    number,
    name,
    capacity,
    status
) {

    try {

        // ==========================================
        // UPDATE BASIC DATA
        // ==========================================

        const response =
            await fetch(
                `${API_URL}/tables/${id}`,
                {

                    method:
                        "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "include",

                    body:
                        JSON.stringify({

                            tableNumber:
                                number,

                            tableName:
                                name,

                            capacity:
                                capacity

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update table"
            );

        }


        // ==========================================
        // STATUS
        // ==========================================

        /*
         * Occupied and partially occupied
         * are calculated automatically.
         *
         * Only reserved / available are
         * manually controlled.
         */

        if (
            status === "reserved" ||
            status === "available"
        ) {

            const statusResponse =
                await fetch(
                    `${API_URL}/tables/${id}/status`,
                    {

                        method:
                            "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials:
                            "include",

                        body:
                            JSON.stringify({

                                status

                            })

                    }
                );


            const statusData =
                await statusResponse.json();


            if (
                !statusResponse.ok
            ) {

                throw new Error(
                    statusData.message ||
                    "Failed to update status"
                );

            }

        }


        alert(
            "Table updated successfully!"
        );


        tableModal.classList.remove(
            "show"
        );


        await loadTables();


    } catch (error) {

        console.error(
            "Update table error:",
            error
        );


        alert(
            error.message
        );

    }

}



// =====================================================
// CHANGE TABLE STATUS
// =====================================================

async function changeTableStatus(id) {

    const table =
        tables.find(
            item =>
                item._id === id
        );


    if (!table) {

        return;

    }


    // =================================================
    // AVAILABLE -> RESERVED
    // =================================================

    if (
        table.status ===
        "available"
    ) {

        try {

            const response =
                await fetch(
                    `${API_URL}/tables/${id}/status`,
                    {

                        method:
                            "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials:
                            "include",

                        body:
                            JSON.stringify({

                                status:
                                    "reserved"

                            })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to reserve table"
                );

            }


            await loadTables();


        } catch (error) {

            console.error(
                "Reserve table error:",
                error
            );


            alert(
                error.message
            );

        }


        return;

    }



    // =================================================
    // RESERVED -> AVAILABLE
    // =================================================

    if (
        table.status ===
        "reserved"
    ) {

        try {

            const response =
                await fetch(
                    `${API_URL}/tables/${id}/status`,
                    {

                        method:
                            "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials:
                            "include",

                        body:
                            JSON.stringify({

                                status:
                                    "available"

                            })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to make table available"
                );

            }


            await loadTables();


        } catch (error) {

            console.error(
                "Make available error:",
                error
            );


            alert(
                error.message
            );

        }


        return;

    }



    // =================================================
    // OCCUPIED / PARTIALLY OCCUPIED
    // =================================================

    if (
        table.status ===
            "occupied" ||
        table.status ===
            "partially_occupied"
    ) {

        const occupiedSeats =
            Number(
                table.occupiedSeats || 0
            );


        const confirmed =
            confirm(

                `This table currently has ` +
                `${occupiedSeats} occupied seat(s).\n\n` +

                `You cannot manually make an occupied ` +
                `table available while its order is active.\n\n` +

                `Please update the related order first.`

            );


        if (confirmed) {

            alert(

                "Please complete/cancel the active order first. " +
                "The table will become available automatically " +
                "when no active order is occupying its seats."

            );

        }


        return;

    }

}



// =====================================================
// GENERATE QR
// =====================================================

async function generateTableQR(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/tables/${id}/qr`,
                {

                    method:
                        "POST",

                    credentials:
                        "include"

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to generate QR"
            );

        }


        showQRModal(
            data.qrCode,
            data.tableURL
        );


        await loadTables();


    } catch (error) {

        console.error(
            "Generate QR error:",
            error
        );


        alert(
            error.message
        );

    }

}



// =====================================================
// QR MODAL
// =====================================================

function showQRModal(
    qrCode,
    tableURL
) {

    const oldModal =
        document.getElementById(
            "qrModal"
        );


    if (oldModal) {

        oldModal.remove();

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "qrModal";


    modal.className =
        "modal show";


    modal.innerHTML = `

        <div class="modal-content">

            <div class="modal-header">

                <h2>
                    Table QR Code
                </h2>


                <button
                    class="close-btn"
                    id="closeQRModal"
                >

                    <i
                        class="fa-solid fa-xmark"
                    ></i>

                </button>

            </div>


            <img
                src="${qrCode}"
                alt="Table QR Code"
                style="
                    display:block;
                    width:250px;
                    height:250px;
                    margin:20px auto;
                "
            >


            <p
                style="
                    text-align:center;
                    color:#777;
                    font-size:13px;
                    word-break:break-all;
                    margin-bottom:15px;
                "
            >

                ${escapeHTML(
                    tableURL
                )}

            </p>


            <button
                class="save-btn"
                id="downloadQRBtn"
                style="width:100%;"
            >

                <i
                    class="fa-solid fa-download"
                ></i>

                Download QR

            </button>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    document
        .getElementById(
            "closeQRModal"
        )
        .addEventListener(
            "click",
            () => {

                modal.remove();

            }
        );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                modal.remove();

            }

        }
    );


    document
        .getElementById(
            "downloadQRBtn"
        )
        .addEventListener(
            "click",
            () => {

                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    qrCode;


                link.download =
                    "table-qr-code.png";


                link.click();

            }
        );

}



// =====================================================
// DELETE TABLE
// =====================================================

async function deleteTable(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this table?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/tables/${id}`,
                {

                    method:
                        "DELETE",

                    credentials:
                        "include"

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete table"
            );

        }


        alert(
            "Table deleted successfully!"
        );


        await loadTables();


    } catch (error) {

        console.error(
            "Delete table error:",
            error
        );


        alert(
            error.message
        );

    }

}



// =====================================================
// CARD BUTTONS
// =====================================================

tablesGrid.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) {

            return;

        }


        const id =
            button.dataset.id;


        if (!id) {

            return;

        }


        // ==========================================
        // EDIT
        // ==========================================

        if (
            button.classList.contains(
                "edit-table-btn"
            )
        ) {

            const table =
                tables.find(
                    item =>
                        item._id === id
                );


            if (table) {

                openEditModal(
                    table
                );

            }

        }


        // ==========================================
        // STATUS
        // ==========================================

        else if (
            button.classList.contains(
                "status-table-btn"
            )
        ) {

            changeTableStatus(
                id
            );

        }


        // ==========================================
        // QR
        // ==========================================

        else if (
            button.classList.contains(
                "qr-table-btn"
            )
        ) {

            generateTableQR(
                id
            );

        }


        // ==========================================
        // DELETE
        // ==========================================

        else if (
            button.classList.contains(
                "delete-table-btn"
            )
        ) {

            deleteTable(
                id
            );

        }

    }
);



// =====================================================
// LOGOUT
// =====================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                const response =
                    await fetch(
                        `${API_URL}/auth/logout`,
                        {

                            method:
                                "POST",

                            credentials:
                                "include"

                        }
                    );


                if (!response.ok) {

                    const data =
                        await response.json();


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


                alert(
                    error.message
                );

            }

        }
    );

}



// =====================================================
// CAPITALIZE
// =====================================================

function capitalize(value) {

    if (!value) {

        return "";

    }


    return (

        value.charAt(0).toUpperCase() +

        value.slice(1)

    );

}



// =====================================================
// ESCAPE HTML
// =====================================================

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



// =====================================================
// INITIAL LOAD
// =====================================================

loadTables();