import client from "./apiService"

// Get general statistics with period filter
export const getStatistics = async (period = "monthly") => {
    try {
        const response = await client.get(`/customer-debt-statistics/?period=${period}ly`)
        return response.data
    } catch (error) {
        console.error("Error fetching statistics:", error)
        throw error
    }
}

// Get customer debt dynamic statistics
export const getCustomerDebtDynamicStatistics = async (type = "monthly", startDate = null, endDate = null) => {
    try {
        let url = `/customer-debt-dynamic-statistics/?type=${type}`

        if (type === "dynamic" && startDate && endDate) {
            url += `&start_date=${startDate}&end_date=${endDate}`
        }

        const response = await client.get(url)
        return response.data
    } catch (error) {
        console.error("Error fetching customer debt dynamic statistics:", error)
        throw error
    }
}

// Get indebted patients list
export const getIndebtedPatients = async (page = 1, search = "") => {
    try {
        let url = `/indebted-patients/?page=${page}`
        if (search) {
            url += `&search=${search}`
        }

        const response = await client.get(url)
        return response.data
    } catch (error) {
        console.error("Error fetching indebted patients:", error)
        throw error
    }
}

export default {
    getStatistics,
    getCustomerDebtDynamicStatistics,
    getIndebtedPatients,
}
