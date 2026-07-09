import client from "./apiService"

const CUSTOMERS_ENDPOINT = "/customers/"

// Get all customers with pagination, search, and branch filtering
const fetchPatients = async (page = 1, limit = 10, search = "", branchId = null) => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams()

    // Add pagination params
    queryParams.append("page", page)
    queryParams.append("page_size", limit)

    // Add search if provided
    if (search) {
      queryParams.append("search", search)
    }

    // Add branch filter if provided and not "all"
    if (branchId && branchId !== "all") {
      queryParams.append("branch_id", branchId)
    }

    const response = await client.get(`${CUSTOMERS_ENDPOINT}?${queryParams.toString()}`)
    return response.data
  } catch (error) {
    console.error("Error fetching customers:", error)
    throw error
  }
}

// Get a single customer by ID
const fetchPatientById = async (patientId) => {
  try {
    const response = await client.get(`${CUSTOMERS_ENDPOINT}${patientId}/`)
    return response.data
  } catch (error) {
    console.error(`Error fetching customer with ID ${patientId}:`, error)
    throw error
  }
}

// Create a new customer
const createPatient = async (patientData) => {
  try {
    const response = await client.post(CUSTOMERS_ENDPOINT, patientData)
    return response.data
  } catch (error) {
    console.error("Error creating customer:", error)
    throw error
  }
}

// Update an existing customer
const updatePatient = async (patientId, patientData) => {
  try {
    const response = await client.patch(`${CUSTOMERS_ENDPOINT}${patientId}/`, patientData)
    return response.data
  } catch (error) {
    console.error(`Error updating customer with ID ${patientId}:`, error)
    throw error
  }
}

// Delete a customer
const deletePatient = async (patientId) => {
  try {
    await client.delete(`${CUSTOMERS_ENDPOINT}${patientId}/`)
    return true
  } catch (error) {
    console.error(`Error deleting customer with ID ${patientId}:`, error)
    throw error
  }
}

// Export patients data to PDF
const exportToPDF = async () => {
  try {
   

    // Make GET request to export PDF endpoint
    const response = await client.get(`${CUSTOMERS_ENDPOINT}export/pdf/`, {
      responseType: "blob", // Important for handling binary data
    })

    // Return the blob data
    return response.data
  } catch (error) {
    console.error("Error exporting PDF:", error)
    throw error
  }
}

// Export patients data to Excel
const exportToExcel = async () => {
  try {
    
    // Make GET request to export Excel endpoint
    const response = await client.get(`${CUSTOMERS_ENDPOINT}export/excel/`, {
      responseType: "blob", // Important for handling binary data
    })

    // Return the blob data
    return response.data
  } catch (error) {
    console.error("Error exporting Excel:", error)
    throw error
  }
}

// Export all functions
const apiPatients = {
  fetchPatients,
  fetchPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  exportToPDF,
  exportToExcel,
}

export default apiPatients
