import apiClient from "./apiClient";

export async function getAll() {
    const response = await apiClient.get("/trips");

    return response.data;
}

export async function getById(tripId) {
    const response = await apiClient.get(`/trips/${tripId}`);

    return response.data;
}

export async function create(trip) {
    const response = await apiClient.post("/trips", trip);

    return response.data;
}

export async function update(tripId, trip) {
    const response = await apiClient.put(`/trips/${tripId}`, trip);

    return response.data;
}

export async function remove(tripId) {
    const response = await apiClient.delete(`/trips/${tripId}`);

    return response.data;
}

export async function getMembers(tripId) {
    const response = await apiClient.get(`/trips/${tripId}/members`);

    return response.data;
}

export async function addMember(tripId, email) {
    const response = await apiClient.post(`/trips/${tripId}/members`, {
        email
    });

    return response.data;
}

export async function removeMember(tripId, userId) {
    const response = await apiClient.delete(
        `/trips/${tripId}/members/${userId}`
    );

    return response.data;
}

export async function leave(tripId) {
    const response = await apiClient.delete(`/trips/${tripId}/members/me`);

    return response.data;
}