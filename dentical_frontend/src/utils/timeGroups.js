// Qabul vaqtlarini ketma-ket (contiguous) diapazonlarga birlashtirish uchun yordamchilar.
// Masalan: 10:00, 10:30, 11:00  ->  "10:00 - 11:00" (bitta card)
// Agar orada bo'sh slot bo'lsa (yarim soat / bir soat), alohida guruhlarga bo'linadi.

export const timeStrToMinutes = (t) => {
    if (t === null || t === undefined) return null
    const [h, m] = String(t).split(":")
    const hh = parseInt(h, 10)
    const mm = parseInt(m, 10)
    if (isNaN(hh)) return null
    return hh * 60 + (isNaN(mm) ? 0 : mm)
}

export const minutesToTimeStr = (mins) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

/**
 * "HH:MM" vaqtlar ro'yxatini ketma-ket diapazonlarga birlashtiradi.
 * Ikki vaqt "yonma-yon" hisoblanadi, agar ular orasidagi farq stepMinutes dan oshmasa
 * (ya'ni orada bo'sh slot bo'lmasa). Bo'sh slot bo'lsa — yangi guruh boshlanadi.
 *
 * @param {string[]} times  masalan ["10:00","10:30","11:00"]
 * @param {number} stepMinutes  slot davomiyligi (30 yoki 60)
 * @returns {{times:string[], first:string, last:string, label:string}[]}
 */
export const groupConsecutiveTimes = (times, stepMinutes = 30) => {
    const step = stepMinutes > 0 ? stepMinutes : 30
    const sorted = (times || [])
        .filter(Boolean)
        .map((t) => ({ t, min: timeStrToMinutes(t) }))
        .filter((x) => x.min !== null)
        .sort((a, b) => a.min - b.min)

    const groups = []
    let cur = null
    sorted.forEach(({ t, min }) => {
        if (cur && min - cur.lastMin > 0 && min - cur.lastMin <= step) {
            cur.times.push(t)
            cur.lastMin = min
        } else {
            cur = { times: [t], firstMin: min, lastMin: min }
            groups.push(cur)
        }
    })

    return groups.map((g) => {
        const first = minutesToTimeStr(g.firstMin)
        const last = minutesToTimeStr(g.lastMin)
        return {
            times: g.times,
            first,
            last,
            label: g.times.length > 1 ? `${first} - ${last}` : first,
        }
    })
}

/**
 * Kalendardagi qabullarni bir xil bemor + shifokor + xona bo'yicha ketma-ket
 * (orada bo'sh joy yo'q) guruhlarga birlashtiradi.
 *
 * @param {object[]} dayAppointments  bir kundagi qabullar
 * @param {(a:object)=>number|null} getMinutes  qabulning kun boshidan daqiqasi
 * @param {number} stepMinutes  ketma-ketlik chegarasi (default 60 daqiqa)
 * @returns {{head:object, items:object[], firstMin:number, lastMin:number}[]}
 */
export const groupConsecutiveAppointments = (dayAppointments, getMinutes, stepMinutes = 60) => {
    const step = stepMinutes > 0 ? stepMinutes : 60
    const items = (dayAppointments || [])
        .map((a) => ({ a, min: getMinutes(a) }))
        .filter((x) => x.min !== null)
        .sort((x, y) => x.min - y.min)

    const keyOf = (x) => `${x.customer_name || x.customer || ""}|${x.doctor_name || ""}|${x.room_name || ""}`
    const lastGroupByKey = {}
    const groups = []

    items.forEach(({ a, min }) => {
        const k = keyOf(a)
        const g = lastGroupByKey[k]
        if (g && min - g.lastMin > 0 && min - g.lastMin <= step) {
            g.items.push(a)
            g.lastMin = min
        } else {
            const ng = { head: a, items: [a], firstMin: min, lastMin: min }
            lastGroupByKey[k] = ng
            groups.push(ng)
        }
    })

    return groups
}
