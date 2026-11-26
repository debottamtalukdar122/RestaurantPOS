const API_URL = "/api";


// ==================================================
// GET SETTINGS
// ==================================================

async function getSettings() {

    const response = await fetch(
        `${API_URL}/settings`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to load settings"
        );
    }

    return data.settings;
}



// ==================================================
// LOAD SETTINGS INTO FORM
// ==================================================

async function loadSettings() {

    try {

        const settings = await getSettings();


        // Restaurant Information

        document.getElementById("restaurantName").value =
            settings.restaurantName || "";

        document.getElementById("restaurantAddress").value =
            settings.address || "";

        document.getElementById("restaurantPhone").value =
            settings.phone || "";

        document.getElementById("restaurantEmail").value =
            settings.email || "";


        // GST

        document.getElementById("gstNumber").value =
            settings.gstNumber || "";

        document.getElementById("gstMode").value =
            settings.gstMode || "exclusive";


        // Billing

        document.getElementById("taxRate").value =
            settings.taxRate ?? 0;

        document.getElementById("serviceCharge").value =
            settings.serviceCharge ?? 0;

        document.getElementById("currency").value =
            settings.currency || "INR";


        // Restaurant Timing

        document.getElementById("openingTime").value =
            settings.openingTime || "10:00";

        document.getElementById("closingTime").value =
            settings.closingTime || "22:00";


        console.log(
            "Settings loaded successfully:",
            settings
        );

    } catch (error) {

        console.error(
            "Load settings error:",
            error
        );

        alert(
            error.message ||
            "Failed to load settings"
        );
    }
}



// ==================================================
// UPDATE SETTINGS
// ==================================================

async function updateSettings() {

    const settingsData = {

        restaurantName:
            document.getElementById(
                "restaurantName"
            ).value.trim(),

        address:
            document.getElementById(
                "restaurantAddress"
            ).value.trim(),

        phone:
            document.getElementById(
                "restaurantPhone"
            ).value.trim(),

        email:
            document.getElementById(
                "restaurantEmail"
            ).value.trim(),

        gstNumber:
            document.getElementById(
                "gstNumber"
            ).value.trim(),

        gstMode:
            document.getElementById(
                "gstMode"
            ).value,

        taxRate:
            Number(
                document.getElementById(
                    "taxRate"
                ).value
            ),

        serviceCharge:
            Number(
                document.getElementById(
                    "serviceCharge"
                ).value
            ),

        currency:
            document.getElementById(
                "currency"
            ).value,

        openingTime:
            document.getElementById(
                "openingTime"
            ).value,

        closingTime:
            document.getElementById(
                "closingTime"
            ).value
    };


    const response = await fetch(
        `${API_URL}/settings`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json"
            },

            credentials: "include",

            body: JSON.stringify(
                settingsData
            )
        }
    );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Failed to update settings"
        );
    }


    return data;
}



// ==================================================
// SETTINGS FORM SUBMIT
// ==================================================

const settingsForm =
    document.getElementById(
        "settingsForm"
    );


if (settingsForm) {

    settingsForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // ------------------------------------------
            // VALIDATION
            // ------------------------------------------

            const restaurantName =
                document.getElementById(
                    "restaurantName"
                ).value.trim();


            const address =
                document.getElementById(
                    "restaurantAddress"
                ).value.trim();


            if (!restaurantName) {

                alert(
                    "Restaurant name is required."
                );

                return;
            }


            if (!address) {

                alert(
                    "Restaurant address is required."
                );

                return;
            }


            // ------------------------------------------
            // BUTTON
            // ------------------------------------------

            const button =
                document.getElementById("btn");


            try {

                button.disabled = true;

                button.textContent =
                    "Saving...";


                // --------------------------------------
                // SEND TO BACKEND
                // --------------------------------------

                const data =
                    await updateSettings();


                console.log(
                    "Settings updated:",
                    data
                );


                // --------------------------------------
                // UPDATE FORM WITH SAVED DATA
                // --------------------------------------

                const settings =
                    data.settings;


                document.getElementById(
                    "restaurantName"
                ).value =
                    settings.restaurantName || "";


                document.getElementById(
                    "restaurantAddress"
                ).value =
                    settings.address || "";


                document.getElementById(
                    "restaurantPhone"
                ).value =
                    settings.phone || "";


                document.getElementById(
                    "restaurantEmail"
                ).value =
                    settings.email || "";


                document.getElementById(
                    "gstNumber"
                ).value =
                    settings.gstNumber || "";


                document.getElementById(
                    "gstMode"
                ).value =
                    settings.gstMode || "exclusive";


                document.getElementById(
                    "taxRate"
                ).value =
                    settings.taxRate ?? 0;


                document.getElementById(
                    "serviceCharge"
                ).value =
                    settings.serviceCharge ?? 0;


                document.getElementById(
                    "currency"
                ).value =
                    settings.currency || "INR";


                document.getElementById(
                    "openingTime"
                ).value =
                    settings.openingTime || "10:00";


                document.getElementById(
                    "closingTime"
                ).value =
                    settings.closingTime || "22:00";


                alert(
                    data.message ||
                    "Settings saved successfully!"
                );


            } catch (error) {

                console.error(
                    "Settings save error:",
                    error
                );


                alert(
                    error.message ||
                    "Failed to save settings"
                );


            } finally {

                button.disabled = false;

                button.textContent =
                    "Save Settings";
            }

        }
    );
}



// ==================================================
// LOGOUT
// ==================================================

const logoutButton =
    document.getElementById(
        "logout_btn"
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


                alert(
                    error.message ||
                    "Logout failed"
                );
            }

        }
    );
}



// ==================================================
// PAGE LOAD
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadSettings();

    }
);