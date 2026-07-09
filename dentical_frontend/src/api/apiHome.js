import apiService from "./apiService"

const apiHome = {
    // Send contact request to the server
    sendContactRequest: async (contactData) => {
        try {
            const response = await apiService.post("/contact-requests/", contactData)
            return response.data
        } catch (error) {
            console.error("Error sending contact request:", error)
            throw error
        }
    },
}

export default apiHome
