"use client"

import {
    FaTimes,
    FaEdit,
    FaTrash,
    FaCheck,
    FaSpinner,
    FaClock,
    FaCalendarAlt,
    FaUser,
    FaFlag,
    FaInfoCircle,
} from "react-icons/fa"
import { useLanguage } from "../../../contexts/LanguageContext"
import { FaClock as FaTime } from "react-icons/fa"

export default function TaskDetails({ task, onClose, onEdit, onDelete, onStatusChange }) {
    const { t } = useLanguage()

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return ""
        return new Intl.DateTimeFormat(navigator.language, {
            dateStyle: "medium",
        }).format(new Date(dateString))
    }

    // Format time for display
    const formatTime = (timeString) => {
        if (!timeString) return ""
        // Если timeString - это строка времени в формате "HH:MM:SS"
        if (typeof timeString === "string" && timeString?.includes(":")) {
            const [hours, minutes] = timeString.split(":")
            return `${hours}:${minutes}`
        }
        // Если timeString - это объект Date
        return new Intl.DateTimeFormat(navigator.language, {
            timeStyle: "short",
        }).format(new Date(timeString))
    }

    // Format datetime for display
    const formatDateTime = (dateString, timeString) => {
        if (!dateString) return ""

        let date
        if (typeof dateString === "string" && timeString && typeof timeString === "string") {
            // Если у нас отдельные строки для даты и времени
            date = new Date(`${dateString}T${timeString}`)
        } else if (dateString instanceof Date) {
            // Если у нас объект Date
            date = dateString
        } else {
            // Если у нас строка ISO
            date = new Date(dateString)
        }

        return new Intl.DateTimeFormat(navigator.language, {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date)
    }

    // Get status badge text
    const getStatusText = (status) => {
        switch (status) {
            case "pending":
                return t("pending")
            case "in_progress":
                return t("in_progress")
            case "completed":
                return t("completed")
            default:
                return status
        }
    }

    // Get priority text
    const getPriorityText = (priority) => {
        switch (priority) {
            case "low":
                return t("low")
            case "medium":
                return t("medium")
            case "high":
                return t("high")
            default:
                return priority
        }
    }

    // Получаем данные о назначенном пользователе
    const getAssigneeName = () => {
        if (task.assignee_data) {
            return `${task.assignee_data.first_name} ${task.assignee_data.last_name}`
        } else if (task.assignee && typeof task.assignee === "object" && task.assignee.name) {
            return task.assignee.name
        } else {
            return t("unknown")
        }
    }

    // Получаем данные о создателе задачи
    const getCreatedByName = () => {
        if (task.created_by) {
            return `${task.created_by.first_name} ${task.created_by.last_name}`
        } else if (task.createdBy && task.createdBy.name) {
            return task.createdBy.name
        } else {
            return t("unknown")
        }
    }

    // Получаем роль пользователя
    const getUserRole = (user) => {
        if (!user) return ""

        const role = user.role
        switch (role) {
            case "doctor":
                return t("doctor")
            case "nurse":
                return t("nurse")
            case "director":
                return t("director")
            case "admin":
                return t("admin")
            default:
                return role
        }
    }

    return (
        <div className="task-details-modal">
            <div className="task-details-content">
                <div className="details-header">
                    <div className="task-title-section">
                        <h2>{task.title}</h2>
                        <div className={`status-badge ${task.status}`}>{getStatusText(task.status)}</div>
                    </div>
                    <button className="close-button" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="details-content">
                    <div className="detail-section">
                        <h3>{t("description")}</h3>
                        <p className="description-text">{task.description || t("no_description")}</p>
                    </div>

                    <div className="detail-section">
                        <h3>{t("details")}</h3>

                        <div className="detail-row">
                            <div className="detail-label">
                                <FaCalendarAlt className="detail-icon" /> {t("start_date")}:
                            </div>
                            <div className="detail-value">{formatDate(task.start_date || task.startDate)}</div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label">
                                <FaTime className="detail-icon" /> {t("start_time")}:
                            </div>
                            <div className="detail-value">{formatTime(task.start_time || (task.startDate && task.startDate))}</div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label">
                                <FaCalendarAlt className="detail-icon" /> {t("end_date")}:
                            </div>
                            <div className="detail-value">{formatDate(task.end_date || task.endDate)}</div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label">
                                <FaTime className="detail-icon" /> {t("end_time")}:
                            </div>
                            <div className="detail-value">{formatTime(task.end_time || (task.endDate && task.endDate))}</div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label">
                                <FaFlag className="detail-icon" /> {t("priority")}:
                            </div>
                            <div className="detail-value">
                                <span className={`priority-badge ${task.priority}-priority`}>{getPriorityText(task.priority)}</span>
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label">
                                <FaUser className="detail-icon" /> {t("assignee")}:
                            </div>
                            <div className="detail-value">
                                <div className="user-info">
                                    <span className="user-name">{getAssigneeName()}</span>
                                    {task.assignee_data && <span className="user-role">{getUserRole(task.assignee_data)}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label">
                                <FaUser className="detail-icon" /> {t("created_by")}:
                            </div>
                            <div className="detail-value">
                                <div className="user-info">
                                    <span className="user-name">{getCreatedByName()}</span>
                                    {task.created_by && <span className="user-role">{getUserRole(task.created_by)}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label">
                                <FaClock className="detail-icon" /> {t("created_at")}:
                            </div>
                            <div className="detail-value">{formatDateTime(task.created_at || task.createdAt)}</div>
                        </div>

                        {task.id && (
                            <div className="detail-row">
                                <div className="detail-label">
                                    <FaInfoCircle className="detail-icon" /> {t("task_id")}:
                                </div>
                                <div className="detail-value">#{task.id}</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="details-actions">
                    {task.status !== "completed" && (
                        <button className="btn-success" onClick={() => onStatusChange("completed")}>
                            <FaCheck /> {t("mark_complete")}
                        </button>
                    )}

                    {task.status === "pending" && (
                        <button className="btn-primary" onClick={() => onStatusChange("in_progress")}>
                            <FaSpinner /> {t("start_task")}
                        </button>
                    )}

                    {task.status === "completed" && (
                        <button className="btn-primary" onClick={() => onStatusChange("pending")}>
                            <FaClock /> {t("reopen_task")}
                        </button>
                    )}

                    <button className="btn-primary" onClick={onEdit}>
                        <FaEdit /> {t("edit")}
                    </button>

                    <button className="btn-danger" onClick={onDelete}>
                        <FaTrash /> {t("delete")}
                    </button>
                </div>
            </div>
        </div>
    )
}
