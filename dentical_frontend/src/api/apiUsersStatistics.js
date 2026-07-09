import client from "./apiService"

// API endpoints
const USERS_STATISTICS_ENDPOINT = "/user-statistics/"

/**
 * Fetch user statistics for all branches or a specific branch
 * @param {string|null} branchId - Branch ID or null for all branches
 * @returns {Promise<Object>} - Statistics data
 */
const fetchUsersStatistics = async (branchId = null) => {
    try {
        let url = USERS_STATISTICS_ENDPOINT
        if (branchId) {
            url += `?branch_id=${branchId}`
        }

        const response = await client.get(url)
        return response.data
    } catch (error) {
        console.error("Error fetching user statistics:", error)
        throw error
    }
}

/**
 * Fetch user statistics for all branches
 * @returns {Promise<Object>} - Statistics data for all branches
 */
const fetchAllBranchesStatistics = async () => {
    try {
        const response = await client.get(USERS_STATISTICS_ENDPOINT)
        return response.data
    } catch (error) {
        console.error("Error fetching all branches user statistics:", error)
        throw error
    }
}

/**
 * Fetch user statistics for a specific branch
 * @param {string} branchId - Branch ID
 * @returns {Promise<Object>} - Statistics data for the specified branch
 */
const fetchBranchStatistics = async (branchId) => {
    try {
        const response = await client.get(`${USERS_STATISTICS_ENDPOINT}?branch_id=${branchId}`)
        return response.data
    } catch (error) {
        console.error(`Error fetching user statistics for branch ${branchId}:`, error)
        throw error
    }
}

/**
 * Fetch user statistics based on selected branch
 * @param {string} selectedBranch - Selected branch ID or "all" for all branches
 * @returns {Promise<Object>} - Statistics data
 */
const fetchStatistics = async (selectedBranch) => {
    if (selectedBranch === "all") {
        return fetchAllBranchesStatistics()
    } else {
        return fetchBranchStatistics(selectedBranch)
    }
}

// Export all functions
const apiUsersStatistics = {
    fetchUsersStatistics,
    fetchAllBranchesStatistics,
    fetchBranchStatistics,
    fetchStatistics,
}

export default apiUsersStatistics
