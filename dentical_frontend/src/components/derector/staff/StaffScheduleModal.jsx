"use client"

import { useState, useEffect, useCallback } from "react"
import { FaTimes, FaSpinner, FaCheck, FaCalendarAlt, FaRegClock, FaMagic } from "react-icons/fa"
import { useLanguage } from "../../../contexts/LanguageContext"
import apiSchedules from "../../../api/apiSchedules"

// Haftalik ish jadvali modali — barcha kunlar bitta ro'yxatda,
// o'zgarishlar "Saqlash" bosilganda birdaniga yuboriladi.
const StaffScheduleModal = ({ isOpen, onClose, userId, userName, onSaved }) => {
    const { t } = useLanguage()

    const allDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

    const defaultDay = () => ({ id: null, start_time: "09:00", end_time: "18:00", is_working: false })

    const [days, setDays] = useState(() =>
        allDays.reduce((acc, d) => ({ ...acc, [d]: defaultDay() }), {}),
    )
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState(null)

    const getDayName = (day) => {
        const names = {
            monday: t("monday"),
            tuesday: t("tuesday"),
            wednesday: t("wednesday"),
            thursday: t("thursday"),
            friday: t("friday"),
            saturday: t("saturday"),
            sunday: t("sunday"),
        }
        return names[day] || day
    }

    // Mavjud jadvalni yuklash
    const loadSchedules = useCallback(async () => {
        if (!userId) return
        setIsLoading(true)
        setError(null)
        try {
            const data = await apiSchedules.fetchUserSchedules(userId)
            const list = Array.isArray(data) ? data : data?.results || []
            setDays(() => {
                const next = allDays.reduce((acc, d) => ({ ...acc, [d]: defaultDay() }), {})
                list.forEach((s) => {
                    if (next[s.day]) {
                        next[s.day] = {
                            id: s.id,
                            start_time: s.start_time ? s.start_time.substring(0, 5) : "09:00",
                            end_time: s.end_time ? s.end_time.substring(0, 5) : "18:00",
                            is_working: !!s.is_working,
                        }
                    }
                })
                return next
            })
        } catch (err) {
            console.error("Error loading schedules:", err)
            setError(t("error_occurred"))
        } finally {
            setIsLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, t])

    useEffect(() => {
        if (isOpen) loadSchedules()
    }, [isOpen, loadSchedules])

    const updateDay = (day, patch) => {
        setDays((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }))
    }

    const toggleDay = (day) => {
        updateDay(day, { is_working: !days[day].is_working })
    }

    // Birinchi ish kunining vaqtini barcha ish kunlariga qo'llash
    const applyToAllWorkingDays = () => {
        const firstWorking = allDays.find((d) => days[d].is_working)
        if (!firstWorking) return
        const { start_time, end_time } = days[firstWorking]
        setDays((prev) => {
            const next = { ...prev }
            allDays.forEach((d) => {
                if (next[d].is_working) next[d] = { ...next[d], start_time, end_time }
            })
            return next
        })
    }

    // Hammasini bitta bosishda saqlash
    const handleSaveAll = async () => {
        setIsSaving(true)
        setError(null)
        try {
            for (const day of allDays) {
                const d = days[day]
                const payload = {
                    user: userId,
                    day,
                    start_time: d.start_time,
                    end_time: d.end_time,
                    is_working: d.is_working,
                }
                if (d.id) {
                    await apiSchedules.updateSchedule(d.id, payload)
                } else if (d.is_working) {
                    await apiSchedules.createSchedule(payload)
                }
            }
            if (onSaved) onSaved()
            onClose()
        } catch (err) {
            console.error("Error saving schedules:", err)
            setError(t("error_updating_schedule"))
        } finally {
            setIsSaving(false)
        }
    }

    if (!isOpen) return null

    const workingCount = allDays.filter((d) => days[d].is_working).length

    return (
        <div className="xsched-overlay">
            <div className="xsched-modal">
                <div className="xsched-header">
                    <div className="xsched-header-info">
                        <div className="xsched-header-icon">
                            <FaCalendarAlt />
                        </div>
                        <div>
                            <h2>{t("weekly_schedule")}</h2>
                            <p>{userName}</p>
                        </div>
                    </div>
                    <button className="xsched-close" onClick={onClose} aria-label={t("close")}>
                        <FaTimes />
                    </button>
                </div>

                <div className="xsched-body">
                    <p className="xsched-hint">
                        <FaRegClock /> {t("set_staff_schedule_hint")}
                    </p>

                    {error && <div className="xsched-error">{error}</div>}

                    {isLoading ? (
                        <div className="xsched-loading">
                            <FaSpinner className="xsched-spinner" /> {t("loading")}...
                        </div>
                    ) : (
                        <div className="xsched-days">
                            {allDays.map((day) => {
                                const d = days[day]
                                return (
                                    <div key={day} className={`xsched-day-row ${d.is_working ? "working" : ""}`}>
                                        <label className="xsched-toggle">
                                            <input
                                                type="checkbox"
                                                checked={d.is_working}
                                                onChange={() => toggleDay(day)}
                                                disabled={isSaving}
                                            />
                                            <span className="xsched-slider"></span>
                                        </label>
                                        <span className="xsched-day-name">{getDayName(day)}</span>
                                        {d.is_working ? (
                                            <div className="xsched-times">
                                                <input
                                                    type="time"
                                                    value={d.start_time}
                                                    onChange={(e) => updateDay(day, { start_time: e.target.value })}
                                                    disabled={isSaving}
                                                />
                                                <span className="xsched-times-sep">—</span>
                                                <input
                                                    type="time"
                                                    value={d.end_time}
                                                    onChange={(e) => updateDay(day, { end_time: e.target.value })}
                                                    disabled={isSaving}
                                                />
                                            </div>
                                        ) : (
                                            <span className="xsched-day-off">{t("day_off")}</span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {workingCount > 1 && (
                        <button
                            type="button"
                            className="xsched-apply-all"
                            onClick={applyToAllWorkingDays}
                            disabled={isSaving || isLoading}
                        >
                            <FaMagic /> {t("apply_to_all_days")}
                        </button>
                    )}
                </div>

                <div className="xsched-footer">
                    <button type="button" className="xsched-btn xsched-btn-secondary" onClick={onClose} disabled={isSaving}>
                        {t("cancel")}
                    </button>
                    <button
                        type="button"
                        className="xsched-btn xsched-btn-primary"
                        onClick={handleSaveAll}
                        disabled={isSaving || isLoading}
                    >
                        {isSaving ? <FaSpinner className="xsched-spinner" /> : <FaCheck />} {t("save")}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default StaffScheduleModal
