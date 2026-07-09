import client from "./apiService"

// Get user profile data
const fetchUserProfile = async (userId) => {
    try {
        const response = await client.get(`/users/${userId}/`)
        return response.data
    } catch (error) {
        console.error(`Error fetching user profile with ID ${userId}:`, error)
        throw error
    }
}

// Update user profile
const updateUserProfile = async (userId, profileData) => {
    try {
        const response = await client.patch(`/users/${userId}/`, profileData)
        return response.data
    } catch (error) {
        console.error(`Error updating user profile with ID ${userId}:`, error)
        throw error
    }
}

// Change password
const changePassword = async (passwordData) => {
    try {
        const response = await client.post("/users/change-password/", passwordData)
        return response.data
    } catch (error) {
        console.error("Error changing password:", error)
        throw error
    }
}

// Request password reset (sends code to email)
const requestPasswordReset = async (email) => {
    try {
        const response = await client.post("/user/change-password/", { email })
        return response.data
    } catch (error) {
        console.error("Error requesting password reset:", error)
        throw error
    }
}

// Verify reset code
const verifyResetCode = async (email, code) => {
    try {
        const response = await client.post("/user/verify-code/", {
            email,
            code: Number.parseInt(code, 10),
        })
        return response.data
    } catch (error) {
        console.error("Error verifying reset code:", error)
        throw error
    }
}

// Reset password with token
const resetPassword = async (token, passwordData) => {
    try {
        const response = await client.post(
            "/user/reset-password/",
            {
                ...passwordData,
                token,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        )
        return response.data
    } catch (error) {
        console.error("Error resetting password:", error)
        throw error
    }
}

// Export all functions
const apiProfile = {
    fetchUserProfile,
    updateUserProfile,
    changePassword,
    requestPasswordReset,
    verifyResetCode,
    resetPassword,
}

export default apiProfile
