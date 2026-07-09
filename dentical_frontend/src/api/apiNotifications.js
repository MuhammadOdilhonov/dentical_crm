import client from "./apiService"

// System notifications
export const getNotifications = async (page = 1, itemsPerPage = 10) => {
    try {
        const response = await client.get(`/notifications/?page=${page}&limit=${itemsPerPage}`)
        return response.data
    } catch (error) {
        console.error("Error fetching notifications:", error)
        throw error
    }
}

export const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await client.post("/notification/mark-as-read/", {
            notification_id: notificationId,
        })
        return response.data
    } catch (error) {
        console.error("Error marking notification as read:", error)
        throw error
    }
}

export const markAllNotificationsAsRead = async () => {
    try {
        const response = await client.post("/notification/mark-all-as-read/")
        return response.data
    } catch (error) {
        console.error("Error marking all notifications as read:", error)
        throw error
    }
}

export const getUnreadNotificationsCount = async () => {
    try {
        const response = await client.get("/notification/unread-count/")
        return response.data
    } catch (error) {
        console.error("Error fetching unread notifications count:", error)
        throw error
    }
}

// Clinic notifications
export const getClinicNotifications = async (page = 1, itemsPerPage = 10) => {
    try {
        const response = await client.get(`/clinic-notifications/?page=${page}&limit=${itemsPerPage}`)
        return response.data
    } catch (error) {
        console.error("Error fetching clinic notifications:", error)
        throw error
    }
}

export const markClinicNotificationAsRead = async (notificationId) => {
    try {
        const response = await client.post("/clinic-notification/mark-as-read/", {
            clinic_notification_id: notificationId,
        })
        return response.data
    } catch (error) {
        console.error("Error marking clinic notification as read:", error)
        throw error
    }
}

export const markAllClinicNotificationsAsRead = async () => {
    try {
        const response = await client.post("/clinic-notification/mark-all-as-read/")
        return response.data
    } catch (error) {
        console.error("Error marking all clinic notifications as read:", error)
        throw error
    }
}

export const getUnreadClinicNotificationsCount = async () => {
    try {
        const response = await client.get("/clinic-notification/unread-count/")
        return response.data
    } catch (error) {
        console.error("Error fetching unread clinic notifications count:", error)
        throw error
    }
}
