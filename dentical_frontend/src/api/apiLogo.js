import client, { BaseUrl } from "./apiService"

class ApiLogo {
    async fetchLogo() {
        const logoEndpoint = `${BaseUrl}/clinic/logo/`

        try {
            const response = await client.get(logoEndpoint)
            return response.data // Masalan: { logo: "/media/logo.png" }
        } catch (error) {
            console.error("Logo olishda xatolik:", error)
            throw error
        }
    }
}

export default new ApiLogo()
