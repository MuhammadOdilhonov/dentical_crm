import client from "./apiService"

// API endpoints
const USERS_ENDPOINT = "/users/"

// Get all users with optional pagination and filtering
const fetchUsers = async (page = 1, limit = 10, filters = {}) => {
    console.log(`Fetching users with page: ${page}, limit: ${limit}, filters:`, filters);
    
    try {
        // Build query parameters
        const queryParams = new URLSearchParams()

        // Add pagination params
        queryParams.append("page", page)
        queryParams.append("page_size", limit)

        // Add filters if provided
        if (filters.branch && filters.branch !== "all") {
            queryParams.append("branch_id", filters.branch)
        }

        if (filters.role && filters.role !== "all") {
            queryParams.append("role", filters.role)
        }

        if (filters.status && filters.status !== "all") {
            queryParams.append("status", filters.status)
        }

        if (filters.search) {
            queryParams.append("search", filters.search)
        }

        const response = await client.get(`${USERS_ENDPOINT}?${queryParams.toString()}`)
        return response.data
    } catch (error) {
        console.error("Error fetching users:", error)
        throw error
    }
}

// Get a single user by ID
const fetchUserById = async (userId) => {
    try {
        const response = await client.get(`${USERS_ENDPOINT}${userId}/`)
        return response.data
    } catch (error) {
        console.error(`Error fetching user with ID ${userId}:`, error)
        throw error
    }
}

// Create a new user
const createUser = async (userData) => {
    try {
        // Ensure KPI is a number if present
        if (userData.kpi !== undefined && userData.kpi !== null && userData.kpi !== "") {
            userData.kpi = Number.parseFloat(userData.kpi)
        } else if (userData.role !== "doctor") {
            delete userData.kpi // Remove kpi if not a doctor and kpi is empty
        } else if (
            userData.role === "doctor" &&
            (userData.kpi === undefined || userData.kpi === null || userData.kpi === "")
        ) {
            userData.kpi = 0 // Default KPI to 0 for doctors if not provided
        }

        const response = await client.post(USERS_ENDPOINT, userData)
        return response.data
    } catch (error) {
        console.error("Error creating user:", error)
        throw error
    }
}

// Update an existing user
const updateUser = async (userId, userData) => {
    try {
        // Ensure KPI is a number if present
        if (userData.kpi !== undefined && userData.kpi !== null && userData.kpi !== "") {
            userData.kpi = Number.parseFloat(userData.kpi)
        } else if (userData.role !== "doctor") {
            delete userData.kpi // Remove kpi if not a doctor and kpi is empty
        } else if (
            userData.role === "doctor" &&
            (userData.kpi === undefined || userData.kpi === null || userData.kpi === "")
        ) {
            // If KPI is being cleared for a doctor, backend might expect null or it might be removed.
            // Assuming backend handles null or removal for optional fields.
            // If it must be a number, set to 0. For now, let's allow it to be removed if empty.
            // userData.kpi = 0; // Or handle as per backend requirements
        }

        const response = await client.patch(`${USERS_ENDPOINT}${userId}/`, userData)
        return response.data
    } catch (error) {
        console.error(`Error updating user with ID ${userId}:`, error)
        throw error
    }
}

// Delete a user
const deleteUser = async (userId) => {
    try {
        const response = await client.delete(`${USERS_ENDPOINT}${userId}/`)
        return response.data
    } catch (error) {
        console.error(`Error deleting user with ID ${userId}:`, error)
        throw error
    }
}

// Export all functions
const apiUsers = {
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
}

export default apiUsers
