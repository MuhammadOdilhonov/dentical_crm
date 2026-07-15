import client from "./apiService"

// SuperAdmin paneli uchun API funksiyalari (backend: /api/admin/...)
const apiSuperAdmin = {
    // ===== Dashboard =====
    fetchDashboard: async () => {
        const response = await client.get("/admin/dashboard/")
        return response.data
    },

    // ===== Klinikalar =====
    fetchClinics: async (page = 1) => {
        const response = await client.get(`/admin/clinics/?page=${page}`)
        return response.data
    },

    createClinic: async (data) => {
        // Logo fayli bo'lishi mumkinligi uchun multipart/form-data yuboriladi
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                formData.append(key, value)
            }
        })
        const response = await client.post("/admin/clinics/create/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        return response.data
    },

    fetchClinicDetail: async (clinicId) => {
        const response = await client.get(`/admin/clinics/${clinicId}/`)
        return response.data
    },

    updateClinic: async (clinicId, data) => {
        const response = await client.patch(`/admin/clinics/${clinicId}/`, data)
        return response.data
    },

    deleteClinic: async (clinicId) => {
        const response = await client.delete(`/admin/clinics/${clinicId}/`)
        return response.data
    },

    notifyClinic: async (clinicId, { title, message }) => {
        const response = await client.post(`/admin/clinics/${clinicId}/notify/`, { title, message })
        return response.data
    },

    fetchClinicBranches: async (clinicId) => {
        const response = await client.get(`/admin/clinics/${clinicId}/branches/`)
        return response.data
    },

    fetchClinicFinancial: async (clinicId) => {
        const response = await client.get(`/admin/clinics/${clinicId}/financial/`)
        return response.data
    },

    fetchClinicSubscriptionHistory: async (clinicId, page = 1) => {
        const response = await client.get(`/admin/clinic/${clinicId}/subscription-history/?page=${page}`)
        return response.data
    },

    fetchClinicSelectList: async (search = "") => {
        const response = await client.get(`/admin/clinics/select/?search=${encodeURIComponent(search)}`)
        return response.data
    },

    // ===== Tariflar (Subscription Plans) =====
    fetchPlans: async () => {
        const response = await client.get("/admin/subscription-plans/")
        return response.data
    },

    createPlan: async (data) => {
        const response = await client.post("/admin/subscription-plans/", data)
        return response.data
    },

    updatePlan: async (planId, data) => {
        const response = await client.patch(`/admin/subscription-plans/${planId}/`, data)
        return response.data
    },

    deletePlan: async (planId) => {
        const response = await client.delete(`/admin/subscription-plans/${planId}/`)
        return response.data
    },

    fetchPlanSelectList: async (search = "") => {
        const response = await client.get(`/admin/subscription-plan/select/?search=${encodeURIComponent(search)}`)
        return response.data
    },

    // ===== Obunalar (Clinic Subscriptions) =====
    fetchSubscriptions: async (page = 1) => {
        const response = await client.get(`/admin/clinic-subscriptions/?page=${page}`)
        return response.data
    },

    createSubscription: async (data) => {
        const response = await client.post("/admin/clinic-subscriptions/", data)
        return response.data
    },

    updateSubscription: async (subId, data) => {
        const response = await client.patch(`/admin/clinic-subscriptions/${subId}/`, data)
        return response.data
    },

    deleteSubscription: async (subId) => {
        const response = await client.delete(`/admin/clinic-subscriptions/${subId}/`)
        return response.data
    },

    // ===== Lidlar (Targets) =====
    fetchTargets: async ({ page = 1, status = "", search = "" } = {}) => {
        let url = `/admin/targets/?page=${page}`
        if (status) url += `&status=${status}`
        if (search) url += `&search=${encodeURIComponent(search)}`
        const response = await client.get(url)
        return response.data
    },

    updateTarget: async (targetId, data) => {
        const response = await client.patch(`/admin/targets/${targetId}/`, data)
        return response.data
    },

    deleteTarget: async (targetId) => {
        const response = await client.delete(`/admin/targets/${targetId}/`)
        return response.data
    },

    fetchTargetStats: async () => {
        const response = await client.get("/admin/target/stats/")
        return response.data
    },
}

export default apiSuperAdmin
