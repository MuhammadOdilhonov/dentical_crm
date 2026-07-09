import client, { BaseUrl } from "./apiService"

// Tizimga kirish va chiqish uchun API funksiyalari
class ApiLogin {
    // Login funksiyasi - faqat bir marta chaqiriladi
    async loginUser(credentials) {
        const loginEndpoint = `${BaseUrl}/users/login/`

        try {
            console.log("Login request started with:", credentials.email)

            const apiData = {
                username: credentials.email,
                password: credentials.password,
            }

            // Faqat bir marta so'rov yuborish
            const response = await client.post(loginEndpoint, apiData)

            console.log("Login response received:", response.status)

            // Token va foydalanuvchi ma'lumotlarini saqlash
            if (response.data && response.data.token) {
                // Avval localStorage ni tozalash
                localStorage.removeItem("token")
                localStorage.removeItem("user")

                // Keyin yangi ma'lumotlarni saqlash
                localStorage.setItem("token", response.data.token)

                if (response.data.user) {
                    localStorage.setItem("user", JSON.stringify(response.data.user))
                }
            }

            return response.data
        } catch (error) {
            console.error("Login error:", error)
            throw error
        }
    }

    // Logout funksiyasi
    async logoutUser() {
        try {
            // Lokal ma'lumotlarni o'chirish
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            localStorage.removeItem("selectedBranch")

            return { success: true }
        } catch (error) {
            console.error("Logout error:", error)

            // Xatolik bo'lsa ham, lokal ma'lumotlarni o'chiramiz
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            localStorage.removeItem("selectedBranch")

            throw error
        }
    }
}

const loginApi = new ApiLogin()
export default loginApi
