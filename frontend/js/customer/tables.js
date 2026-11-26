const API_URL = "/api";


// ==================================================
// LOAD TABLES
// ==================================================

async function loadTables() {

    const loading =
        document.getElementById("loading");

    const tableGrid =
        document.getElementById("tableGrid");

    const emptyState =
        document.getElementById("emptyState");

    const errorState =
        document.getElementById("errorState");

    const errorMessage =
        document.getElementById("errorMessage");


    try {

        loading.style.display =
            "block";

        tableGrid.innerHTML =
            "";

        emptyState.style.display =
            "none";

        errorState.style.display =
            "none";


        const response =
            await fetch(
                `${API_URL}/tables`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load tables"
            );

        }


        const tables =
            data.tables || [];


        loading.style.display =
            "none";


        if (
            !Array.isArray(tables) ||
            tables.length === 0
        ) {

            emptyState.style.display =
                "block";

            return;

        }


        tables.forEach(
            table => {

                tableGrid.appendChild(
                    createTableCard(table)
                );

            }
        );


    } catch (error) {

        console.error(
            "Load tables error:",
            error
        );


        loading.style.display =
            "none";

        errorState.style.display =
            "block";

        errorMessage.textContent =
            error.message ||
            "Failed to load tables";

    }

}



// ==================================================
// CREATE TABLE CARD
// ==================================================

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


    // ==========================================
    // CAN CUSTOMER SELECT?
    // ==========================================

    const canSelect =
        status === "available" ||
        status === "partially_occupied";


    let statusText =
        "Available";


    if (
        status === "partially_occupied"
    ) {

        statusText =
            `${availableSeats} seat(s) available`;

    }

    else if (
        status === "occupied"
    ) {

        statusText =
            "Fully Occupied";

    }

    else if (
        status === "reserved"
    ) {

        statusText =
            "Reserved";

    }


    card.innerHTML = `

        <div class="table-icon">

            <i class="fa-solid fa-table"></i>

        </div>


        <h3>

            ${table.tableName ||
              `Table ${table.tableNumber}`}

        </h3>


        <div class="table-status">

            ${statusText}

        </div>


        <p style="
            margin-bottom:15px;
            color:#777;
            font-size:14px;
        ">

            ${occupiedSeats}
            occupied /
            ${capacity}
            seats

        </p>


        <button
            class="select-btn"
            ${!canSelect ? "disabled" : ""}
        >

            ${
                canSelect
                    ? "Select Table"
                    : status === "reserved"
                        ? "Reserved"
                        : "Fully Occupied"
            }

        </button>

    `;


    const selectButton =
        card.querySelector(
            ".select-btn"
        );


    if (canSelect) {

        selectButton.addEventListener(
            "click",
            () => {

                selectTable(
                    table,
                    availableSeats
                );

            }
        );

    }


    return card;

}



// ==================================================
// SELECT TABLE
// ==================================================

function selectTable(
    table,
    availableSeats
) {

    const tableId =
        table._id;


    if (!tableId) {

        alert(
            "Table ID is missing."
        );

        return;

    }


    if (
        availableSeats <= 0
    ) {

        alert(
            "No seats are available."
        );

        return;

    }


    // ==========================================
    // ASK SEATS
    // ==========================================

    const answer =
        prompt(
            `How many seats do you need?\n\nAvailable seats: ${availableSeats}`
        );


    if (
        answer === null
    ) {

        return;

    }


    const seats =
        Number(answer);


    if (
        !Number.isInteger(seats) ||
        seats < 1
    ) {

        alert(
            "Please enter a valid number of seats."
        );

        return;

    }


    if (
        seats > availableSeats
    ) {

        alert(
            `Only ${availableSeats} seat(s) are available.`
        );

        return;

    }


    // ==========================================
    // CLEAR CART
    // ==========================================

    localStorage.removeItem(
        "restaurantCart"
    );


    // ==========================================
    // SAVE TABLE
    // ==========================================

    localStorage.setItem(
        "selectedTable",
        tableId
    );


    // ==========================================
    // SAVE SEATS
    // ==========================================

    localStorage.setItem(
        "selectedSeats",
        String(seats)
    );


    // ==========================================
    // SAVE TABLE INFO
    // ==========================================

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
                seats

        })

    );


    // ==========================================
    // MENU
    // ==========================================

    window.location.href =
        `menu.html?table=${tableId}`;

}



// ==================================================
// PAGE LOAD
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadTables();

    }
);