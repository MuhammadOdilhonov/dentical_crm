import client from "./apiService"

// API endpoints
const SCHEDULES_ENDPOINT = "/user-schedules/"

// Get user schedules
const fetchUserSchedules = async (userId) => {
    try {
        const response = await client.get(`${SCHEDULES_ENDPOINT}?user_id=${userId}`)
        return response.data
    } catch (error) {
        console.error(`Error fetching schedules for user ${userId}:`, error)
        throw error
    }
}

// Update schedule status (toggle working/not working)
const updateScheduleStatus = async (scheduleId, isWorking) => {
    try {
        // Ensure isWorking is sent as a boolean
        const response = await client.patch(`${SCHEDULES_ENDPOINT}${scheduleId}/`, {
            is_working: Boolean(isWorking),
        })
        return response.data
    } catch (error) {
        console.error(`Error updating schedule status for ID ${scheduleId}:`, error)
        throw error
    }
}

// Update full schedule
const updateSchedule = async (scheduleId, scheduleData) => {
    try {
        // Ensure is_working is sent as a boolean if it exists in the data
        const dataToSend = {
            ...scheduleData,
            is_working: scheduleData.is_working !== undefined ? Boolean(scheduleData.is_working) : undefined,
        }

        const response = await client.patch(`${SCHEDULES_ENDPOINT}${scheduleId}/`, dataToSend)
        return response.data
    } catch (error) {
        console.error(`Error updating schedule for ID ${scheduleId}:`, error)
        throw error
    }
}

// Create new schedule
const createSchedule = async (scheduleData) => {
    try {
        // Ensure is_working is sent as a boolean if it exists in the data
        const dataToSend = {
            ...scheduleData,
            is_working: scheduleData.is_working !== undefined ? Boolean(scheduleData.is_working) : true,
        }

        const response = await client.post(SCHEDULES_ENDPOINT, dataToSend)
        return response.data
    } catch (error) {
        console.error("Error creating schedule:", error)
        throw error
    }
}

// Delete schedule
const deleteSchedule = async (scheduleId) => {
    try {
        await client.delete(`${SCHEDULES_ENDPOINT}${scheduleId}/`)
        return true
    } catch (error) {
        console.error(`Error deleting schedule with ID ${scheduleId}:`, error)
        throw error
    }
}

// Export all functions
const apiSchedules = {
    fetchUserSchedules,
    updateScheduleStatus,
    updateSchedule,
    createSchedule,
    deleteSchedule,
}

export default apiSchedules
