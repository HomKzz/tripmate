import apiClient from "./apiClient";

export async function createPlan(planRequest) {
    const response = await apiClient.post("/ai/plan", planRequest);
    return response.data;
}
