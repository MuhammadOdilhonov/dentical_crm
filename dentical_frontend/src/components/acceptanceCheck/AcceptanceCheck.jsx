"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { checkAppointmentAccess, enterAppointment } from "../../api/apiAcceptanceCheck"

const AcceptanceCheck = () => {
    const { meetingId, patientId } = useParams()

    const [appointmentData, setAppointmentData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [timeStatus, setTimeStatus] = useState("")
    const [canEnter, setCanEnter] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [timeRemaining, setTimeRemaining] = useState("")
    const [entering, setEntering] = useState(false)

    // Har soniya vaqtni yangilash
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    // Qabul ma'lumotlarini olish
    useEffect(() => {
        const fetchAppointmentData = async () => {
            setLoading(true)
            try {
                const result = await checkAppointmentAccess(meetingId, patientId)

                if (result.success) {
                    const data = result.data

                    // Agar status progress bo'lsa, sahifani ochmaslik
                    if (data.meeting?.status === "progress") {
                        setError("Qabul hozirda davom etmoqda")
                        setLoading(false)
                        return
                    }

                    setAppointmentData(data)
                    checkTimeStatus(data)
                } else {
                    setError(result.error)
                }
            } catch (err) {
                setError("Ma'lumotlarni olishda xatolik yuz berdi")
            }
            setLoading(false)
        }

        if (meetingId && patientId) {
            fetchAppointmentData()
        }
    }, [meetingId, patientId])

    // Vaqt holatini tekshirish (har soniya yangilanadi)
    useEffect(() => {
        if (appointmentData) {
            checkTimeStatus(appointmentData)
        }
    }, [currentTime, appointmentData])

    const checkTimeStatus = (data) => {
        if (!data.meeting?.date) {
            setTimeStatus("Qabul vaqti belgilanmagan")
            setCanEnter(false)
            return
        }

        // API dan kelgan vaqtni string sifatida parse qilish (timezone conversion qilmasdan)
        const parseApiDateTime = (dateString) => {
            try {
                const dateStr = dateString.toString()

                // Agar ISO format bo'lsa
                if (dateStr.includes('T')) {
                    const datePart = dateStr.split('T')[0] // "2025-06-15"
                    const timePart = dateStr.split('T')[1].split('.')[0] // "00:00:00"

                    const [year, month, day] = datePart.split('-')
                    const [hours, minutes, seconds = "00"] = timePart.split(':')

                    // Local vaqt sifatida yaratish (timezone conversion qilmasdan)
                    return new Date(
                        parseInt(year),
                        parseInt(month) - 1,
                        parseInt(day),
                        parseInt(hours),
                        parseInt(minutes),
                        parseInt(seconds)
                    )
                }

                // Fallback: oddiy Date constructor
                return new Date(dateString)
            } catch (error) {
                console.error("Vaqtni parse qilishda xatolik:", error)
                return new Date(dateString)
            }
        }

        // Hozirgi vaqt
        const now = new Date()

        // API dan kelgan vaqtni to'g'ri parse qilish
        const appointmentDateTime = parseApiDateTime(data.meeting.date)

        // Vaqt farqini hisoblash (millisekundlarda)
        const timeDifference = now.getTime() - appointmentDateTime.getTime()
        const minutesDifference = Math.floor(timeDifference / (1000 * 60))

        console.log("=== VAQT TEKSHIRISH ===")
        console.log("API dan kelgan vaqt (asl):", data.meeting.date)
        console.log("Parse qilingan qabul vaqti:", appointmentDateTime.toString())
        console.log("Hozirgi vaqt:", now.toString())
        console.log("Farq (daqiqa):", minutesDifference)

        if (timeDifference < 0) {
            // Vaqt hali kelmagan
            const timeUntilAppointment = appointmentDateTime.getTime() - now.getTime()
            const hoursUntil = Math.floor(timeUntilAppointment / (1000 * 60 * 60))
            const minutesUntil = Math.floor((timeUntilAppointment % (1000 * 60 * 60)) / (1000 * 60))
            const secondsUntil = Math.floor((timeUntilAppointment % (1000 * 60)) / 1000)

            if (hoursUntil > 0) {
                setTimeRemaining(`${hoursUntil} soat ${minutesUntil} daqiqa ${secondsUntil} soniya`)
            } else if (minutesUntil > 0) {
                setTimeRemaining(`${minutesUntil} daqiqa ${secondsUntil} soniya`)
            } else {
                setTimeRemaining(`${secondsUntil} soniya`)
            }

            setTimeStatus("Sizning vaqtingiz hali kelmadi")
            setCanEnter(false)
        } else if (minutesDifference <= 10) {
            // Vaqt kelgan yoki 10 daqiqagacha o'tgan
            if (minutesDifference <= 0) {
                setTimeStatus("Sizning vaqtingiz keldi, kiring!")
                setTimeRemaining("")
            } else {
                const remainingSeconds = Math.floor((timeDifference % (1000 * 60)) / 1000)
                setTimeStatus(`Sizning vaqtingiz ${minutesDifference} daqiqa ${remainingSeconds} soniya o'tib ketdi`)
                setTimeRemaining("")
            }
            setCanEnter(true)
        } else {
            // 10 daqiqadan ko'p o'tgan
            setError("Sizning qabul vaqtingiz 10 daqiqadan ko'p o'tib ketdi")
            setCanEnter(false)
            setTimeRemaining("")
            return
        }
    }

    const handleEnterAppointment = async () => {
        setEntering(true)
        try {
            const result = await enterAppointment(meetingId, patientId)
            if (result.success) {
                setTimeStatus("Qabulga muvaffaqiyatli kirdingiz!")
                setCanEnter(false)
                // 3 soniyadan keyin sahifani yopish
                setTimeout(() => {
                    window.close()
                }, 3000)
            } else {
                setError(result.error)
            }
        } catch (err) {
            setError("Qabulga kirishda xatolik yuz berdi")
        }
        setEntering(false)
    }

    // API dan kelgan vaqtni aynan shu ko'rinishda formatlash (vaqt zonasini o'zgartirmasdan)
    const formatDateTime = (dateString) => {
        if (!dateString) return "Belgilanmagan"

        // Vaqtni string sifatida parse qilish (timezone conversion qilmasdan)
        try {
            // ISO formatdagi stringdan to'g'ridan-to'g'ri parse qilish
            const dateStr = dateString.toString()

            // Agar ISO format bo'lsa (masalan: "2025-06-15T00:00:00.000Z")
            if (dateStr.includes('T')) {
                const datePart = dateStr.split('T')[0] // "2025-06-15"
                const timePart = dateStr.split('T')[1].split('.')[0] // "00:00:00"

                const [year, month, day] = datePart.split('-')
                const [hours, minutes] = timePart.split(':')

                return `${day}.${month}.${year} ${hours}:${minutes}`
            }

            // Agar boshqa format bo'lsa, Date obyektini ishlatamiz lekin local vaqt sifatida
            const date = new Date(dateString)

            const day = date.getDate().toString().padStart(2, "0")
            const month = (date.getMonth() + 1).toString().padStart(2, "0")
            const year = date.getFullYear()
            const hours = date.getHours().toString().padStart(2, "0")
            const minutes = date.getMinutes().toString().padStart(2, "0")

            return `${day}.${month}.${year} ${hours}:${minutes}`
        } catch (error) {
            console.error("Vaqtni formatlashda xatolik:", error)
            return dateString // Agar formatlash muvaffaqiyatsiz bo'lsa, asl stringni qaytarish
        }
    }

    if (loading) {
        return (
            <div className="acceptance-check">
                <div className="acceptance-check__loading">
                    <div className="loading-spinner"></div>
                    <p>Ma'lumotlar yuklanmoqda...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="acceptance-check">
                <div className="acceptance-check__error">
                    <div className="error-icon">⚠️</div>
                    <h2>Xatolik yuz berdi</h2>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>
                        Qayta urinish
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="acceptance-check">
            <div className="acceptance-check__header">
                <div className="logos">
                    <div className="logo-item">
                        <img src="/images/dentical_logo.png" alt="Bizning logo" className="our-logo" />
                    </div>
                    {appointmentData?.clinic?.logo && (
                        <div className="logo-item">
                            <img
                                src={appointmentData.clinic.logo || "/placeholder.svg"}
                                alt="Klinika logosi"
                                className="clinic-logo"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="acceptance-check__content">
                <div className={`status-card ${canEnter ? "success" : ""}`}>
                    <div className="status-icon">
                        {timeStatus.includes("kelmadi")
                            ? "⏰"
                            : timeStatus.includes("keldi")
                                ? "✅"
                                : timeStatus.includes("o'tib ketdi")
                                    ? "⚠️"
                                    : "❌"}
                    </div>

                    <h2 className="status-title">{timeStatus}</h2>

                    {timeRemaining && <p className="time-remaining">Qolgan vaqt: {timeRemaining}</p>}

                    {appointmentData && (
                        <div className="appointment-info">
                            <div className="clinic-info">
                                <h3>{appointmentData.clinic?.name || "Klinika nomi"}</h3>
                                {appointmentData.clinic?.phone && <a href={`tel:${appointmentData.clinic.phone}`} className="clinic-phone">📞 {appointmentData.clinic.phone}</a>}
                                {appointmentData.clinic?.address && (
                                    <p className="clinic-address">📍 {appointmentData.clinic.address}</p>
                                )}
                            </div>

                            <div className="appointment-details">
                                <p>
                                    <strong>Bemor:</strong> {appointmentData.customer?.full_name || "Noma'lum"}
                                </p>
                                <p>
                                    <strong>Telefon:</strong> {appointmentData.customer?.phone_number || "Belgilanmagan"}
                                </p>
                                <p>
                                    <strong>Qabul vaqti:</strong> {formatDateTime(appointmentData.meeting?.date)}
                                </p>
                                <p>
                                    <strong>Shifokor:</strong> {appointmentData.doctor?.full_name || "Belgilanmagan"}
                                </p>
                                <p>
                                    <strong>Mutaxassislik:</strong> {appointmentData.doctor?.specialization || "Belgilanmagan"}
                                </p>
                                {appointmentData.meeting?.room && (
                                    <p>
                                        <strong>Xona:</strong> {appointmentData.meeting.room.name} ({appointmentData.meeting.room.floor}
                                        -qavat)
                                    </p>
                                )}
                                {appointmentData.meeting?.branch && (
                                    <p>
                                        <strong>Filial:</strong> {appointmentData.meeting.branch}
                                    </p>
                                )}
                                {appointmentData.meeting?.comment && (
                                    <p>
                                        <strong>Izoh:</strong> {appointmentData.meeting.comment}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AcceptanceCheck