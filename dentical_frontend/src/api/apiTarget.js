import client from "./apiService"

export const submitTarget = async (targetData) => {
    try {
        const response = await client.post("/admin/targets/", targetData)
        return response.data
    } catch (error) {
        console.error("Target submission error:", error)
        throw error
    }
}
