import client from "./apiService"

class ApiServicePrices {
    // Xizmatlar summary ma'lumotlarini olish
    static async fetchServicePrices(page = 1, pageSize = 10) {
        try {
            const response = await client.get(`/dental-service/name-summary/?page=${page}&page_size=${pageSize}`)
            return response.data
        } catch (error) {
            console.error("Xizmat narxlarini olishda xatolik:", error)
            throw error
        }
    }

    // Xizmat nomi bo'yicha batafsil ma'lumotlarni olish (barcha tishlar)
    static async fetchServiceDetailsByName(serviceId) {
        try {
            const response = await client.get(`/dental-service/by-name/${serviceId}/`)
            return response.data
        } catch (error) {
            console.error("Xizmat tafsilotlarini olishda xatolik:", error)
            throw error
        }
    }

    // Yangi xizmat qo'shish (bitta tish uchun)
    static async createService(serviceData) {
        try {
            const response = await client.post("/dental-services/", serviceData)
            return response.data
        } catch (error) {
            console.error("Xizmat qo'shishda xatolik:", error)
            throw error
        }
    }

    // 32 ta tish uchun xizmat yaratish (bulk create)
    static async createBulkService(serviceData) {
        try {
            const response = await client.post("/dental-service/bulk-create/", serviceData)
            return response.data
        } catch (error) {
            console.error("Bulk xizmat qo'shishda xatolik:", error)
            throw error
        }
    }

    // Bitta tishning xizmatini yangilash
    static async updateSingleService(serviceId, serviceData) {
        try {
            const response = await client.put(`/dental-services/${serviceId}/`, serviceData)
            return response.data
        } catch (error) {
            console.error("Bitta tish xizmatini yangilashda xatolik:", error)
            throw error
        }
    }

    // Barcha tishlarning xizmatini yangilash (bulk update)
    static async updateBulkService(serviceId, serviceData) {
        try {
            const response = await client.patch(`/dental-service/bulk-update/${serviceId}/`, serviceData)
            return response.data
        } catch (error) {
            console.error("Bulk xizmatni yangilashda xatolik:", error)
            throw error
        }
    }

    // Bitta tishning xizmatini o'chirish
    static async deleteSingleService(serviceId) {
        try {
            const response = await client.delete(`/dental-services/${serviceId}/`)
            return response.data
        } catch (error) {
            console.error("Bitta tish xizmatini o'chirishda xatolik:", error)
            throw error
        }
    }

    // Barcha tishlarning xizmatini o'chirish (bulk delete)
    static async deleteBulkService(serviceId) {
        try {
            const response = await client.delete(`/dental-service/bulk-update/${serviceId}/`)
            return response.data
        } catch (error) {
            console.error("Bulk xizmatni o'chirishda xatolik:", error)
            throw error
        }
    }

    // Xizmat kategoriyalarini olish
    static async fetchServiceCategories() {
        try {
            const response = await client.get("/dental-service-categories/")
            return response.data
        } catch (error) {
            console.error("Xizmat kategoriyalarini olishda xatolik:", error)
            throw error
        }
    }

    // Yangi kategoriya qo'shish
    static async createCategory(categoryData) {
        try {
            const response = await client.post("/dental-service-categories/", categoryData)
            return response.data
        } catch (error) {
            console.error("Kategoriya qo'shishda xatolik:", error)
            throw error
        }
    }

    // Kategoriyani yangilash
    static async updateCategory(categoryId, categoryData) {
        try {
            const response = await client.put(`/dental-service-categories/${categoryId}/`, categoryData)
            return response.data
        } catch (error) {
            console.error("Kategoriyani yangilashda xatolik:", error)
            throw error
        }
    }

    // Kategoriyani o'chirish
    static async deleteCategory(categoryId) {
        try {
            const response = await client.delete(`/dental-service-categories/${categoryId}/`)
            return response.data
        } catch (error) {
            console.error("Kategoriyani o'chirishda xatolik:", error)
            throw error
        }
    }

    // Narx tarixini olish
    static async fetchPriceHistory(serviceId) {
        try {
            const response = await client.get(`/clinic/service-prices/${serviceId}/history/`)
            return response.data
        } catch (error) {
            console.error("Narx tarixini olishda xatolik:", error)
            throw error
        }
    }
}

export default ApiServicePrices
