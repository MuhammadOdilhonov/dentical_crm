import client from "./apiService"

const apiTarif = {
    // Tarif statistikalarini olish
    fetchTariffStats: async () => {
        try {
            const response = await client.get("/clinic/tariff-stats/")
            return response.data
        } catch (error) {
            console.error("Tarif statistikalarini olishda xatolik:", error)
            throw error
        }
    },
}

export default apiTarif
