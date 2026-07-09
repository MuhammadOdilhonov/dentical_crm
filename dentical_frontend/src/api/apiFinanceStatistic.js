import client from "./apiService"

// Get financial statistics based on period and branch
export const getFinancialStatistics = async (period = "year", quarter = null, branchId = null) => {
    try {
        let url = `/filial/${branchId || "all"}/financial-report/?period=${period}`

        // Add quarter parameter if provided
        if (period === "quarter" && quarter) {
            url += `&quarter=${quarter}`
        }

        const response = await client.get(url)
        return response.data
    } catch (error) {
        console.error("Error fetching financial statistics:", error)
        throw error
    }
}

// Get cash withdrawal history
export const getCashWithdrawals = async () => {
    try {
        const response = await client.get("/cash-withdrawals/")
        return response.data
    } catch (error) {
        console.error("Error fetching cash withdrawals:", error)
        throw error
    }
}

// Create a new cash withdrawal
export const createCashWithdrawal = async (withdrawalData) => {
    try {
        const response = await client.post("/cash-withdrawals/", withdrawalData)
        return response.data
    } catch (error) {
        console.error("Error creating cash withdrawal:", error)
        throw error
    }
}
