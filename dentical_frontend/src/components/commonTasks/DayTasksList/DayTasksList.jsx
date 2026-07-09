import { FaTimes, FaPlus, FaCalendarAlt, FaUser, FaFlag } from "react-icons/fa"
import { useLanguage } from "../../../contexts/LanguageContext"

export default function DayTasksList({ day, tasks, onClose, onTaskClick, onAddTask, isMonthView }) {
    const { t } = useLanguage()

    // Format date for display
    const formatDate = (date) => {
        // Agar oy ko'rinishi bo'lsa, faqat oy va yilni ko'rsatamiz
        if (isMonthView || (day && day.isMonth)) {
            return date.toLocaleDateString(undefined, { month: "long", year: "numeric" })
        }

        // Aks holda, to'liq sanani ko'rsatamiz
        return date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    }

    // Safe task click handler
    const handleTaskClick = (task) => {
        if (task && onTaskClick) {
            onTaskClick(task)
        }
    }

    return (
        <div className="day-tasks-list">
            <div className="day-tasks-header">
                <h2>{day && day.date ? formatDate(day.date) : ""}</h2>
                <button className="close-button" onClick={onClose}>
                    <FaTimes />
                </button>
            </div>

            <div className="day-tasks-content">
                {tasks && tasks.length > 0 ? (
                    <div className="tasks-list">
                        {tasks.map((task) => (
                            <div key={task.id} className="task-item" onClick={() => handleTaskClick(task)}>
                                <div className={`task-priority ${task.priority}-priority`}></div>
                                <div className="task-info">
                                    <h3 className="task-title">{task.title}</h3>
                                    <div className="task-details">
                                        <div className="task-time">
                                            <FaCalendarAlt />
                                            <span>
                                                {task.startDate.toLocaleDateString()}{" "}
                                                {task.startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                {" - "}
                                                {task.endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                        <div className="task-assignee">
                                            <FaUser />
                                            <span>{task.assignee.name}</span>
                                        </div>
                                        <div className="task-priority-label">
                                            <FaFlag />
                                            <span>{t(task.priority)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`task-status ${task.status}`}>
                                    {task.status === "completed" && t("completed")}
                                    {task.status === "in_progress" && t("in_progress")}
                                    {task.status === "pending" && t("pending")}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-tasks">
                        <p>{isMonthView || (day && day.isMonth) ? t("no_tasks_for_this_month") : t("no_tasks_for_this_day")}</p>
                    </div>
                )}
            </div>

            <div className="day-tasks-footer">
                <button className="add-task-btn" onClick={onAddTask}>
                    <FaPlus />
                    {t("add_task")}
                </button>
            </div>
        </div>
    )
}

