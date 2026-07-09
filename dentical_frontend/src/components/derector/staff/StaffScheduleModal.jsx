"use client"

import { useState } from "react"
import { FaTimes, FaEdit, FaPlus, FaSpinner, FaCheck, FaTrash, FaCalendarAlt } from "react-icons/fa"
import { useLanguage } from "../../../contexts/LanguageContext"
import apiSchedules from "../../../api/apiSchedules"

const StaffScheduleModal = ({ isOpen, onClose, userId, userName, initialSchedules = [] }) => {
    const { t } = useLanguage()
    const [schedules, setSchedules] = useState(initialSchedules)
    const [isLoading, setIsLoading] = useState(false)
    const [editMode, setEditMode] = useState(null)
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

    // Toggle schedule working status
    const handleToggleScheduleStatus = async (scheduleId, currentStatus) => {
        try {
            setIsLoading(true)
            await apiSchedules.updateScheduleStatus(scheduleId, !currentStatus)

            // Update local state
            setSchedules((prevSchedules) =>
                prevSchedules.map((schedule) =>
                    schedule.id === scheduleId ? { ...schedule, is_working: !currentStatus } : schedule,
                ),
            )
            setError(null)
        } catch (error) {
            console.error("Error updating schedule status:", error)
            setError(t("error_updating_schedule"))
        } finally {
            setIsLoading(false)
        }
    }

    // Start editing a schedule
    const handleEditSchedule = (schedule) => {
        setEditMode(schedule.id || schedule.day)
        setFormData({
            day: schedule.day,
            start_time: schedule.start_time ? schedule.start_time.substring(0, 5) : "09:00",
            end_time: schedule.end_time ? schedule.end_time.substring(0, 5) : "18:00",
            is_working: schedule.is_working !== undefined ? schedule.is_working : true,
        })
        setError(null)
    }

    // Cancel editing
    const handleCancelEdit = () => {
        setEditMode(null)
        setError(null)
    }

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        })
    }

    // Submit schedule form
    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setIsLoading(true)
            const scheduleData = {
                ...formData,
                user: userId,
            }

            let updatedSchedule
            const existingSchedule = schedules.find((s) => s.id === editMode || (s.day === formData.day && !editMode))

            if (existingSchedule?.id) {
                // Update existing schedule
                updatedSchedule = await apiSchedules.updateSchedule(existingSchedule.id, scheduleData)

                // Update local state
                setSchedules((prevSchedules) =>
                    prevSchedules.map((schedule) => (schedule.id === existingSchedule.id ? updatedSchedule : schedule)),
                )
            } else {
                // Create new schedule
                updatedSchedule = await apiSchedules.createSchedule(scheduleData)

                // Add to local state
                setSchedules((prevSchedules) => [...prevSchedules, updatedSchedule])
            }

            setEditMode(null)
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
        if (!scheduleId) return

        try {
            setIsLoading(true)
            await apiSchedules.deleteSchedule(scheduleId)

            // Remove from local state
            setSchedules((prevSchedules) => prevSchedules.filter((schedule) => schedule.id !== scheduleId))
            setError(null)
        } catch (error) {
            console.error("Error deleting schedule:", error)
            setError(t("error_deleting_schedule"))
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="xodim-modal-overlay">
            <div className="xodim-modal">
                <div className="xodim-modal-header">
                    <h2>
                        <FaCalendarAlt style={{ marginRight: "8px" }} />
                        {t("working_schedule")}: {userName}
                    </h2>
                    <button className="xodim-close-button" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="xodim-modal-content">
                    {error && (
                        <div className="xodim-error" style={{ marginBottom: "20px" }}>
                            {error}
                        </div>
                    )}

                    {isLoading && (
                        <div className="xodim-loading" style={{ marginBottom: "20px" }}>
                            <FaSpinner className="xodim-spinner" /> {t("loading")}
                        </div>
                    )}

                    <div className="xodim-schedule-grid">
                        {allDays.map((day) => {
                            const daySchedule = schedules.find((s) => s.day === day)
                            const isEditing = editMode === (daySchedule?.id || day)

                            return (
                                <div key={day} className={`xodim-schedule-card ${daySchedule?.is_working ? "working" : "not-working"}`}>
                                    <div className="xodim-schedule-day-header">
                                        <h4>{getDayName(day)}</h4>
                                        {!isEditing && daySchedule && (
                                            <label className="xodim-schedule-toggle">
                                                <input
                                                    type="checkbox"
                                                    checked={daySchedule.is_working || false}
                                                    onChange={() => handleToggleScheduleStatus(daySchedule.id, daySchedule.is_working)}
                                                    disabled={isLoading}
                                                />
                                                <span className="xodim-schedule-slider"></span>
                                            </label>
                                        )}
                                    </div>

                                    <div className="xodim-schedule-time">
                                        {isEditing ? (
                                            <form onSubmit={handleSubmit}>
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
                                                        className="xodim-btn xodim-btn-secondary xodim-btn-sm"
                                                        onClick={handleCancelEdit}
                                                        disabled={isLoading}
                                                    >
                                                        {t("cancel")}
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="xodim-btn xodim-btn-primary xodim-btn-sm"
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? <FaSpinner className="xodim-spinner" /> : <FaCheck />} {t("save")}
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <>
                                                {daySchedule ? (
                                                    daySchedule.is_working ? (
                                                        <>
                                                            <p>
                                                                {daySchedule.start_time?.substring(0, 5)} - {daySchedule.end_time?.substring(0, 5)}
                                                            </p>
                                                            <div className="xodim-form-actions">
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
                                                                    <FaTrash /> {t("delete")}
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <p className="xodim-schedule-not-working">{t("not_working")}</p>
                                                    )
                                                ) : (
                                                    <>
                                                        <p className="xodim-schedule-not-set">{t("not_set")}</p>
                                                        <button
                                                            className="xodim-btn xodim-btn-sm xodim-btn-outline"
                                                            onClick={() =>
                                                                handleEditSchedule({ day, start_time: "09:00", end_time: "18:00", is_working: true })
                                                            }
                                                            disabled={isLoading}
                                                        >
                                                            <FaPlus /> {t("add")}
                                                        </button>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StaffScheduleModal
