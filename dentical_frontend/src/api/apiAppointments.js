import client from "./apiService"

// Qabullarni olish
export const fetchAppointments = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams()

        // Parametrlarni qo'shish
        Object.keys(params).forEach((key) => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
                queryParams.append(key, params[key])
            }
        })

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
        const response = await client.get(`/meetings/${queryString}`)
        return response.data
    } catch (error) {
        console.error("Qabullarni olishda xatolik:", error)
        throw error
    }
}

// Bitta qabulni ID bo'yicha olish
export const fetchAppointmentById = async (id) => {
    try {
        const response = await client.get(`/meetings/${id}/`)
        return response.data
    } catch (error) {
        console.error("Qabulni olishda xatolik:", error)
        throw error
    }
}

// Filtrlar uchun ma'lumotlarni olish (bemorlar, shifokorlar, xonalar)
export const fetchFilterData = async (branchId) => {
    try {
        const response = await client.get(`/meetings-filter/?branch_id=${branchId}`)
        return response.data
    } catch (error) {
        console.error("Filtr ma'lumotlarini olishda xatolik:", error)
        throw error
    }
}

// Band vaqtlarni olish
export const fetchBusyTimes = async (params) => {
    try {
        const { branchId, doctorId, cabinetId, date } = params
        const queryParams = new URLSearchParams()

        if (branchId) queryParams.append("branch_id", branchId)
        if (doctorId) queryParams.append("doctor", doctorId)
        if (cabinetId) queryParams.append("cabinet_id", cabinetId)
        if (date) queryParams.append("date", date)

        const queryString = queryParams.toString()
        const response = await client.get(`/meetings-filter/?${queryString}`)
        return response.data.busy_times || []
    } catch (error) {
        console.error("Band vaqtlarni olishda xatolik:", error)
        return []
    }
}

// Yangi qabul yaratish
export const createAppointment = async (appointmentData) => {
    try {
        const response = await client.post("/meetings/", appointmentData)
        return response.data
    } catch (error) {
        console.error("Qabul yaratishda xatolik:", error)
        throw error
    }
}

// Qabulni yangilash
export const updateAppointment = async (id, appointmentData) => {
    try {
        const response = await client.patch(`/meetings/${id}/`, appointmentData)
        return response.data
    } catch (error) {
        console.error("Qabulni yangilashda xatolik:", error)
        throw error
    }
}

// Qabul holatini yangilash
export const updateAppointmentStatus = async (id, status) => {
    try {
        const response = await client.patch(`/meetings/${id}/`, { status })
        return response.data
    } catch (error) {
        console.error("Qabul holatini yangilashda xatolik:", error)
        throw error
    }
}

// Qabulni o'chirish
export const deleteAppointment = async (id) => {
    try {
        const response = await client.delete(`/meetings/${id}/`)
        return response.data
    } catch (error) {
        console.error("Qabulni o'chirishda xatolik:", error)
        throw error
    }
}

// Kunlik qabullarni olish
export const fetchDailyMeetings = async (date) => {
    try {
        const response = await client.get(`/meetings/daily_meetings/?date=${date}`)
        return response.data
    } catch (error) {
        console.error("Kunlik qabullarni olishda xatolik:", error)
        throw error
    }
}

// Haftalik qabullarni olish
export const fetchWeeklyMeetings = async (date) => {
    try {
        const response = await client.get(`/meetings/weekly_meetings/?date=${date}`)
        return response.data
    } catch (error) {
        console.error("Haftalik qabullarni olishda xatolik:", error)
        throw error
    }
}

// Qabulni tashxis va organlar ma'lumotlari bilan yangilash
export const updateAppointmentWithDiagnosis = async (appointmentId, data) => {
    try {
        if (data instanceof FormData) {
            const response = await client.patch(`/meetings/${appointmentId}/`, data, {
                headers: {
                    "Content-Type": undefined,
                },
            })
            return response.data
        } else {
            const response = await client.patch(`/meetings/${appointmentId}/`, data)
            return response.data
        }
    } catch (error) {
        console.error("Error updating appointment with diagnosis:", error)
        throw error
    }
}

// Stomatologik xizmat kategoriyalarini olish
export const fetchDentalServiceCategories = async () => {
    try {
        const response = await client.get("/dental-service-categories/")
        return response.data
    } catch (error) {
        console.error("Error fetching dental service categories:", error)
        return []
    }
}

// Stomatologik xizmatlarni olish
export const fetchDentalServices = async (categoryId, teethNumber) => {
    try {
        let url = "/dental-services/"
        const queryParams = new URLSearchParams()

        if (categoryId) queryParams.append("category", categoryId)
        if (teethNumber) queryParams.append("teeth_number", teethNumber)

        if (queryParams.toString()) {
            url += "?" + queryParams.toString()
        }

        const response = await client.get(url)
        return response.data
    } catch (error) {
        console.error("Error fetching dental services:", error)
        return []
    }
}

// Qabul talonini olish
export const fetchAppointmentTalon = async (id) => {
    try {
        const response = await client.get(`/meetings/${id}/talon/`)
        return response.data
    } catch (error) {
        console.error("Qabul talonini olishda xatolik:", error)
        throw error
    }
}

// Band vaqtlarni tekshirish
export const checkAvailableTimes = async (params) => {
    try {
        const { branchId, doctorId, cabinetId, date } = params
        const queryParams = new URLSearchParams()

        if (branchId) queryParams.append("branch_id", branchId)
        if (doctorId) queryParams.append("doctor", doctorId)
        if (cabinetId) queryParams.append("cabinet_id", cabinetId)
        if (date) queryParams.append("date", date)

        const queryString = queryParams.toString()
        const response = await client.get(`/meetings-filter/?${queryString}`)
        return response.data.busy_times || []
    } catch (error) {
        console.error("Band vaqtlarni tekshirishda xatolik:", error)
        return []
    }
}

// PDF eksport qilish
export const exportAppointmentPDF = async (id) => {
    try {
        const response = await client.get(`/meetings/${id}/export/pdf/`, {
            responseType: "blob",
        })
        return response.data
    } catch (error) {
        console.error("PDF eksport qilishda xatolik:", error)
        throw error
    }
}

// Printer holatini tekshirish
export const checkPrinterStatus = async () => {
    try {
        return new Promise((resolve) => {
            setTimeout(() => {
                const isAvailable = Math.random() > 0.3
                resolve(isAvailable)
            }, 500)
        })
    } catch (error) {
        console.error("Printer holatini tekshirishda xatolik:", error)
        return false
    }
}

// Hujjatni chiqarish
export const printDocument = async (content, type = "ticket") => {
    try {
        const printerAvailable = await checkPrinterStatus()

        if (!printerAvailable) {
            throw new Error("Siz printerni ulamadingiz")
        }

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const success = Math.random() > 0.1
                if (success) {
                    resolve({ success: true, message: `${type} muvaffaqiyatli chiqarildi` })
                } else {
                    reject(new Error("Chiqarishda xatolik yuz berdi"))
                }
            }, 2000)
        })
    } catch (error) {
        console.error("Chiqarishda xatolik:", error)
        throw error
    }
}

// Bemor keldi deb belgilash — kechikish backend'da avtomatik hisoblanadi
export const markPatientArrived = async (meetingId) => {
    try {
        const response = await client.post(`/meetings/${meetingId}/arrive/`)
        return response.data
    } catch (error) {
        console.error("Error marking patient arrived:", error)
        throw error
    }
}

const appointmentsApi = {
    fetchAppointments,
    fetchAppointmentById,
    markPatientArrived,
    fetchFilterData,
    fetchBusyTimes,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    fetchDailyMeetings,
    fetchWeeklyMeetings,
    updateAppointmentWithDiagnosis,
    fetchDentalServiceCategories,
    fetchDentalServices,
    fetchAppointmentTalon,
    checkAvailableTimes,
    exportAppointmentPDF,
    checkPrinterStatus,
    printDocument,
}

export default appointmentsApi
