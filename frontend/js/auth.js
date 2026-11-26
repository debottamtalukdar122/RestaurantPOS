// const API_URL = "http://localhost:3000/api";
const API_URL = "/api";
// const API_URL = "http://127.0.0.1:3000/api";


// =====================================================
// REFRESH TOKEN CONTROL
// =====================================================

// This prevents multiple API requests from
// refreshing the token at the same time.

let refreshPromise = null;


// =====================================================
// REFRESH ACCESS TOKEN
// =====================================================

async function refreshAccessToken() {

    // If refresh is already running,
    // wait for the same refresh request.

    if (refreshPromise) {

        return refreshPromise;

    }


    refreshPromise = fetch(
        `${API_URL}/auth/refresh`,
        {
            method: "POST",

            credentials: "include"
        }
    )
    .then(async (response) => {

        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Session expired"
            );

        }


        return data;

    })
    .catch((error) => {

        console.error(
            "Refresh token error:",
            error
        );

        throw error;

    })
    .finally(() => {

        refreshPromise = null;

    });


    return refreshPromise;

}


// =====================================================
// API FETCH
// =====================================================
//
// Use this for protected API requests.
//
// If access token is expired:
//
// 1. Request gets 401
// 2. Refresh token endpoint is called
// 3. New access token cookie is created
// 4. Original request is retried
//
// =====================================================

async function apiFetch(
    url,
    options = {},
    retry = true
) {

    options.credentials = "include";


    let response =
        await fetch(
            url,
            options
        );


    // Access token expired / invalid

    if (
        response.status === 401 &&
        retry
    ) {

        try {

            // Get a new access token

            await refreshAccessToken();


            // Retry original request

            response =
                await apiFetch(
                    url,
                    options,
                    false
                );


        } catch (error) {

            console.error(
                "Automatic token refresh failed:",
                error
            );

        }

    }


    return response;

}


// =====================================================
// REGISTER
// =====================================================

async function registerUser(
    name,
    email,
    password
) {

    try {

        const response =
            await fetch(
                `${API_URL}/auth/register`,
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
                            password
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Registration failed"
            );

        }


        return data;


    } catch (error) {

        console.error(
            "Register error:",
            error
        );

        throw error;

    }

}


// =====================================================
// LOGIN
// =====================================================

async function loginUser(
    email,
    password
) {

    try {

        const response =
            await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body:
                        JSON.stringify({
                            email,
                            password
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Login failed"
            );

        }


        return data;


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        throw error;

    }

}


// =====================================================
// LOGOUT
// =====================================================

async function logoutUser() {

    try {

        const response =
            await apiFetch(
                `${API_URL}/auth/logout`,
                {
                    method: "POST"
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


        return data;


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        throw error;

    }

}


// =====================================================
// GET CURRENT USER
// =====================================================

async function getCurrentUser() {

    try {

        const response =
            await apiFetch(
                `${API_URL}/auth/me`,
                {
                    method: "GET"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Not authenticated"
            );

        }


        return data;


    } catch (error) {

        console.error(
            "Get current user error:",
            error
        );

        throw error;

    }

}


// =====================================================
// REGISTER FORM
// =====================================================

const registerForm =
    document.getElementById(
        "registerForm"
    );


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            try {

                const data =
                    await registerUser(
                        name,
                        email,
                        password
                    );


                console.log(
                    "Registration successful:",
                    data
                );


                alert(
                    "Account created successfully!"
                );


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "Registration failed:",
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
// FORGOT PASSWORD
// =====================================================

async function forgotPassword(email) {

    try {

        const response =
            await fetch(
                `${API_URL}/auth/forgot-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            email
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to send reset link"
            );

        }


        return data;


    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );

        throw error;

    }

}


// =====================================================
// FORGOT PASSWORD FORM
// =====================================================

const forgotPasswordForm =
    document.getElementById(
        "forgotPasswordForm"
    );


if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const button =
                document.getElementById(
                    "forgotPasswordBtn"
                );


            try {

                button.disabled = true;

                button.textContent =
                    "Sending...";


                const data =
                    await forgotPassword(
                        email
                    );


                console.log(
                    "Forgot password response:",
                    data
                );


                alert(
                    data.message ||
                    "Reset link sent successfully."
                );


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(error);

                alert(
                    error.message
                );


            } finally {

                button.disabled = false;

                button.textContent =
                    "Send Reset Link";

            }

        }
    );

}


// =====================================================
// RESET PASSWORD
// =====================================================

async function resetPassword(
    token,
    password
) {

    try {

        const response =
            await fetch(
                `${API_URL}/auth/reset-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            token,
                            password
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Password reset failed"
            );

        }


        return data;


    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        throw error;

    }

}


// =====================================================
// RESET PASSWORD FORM
// =====================================================

const resetPasswordForm =
    document.getElementById(
        "resetPasswordForm"
    );


if (resetPasswordForm) {

    resetPasswordForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const newPassword =
                document
                    .getElementById("newPassword")
                    .value;


            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;


            // Password match

            if (
                newPassword !==
                confirmPassword
            ) {

                alert(
                    "Passwords do not match."
                );

                return;

            }


            // Get token from URL

            const params =
                new URLSearchParams(
                    window.location.search
                );


            const token =
                params.get("token");


            if (!token) {

                alert(
                    "Invalid or missing reset token."
                );

                return;

            }


            const button =
                document.getElementById(
                    "resetPasswordBtn"
                );


            try {

                button.disabled = true;

                button.textContent =
                    "Resetting...";


                const data =
                    await resetPassword(
                        token,
                        newPassword
                    );


                console.log(
                    "Password reset:",
                    data
                );


                alert(
                    data.message ||
                    "Password reset successfully."
                );


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(error);

                alert(
                    error.message
                );


            } finally {

                button.disabled = false;

                button.textContent =
                    "Reset Password";

            }

        }
    );

}