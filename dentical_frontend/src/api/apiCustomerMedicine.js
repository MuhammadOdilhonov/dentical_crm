import client from "./apiService"

const CUSTOMER_MEDICINE_ENDPOINT = "/customer-medicine/"

// Get customer medicine purchases with pagination
const fetchCustomerMedicine = async (customerId, page = 1, pageSize = 10) => {
    try {
        const response = await client.get(`${CUSTOMER_MEDICINE_ENDPOINT}${customerId}/?page=${page}&page_size=${pageSize}`)
        return response.data
    } catch (error) {
        console.error(`Error fetching medicine for customer ${customerId}:`, error)
        throw error
    }
}

// Get medicine details by ID
const fetchMedicineById = async (medicineId) => {
    try {
        const response = await client.get(`/medicines/${medicineId}/`)
        return response.data
    } catch (error) {
        console.error(`Error fetching medicine with ID ${medicineId}:`, error)
        throw error
    }
}

const apiCustomerMedicine = {
    fetchCustomerMedicine,
    fetchMedicineById,
}

export default apiCustomerMedicine
