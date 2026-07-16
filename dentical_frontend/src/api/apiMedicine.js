import client from "./apiService.js"

// Medicine Categories API
export const fetchMedicineCategories = async () => {
    try {
        const response = await client.get("/medicine-categories/")
        return response.data
    } catch (error) {
        console.error("Error fetching medicine categories:", error)
        throw error
    }
}

export const createMedicineCategory = async (categoryData) => {
    try {
        const response = await client.post("/medicine-categories/", categoryData)
        return response.data
    } catch (error) {
        console.error("Error creating medicine category:", error)
        throw error
    }
}

export const updateMedicineCategory = async (id, categoryData) => {
    try {
        const response = await client.put(`/medicine-categories/${id}/`, categoryData)
        return response.data
    } catch (error) {
        console.error("Error updating medicine category:", error)
        throw error
    }
}

export const deleteMedicineCategory = async (id) => {
    try {
        const response = await client.delete(`/medicine-categories/${id}/`)
        return response.data
    } catch (error) {
        console.error("Error deleting medicine category:", error)
        throw error
    }
}

// Medicines API
export const fetchMedicines = async (params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString()
        const response = await client.get(`/medicines/${queryString ? `?${queryString}` : ""}`)
        return response.data
    } catch (error) {
        console.error("Error fetching medicines:", error)
        throw error
    }
}

export const createMedicine = async (medicineData) => {
    try {
        const response = await client.post("/medicines/", medicineData)
        return response.data
    } catch (error) {
        console.error("Error creating medicine:", error)
        throw error
    }
}

export const updateMedicine = async (id, medicineData) => {
    try {
        const response = await client.put(`/medicines/${id}/`, medicineData)
        return response.data
    } catch (error) {
        console.error("Error updating medicine:", error)
        throw error
    }
}

export const deleteMedicine = async (id) => {
    try {
        const response = await client.delete(`/medicines/${id}/`)
        return response.data
    } catch (error) {
        console.error("Error deleting medicine:", error)
        throw error
    }
}

// Medicine Purchases API
export const fetchMedicinePurchases = async (params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString()
        const response = await client.get(`/medicine-purchases/${queryString ? `?${queryString}` : ""}`)
        return response.data
    } catch (error) {
        console.error("Error fetching medicine purchases:", error)
        throw error
    }
}

export const createMedicinePurchase = async (purchaseData) => {
    try {
        const response = await client.post("/medicine-purchases/", purchaseData)
        return response.data
    } catch (error) {
        console.error("Error creating medicine purchase:", error)
        throw error
    }
}

// Medicine Sales API
export const fetchMedicineSales = async (params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString()
        const response = await client.get(`/medicine-sales/${queryString ? `?${queryString}` : ""}`)
        return response.data
    } catch (error) {
        console.error("Error fetching medicine sales:", error)
        throw error
    }
}

export const createMedicineSale = async (saleData) => {
    try {
        const response = await client.post("/medicine-sales/", saleData)
        return response.data
    } catch (error) {
        console.error("Error creating medicine sale:", error)
        throw error
    }
}

export const sellMedicine = async (saleData) => {
    try {
        const response = await client.post("/medicine-sales/sell_medicine/", saleData)
        return response.data
    } catch (error) {
        console.error("Error selling medicine:", error)
        throw error
    }
}

// Medicine Adjustments API
export const fetchMedicineAdjustments = async () => {
    try {
        const response = await client.get("/medicine-adjustments/")
        return response.data
    } catch (error) {
        console.error("Error fetching medicine adjustments:", error)
        throw error
    }
}

export const createMedicineAdjustment = async (adjustmentData) => {
    try {
        const response = await client.post("/medicine-adjustments/", adjustmentData)
        return response.data
    } catch (error) {
        console.error("Error creating medicine adjustment:", error)
        throw error
    }
}

// Prescriptions API
export const fetchPrescriptions = async () => {
    try {
        const response = await client.get("/prescriptions/")
        return response.data
    } catch (error) {
        console.error("Error fetching prescriptions:", error)
        throw error
    }
}

export const createPrescription = async (prescriptionData) => {
    try {
        const response = await client.post("/prescriptions/", prescriptionData)
        return response.data
    } catch (error) {
        console.error("Error creating prescription:", error)
        throw error
    }
}

// Statistics API
export const fetchMedicineStatistics = async () => {
    try {
        const response = await client.get("/medicine-statistics/")
        return response.data
    } catch (error) {
        console.error("Error fetching medicine statistics:", error)
        throw error
    }
}

export const fetchMedicineSalesChart = async () => {
    try {
        const response = await client.get("/medicine-sales-chart/")
        return response.data
    } catch (error) {
        console.error("Error fetching medicine sales chart:", error)
        throw error
    }
}

export const fetchMedicineStockChart = async () => {
    try {
        const response = await client.get("/medicine-stock-chart/")
        return response.data
    } catch (error) {
        console.error("Error fetching medicine stock chart:", error)
        throw error
    }
}

// Search and Reports API
export const searchMedicines = async (query) => {
    try {
        const response = await client.get(`/medicine-search/?q=${encodeURIComponent(query)}`)
        return response.data
    } catch (error) {
        console.error("Error searching medicines:", error)
        throw error
    }
}

export const searchMedicineByBarcode = async (barcode) => {
    try {
        const response = await client.get(`/medicine-barcode/?barcode=${barcode}`)
        return response.data
    } catch (error) {
        console.error("Error searching medicine by barcode:", error)
        throw error
    }
}

export const fetchMedicineExpiryReport = async (days = 30) => {
    try {
        const response = await client.get(`/medicine-expiry-report/?days=${days}`)
        return response.data
    } catch (error) {
        console.error("Error fetching medicine expiry report:", error)
        throw error
    }
}

export const fetchMedicineLowStockReport = async () => {
    try {
        const response = await client.get("/medicine-low-stock-report/")
        return response.data
    } catch (error) {
        console.error("Error fetching medicine low stock report:", error)
        throw error
    }
}
