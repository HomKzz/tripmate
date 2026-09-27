import apiClient from "./apiClient";

export async function getAll(tripId) {
    const response = await apiClient.get(`/trips/${tripId}/itineraries`);

    return response.data;
}

export async function create(tripId, itinerary) {
    const response = await apiClient.post(
        `/trips/${tripId}/itineraries`,
        itinerary
    );

    return response.data;
}

export async function update(itineraryId, itinerary) {
    const response = await apiClient.put(
        `/itineraries/${itineraryId}`,
        itinerary
    );

    return response.data;
}

export async function remove(itineraryId) {
    const response = await apiClient.delete(`/itineraries/${itineraryId}`);

    return response.data;
}