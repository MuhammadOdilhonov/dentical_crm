import client from "./apiService"

// Doktor dashboardi uchun statistika ma'lumotlarini olish
export const getDashboardStats = async () => {
    try {
        const response = await client.get("/doctor/dashboard/")
        return response.data
    } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        throw error
    }
}

// Bugungi uchrashuvlarni olish
export const getTodayAppointments = async () => {
    try {
        const response = await client.get("/doctor/dashboard/todays-appointments/")
        return response.data
    } catch (error) {
        console.error("Error fetching today's appointments:", error)
        throw error
    }
}

// Bemorlar trendini olish
export const getPatientTrend = async () => {
    try {
        const response = await client.get("/doctor/dashboard/patient-trend/")
        return response.data
    } catch (error) {
        console.error("Error fetching patient trend:", error)
        throw error
    }
}

// Haftalik vazifalarni olish
export const getWeeklyTasks = async () => {
    try {
        const response = await client.get("/doctor/dashboard/weekly-tasks/")
        return response.data
    } catch (error) {
        console.error("Error fetching weekly tasks:", error)
        throw error
    }
}

// Oylik uchrashuvlar statusini olish
export const getMonthlyMeetingsStatus = async () => {
    try {
        const response = await client.get("/doctor/dashboard/monthly-meetings-status/")
        return response.data
    } catch (error) {
        console.error("Error fetching monthly meetings status:", error)
        throw error
    }
}

// Haftalik bemorlarni olish
export const getWeeklyCustomers = async () => {
    try {
        const response = await client.get("/doctor/dashboard/weekly-customers/")
        return response.data
    } catch (error) {
        console.error("Error fetching weekly customers:", error)
        throw error
    }
}
