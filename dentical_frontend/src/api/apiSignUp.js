import client, { BaseUrl } from "./apiService"

// Ro'yxatdan o'tish uchun API funksiyasi
class ApiSignUp {
    async registerUser(userData) {
        const signUpEndpoint = `${BaseUrl}/signup/`

        try {
            const apiData = {
                clinic_name: userData.clinicName,
                clinic_phone: userData.phone,
                clinic_license: userData.license,
                user_email: userData.email,
            }

            const response = await client.post(signUpEndpoint, apiData)
            return response.data
        } catch (error) {
            console.error("Registration error:", error)
            throw error
        }
    }
}

const signUpApi = new ApiSignUp()
export default signUpApi
