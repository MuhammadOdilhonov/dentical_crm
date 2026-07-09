"use client"

import { useState, useEffect } from "react"
import { FaTimes } from "react-icons/fa"
import { useLanguage } from "../../../contexts/LanguageContext"
import { useAuth } from "../../../contexts/AuthContext"

export default function TaskForm({ task, staff, initialDate, onSubmit, onCancel }) {
    const { t } = useLanguage()
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        status: "pending",
        priority: "medium",
        assigneeId: "",
    })

    useEffect(() => {
        if (task && task.id) {
            // Format dates for form inputs
            const startDate = task.startDate.toISOString().split("T")[0]
            const startTime = task.startDate.toTimeString().slice(0, 5)
            const endDate = task.endDate.toISOString().split("T")[0]
            const endTime = task.endDate.toTimeString().slice(0, 5)

            setFormData({
                title: task.title || "",
                description: task.description || "",
                startDate,
                startTime,
                endDate,
                endTime,
                status: task.status || "pending",
                priority: task.priority || "medium",
                assigneeId: task.assignee?.id?.toString() || "",
            })
        } else if (initialDate) {
            // If initialDate is provided, set the start and end date/time
            const startDate = initialDate.toISOString().split("T")[0]

            // Set default start time to 9:00 AM
            const startTime = "09:00"

            // Set default end time to 10:00 AM
            const endTime = "10:00"

            setFormData((prevFormData) => ({
                ...prevFormData,
                startDate,
                startTime,
                endDate: startDate,
                endTime,
            }))
        }

        // Agar hamshira o'ziga vazifa yaratayotgan bo'lsa va staff ro'yxatida faqat bitta kishi bo'lsa
        // (ya'ni hamshiraning o'zi), assigneeId ni avtomatik ravishda o'rnatish
        if (staff.length === 1 && user.role === "nurse" && !task) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                assigneeId: staff[0].id.toString(),
            }))
        }
    }, [task, initialDate, staff, user.role])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        // Combine date and time into Date objects
        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

        // Find the selected assignee from staff
        const assignee = staff.find((person) => person.id.toString() === formData.assigneeId)

        if (!assignee) {
            alert(t("please_select_assignee"))
            return
        }

        // Prepare task data for submission
        const taskData = {
            title: formData.title,
            description: formData.description,
            startDate: startDateTime,
            endDate: endDateTime,
            status: formData.status,
            priority: formData.priority,
            assignee: assignee,
        }

        // If editing, preserve the id
        if (task && task.id) {
            taskData.id = task.id
        }

        onSubmit(taskData)
    }

    // Hamshira o'ziga vazifa yaratayotganda va staff ro'yxatida faqat bitta kishi bo'lsa (ya'ni hamshiraning o'zi),
    // assignee tanlash qismini ko'rsatmaslik
    const showAssigneeSelect = !(staff.length === 1 && user.role === "nurse")

    return (
        <form className="task-form" onSubmit={handleSubmit}>
            <div className="form-header">
                <h2>{task && task.id ? t("edit_task") : t("add_task")}</h2>
                <button type="button" className="close-button" onClick={onCancel}>
                    <FaTimes />
                </button>
            </div>

            <div className="form-group">
                <label htmlFor="title">{t("task_title")}*</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label htmlFor="description">{t("description")}</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange}></textarea>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="startDate">{t("start_date")}*</label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="startTime">{t("start_time")}*</label>
                    <input
                        type="time"
                        id="startTime"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="endDate">{t("end_date")}*</label>
                    <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label htmlFor="endTime">{t("end_time")}*</label>
                    <input type="time" id="endTime" name="endTime" value={formData.endTime} onChange={handleChange} required />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="status">{t("status")}</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange}>
                        <option value="pending">{t("pending")}</option>
                        <option value="in_progress">{t("in_progress")}</option>
                        <option value="completed">{t("completed")}</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="priority">{t("priority")}</label>
                    <select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
                        <option value="low">{t("low")}</option>
                        <option value="medium">{t("medium")}</option>
                        <option value="high">{t("high")}</option>
                    </select>
                </div>
            </div>

            {showAssigneeSelect ? (
                <div className="form-group">
                    <label htmlFor="assigneeId">{t("assignee")}*</label>
                    <select id="assigneeId" name="assigneeId" value={formData.assigneeId} onChange={handleChange} required>
                        <option value="">{t("select_assignee")}</option>
                        {staff &&
                            staff.map((person) => (
                                <option key={person.id} value={person.id.toString()}>
                                    {person.name} ({t(person.role)})
                                </option>
                            ))}
                    </select>
                </div>
            ) : (
                <input type="hidden" name="assigneeId" value={formData.assigneeId} />
            )}

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}>
                    {t("cancel")}
                </button>
                <button type="submit" className="btn-primary">
                    {task && task.id ? t("update_task") : t("create_task")}
                </button>
            </div>
        </form>
    )
}
