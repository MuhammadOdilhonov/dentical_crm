import client from "./apiService"

// Get customer debt summary
export const fetchCustomerDebtSummary = async (customerId) => {
    try {
        const response = await client.get(`/customer-debt-summary/${customerId}/`)
        return response.data
    } catch (error) {
        console.error(`Error fetching debt summary for customer ${customerId}:`, error)
        throw error
    }
}

// Get customer debt statistics with detailed breakdown
export const fetchCustomerDebtStats = async (customerId) => {
    try {
        const response = await client.get(`/customer/${customerId}/debt-stats/`)
        return response.data
    } catch (error) {
        console.error(`Error fetching debt stats for customer ${customerId}:`, error)
        throw error
    }
}

// Create new customer debt payment
export const createCustomerDebt = async (debtData) => {
    try {
        const response = await client.post("/customer-debts/", debtData)
        return response.data
    } catch (error) {
        console.error("Error creating customer debt:", error)
        throw error
    }
}

// Update existing customer debt payment
export const updateCustomerDebt = async (debtId, debtData) => {
    try {
        const response = await client.patch(`/customer-debts/${debtId}/`, debtData)
        return response.data
    } catch (error) {
        console.error(`Error updating customer debt ${debtId}:`, error)
        throw error
    }
}

export const fetchCustomerMeetings = async (customerId) => {
    try {
        const response = await client.get(`/customer-filter-meetings/${customerId}/`)
        return response.data
    } catch (error) {
        console.error(`Error fetching meetings for customer ${customerId}:`, error)
        throw error
    }
}

const apiCustomerDebts = {
    fetchCustomerDebtSummary,
    fetchCustomerDebtStats,
    createCustomerDebt,
    updateCustomerDebt,
    fetchCustomerMeetings, // Added to exports
}

export default apiCustomerDebts
