import client, { BaseUrl } from "./apiService"

class ApiSettings {
    // Clinic (General) Settings
    async fetchClinicSettings() {
        const clinicsEndpoint = `${BaseUrl}/clinics/`

        try {
            const response = await client.get(clinicsEndpoint)
            return response.data.results[0] // Return the first clinic from results
        } catch (error) {
            console.error("Klinika ma'lumotlarini olishda xatolik:", error)
            throw error
        }
    }

    async updateClinicSettings(clinicId, clinicData) {
        const clinicEndpoint = `${BaseUrl}/clinics/${clinicId}/`

        try {
            const response = await client.patch(clinicEndpoint, clinicData)
            return response.data
        } catch (error) {
            console.error(`Klinika ma'lumotlarini yangilashda xatolik:`, error)
            throw error
        }
    }

    // Branch Settings
    async fetchBranches() {
        const branchesEndpoint = `${BaseUrl}/branches/`

        try {
            const response = await client.get(branchesEndpoint)
            return response.data
        } catch (error) {
            console.error("Filiallarni olishda xatolik:", error)
            throw error
        }
    }

    async fetchBranchById(branchId) {
        const branchEndpoint = `${BaseUrl}/branches/${branchId}/`

        try {
            const response = await client.get(branchEndpoint)
            return response.data
        } catch (error) {
            console.error(`${branchId} ID li filialni olishda xatolik:`, error)
            throw error
        }
    }

    async createBranch(branchData) {
        const branchesEndpoint = `${BaseUrl}/branches/`

        try {
            const response = await client.post(branchesEndpoint, branchData)
            return response.data
        } catch (error) {
            console.error(`Yangi filial yaratishda xatolik:`, error)
            throw error
        }
    }

    async updateBranch(branchId, branchData) {
        const branchEndpoint = `${BaseUrl}/branches/${branchId}/`

        try {
            const response = await client.patch(branchEndpoint, branchData)
            return response.data
        } catch (error) {
            console.error(`${branchId} ID li filialni yangilashda xatolik:`, error)
            throw error
        }
    }

    async deleteBranch(branchId) {
        const branchEndpoint = `${BaseUrl}/branches/${branchId}/`

        try {
            const response = await client.delete(branchEndpoint)
            return response.data
        } catch (error) {
            console.error(`${branchId} ID li filialni o'chirishda xatolik:`, error)
            throw error
        }
    }
}

const settingsApi = new ApiSettings()
export default settingsApi
