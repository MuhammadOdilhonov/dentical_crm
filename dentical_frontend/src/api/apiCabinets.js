import client from "./apiService"

// Get all cabinets with optional filters
export const getCabinets = async (page = 1, pageSize = 5, branchId = null, search = "") => {
    try {
        let url = `/cabinets/?page=${page}&page_size=${pageSize}`

        if (branchId) {
            url += `&branch=${branchId}`
        }

        if (search) {
            url += `&search=${encodeURIComponent(search)}`
        }

        const response = await client.get(url)
        return response.data
    } catch (error) {
        console.error("Error fetching cabinets:", error)
        throw error
    }
}

// Get a single cabinet by ID
export const getCabinetById = async (cabinetId) => {
    try {
        const response = await client.get(`/cabinets/${cabinetId}/`)
        return response.data
    } catch (error) {
        console.error(`Error fetching cabinet with ID ${cabinetId}:`, error)
        throw error
    }
}

// Create a new cabinet
export const createCabinet = async (cabinetData) => {
    try {
        // Format the data according to API requirements
        const formattedData = {
            name: cabinetData.name,
            type: cabinetData.type,
            floor: cabinetData.floor,
            status: cabinetData.status,
            description: cabinetData.description,
            branch: cabinetData.branch,
            user: cabinetData.user_doctor || [],
            nurse: cabinetData.user_nurse || [],
        }

        const response = await client.post("/cabinets/", formattedData)
        return response.data
    } catch (error) {
        console.error("Error creating cabinet:", error)
        throw error
    }
}

// Update a cabinet
export const updateCabinet = async (cabinetId, cabinetData) => {
    try {
        // Format the data according to API requirements
        const formattedData = {
            name: cabinetData.name,
            type: cabinetData.type,
            floor: cabinetData.floor,
            status: cabinetData.status,
            description: cabinetData.description,
            branch: cabinetData.branch,
            doctor: cabinetData.user_doctor || [],
            nurse: cabinetData.user_nurse || [],
        }

        const response = await client.patch(`/cabinets/${cabinetId}/`, formattedData)
        return response.data
    } catch (error) {
        console.error(`Error updating cabinet with ID ${cabinetId}:`, error)
        throw error
    }
}

// Delete a cabinet
export const deleteCabinet = async (cabinetId) => {
    try {
        if (!cabinetId) {
            throw new Error("Cabinet ID is required")
        }

        console.log(`Deleting cabinet with ID: ${cabinetId}`)

        const response = await client.delete(`/cabinets/${cabinetId}/`)

        // Check if the response is successful
        if (response.status >= 200 && response.status < 300) {
            return { success: true }
        } else {
            console.error("Delete cabinet failed with status:", response.status)
            throw new Error(`Failed to delete cabinet. Status: ${response.status}`)
        }
    } catch (error) {
        console.error("Error in deleteCabinet:", error)
        throw error
    }
}
