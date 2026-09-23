const API_URL = import.meta.env.VITE_API_URL;

export async function getHealth() {
    const response = await fetch(`${API_URL}/health`);

    if (!response.ok) {
        throw new Error("API request failed");
    }

    return response.json();
}

export async function loginUser(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
}

export async function registerUser(name, email, password) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            email,
            password
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Register failed");
    }

    return data;
}

export async function getCurrentUser(token) {
    const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
    }

    return data;
}