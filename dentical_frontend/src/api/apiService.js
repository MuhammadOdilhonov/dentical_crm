import axios from "axios"

// export const BaseUrl = "https://cliniccrm.pythonanywhere.com/api" // To'g'ri URLni tekshiring
// export const BaseUrlImg = "https://cliniccrm.pythonanywhere.com"

// Lokal ishlatish uchun: http://127.0.0.1:8000/api , production: https://med-crm-service.uz/api
export const BaseUrl = "http://127.0.0.1:8000/api"
export const BaseUrlImg = "http://127.0.0.1:8000"

// Axios instance yaratish
const client = axios.create({
    baseURL: BaseUrl, // baseURL (kichik harflar bilan)
    baseURLIMG: BaseUrlImg,
    headers: {
        "Content-Type": "application/json", // JSON yuborish uchun zarur header
    },
})

// Interceptorlarni tozalash (agar avval qo'shilgan bo'lsa)
if (client.interceptors.request.handlers) {
    client.interceptors.request.handlers = []
}
if (client.interceptors.response.handlers) {
    client.interceptors.response.handlers = []
}

// Request interceptor - har bir so'rovga token qo'shish
client.interceptors.request.use(
    (config) => {
        console.log("REQUEST:", config.url, config.method)

        // Token mavjud bo'lsa, uni headerga qo'shish
        const token = localStorage.getItem("token")
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        console.error("REQUEST ERROR:", error)
        return Promise.reject(error)
    },
)

// Response interceptor - xatoliklarni ushlab olish
client.interceptors.response.use(
    (response) => {
        console.log("RESPONSE SUCCESS:", response.config.url, response.status)
        return response
    },
    (error) => {
        console.error("RESPONSE ERROR:", error.config?.url, error.response?.status)

        // 401 xatolik (unauthorized) bo'lsa, foydalanuvchini login sahifasiga yo'naltirish
        if (error.response && error.response.status === 401) {
            // Bu qatorni vaqtincha kommentga olamiz, chunki bu login sahifasida muammoga sabab bo'lishi mumkin
            // window.location.href = "/login";

            // Faqat token va user ma'lumotlarini o'chiramiz
            localStorage.removeItem("token")
            localStorage.removeItem("user")
        }
        return Promise.reject(error)
    },
)

export default client;