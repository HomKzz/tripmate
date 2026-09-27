import apiClient from "./apiClient";

export async function getHealth() {
    const response = await apiClient.get("/health");

    return response.data;
}