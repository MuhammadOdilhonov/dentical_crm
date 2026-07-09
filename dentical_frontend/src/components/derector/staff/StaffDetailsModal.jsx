"use client"

import { useState, useEffect } from "react"
import {
    FaTimes,
    FaUserMd,
    FaUserNurse,
    FaUserCog,
    FaCheck,
    FaTimes as FaTimesIcon,
    FaCalendarAlt,
    FaPhone,
    FaEnvelope,
    FaBuilding,
    FaMoneyBillWave,
    FaSpinner,
    FaPlus,
    FaEdit,
    FaSave,
} from "react-icons/fa"
import { useLanguage } from "../../../contexts/LanguageContext"
import apiSchedules from "../../../api/apiSchedules"

const StaffDetailsModal = ({ isOpen, onClose, user, staffPositions, specializationOptions, getBranchName }) => {
    const { t } = useLanguage()
    const [schedules, setSchedules] = useState([])
    const [isLoadingSchedules, setIsLoadingSchedules] = useState(false)
    const [scheduleError, setScheduleError] = useState(null)
    const [showSchedule, setShowSchedule] = useState(true)
    const [editingDay, setEditingDay] = useState(null)
    const [timeForm, setTimeForm] = useState({
        start_time: "09:00",
        end_time: "18:00",
    })
    const [showFullScheduleModal, setShowFullScheduleModal] = useState(false)

    // Fetch user schedules
    const fetchUserSchedules = async () => {
        if (!isOpen || !user?.id) return

        setIsLoadingSchedules(true)
        setScheduleError(null)

        try {
            const response = await apiSchedules.fetchUserSchedules(user.id)
            console.log("Raw API response:", response)

            // Check if the response has a results array (paginated response)
            let schedulesData = []
            if (response && response.results && Array.isArray(response.results)) {
                schedulesData = response.results
                console.log("Extracted schedules from results:", schedulesData)
            } else if (Array.isArray(response)) {
                schedulesData = response
                console.log("Response is already an array:", schedulesData)
            } else {
                console.error("Unexpected response format:", response)
                setScheduleError(t("error_fetching_schedules"))
                setSchedules([])
                setIsLoadingSchedules(false)
                return
            }

            // Process the schedules to ensure is_working is a boolean
            const processedSchedules = schedulesData.map((schedule) => ({
                ...schedule,
                is_working: schedule.is_working === true || schedule.is_working === "true" || schedule.is_working === 1,
            }))

            setSchedules(processedSchedules)
            console.log("Processed schedules:", processedSchedules)
        } catch (error) {
            console.error("Error fetching user schedules:", error)
            setScheduleError(t("error_fetching_schedules"))
            setSchedules([])
        } finally {
            setIsLoadingSchedules(false)
        }
    }

    useEffect(() => {
        fetchUserSchedules()
    }, [isOpen, user?.id, t])

    // Format full name
    const formatFullName = (firstName, lastName) => {
        return `${firstName || ""} ${lastName || ""}`.trim()
    }

    // Get role label
    const getRoleLabel = (roleValue) => {
        const role = staffPositions.find((pos) => pos.value === roleValue)
        return role ? role.label : roleValue
    }

    // Get specialization label
    const getSpecializationLabel = (specValue) => {
        const spec = specializationOptions.find((s) => s.value === specValue)
        return spec ? spec.label : specValue
    }

    // Get role icon
    const getRoleIcon = (role) => {
        switch (role) {
            case "doctor":
                return <FaUserMd />
            case "nurse":
                return <FaUserNurse />
            default:
                return <FaUserCog />
        }
    }

    // Handle time form input change
    const handleTimeChange = (e) => {
        const { name, value } = e.target
        setTimeForm({
            ...timeForm,
            [name]: value,
        })
    }

    // Start editing a day's schedule
    const handleEditDay = (day, existingSchedule) => {
        setEditingDay(day)
        setTimeForm({
            start_time: existingSchedule?.start_time?.substring(0, 5) || "09:00",
            end_time: existingSchedule?.end_time?.substring(0, 5) || "18:00",
        })
    }

    // Save the schedule for a day
    const handleSaveSchedule = async (day, existingScheduleId = null) => {
        try {
            setIsLoadingSchedules(true)
            const scheduleData = {
                user: user.id,
                day: day,
                start_time: timeForm.start_time,
                end_time: timeForm.end_time,
                is_working: true,
            }

            let updatedSchedule
            if (existingScheduleId) {
                // Update existing schedule
                updatedSchedule = await apiSchedules.updateSchedule(existingScheduleId, scheduleData)
                // Ensure is_working is properly set in the state
                setSchedules(schedules.map((s) => (s.id === existingScheduleId ? { ...updatedSchedule, is_working: true } : s)))
            } else {
                // Create new schedule
                updatedSchedule = await apiSchedules.createSchedule(scheduleData)
                // Ensure is_working is properly set in the state
                setSchedules([...schedules, { ...updatedSchedule, is_working: true }])
            }

            setEditingDay(null)
            setScheduleError(null)
        } catch (error) {
            console.error("Error saving schedule:", error)
            setScheduleError(t("error_saving_schedule"))
        } finally {
            setIsLoadingSchedules(false)
        }
    }

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingDay(null)
    }

    if (!isOpen || !user) return null

    return (
        <div className="xodim-modal-overlay">
            <div className="xodim-modal">
                <div className="xodim-modal-header">
                    <h2>{t("staff_details")}</h2>
                    <button className="xodim-close-button" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="xodim-modal-content">
                    <div className="xodim-user-details">
                        <div className="xodim-user-details-section">
                            <h3>{t("personal_information")}</h3>
                            <div className="xodim-detail-row">
                                <span className="xodim-detail-label">{t("full_name")}:</span>
                                <span className="xodim-detail-value">{formatFullName(user.first_name, user.last_name)}</span>
                            </div>
                            <div className="xodim-detail-row">
                                <span className="xodim-detail-label">{t("email")}:</span>
                                <span className="xodim-detail-value">
                                    <FaEnvelope style={{ marginRight: "8px" }} /> {user.email}
                                </span>
                            </div>
                            <div className="xodim-detail-row">
                                <span className="xodim-detail-label">{t("phone")}:</span>
                                <span className="xodim-detail-value">
                                    <FaPhone style={{ marginRight: "8px" }} /> {user.phone_number}
                                </span>
                            </div>
                            <div className="xodim-detail-row">
                                <span className="xodim-detail-label">{t("salary")}:</span>
                                <span className="xodim-detail-value">
                                    <FaMoneyBillWave style={{ marginRight: "8px" }} /> {user.salary} UZS
                                </span>
                            </div>
                        </div>

                        <div className="xodim-user-details-section">
                            <h3>{t("professional_information")}</h3>
                            <div className="xodim-detail-row">
                                <span className="xodim-detail-label">{t("role")}:</span>
                                <span className="xodim-detail-value">
                                    <div className={`xodim-role-badge ${user.role}`}>
                                        {getRoleIcon(user.role)} {getRoleLabel(user.role)}
                                    </div>
                                </span>
                            </div>
                            {user.role === "doctor" && (
                                <div className="xodim-detail-row">
                                    <span className="xodim-detail-label">{t("specialization")}:</span>
                                    <span className="xodim-detail-value">{getSpecializationLabel(user.specialization)}</span>
                                </div>
                            )}
                            <div className="xodim-detail-row">
                                <span className="xodim-detail-label">{t("branch")}:</span>
                                <span className="xodim-detail-value">
                                    <FaBuilding style={{ marginRight: "8px" }} /> {getBranchName(user.branch)}
                                </span>
                            </div>
                            <div className="xodim-detail-row">
                                <span className="xodim-detail-label">{t("status")}:</span>
                                <span className="xodim-detail-value">
                                    <div
                                        className={`xodim-status-badge ${user.status === "faol" ? "active" : user.status === "nofaol" ? "inactive" : "vacation"
                                            }`}
                                    >
                                        {user.status === "faol" ? (
                                            <>
                                                <FaCheck /> {t("active")}
                                            </>
                                        ) : user.status === "nofaol" ? (
                                            <>
                                                <FaTimesIcon /> {t("inactive")}
                                            </>
                                        ) : (
                                            <>
                                                <FaCalendarAlt /> {t("on_vacation")}
                                            </>
                                        )}
                                    </div>
                                </span>
                            </div>
                        </div>

                        {user.status === "nofaol" && (
                            <div className="xodim-user-details-section">
                                <h3>{t("inactive_status_details")}</h3>
                                <div className="xodim-detail-row">
                                    <span className="xodim-detail-label">{t("reason")}:</span>
                                    <span className="xodim-detail-value">{user.reason_holiday}</span>
                                </div>
                            </div>
                        )}

                        {user.status === "tatilda" && (
                            <div className="xodim-user-details-section">
                                <h3>{t("vacation_details")}</h3>
                                <div className="xodim-detail-row">
                                    <span className="xodim-detail-label">{t("start_date")}:</span>
                                    <span className="xodim-detail-value">{user.start_holiday}</span>
                                </div>
                                <div className="xodim-detail-row">
                                    <span className="xodim-detail-label">{t("end_date")}:</span>
                                    <span className="xodim-detail-value">{user.end_holiday}</span>
                                </div>
                                <div className="xodim-detail-row">
                                    <span className="xodim-detail-label">{t("reason")}:</span>
                                    <span className="xodim-detail-value">{user.reason_holiday}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="xodim-user-details-section xodim-schedule-section">
                        <div className="xodim-section-header">
                            <h3>
                                <FaCalendarAlt style={{ marginRight: "8px" }} />
                                {t("weekly_schedule")}
                            </h3>
                            <button
                                className="xodim-btn xodim-btn-sm xodim-btn-outline"
                                onClick={() => setShowSchedule(!showSchedule)}
                            >
                                {showSchedule ? t("hide") : t("show")}
                            </button>
                        </div>

                        {showSchedule && (
                            <>
                                {isLoadingSchedules && !editingDay ? (
                                    <div className="xodim-loading">
                                        <FaSpinner className="xodim-spinner" /> {t("loading_schedule")}
                                    </div>
                                ) : scheduleError ? (
                                    <div className="xodim-error">{scheduleError}</div>
                                ) : (
                                    <div className="xodim-weekly-schedule">
                                        {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                                            const daySchedule = schedules.find((s) => s.day === day)
                                            const dayName = {
                                                monday: t("monday"),
                                                tuesday: t("tuesday"),
                                                wednesday: t("wednesday"),
                                                thursday: t("thursday"),
                                                friday: t("friday"),
                                                saturday: t("saturday"),
                                                sunday: t("sunday"),
                                            }[day]

                                            // Debug log for each day's schedule
                                            console.log(`Day ${day} schedule:`, daySchedule)

                                            return (
                                                <div
                                                    key={day}
                                                    className={`xodim-day-schedule ${editingDay === day
                                                            ? "editing"
                                                            : daySchedule?.is_working === true
                                                                ? "working"
                                                                : daySchedule
                                                                    ? "not-working"
                                                                    : ""
                                                        }`}
                                                >
                                                    <div className="xodim-day-name">{dayName}</div>
                                                    <div className="xodim-day-status">
                                                        {editingDay === day ? (
                                                            <div className="xodim-time-form">
                                                                <div className="xodim-time-inputs">
                                                                    <div className="xodim-time-input-group">
                                                                        <label>{t("start_time")}</label>
                                                                        <input
                                                                            type="time"
                                                                            name="start_time"
                                                                            value={timeForm.start_time}
                                                                            onChange={handleTimeChange}
                                                                        />
                                                                    </div>
                                                                    <div className="xodim-time-input-group">
                                                                        <label>{t("end_time")}</label>
                                                                        <input
                                                                            type="time"
                                                                            name="end_time"
                                                                            value={timeForm.end_time}
                                                                            onChange={handleTimeChange}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="xodim-time-form-actions">
                                                                    <button
                                                                        className="xodim-btn xodim-btn-sm xodim-btn-secondary"
                                                                        onClick={handleCancelEdit}
                                                                        disabled={isLoadingSchedules}
                                                                    >
                                                                        {t("cancel")}
                                                                    </button>
                                                                    <button
                                                                        className="xodim-btn xodim-btn-sm xodim-btn-primary"
                                                                        onClick={() => handleSaveSchedule(day, daySchedule?.id)}
                                                                        disabled={isLoadingSchedules}
                                                                    >
                                                                        {isLoadingSchedules ? <FaSpinner className="xodim-spinner" /> : <FaSave />}{" "}
                                                                        {t("save")}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : daySchedule ? (
                                                            daySchedule.is_working ? (
                                                                <>
                                                                    <span className="xodim-working-time">
                                                                        {daySchedule.start_time?.substring(0, 5)} - {daySchedule.end_time?.substring(0, 5)}
                                                                    </span>
                                                                    <div className="xodim-day-actions">
                                                                        <button
                                                                            className="xodim-btn xodim-btn-sm xodim-btn-outline"
                                                                            onClick={() => handleEditDay(day, daySchedule)}
                                                                            disabled={isLoadingSchedules}
                                                                        >
                                                                            <FaEdit /> {t("edit")}
                                                                        </button>
                                                                        <button
                                                                            className="xodim-btn xodim-btn-sm xodim-btn-danger"
                                                                            onClick={async () => {
                                                                                try {
                                                                                    setIsLoadingSchedules(true)
                                                                                    await apiSchedules.updateScheduleStatus(daySchedule.id, false)
                                                                                    setSchedules(
                                                                                        schedules.map((s) =>
                                                                                            s.id === daySchedule.id ? { ...s, is_working: false } : s,
                                                                                        ),
                                                                                    )
                                                                                } catch (error) {
                                                                                    console.error("Error updating schedule:", error)
                                                                                    setScheduleError(t("error_updating_schedule"))
                                                                                } finally {
                                                                                    setIsLoadingSchedules(false)
                                                                                }
                                                                            }}
                                                                            disabled={isLoadingSchedules}
                                                                        >
                                                                            <FaTimes /> {t("disable")}
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="xodim-not-working">{t("not_working")}</span>
                                                                    <button
                                                                        className="xodim-btn xodim-btn-sm xodim-btn-success"
                                                                        onClick={async () => {
                                                                            try {
                                                                                setIsLoadingSchedules(true)
                                                                                await apiSchedules.updateScheduleStatus(daySchedule.id, true)
                                                                                setSchedules(
                                                                                    schedules.map((s) =>
                                                                                        s.id === daySchedule.id ? { ...s, is_working: true } : s,
                                                                                    ),
                                                                                )
                                                                            } catch (error) {
                                                                                console.error("Error updating schedule:", error)
                                                                                setScheduleError(t("error_updating_schedule"))
                                                                            } finally {
                                                                                setIsLoadingSchedules(false)
                                                                            }
                                                                        }}
                                                                        disabled={isLoadingSchedules}
                                                                    >
                                                                        <FaCheck /> {t("enable")}
                                                                    </button>
                                                                </>
                                                            )
                                                        ) : (
                                                            <>
                                                                <span className="xodim-not-set">{t("not_set")}</span>
                                                                <button
                                                                    className="xodim-btn xodim-btn-sm xodim-btn-primary"
                                                                    onClick={() => handleEditDay(day)}
                                                                    disabled={isLoadingSchedules}
                                                                >
                                                                    <FaPlus /> {t("add")}
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                <div className="xodim-schedule-actions">
                                    <button className="xodim-btn xodim-btn-primary" onClick={() => setShowFullScheduleModal(true)}>
                                        <FaCalendarAlt /> {t("manage_full_schedule")}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Full Schedule Modal */}
            {showFullScheduleModal && (
                <FullScheduleModal
                    isOpen={showFullScheduleModal}
                    onClose={() => {
                        setShowFullScheduleModal(false)
                        fetchUserSchedules() // Refresh schedules after closing the modal
                    }}
                    userId={user.id}
                    userName={formatFullName(user.first_name, user.last_name)}
                    initialSchedules={schedules}
                />
            )}
        </div>
    )
}

// Full Schedule Modal Component
const FullScheduleModal = ({ isOpen, onClose, userId, userName, initialSchedules = [] }) => {
    const { t } = useLanguage()
    const [schedules, setSchedules] = useState(initialSchedules)
    const [isLoading, setIsLoading] = useState(false)
    const [editingSchedule, setEditingSchedule] = useState(null)
    const [formData, setFormData] = useState({
        day: "",
        start_time: "09:00",
        end_time: "18:00",
        is_working: true,
    })
    const [error, setError] = useState(null)

    // All days of the week
    const allDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

    // Get day name in local language
    const getDayName = (day) => {
        const days = {
            monday: t("monday"),
            tuesday: t("tuesday"),
            wednesday: t("wednesday"),
            thursday: t("thursday"),
            friday: t("friday"),
            saturday: t("saturday"),
            sunday: t("sunday"),
        }
        return days[day] || day
    }

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        })
    }

    // Start editing a schedule
    const handleEditSchedule = (schedule) => {
        setEditingSchedule(schedule.id)
        setFormData({
            day: schedule.day,
            start_time: schedule.start_time ? schedule.start_time.substring(0, 5) : "09:00",
            end_time: schedule.end_time ? schedule.end_time.substring(0, 5) : "18:00",
            is_working: schedule.is_working !== undefined ? schedule.is_working : true,
        })
        setError(null)
    }

    // Add new schedule
    const handleAddSchedule = (day) => {
        setEditingSchedule("new")
        setFormData({
            day: day,
            start_time: "09:00",
            end_time: "18:00",
            is_working: true,
        })
        setError(null)
    }

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingSchedule(null)
        setError(null)
    }

    // Submit schedule form
    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setIsLoading(true)
            const scheduleData = {
                ...formData,
                user: userId,
                // Ensure is_working is a boolean
                is_working: Boolean(formData.is_working),
            }

            let updatedSchedule
            if (editingSchedule === "new") {
                // Create new schedule
                updatedSchedule = await apiSchedules.createSchedule(scheduleData)
                // Ensure is_working is properly set in the state
                setSchedules([...schedules, { ...updatedSchedule, is_working: Boolean(formData.is_working) }])
            } else {
                // Update existing schedule
                updatedSchedule = await apiSchedules.updateSchedule(editingSchedule, scheduleData)
                // Ensure is_working is properly set in the state
                setSchedules(
                    schedules.map((s) =>
                        s.id === editingSchedule ? { ...updatedSchedule, is_working: Boolean(formData.is_working) } : s,
                    ),
                )
            }

            setEditingSchedule(null)
            setError(null)
        } catch (error) {
            console.error("Error submitting schedule form:", error)
            setError(t("error_updating_schedule"))
        } finally {
            setIsLoading(false)
        }
    }

    // Delete schedule
    const handleDeleteSchedule = async (scheduleId) => {
        try {
            setIsLoading(true)
            await apiSchedules.deleteSchedule(scheduleId)
            setSchedules(schedules.filter((s) => s.id !== scheduleId))
            setError(null)
        } catch (error) {
            console.error("Error deleting schedule:", error)
            setError(t("error_deleting_schedule"))
        } finally {
            setIsLoading(false)
        }
    }

    // Toggle schedule working status
    const handleToggleStatus = async (scheduleId, currentStatus) => {
        try {
            setIsLoading(true)
            // Convert currentStatus to boolean if it's not already
            const isCurrentlyWorking = Boolean(currentStatus)
            await apiSchedules.updateScheduleStatus(scheduleId, !isCurrentlyWorking)

            // Update the local state with the new status
            setSchedules(schedules.map((s) => (s.id === scheduleId ? { ...s, is_working: !isCurrentlyWorking } : s)))

            setError(null)
        } catch (error) {
            console.error("Error toggling schedule status:", error)
            setError(t("error_updating_schedule"))
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="xodim-modal-overlay">
            <div className="xodim-modal xodim-full-schedule-modal">
                <div className="xodim-modal-header">
                    <h2>
                        <FaCalendarAlt style={{ marginRight: "8px" }} />
                        {t("full_schedule")}: {userName}
                    </h2>
                    <button className="xodim-close-button" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="xodim-modal-content">
                    {error && <div className="xodim-error">{error}</div>}

                    {editingSchedule && (
                        <div className="xodim-schedule-form-container">
                            <h3>{editingSchedule === "new" ? t("add_schedule") : t("edit_schedule")}</h3>
                            <form onSubmit={handleSubmit} className="xodim-schedule-form">
                                <div className="xodim-form-group">
                                    <label>{t("day")}</label>
                                    <select name="day" value={formData.day} onChange={handleInputChange} required>
                                        <option value="">{t("select_day")}</option>
                                        {allDays.map((day) => (
                                            <option key={day} value={day}>
                                                {getDayName(day)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="xodim-form-row">
                                    <div className="xodim-form-group">
                                        <label>{t("start_time")}</label>
                                        <input
                                            type="time"
                                            name="start_time"
                                            value={formData.start_time}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="xodim-form-group">
                                        <label>{t("end_time")}</label>
                                        <input
                                            type="time"
                                            name="end_time"
                                            value={formData.end_time}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="xodim-form-group">
                                    <label className="xodim-checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="is_working"
                                            checked={formData.is_working}
                                            onChange={handleInputChange}
                                        />
                                        {t("working_day")}
                                    </label>
                                </div>

                                <div className="xodim-form-actions">
                                    <button
                                        type="button"
                                        className="xodim-btn xodim-btn-secondary"
                                        onClick={handleCancelEdit}
                                        disabled={isLoading}
                                    >
                                        {t("cancel")}
                                    </button>
                                    <button type="submit" className="xodim-btn xodim-btn-primary" disabled={isLoading}>
                                        {isLoading ? <FaSpinner className="xodim-spinner" /> : <FaSave />} {t("save")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="xodim-schedule-table-container">
                        <table className="xodim-schedule-table">
                            <thead>
                                <tr>
                                    <th>{t("day")}</th>
                                    <th>{t("start_time")}</th>
                                    <th>{t("end_time")}</th>
                                    <th>{t("status")}</th>
                                    <th>{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allDays.map((day) => {
                                    const daySchedule = schedules.find((s) => s.day === day)
                                    return (
                                        <tr key={day} className={daySchedule?.is_working ? "working-row" : "not-working-row"}>
                                            <td>{getDayName(day)}</td>
                                            <td>
                                                {daySchedule ? (
                                                    daySchedule.start_time?.substring(0, 5) || "-"
                                                ) : (
                                                    <span className="xodim-not-set">{t("not_set")}</span>
                                                )}
                                            </td>
                                            <td>
                                                {daySchedule ? (
                                                    daySchedule.end_time?.substring(0, 5) || "-"
                                                ) : (
                                                    <span className="xodim-not-set">{t("not_set")}</span>
                                                )}
                                            </td>
                                            <td>
                                                {daySchedule ? (
                                                    <span
                                                        className={`xodim-status-badge ${daySchedule.is_working ? "active" : "inactive"}`}
                                                        onClick={() => daySchedule && handleToggleStatus(daySchedule.id, daySchedule.is_working)}
                                                    >
                                                        {daySchedule.is_working ? t("working") : t("not_working")}
                                                    </span>
                                                ) : (
                                                    <span className="xodim-not-set">{t("not_set")}</span>
                                                )}
                                            </td>
                                            <td>
                                                {daySchedule ? (
                                                    <div className="xodim-table-actions">
                                                        <button
                                                            className="xodim-btn xodim-btn-sm xodim-btn-outline"
                                                            onClick={() => handleEditSchedule(daySchedule)}
                                                            disabled={isLoading}
                                                        >
                                                            <FaEdit /> {t("edit")}
                                                        </button>
                                                        <button
                                                            className="xodim-btn xodim-btn-sm xodim-btn-danger"
                                                            onClick={() => handleDeleteSchedule(daySchedule.id)}
                                                            disabled={isLoading}
                                                        >
                                                            <FaTimes /> {t("delete")}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="xodim-btn xodim-btn-sm xodim-btn-primary"
                                                        onClick={() => handleAddSchedule(day)}
                                                        disabled={isLoading || editingSchedule}
                                                    >
                                                        <FaPlus /> {t("add")}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StaffDetailsModal
