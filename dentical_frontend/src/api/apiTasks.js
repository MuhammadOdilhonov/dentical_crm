import client from "./apiService"

// API endpoints
const TASKS_ENDPOINT = "/tasks/"
const DAILY_TASKS_ENDPOINT = "/tasks/daily_tasks/"
const WEEKLY_TASKS_ENDPOINT = "/tasks/weekly_tasks/"
const MONTHLY_TASKS_ENDPOINT = "/tasks/monthly_tasks/"
const YEARLY_TASKS_ENDPOINT = "/tasks/yearly_tasks/"

// Get all tasks with optional pagination and filtering
const fetchTasks = async (page = 1, limit = 10, filters = {}) => {
    try {
        // Build query parameters
        const queryParams = new URLSearchParams()

        // Ensure page is at least 1
        const validPage = Math.max(1, page)

        // Add pagination params
        queryParams.append("page", validPage)
        queryParams.append("page_size", limit)

        // Add filters if provided
        if (filters.status && filters.status !== "all") {
            queryParams.append("status", filters.status)
        }

        if (filters.priority && filters.priority !== "all") {
            queryParams.append("priority", filters.priority)
        }

        if (filters.assignee && filters.assignee !== "all") {
            queryParams.append("assignee", filters.assignee)
        }

        if (filters.branch && filters.branch !== "all") {
            queryParams.append("branch_id", filters.branch)
        }

        if (filters.search) {
            queryParams.append("search", filters.search)
        }

        const response = await client.get(`${TASKS_ENDPOINT}?${queryParams.toString()}`)
        return response.data
    } catch (error) {
        console.error("Error fetching tasks:", error)
        throw error
    }
}

// Get a single task by ID
const fetchTaskById = async (taskId) => {
    try {
        const response = await client.get(`${TASKS_ENDPOINT}${taskId}/`)
        return response.data
    } catch (error) {
        console.error(`Error fetching task with ID ${taskId}:`, error)
        throw error
    }
}

// Create a new task
const createTask = async (taskData) => {
    try {
        // Format the data for the API
        const formattedData = {
            title: taskData.title,
            description: taskData.description,
            start_date: formatDateForAPI(taskData.startDate),
            start_time: formatTimeForAPI(taskData.startDate),
            end_date: formatDateForAPI(taskData.endDate),
            end_time: formatTimeForAPI(taskData.endDate),
            status: taskData.status || "pending",
            priority: taskData.priority || "medium",
            assignee: taskData.assignee?.id || taskData.assignee,
        }

        const response = await client.post(TASKS_ENDPOINT, formattedData)
        return response.data
    } catch (error) {
        console.error("Error creating task:", error)
        throw error
    }
}

// Update an existing task
const updateTask = async (taskId, taskData) => {
    try {
        // Format the data for the API
        const formattedData = {
            title: taskData.title,
            description: taskData.description,
            start_date: formatDateForAPI(taskData.startDate),
            start_time: formatTimeForAPI(taskData.startDate),
            end_date: formatDateForAPI(taskData.endDate),
            end_time: formatTimeForAPI(taskData.endDate),
            status: taskData.status,
            priority: taskData.priority,
            assignee: taskData.assignee?.id || taskData.assignee,
        }

        const response = await client.patch(`${TASKS_ENDPOINT}${taskId}/`, formattedData)
        return response.data
    } catch (error) {
        console.error(`Error updating task with ID ${taskId}:`, error)
        throw error
    }
}

// Delete a task
const deleteTask = async (taskId) => {
    try {
        const response = await client.delete(`${TASKS_ENDPOINT}${taskId}/`)
        return response.data
    } catch (error) {
        console.error(`Error deleting task with ID ${taskId}:`, error)
        throw error
    }
}

// Get daily tasks
const fetchDailyTasks = async (date, branch = null) => {
    try {
        const queryParams = new URLSearchParams()
        queryParams.append("date", formatDateForAPI(date))

        if (branch && branch !== "all") {
            queryParams.append("branch_id", branch)
        }

        const response = await client.get(`${DAILY_TASKS_ENDPOINT}?${queryParams.toString()}`)
        return response.data
    } catch (error) {
        console.error("Error fetching daily tasks:", error)
        throw error
    }
}

// Get weekly tasks
const fetchWeeklyTasks = async (date, branch = null) => {
    try {
        const queryParams = new URLSearchParams()
        queryParams.append("date", formatDateForAPI(date))

        if (branch && branch !== "all") {
            queryParams.append("branch_id", branch)
        }

        const response = await client.get(`${WEEKLY_TASKS_ENDPOINT}?${queryParams.toString()}`)
        return response.data
    } catch (error) {
        console.error("Error fetching weekly tasks:", error)
        throw error
    }
}

// Get monthly tasks
const fetchMonthlyTasks = async (date, branch = null) => {
    try {
        const queryParams = new URLSearchParams()
        queryParams.append("date", formatDateForAPI(date))

        if (branch && branch !== "all") {
            queryParams.append("branch_id", branch)
        }

        const response = await client.get(`${MONTHLY_TASKS_ENDPOINT}?${queryParams.toString()}`)
        return response.data
    } catch (error) {
        console.error("Error fetching monthly tasks:", error)
        throw error
    }
}

// Get yearly tasks
const fetchYearlyTasks = async (date, branch = null) => {
    try {
        const queryParams = new URLSearchParams()
        queryParams.append("date", formatDateForAPI(date))

        if (branch && branch !== "all") {
            queryParams.append("branch_id", branch)
        }

        const response = await client.get(`${YEARLY_TASKS_ENDPOINT}?${queryParams.toString()}`)
        return response.data
    } catch (error) {
        console.error("Error fetching yearly tasks:", error)
        throw error
    }
}

// Helper function to format date for API
const formatDateForAPI = (date) => {
    if (!date) return new Date().toISOString().split("T")[0]

    if (typeof date === "string") {
        // If it's already a string, check if it's a valid date format
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date
        }
        // Otherwise, try to parse it
        return new Date(date).toISOString().split("T")[0]
    }

    if (date instanceof Date) {
        return date.toISOString().split("T")[0]
    }

    // Default fallback
    return new Date().toISOString().split("T")[0]
}

// Helper function to format time for API
const formatTimeForAPI = (date) => {
    if (!date) return new Date().toTimeString().slice(0, 5)

    if (typeof date === "string") {
        // If it contains time information
        if (date.includes("T")) {
            return date.split("T")[1].slice(0, 5)
        }
        // Try to parse it
        return new Date(date).toTimeString().slice(0, 5)
    }

    if (date instanceof Date) {
        return date.toTimeString().slice(0, 5)
    }

    // Default fallback
    return new Date().toTimeString().slice(0, 5)
}

// Export all functions
const apiTasks = {
    fetchTasks,
    fetchTaskById,
    createTask,
    updateTask,
    deleteTask,
    fetchDailyTasks,
    fetchWeeklyTasks,
    fetchMonthlyTasks,
    fetchYearlyTasks,
}

export default apiTasks
