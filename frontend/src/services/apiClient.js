import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.message ||
            error.message ||
            "API request failed";

        return Promise.reject(new Error(message));
    }
);

export default apiClient;