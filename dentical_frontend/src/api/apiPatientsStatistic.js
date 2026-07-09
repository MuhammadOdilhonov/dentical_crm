import client from "./apiService"

// Get patient statistics based on period and branch
export const getPatientStatistics = async (period = "year", quarter = null, branchId = null) => {
    try {
        let url = `/filial/${branchId || "all"}/patient-statistics/?period=${period}`

        // Add quarter parameter if provided
        if (period === "quarter" && quarter) {
            url += `&quarter=${quarter}`
        }

        const response = await client.get(url)
        return response.data
    } catch (error) {
        console.error("Error fetching patient statistics:", error)
        throw error
    }
}
