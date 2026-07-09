import client from "./apiService"

/**
 * Get dashboard metrics (customers, doctors, cabinets, meetings)
 * @param {string} filialId - The filial ID or "all" for all filials
 * @returns {Promise} - Promise with dashboard metrics data
 */
export const getDashboardMetrics = async (filialId) => {
    try {
        const response = await client.get(`/filial/${filialId}/dashboard/metrics/`)
        return response.data
    } catch (error) {
        console.error("Error fetching dashboard metrics:", error)
        throw error
    }
}

/**
 * Get monthly customer trend data
 * @param {string} filialId - The filial ID or "all" for all filials
 * @returns {Promise} - Promise with monthly customer trend data
 */
export const getMonthlyCustomerTrend = async (filialId) => {
    try {
        const response = await client.get(`/filial/${filialId}/dashboard/monthly-customer-trend/`)
        return response.data
    } catch (error) {
        console.error("Error fetching monthly customer trend:", error)
        throw error
    }
}

/**
 * Get patient distribution by gender
 * @param {string} filialId - The filial ID or "all" for all filials
 * @returns {Promise} - Promise with patient distribution data
 */
export const getPatientDistribution = async (filialId) => {
    try {
        const response = await client.get(`/filial/${filialId}/dashboard/patient-distribution/`)
        return response.data
    } catch (error) {
        console.error("Error fetching patient distribution:", error)
        throw error
    }
}

/**
 * Get weekly appointments data
 * @param {string} filialId - The filial ID or "all" for all filials
 * @returns {Promise} - Promise with weekly appointments data
 */
export const getWeeklyAppointments = async (filialId) => {
    try {
        const response = await client.get(`/filial/${filialId}/dashboard/weekly-appointments/`)
        return response.data
    } catch (error) {
        console.error("Error fetching weekly appointments:", error)
        throw error
    }
}

/**
 * Get cabinet utilization data
 * @param {string} filialId - The filial ID or "all" for all filials
 * @returns {Promise} - Promise with cabinet utilization data
 */
export const getCabinetUtilization = async (filialId) => {
    try {
        const response = await client.get(`/filial/${filialId}/dashboard/cabinet-utilization/`)
        return response.data
    } catch (error) {
        console.error("Error fetching cabinet utilization:", error)
        throw error
    }
}

/**
 * Get pending tasks
 * @param {string} filialId - The filial ID or "all" for all filials
 * @returns {Promise} - Promise with pending tasks data
 */
export const getPendingTasks = async (filialId) => {
    try {
        const response = await client.get(`/filial/${filialId}/dashboard/pending-tasks/`)
        return response.data
    } catch (error) {
        console.error("Error fetching pending tasks:", error)
        throw error
    }
}

/**
 * Get recent patients
 * @param {string} filialId - The filial ID or "all" for all filials
 * @returns {Promise} - Promise with recent patients data
 */
export const getRecentPatients = async (filialId) => {
    try {
        const response = await client.get(`/filial/${filialId}/dashboard/recent-patients/`)
        return response.data
    } catch (error) {
        console.error("Error fetching recent patients:", error)
        throw error
    }
}

/**
 * Get all admin dashboard data
 * @param {string} filialId - The filial ID or "all" for all filials
 * @returns {Promise} - Promise with all dashboard data
 */
export const getAllAdminDashboardData = async (filialId) => {
    try {
        const [
            dashboardMetrics,
            monthlyCustomerTrend,
            patientDistribution,
            weeklyAppointments,
            cabinetUtilization,
            pendingTasks,
            recentPatients,
        ] = await Promise.all([
            getDashboardMetrics(filialId),
            getMonthlyCustomerTrend(filialId),
            getPatientDistribution(filialId),
            getWeeklyAppointments(filialId),
            getCabinetUtilization(filialId),
            getPendingTasks(filialId),
            getRecentPatients(filialId),
        ])

        return {
            dashboardMetrics,
            monthlyCustomerTrend,
            patientDistribution,
            weeklyAppointments,
            cabinetUtilization,
            pendingTasks,
            recentPatients,
        }
    } catch (error) {
        console.error("Error fetching all admin dashboard data:", error)
        throw error
    }
}
