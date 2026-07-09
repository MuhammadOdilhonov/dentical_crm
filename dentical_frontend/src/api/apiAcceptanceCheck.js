import client from "./apiService"

// Qabulni tekshirish uchun API
export const checkAppointmentAccess = async (meetingId, patientId) => {
    try {
        const response = await client.get(`/meeting-public/${meetingId}/${patientId}/`)
        return {
            success: true,
            data: response.data,
        }
    } catch (error) {
        console.error("Qabul tekshirishda xatolik:", error)
        return {
            success: false,
            error: error.response?.data?.message || "Qabul ma'lumotlarini olishda xatolik yuz berdi",
        }
    }
}

// Qabulga kirish uchun API
export const enterAppointment = async (meetingId, patientId) => {
    try {
        const response = await client.post(`/meeting-public/${meetingId}/${patientId}/enter/`)
        return {
            success: true,
            data: response.data,
        }
    } catch (error) {
        console.error("Qabulga kirishda xatolik:", error)
        return {
            success: false,
            error: error.response?.data?.message || "Qabulga kirishda xatolik yuz berdi",
        }
    }
}

// Qabul holatini yangilash
export const updateAppointmentStatus = async (meetingId, status) => {
    try {
        const response = await client.patch(`/meeting-public/${meetingId}/status/`, {
            status: status,
        })
        return {
            success: true,
            data: response.data,
        }
    } catch (error) {
        console.error("Qabul holatini yangilashda xatolik:", error)
        return {
            success: false,
            error: error.response?.data?.message || "Qabul holatini yangilashda xatolik yuz berdi",
        }
    }
}
