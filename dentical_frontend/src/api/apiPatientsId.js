import client from "./apiService"

const CUSTOMERS_ENDPOINT = "/customers/"

// Get a single patient by ID
const fetchPatientById = async (patientId) => {
    try {
        const response = await client.get(`${CUSTOMERS_ENDPOINT}${patientId}/`)
        return response.data
    } catch (error) {
        console.error(`Error fetching patient with ID ${patientId}:`, error)
        throw error
    }
}

// Update an existing patient
const updatePatient = async (patientId, patientData) => {
    try {
        const response = await client.patch(`${CUSTOMERS_ENDPOINT}${patientId}/`, patientData)
        return response.data
    } catch (error) {
        console.error(`Error updating patient with ID ${patientId}:`, error)
        throw error
    }
}

// Export patient data as PDF
// exportPatientAsPDF - PDF faylni yuklab olish
const exportPatientAsPDF = async (patientId) => {
    try {
        const response = await client.get(`${CUSTOMERS_ENDPOINT}${patientId}/export/pdf/`, {
            responseType: "blob", // Fayl blob formatida bo'ladi
        })

        // Faylni yaratish va avtomatik yuklab olish
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const a = document.createElement("a")
        a.href = url
        a.download = `customer_${patientId}.pdf` // Fayl nomi
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url) // URLni tozalash
    } catch (error) {
        console.error(`Error exporting patient with ID ${patientId} as PDF:`, error)
        throw error
    }
}


// Export patient data as Excel
const exportPatientAsExcel = async (patientId) => {
    try {
        const response = await client.get(`${CUSTOMERS_ENDPOINT}${patientId}/export/excel/`, {
            responseType: "blob", // Excel fayl blob shaklida bo'ladi
        })

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const a = document.createElement("a")
        a.href = url
        a.download = `customer_${patientId}.xlsx` // Excel fayl nomi va kengaytmasi
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url) // URLni tozalash
    } catch (error) {
        console.error(`Error exporting patient with ID ${patientId} as Excel:`, error)
        throw error
    }
}

// Export all functions
const apiPatientId = {
    fetchPatientById,
    updatePatient,
    exportPatientAsPDF,
    exportPatientAsExcel,
}

export default apiPatientId
