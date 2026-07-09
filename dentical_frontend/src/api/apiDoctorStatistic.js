import client from "./apiService"

// Get doctor statistics based on period and branch
export const getDoctorStatistics = async (period = "year", quarter = null, branchId = null) => {
    try {
        let url = `/filial/${branchId || "all"}/doctor-statistics/?period=${period}`

        // Add quarter parameter if provided
        if (period === "quarter" && quarter) {
            url += `&quarter=${quarter}`
        }

        const response = await client.get(url)
        return response.data
    } catch (error) {
        console.error("Error fetching doctor statistics:", error)
        throw error
    }
}
