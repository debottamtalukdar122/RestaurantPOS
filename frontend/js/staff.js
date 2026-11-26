const API_URL = "/api";


// =====================================================
// GLOBAL DATA
// =====================================================

let staffList = [];


// =====================================================
// DOM ELEMENTS
// =====================================================

const staffTable =
    document.getElementById("staffTable");

const emptyState =
    document.getElementById("emptyState");

const searchStaff =
    document.getElementById("searchStaff");

const roleFilter =
    document.getElementById("roleFilter");

const staffCount =
    document.getElementById("staffCount");

const totalStaff =
    document.getElementById("totalStaff");

const activeStaff =
    document.getElementById("activeStaff");

const inactiveStaff =
    document.getElementById("inactiveStaff");

const managerCount =
    document.getElementById("managerCount");

const addStaffBtn =
    document.getElementById("addStaffBtn");

const staffModal =
    document.getElementById("staffModal");

const closeModal =
    document.getElementById("closeModal");

const modalTitle =
    document.getElementById("modalTitle");

const staffForm =
    document.getElementById("staffForm");

const editStaffId =
    document.getElementById("editStaffId");

const staffName =
    document.getElementById("staffName");

const staffRole =
    document.getElementById("staffRole");

const staffPhone =
    document.getElementById("staffPhone");

const staffEmail =
    document.getElementById("staffEmail");

const staffSalary =
    document.getElementById("staffSalary");

const staffStatus =
    document.getElementById("staffStatus");

const logoutBtn =
    document.querySelector(".logout-btn");


// =====================================================
// LOAD ALL STAFF
// =====================================================

async function loadStaff() {

    try {

        const response =
            await fetch(
                `${API_URL}/staff`,
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
                "Failed to load staff"
            );

        }


        staffList =
            data.staff || [];


        updateSummary();

        renderStaff();


    } catch (error) {

        console.error(
            "Load staff error:",
            error
        );


        alert(
            error.message ||
            "Failed to load staff"
        );

    }

}


// =====================================================
// UPDATE SUMMARY
// =====================================================

function updateSummary() {

    const total =
        staffList.length;


    const active =
        staffList.filter(
            staff =>
                staff.isActive === true
        ).length;


    const inactive =
        staffList.filter(
            staff =>
                staff.isActive === false
        ).length;


    // ==========================================
    // IMPORTANT:
    // USE staffRole, NOT role
    // ==========================================

    const managers =
        staffList.filter(
            staff =>
                staff.staffRole === "manager"
        ).length;


    if (totalStaff) {

        totalStaff.textContent =
            total;

    }


    if (activeStaff) {

        activeStaff.textContent =
            active;

    }


    if (inactiveStaff) {

        inactiveStaff.textContent =
            inactive;

    }


    if (managerCount) {

        managerCount.textContent =
            managers;

    }


    if (staffCount) {

        staffCount.textContent =
            `${total} Staff`;

    }

}


// =====================================================
// RENDER STAFF
// =====================================================

function renderStaff() {

    if (!staffTable) {
        return;
    }


    staffTable.innerHTML = "";


    const searchText =
        searchStaff
            ? searchStaff.value
                .trim()
                .toLowerCase()
            : "";


    const selectedRole =
        roleFilter
            ? roleFilter.value
            : "All";


    const filteredStaff =
        staffList.filter(
            staff => {

                // =====================================
                // SEARCH
                // =====================================

                const name =
                    staff.name
                        ? staff.name
                            .toLowerCase()
                        : "";


                const email =
                    staff.email
                        ? staff.email
                            .toLowerCase()
                        : "";


                const phone =
                    staff.phone
                        ? String(
                            staff.phone
                        ).toLowerCase()
                        : "";


                if (
                    searchText &&
                    !name.includes(searchText) &&
                    !email.includes(searchText) &&
                    !phone.includes(searchText)
                ) {

                    return false;

                }


                // =====================================
                // RESTAURANT ROLE FILTER
                // =====================================

                if (
                    selectedRole !== "All"
                ) {

                    const selectedBackendRole =
                        selectedRole.toLowerCase();


                    if (
                        staff.staffRole !==
                        selectedBackendRole
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );


    // =============================================
    // EMPTY STATE
    // =============================================

    if (
        filteredStaff.length === 0
    ) {

        if (emptyState) {

            emptyState.style.display =
                "block";

        }

        return;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    // =============================================
    // CREATE ROWS
    // =============================================

    filteredStaff.forEach(
        staff => {

            const row =
                createStaffRow(staff);


            staffTable.appendChild(
                row
            );

        }
    );

}


// =====================================================
// CREATE STAFF ROW
// =====================================================

function createStaffRow(staff) {

    const row =
        document.createElement("tr");


    const firstLetter =
        staff.name
            ? staff.name
                .charAt(0)
                .toUpperCase()
            : "S";


    // =============================================
    // IMPORTANT:
    // RESTAURANT ROLE
    // =============================================

    const restaurantRole =
        staff.staffRole
            ? capitalize(
                staff.staffRole
            )
            : "Unassigned";


    const status =
        staff.isActive
            ? "Active"
            : "Inactive";


    const statusClass =
        staff.isActive
            ? "active"
            : "inactive";


    // =============================================
    // PHONE
    // =============================================

    const phone =
        staff.phone
            ? staff.phone
            : "-";


    // =============================================
    // SALARY
    // =============================================

    const salary =
        staff.salary !== undefined &&
        staff.salary !== null
            ? `₹${Number(
                staff.salary
            ).toLocaleString("en-IN")}`
            : "-";


    row.innerHTML = `

        <!-- STAFF -->

        <td>

            <div class="staff-info">

                <div class="avatar">

                    ${firstLetter}

                </div>


                <div>

                    <div class="staff-name">

                        ${escapeHTML(
                            staff.name || ""
                        )}

                    </div>

                </div>

            </div>

        </td>


        <!-- RESTAURANT ROLE -->

        <td>

            <span class="role">

                ${escapeHTML(
                    restaurantRole
                )}

            </span>

        </td>


        <!-- PHONE -->

        <td>

            ${escapeHTML(
                String(phone)
            )}

        </td>


        <!-- EMAIL -->

        <td>

            ${escapeHTML(
                staff.email || ""
            )}

        </td>


        <!-- SALARY -->

        <td>

            ${salary}

        </td>


        <!-- STATUS -->

        <td>

            <span
                class="status ${statusClass}"
            >

                ${status}

            </span>

        </td>


        <!-- ACTIONS -->

        <td>

            <button
                class="action-btn edit-staff-btn"
                data-id="${staff._id}"
                title="Edit Staff"
            >

                <i class="fa-solid fa-pen"></i>

            </button>


            <button
                class="action-btn toggle-staff-btn"
                data-id="${staff._id}"
                title="${
                    staff.isActive
                        ? "Disable Staff"
                        : "Enable Staff"
                }"
            >

                <i class="fa-solid ${
                    staff.isActive
                        ? "fa-user-xmark"
                        : "fa-user-check"
                }"></i>

            </button>


            <button
                class="action-btn delete-staff-btn"
                data-id="${staff._id}"
                title="Delete Staff"
            >

                <i class="fa-solid fa-trash"></i>

            </button>

        </td>

    `;


    return row;

}


// =====================================================
// SEARCH
// =====================================================

if (searchStaff) {

    searchStaff.addEventListener(
        "input",
        () => {

            renderStaff();

        }
    );

}


// =====================================================
// ROLE FILTER
// =====================================================

if (roleFilter) {

    roleFilter.addEventListener(
        "change",
        () => {

            renderStaff();

        }
    );

}


// =====================================================
// OPEN ADD STAFF MODAL
// =====================================================

if (addStaffBtn) {

    addStaffBtn.addEventListener(
        "click",
        () => {

            modalTitle.textContent =
                "Add Staff";


            editStaffId.value =
                "";


            staffForm.reset();


            staffRole.value =
                "";


            staffStatus.value =
                "Active";


            staffModal.classList.add(
                "show"
            );

        }
    );

}


// =====================================================
// OPEN EDIT MODAL
// =====================================================

function openEditModal(staff) {

    modalTitle.textContent =
        "Edit Staff";


    editStaffId.value =
        staff._id;


    staffName.value =
        staff.name || "";


    staffEmail.value =
        staff.email || "";


    staffPhone.value =
        staff.phone || "";


    staffSalary.value =
        staff.salary !== undefined &&
        staff.salary !== null
            ? staff.salary
            : "";


    // ==========================================
    // IMPORTANT:
    // USE staff.staffRole
    // ==========================================

    if (staffRole) {

        staffRole.value =
            staff.staffRole || "";

    }


    staffStatus.value =
        staff.isActive
            ? "Active"
            : "Inactive";


    staffModal.classList.add(
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

            staffModal.classList.remove(
                "show"
            );

        }
    );

}


// =====================================================
// CLOSE MODAL OUTSIDE
// =====================================================

if (staffModal) {

    staffModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                staffModal
            ) {

                staffModal.classList.remove(
                    "show"
                );

            }

        }
    );

}


// =====================================================
// STAFF FORM SUBMIT
// =====================================================

if (staffForm) {

    staffForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const id =
                editStaffId.value;


            const name =
                staffName.value.trim();


            const email =
                staffEmail.value.trim();


            const phone =
                staffPhone.value.trim();


            const salary =
                staffSalary.value;


            // ==========================================
            // RESTAURANT ROLE
            // ==========================================

            const selectedStaffRole =
                staffRole.value;


            // ==========================================
            // VALIDATION
            // ==========================================

            if (!name) {

                alert(
                    "Staff name is required"
                );

                return;

            }


            if (!email) {

                alert(
                    "Staff email is required"
                );

                return;

            }


            if (!selectedStaffRole) {

                alert(
                    "Please select a restaurant role"
                );

                return;

            }


            if (
                salary === "" ||
                Number(salary) < 0
            ) {

                alert(
                    "Please enter a valid salary"
                );

                return;

            }


            // ==========================================
            // EDIT STAFF
            // ==========================================

            if (id) {

                await updateStaff(

                    id,

                    name,

                    email,

                    phone,

                    Number(salary),

                    selectedStaffRole

                );

            }


            // ==========================================
            // CREATE STAFF
            // ==========================================

            else {

                const newPassword =
                    prompt(
                        "Enter password for this staff member:"
                    );


                if (!newPassword) {

                    alert(
                        "Password is required"
                    );

                    return;

                }


                await createStaff(

                    name,

                    email,

                    phone,

                    Number(salary),

                    newPassword,

                    selectedStaffRole

                );

            }

        }
    );

}


// =====================================================
// CREATE STAFF
// =====================================================

async function createStaff(

    name,
    email,
    phone,
    salary,
    password,
    staffRole

) {

    try {

        const response =
            await fetch(
                `${API_URL}/staff`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body:
                        JSON.stringify({

                            name,

                            email,

                            phone,

                            salary,

                            password,

                            // IMPORTANT
                            // restaurant position
                            staffRole

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to create staff"
            );

        }


        alert(
            "Staff created successfully!"
        );


        staffModal.classList.remove(
            "show"
        );


        await loadStaff();


    } catch (error) {

        console.error(
            "Create staff error:",
            error
        );


        alert(
            error.message ||
            "Failed to create staff"
        );

    }

}


// =====================================================
// UPDATE STAFF
// =====================================================

async function updateStaff(

    id,
    name,
    email,
    phone,
    salary,
    staffRole

) {

    try {

        const response =
            await fetch(
                `${API_URL}/staff/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body:
                        JSON.stringify({

                            name,

                            email,

                            phone,

                            salary,

                            // IMPORTANT
                            // restaurant position
                            staffRole

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update staff"
            );

        }


        alert(
            "Staff updated successfully!"
        );


        staffModal.classList.remove(
            "show"
        );


        await loadStaff();


    } catch (error) {

        console.error(
            "Update staff error:",
            error
        );


        alert(
            error.message ||
            "Failed to update staff"
        );

    }

}


// =====================================================
// TOGGLE STAFF STATUS
// =====================================================

async function toggleStaffStatus(
    id
) {

    const staff =
        staffList.find(
            item =>
                item._id === id
        );


    if (!staff) {

        return;

    }


    const action =
        staff.isActive
            ? "disable"
            : "enable";


    const confirmed =
        confirm(
            `Are you sure you want to ${action} this staff member?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/staff/${id}/toggle`,
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
                "Failed to update staff status"
            );

        }


        alert(
            data.message ||
            "Staff status updated"
        );


        await loadStaff();


    } catch (error) {

        console.error(
            "Toggle staff error:",
            error
        );


        alert(
            error.message ||
            "Failed to update staff status"
        );

    }

}


// =====================================================
// DELETE STAFF
// =====================================================

async function deleteStaff(
    id
) {

    const staff =
        staffList.find(
            item =>
                item._id === id
        );


    if (!staff) {

        return;

    }


    const confirmed =
        confirm(
            `Are you sure you want to delete ${staff.name}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/staff/${id}`,
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
                "Failed to delete staff"
            );

        }


        alert(
            data.message ||
            "Staff deleted successfully"
        );


        await loadStaff();


    } catch (error) {

        console.error(
            "Delete staff error:",
            error
        );


        alert(
            error.message ||
            "Failed to delete staff"
        );

    }

}


// =====================================================
// TABLE BUTTON ACTIONS
// =====================================================

if (staffTable) {

    staffTable.addEventListener(
        "click",
        event => {

            // =========================================
            // EDIT
            // =========================================

            const editButton =
                event.target.closest(
                    ".edit-staff-btn"
                );


            if (editButton) {

                const id =
                    editButton.dataset.id;


                const staff =
                    staffList.find(
                        item =>
                            item._id === id
                    );


                if (staff) {

                    openEditModal(
                        staff
                    );

                }


                return;

            }


            // =========================================
            // TOGGLE
            // =========================================

            const toggleButton =
                event.target.closest(
                    ".toggle-staff-btn"
                );


            if (toggleButton) {

                const id =
                    toggleButton.dataset.id;


                toggleStaffStatus(
                    id
                );


                return;

            }


            // =========================================
            // DELETE
            // =========================================

            const deleteButton =
                event.target.closest(
                    ".delete-staff-btn"
                );


            if (deleteButton) {

                const id =
                    deleteButton.dataset.id;


                deleteStaff(
                    id
                );


                return;

            }

        }
    );

}


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


                alert(
                    error.message ||
                    "Logout failed"
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

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadStaff();

    }
);