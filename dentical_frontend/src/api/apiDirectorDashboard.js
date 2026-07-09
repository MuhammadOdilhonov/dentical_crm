import client from "./apiService"

/**
 * Get financial metrics for a branch
 * @param {string} branchId - The branch ID
 * @returns {Promise} - Promise with financial metrics data
 */
export const getFinancialMetrics = async (branchId) => {
    try {
        const response = await client.get(`/filial/${branchId}/dashboard/financial-metrics/`)
        return response.data
    } catch (error) {
        console.error("Error fetching financial metrics:", error)
        throw error
    }
}

/**
 * Get doctor efficiency data for a branch
 * @param {string} branchId - The branch ID
 * @returns {Promise} - Promise with doctor efficiency data
 */
export const getDoctorEfficiency = async (branchId) => {
    try {
        const response = await client.get(`/filial/${branchId}/dashboard/doctor-efficiency/`)
        return response.data
    } catch (error) {
        console.error("Error fetching doctor efficiency:", error)
        throw error
    }
}

/**
 * Get customers by department for a branch
 * @param {string} branchId - The branch ID
 * @returns {Promise} - Promise with customers by department data
 */
export const getCustomersByDepartment = async (branchId) => {
    try {
        const response = await client.get(`/filial/${branchId}/dashboard/customers-by-department/`)
        return response.data
    } catch (error) {
        console.error("Error fetching customers by department:", error)
        throw error
    }
}

/**
 * Get monthly customer dynamics for a branch
 * @param {string} branchId - The branch ID
 * @returns {Promise} - Promise with monthly customer dynamics data
 */
export const getMonthlyCustomerDynamics = async (branchId) => {
    try {
        const response = await client.get(`/filial/${branchId}/dashboard/monthly-customer-dynamics/`)
        return response.data
    } catch (error) {
        console.error("Error fetching monthly customer dynamics:", error)
        throw error
    }
}

/**
 * Get department efficiency for a branch
 * @param {string} branchId - The branch ID
 * @returns {Promise} - Promise with department efficiency data
 */
export const getDepartmentEfficiency = async (branchId) => {
    try {
        const response = await client.get(`/filial/${branchId}/dashboard/department-efficiency/`)
        return response.data
    } catch (error) {
        console.error("Error fetching department efficiency:", error)
        throw error
    }
}

/**
 * Get today's appointments for a branch
 * @param {string} branchId - The branch ID
 * @returns {Promise} - Promise with today's appointments data
 */
export const getTodaysAppointments = async (branchId) => {
    try {
        const response = await client.get(`/filial/${branchId}/dashboard/todays-appointments/`)
        return response.data
    } catch (error) {
        console.error("Error fetching today's appointments:", error)
        throw error
    }
}

/**
 * Get new staff data
 * @returns {Promise} - Promise with new staff data
 */
export const getNewStaff = async () => {
    try {
        const response = await client.get("/dashboard/new-staff/")
        return response.data
    } catch (error) {
        console.error("Error fetching new staff:", error)
        throw error
    }
}

/**
 * Get financial report for a branch
 * @param {string} branchId - The branch ID
 * @returns {Promise} - Promise with financial report data
 */
export const getFinancialReport = async (branchId) => {
    try {
        const response = await client.get(`/filial/${branchId}/financial-report/`)
        return response.data
    } catch (error) {
        console.error("Error fetching financial report:", error)
        throw error
    }
}

/**
 * Get patient statistics for a branch
 * @param {string} branchId - The branch ID
 * @returns {Promise} - Promise with patient statistics data
 */
export const getPatientStatistics = async (branchId) => {
    try {
        const response = await client.get(`/filial/${branchId}/patient-statistics/`)
        return response.data
    } catch (error) {
        console.error("Error fetching patient statistics:", error)
        throw error
    }
}

/**
 * Get doctor statistics for a branch
 * @param {string} branchId - The branch ID
 * @returns {Promise} - Promise with doctor statistics data
 */
export const getDoctorStatistics = async (branchId) => {
    try {
        const response = await client.get(`/filial/${branchId}/doctor-statistics/`)
        return response.data
    } catch (error) {
        console.error("Error fetching doctor statistics:", error)
        throw error
    }
}

/**
 * Get all dashboard data for a branch
 * @param {string} branchId - The branch ID
 * @returns {Promise} - Promise with all dashboard data
 */
export const getAllDashboardData = async (branchId) => {
    try {
        const [
            financialMetrics,
            doctorEfficiency,
            customersByDepartment,
            monthlyCustomerDynamics,
            departmentEfficiency,
            todaysAppointments,
            newStaff,
            financialReport,
            patientStatistics,
            doctorStatistics,
        ] = await Promise.all([
            getFinancialMetrics(branchId),
            getDoctorEfficiency(branchId),
            getCustomersByDepartment(branchId),
            getMonthlyCustomerDynamics(branchId),
            getDepartmentEfficiency(branchId),
            getTodaysAppointments(branchId),
            getNewStaff(),
            getFinancialReport(branchId),
            getPatientStatistics(branchId),
            getDoctorStatistics(branchId),
        ])

        return {
            financialMetrics,
            doctorEfficiency,
            customersByDepartment,
            monthlyCustomerDynamics,
            departmentEfficiency,
            todaysAppointments,
            newStaff,
            financialReport,
            patientStatistics,
            doctorStatistics,
        }
    } catch (error) {
        console.error("Error fetching all dashboard data:", error)
        throw error
    }
}
