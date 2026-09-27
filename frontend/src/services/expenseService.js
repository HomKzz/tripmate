import apiClient from "./apiClient";

export async function getAll(tripId) {
    const response = await apiClient.get(
        `/trips/${tripId}/expenses`
    );

    return response.data;
}

export async function create(tripId, expense) {
    const response = await apiClient.post(
        `/trips/${tripId}/expenses`,
        expense
    );

    return response.data;
}

export async function update(expenseId, expense) {
    const response = await apiClient.put(
        `/expenses/${expenseId}`,
        expense
    );

    return response.data;
}

export async function remove(expenseId) {
    const response = await apiClient.delete(
        `/expenses/${expenseId}`
    );

    return response.data;
}