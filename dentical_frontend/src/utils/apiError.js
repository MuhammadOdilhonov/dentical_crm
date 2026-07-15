// Backend qaytargan xatoni odam o'qiy oladigan matnga aylantiradi.
// Har qanday catch blokida: getApiErrorMessage(error, t("error_adding_staff"))
export function getApiErrorMessage(error, fallback = "") {
    const data = error?.response?.data

    if (!data) {
        // Tarmoq xatosi (server ishlamayapti va h.k.)
        if (error?.message === "Network Error") {
            return (fallback ? fallback + ": " : "") + "Server bilan aloqa yo'q"
        }
        return fallback || error?.message || "Xatolik yuz berdi"
    }

    if (typeof data === "string") {
        // HTML sahifa kelgan bo'lsa (500) — foydasiz, fallback qaytaramiz
        if (data.startsWith("<")) return fallback || "Server xatosi (500)"
        return data
    }

    // Odatiy DRF formatlari: {error: "..."} / {detail: "..."} / {maydon: ["xato"]}
    if (data.error) return String(data.error)
    if (data.detail) return String(data.detail)
    if (data.message) return String(data.message)

    if (typeof data === "object") {
        const parts = []
        for (const [field, value] of Object.entries(data)) {
            const text = Array.isArray(value) ? value.join(", ") : String(value)
            // non_field_errors kabi texnik nomlarni ko'rsatmaymiz
            parts.push(field === "non_field_errors" ? text : `${field}: ${text}`)
        }
        if (parts.length) return (fallback ? fallback + " — " : "") + parts.join("; ")
    }

    return fallback || "Xatolik yuz berdi"
}

export default getApiErrorMessage
