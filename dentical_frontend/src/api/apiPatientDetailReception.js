import apiService from "./apiService"

const apiPatientDetailReception = {
    // Fetch patient appointments with pagination
    fetchPatientAppointments: async (patientId, page = 1, pageSize = 10) => {
        try {
            const response = await apiService.get(`/meetings/?customer_id=${patientId}&page=${page}&page_size=${pageSize}`)
            return response.data
        } catch (error) {
            console.error("Error fetching patient appointments:", error)
            throw error
        }
    },

    // Fetch a single appointment by ID
    fetchAppointmentById: async (appointmentId) => {
        try {
            const response = await apiService.get(`/meetings/${appointmentId}/`)
            return response.data
        } catch (error) {
            console.error("Error fetching appointment details:", error)
            throw error
        }
    },

    // Export appointment as PDF
    exportAppointmentAsPDF: async (appointmentId) => {
        try {
            const response = await apiService.get(`/meetings/${appointmentId}/export/pdf/`, {
                responseType: "blob",
            })
            return response.data
        } catch (error) {
            console.error("Error exporting appointment as PDF:", error)
            throw error
        }
    },

    // Export appointment as Excel
    exportAppointmentAsExcel: async (appointmentId) => {
        try {
            const response = await apiService.get(`/meetings/${appointmentId}/export/excel/`, {
                responseType: "blob",
            })
            return response.data
        } catch (error) {
            console.error("Error exporting appointment as Excel:", error)
            throw error
        }
    },
}

export default apiPatientDetailReception
