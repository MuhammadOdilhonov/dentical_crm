"use client"

import { useState, useEffect } from "react"
import {
    FaTasks,
    FaSearch,
    FaFilter,
    FaPlus,
    FaChevronLeft,
    FaChevronRight,
    FaListUl,
    FaUser,
    FaEdit,
    FaTrash,
    FaEye,
    FaCheck,
    FaClock,
    FaExclamationTriangle,
} from "react-icons/fa"
import { useAuth } from "../../../contexts/AuthContext"
import { useLanguage } from "../../../contexts/LanguageContext"
import TaskCalendar from "../../commonTasks/taskCalendar/TaskCalendar"
import TaskForm from "../../commonTasks/taskForm/TaskForm"
import TaskDetails from "../../commonTasks/taskDetails/TaskDetails"
import DayTasksList from "../../commonTasks/DayTasksList/DayTasksList"
import ConfirmModal from "../../modal/ConfirmModal"
import Pagination from "../../pagination/Pagination"
import apiTasks from "../../../api/apiTasks"
import apiUsers from "../../../api/apiUsers"

export default function ATasks() {
    const { selectedBranch } = useAuth()
    const { t, language } = useLanguage()

    // State for tasks
    const [loading, setLoading] = useState(true)
    const [tasks, setTasks] = useState([])
    const [totalTasks, setTotalTasks] = useState(0)
    const [error, setError] = useState(null)

    // State for view
    const [view, setView] = useState("month") // month, week, day, year, list
    const [currentDate, setCurrentDate] = useState(new Date())
    const [showTaskForm, setShowTaskForm] = useState(false)
    const [showTaskDetails, setShowTaskDetails] = useState(false)
    const [showDayTasks, setShowDayTasks] = useState(false)
    const [selectedDay, setSelectedDay] = useState(null)
    const [selectedTask, setSelectedTask] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [newTaskDate, setNewTaskDate] = useState(null)
    const [selectedMonthTasks, setSelectedMonthTasks] = useState([])
    const [isMonthView, setIsMonthView] = useState(false)

    // State for filters and pagination
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [priorityFilter, setPriorityFilter] = useState("all")
    const [assigneeFilter, setAssigneeFilter] = useState("all")
    const [staff, setStaff] = useState([])
    const [showFilters, setShowFilters] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)

    // Fetch tasks based on view
    const fetchTasks = async () => {
        setLoading(true)
        try {
            let tasksData
            const formattedDate =
                currentDate instanceof Date ? currentDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]

            // Ensure page is at least 1
            const validPage = Math.max(1, currentPage)

            // Different API calls based on view
            switch (view) {
                case "day":
                    tasksData = await apiTasks.fetchDailyTasks(formattedDate, selectedBranch)
                    break
                case "week":
                    tasksData = await apiTasks.fetchWeeklyTasks(formattedDate, selectedBranch)
                    break
                case "month":
                    tasksData = await apiTasks.fetchMonthlyTasks(formattedDate, selectedBranch)
                    break
                case "year":
                    tasksData = await apiTasks.fetchYearlyTasks(formattedDate, selectedBranch)
                    break
                case "list":
                    // For list view, use the regular tasks endpoint with filters
                    const filters = {
                        status: statusFilter !== "all" ? statusFilter : undefined,
                        priority: priorityFilter !== "all" ? priorityFilter : undefined,
                        assignee: assigneeFilter !== "all" ? assigneeFilter : undefined,
                        branch: selectedBranch !== "all" ? selectedBranch : undefined,
                        search: searchQuery || undefined,
                    }
                    tasksData = await apiTasks.fetchTasks(validPage, itemsPerPage, filters)
                    break
                default:
                    tasksData = await apiTasks.fetchMonthlyTasks(formattedDate, selectedBranch)
            }

            // Handle different response formats
            // If tasksData is an array, use it directly, otherwise check for results property
            const taskItems = Array.isArray(tasksData) ? tasksData : tasksData.results || []
            const totalCount = Array.isArray(tasksData) ? taskItems.length : tasksData.count || 0

            // Transform API data to match the expected format in the UI
            const transformedTasks = taskItems.map((task) => ({
                id: task.id,
                title: task.title,
                description: task.description,
                startDate: new Date(`${task.start_date}T${task.start_time}`),
                endDate: new Date(`${task.end_date}T${task.end_time}`),
                status: task.status,
                priority: task.priority,
                assignee: {
                    id: task.assignee_data ? task.assignee_data.id : task.assignee,
                    name: task.assignee_data ? `${task.assignee_data.first_name} ${task.assignee_data.last_name}` : "Unknown",
                    role: task.assignee_data ? task.assignee_data.role : "",
                },
                createdBy: task.created_by
                    ? {
                        id: task.created_by.id,
                        name: `${task.created_by.first_name || ""} ${task.created_by.last_name || ""}`.trim() || "Unknown",
                        role: task.created_by.role || "",
                    }
                    : null,
                createdAt: new Date(task.created_at),
            }))

            setTasks(transformedTasks)
            setTotalTasks(totalCount)
            setError(null)
        } catch (err) {
            console.error("Error fetching tasks:", err)
            setError(t("error_fetching_tasks"))
        } finally {
            setLoading(false)
        }
    }

    // Fetch staff (users)
    const fetchStaff = async () => {
        try {
            // Use a large page size to get all staff
            const filters = {
                branch: selectedBranch !== "all" ? selectedBranch : undefined,
            }
            const usersData = await apiUsers.fetchUsers(1, 1000, filters)

            // Transform API data
            const transformedStaff = usersData.results
                ? usersData.results.map((user) => ({
                    id: user.id,
                    name: `${user.first_name} ${user.last_name}`,
                    role: user.role,
                    department: user.department || "",
                }))
                : []

            setStaff(transformedStaff)
        } catch (err) {
            console.error("Error fetching staff:", err)
        }
    }

    // Initial data loading
    useEffect(() => {
        fetchStaff()
    }, [selectedBranch])

    // Fetch tasks when view, date, or filters change
    useEffect(() => {
        fetchTasks()
    }, [view, currentDate, selectedBranch, currentPage, itemsPerPage])

    // Fetch tasks when filters change in list view
    useEffect(() => {
        if (view === "list") {
            fetchTasks()
        }
    }, [statusFilter, priorityFilter, assigneeFilter, searchQuery])

    // Navigate to previous month/week/day
    const handlePrevious = () => {
        const newDate = new Date(currentDate)
        if (view === "month") {
            newDate.setMonth(newDate.getMonth() - 1)
        } else if (view === "week") {
            newDate.setDate(newDate.getDate() - 7)
        } else if (view === "day") {
            newDate.setDate(newDate.getDate() - 1)
        } else if (view === "year") {
            newDate.setFullYear(newDate.getFullYear() - 1)
        } else {
            newDate.setDate(newDate.getDate() - 7)
        }
        setCurrentDate(newDate)
    }

    // Navigate to next month/week/day
    const handleNext = () => {
        const newDate = new Date(currentDate)
        if (view === "month") {
            newDate.setMonth(newDate.getMonth() + 1)
        } else if (view === "week") {
            newDate.setDate(newDate.getDate() + 7)
        } else if (view === "day") {
            newDate.setDate(newDate.getDate() + 1)
        } else if (view === "year") {
            newDate.setFullYear(newDate.getFullYear() + 1)
        } else {
            newDate.setDate(newDate.getDate() + 7)
        }
        setCurrentDate(newDate)
    }

    // Go to today
    const goToToday = () => {
        setCurrentDate(new Date())
    }

    // Ilova tiliga mos locale (tizim tili emas)
    const appLocale = { uz: "uz-UZ", ru: "ru-RU", en: "en-US" }[language] || "uz-UZ"

    // Format date for display
    const formatDateRange = () => {
        if (view === "month") {
            const options = { month: "long", year: "numeric" }
            return new Intl.DateTimeFormat(appLocale, options).format(currentDate)
        } else if (view === "week") {
            const startOfWeek = new Date(currentDate)
            let dayOfWeek = currentDate.getDay()
            if (dayOfWeek === 0) dayOfWeek = 7
            const diff = 1 - dayOfWeek
            startOfWeek.setDate(currentDate.getDate() + diff)

            const endOfWeek = new Date(startOfWeek)
            endOfWeek.setDate(startOfWeek.getDate() + 6)

            return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`
        } else if (view === "day") {
            return currentDate.toLocaleDateString(appLocale, { weekday: "long", day: "numeric", month: "long" })
        } else if (view === "year") {
            return currentDate.getFullYear().toString()
        } else {
            return t("tasks_list")
        }
    }

    // Open task form for creating a new task
    const handleAddTask = (date = null) => {
        setSelectedTask(null)
        setNewTaskDate(date ? new Date(date) : null)
        setShowTaskForm(true)
    }

    // Open task form for editing an existing task
    const handleEditTask = (task) => {
        setSelectedTask({ ...task })
        setNewTaskDate(null)
        setShowTaskForm(true)
        setShowTaskDetails(false)
    }

    // Open task details modal
    const handleViewTask = (task) => {
        if (!task) return

        setSelectedTask({ ...task })
        setShowTaskDetails(true)
        setShowDayTasks(false)
    }

    // Handle month click in year view
    const handleMonthClick = (month) => {
        if (!month || !month.date) return

        // Create a new date object to avoid reference issues
        const monthDate = new Date(month.date)

        // Set the current date
        setCurrentDate(monthDate)

        // Get month tasks
        const monthTasks = tasks.filter((task) => {
            if (!task || !task.startDate) return false

            const taskDate = new Date(task.startDate)
            return taskDate.getMonth() === monthDate.getMonth() && taskDate.getFullYear() === monthDate.getFullYear()
        })

        setSelectedDay({
            date: monthDate,
            isMonth: true,
            monthName: monthDate.toLocaleString(appLocale, { month: "long" }),
            year: monthDate.getFullYear(),
        })

        setSelectedMonthTasks(monthTasks)
        setIsMonthView(true)
        setShowDayTasks(true)

        // Change view to month after selecting a month
        setView("month")
    }

    // Handle day click in calendar
    const handleDayClick = (day) => {
        if (!day) return

        // If year view and month is clicked
        if (view === "year") {
            handleMonthClick(day)
            return
        }

        // Create a new date object to avoid reference issues
        const dayDate = new Date(day.date)

        // Get day tasks
        const dayTasks = tasks.filter((task) => {
            if (!task || !task.startDate) return false

            const taskDate = new Date(task.startDate)
            return (
                taskDate.getDate() === dayDate.getDate() &&
                taskDate.getMonth() === dayDate.getMonth() &&
                taskDate.getFullYear() === dayDate.getFullYear()
            )
        })

        setSelectedDay({
            date: dayDate,
            isCurrentMonth: day.isCurrentMonth,
            isToday: day.isToday,
            tasks: dayTasks,
        })

        setSelectedMonthTasks([])
        setIsMonthView(false)
        setShowDayTasks(true)
    }

    // Handle task form submission
    const handleTaskSubmit = async (taskData) => {
        try {
            if (selectedTask && selectedTask.id) {
                // Update existing task
                await apiTasks.updateTask(selectedTask.id, taskData)
            } else {
                // Create new task
                await apiTasks.createTask(taskData)
            }

            // Refresh tasks
            fetchTasks()

            // Close form
            setShowTaskForm(false)
            setNewTaskDate(null)
        } catch (error) {
            console.error("Error saving task:", error)
            alert(t("error_saving_task"))
        }
    }

    // Handle task deletion
    const handleDeleteTask = (taskId) => {
        const task = tasks.find((task) => task.id === taskId)
        if (task) {
            setSelectedTask(task)
            setShowDeleteConfirm(true)
        }
    }

    // Calculate page count and ensure it's at least 1
    const pageCount = Math.max(1, Math.ceil(totalTasks / itemsPerPage))

    // Handle page change with validation
    const handlePageChange = (page) => {
        // API uses 1-based pagination, but react-paginate uses 0-based indexing
        setCurrentPage(page + 1)
    }

    // Handle items per page change
    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage)
        setCurrentPage(1) // Reset to first page when items per page changes
    }

    // Confirm task deletion
    const confirmDeleteTask = async () => {
        if (!selectedTask || !selectedTask.id) return

        try {
            await apiTasks.deleteTask(selectedTask.id)

            // Refresh tasks
            fetchTasks()

            // Close modals
            setShowDeleteConfirm(false)
            setShowTaskDetails(false)
        } catch (error) {
            console.error("Error deleting task:", error)
            alert(t("error_deleting_task"))
        }
    }

    // Handle task status change
    const handleStatusChange = async (taskId, newStatus) => {
        const task = tasks.find((t) => t.id === taskId)
        if (!task) return

        try {
            await apiTasks.updateTask(taskId, { ...task, status: newStatus })

            // Refresh tasks
            fetchTasks()

            // Close details
            setShowTaskDetails(false)
        } catch (error) {
            console.error("Error updating task status:", error)
            alert(t("error_updating_task"))
        }
    }

    // Toggle filters visibility
    const toggleFilters = () => {
        setShowFilters(!showFilters)
    }

    if (loading && tasks.length === 0) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>{t("loading")}...</p>
            </div>
        )
    }

    return (
        <div className="director-tasks admin-tasks">
            <div className="tasks-container">
                <div className="tasks-header">
                    <div className="header-left">
                        <button className="today-btn" onClick={goToToday}>
                            {t("today")}
                        </button>
                        <div className="navigation-buttons">
                            <button className="nav-btn" onClick={handlePrevious}>
                                <FaChevronLeft />
                            </button>
                            <button className="nav-btn" onClick={handleNext}>
                                <FaChevronRight />
                            </button>
                        </div>
                        <h2 className="current-date-title">{formatDateRange()}</h2>
                    </div>

                    <div className="header-right">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder={t("search_tasks")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        fetchTasks()
                                    }
                                }}
                            />
                        </div>

                        <button className="filter-btn" onClick={toggleFilters}>
                            <FaFilter />
                        </button>

                        <div className="view-buttons">
                            <button className={`view-btn ${view === "day" ? "active" : ""}`} onClick={() => setView("day")}>
                                {t("day")}
                            </button>
                            <button className={`view-btn ${view === "week" ? "active" : ""}`} onClick={() => setView("week")}>
                                {t("week")}
                            </button>
                            <button className={`view-btn ${view === "month" ? "active" : ""}`} onClick={() => setView("month")}>
                                {t("month")}
                            </button>
                            <button className={`view-btn ${view === "year" ? "active" : ""}`} onClick={() => setView("year")}>
                                {t("year")}
                            </button>
                        </div>

                        <button className={`list-view-btn ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>
                            <FaListUl />
                            {t("list_view")}
                        </button>

                        <div className="header-actions">
                            <button className="create-btn" onClick={() => handleAddTask()}>
                                <FaPlus />
                            </button>
                        </div>
                    </div>
                </div>

                {showFilters && (
                    <div className="filters-panel">
                        <div className="filter-group">
                            <label>{t("status")}:</label>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">{t("all")}</option>
                                <option value="pending">{t("pending")}</option>
                                <option value="in_progress">{t("in_progress")}</option>
                                <option value="completed">{t("completed")}</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>{t("priority")}:</label>
                            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                                <option value="all">{t("all")}</option>
                                <option value="high">{t("high")}</option>
                                <option value="medium">{t("medium")}</option>
                                <option value="low">{t("low")}</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>{t("assignee")}:</label>
                            <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
                                <option value="all">{t("all")}</option>
                                {staff.map((person) => (
                                    <option key={person.id} value={person.id.toString()}>
                                        {person.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {view !== "list" ? (
                    <div className="calendar-container">
                        <TaskCalendar
                            tasks={tasks}
                            currentDate={currentDate}
                            view={view}
                            onTaskClick={handleViewTask}
                            onDayClick={handleDayClick}
                            onMonthClick={handleMonthClick}
                        />
                    </div>
                ) : (
                    <div className="tasks-list-container">
                        <h2 className="section-title">{t("tasks_list")}</h2>
                        {loading ? (
                            <div className="loading-indicator">
                                <div className="loading-spinner"></div>
                                <p>{t("loading")}...</p>
                            </div>
                        ) : error ? (
                            <div className="error-message">{error}</div>
                        ) : tasks.length > 0 ? (
                            <>
                                <div className="tasks-list">
                                    <table className="tasks-table">
                                        <thead>
                                            <tr>
                                                <th>{t("title")}</th>
                                                <th>{t("assignee")}</th>
                                                <th>{t("start_date")}</th>
                                                <th>{t("status")}</th>
                                                <th>{t("priority")}</th>
                                                <th>{t("actions")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tasks.map((task) => (
                                                <tr key={task.id} className={`task-row ${task.status}`}>
                                                    <td className="task-title">{task.title}</td>
                                                    <td className="task-assignee">
                                                        <div className="assignee-info">
                                                            <FaUser className="assignee-icon" />
                                                            <span>{task.assignee.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="task-date">
                                                        {task.startDate.toLocaleDateString()}{" "}
                                                        {task.startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </td>
                                                    <td className="task-status">
                                                        <span className={`status-badge ${task.status}`}>
                                                            {task.status === "completed" && <FaCheck className="status-icon" />}
                                                            {task.status === "in_progress" && <FaClock className="status-icon" />}
                                                            {task.status === "pending" && <FaExclamationTriangle className="status-icon" />}
                                                            {t(task.status)}
                                                        </span>
                                                    </td>
                                                    <td className="task-priority">
                                                        <span className={`priority-badge ${task.priority}-priority`}>{t(task.priority)}</span>
                                                    </td>
                                                    <td className="task-actions">
                                                        <button className="action-btn view" onClick={() => handleViewTask(task)} title={t("view")}>
                                                            <FaEye />
                                                        </button>
                                                        <button className="action-btn edit" onClick={() => handleEditTask(task)} title={t("edit")}>
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            className="action-btn delete"
                                                            onClick={() => handleDeleteTask(task.id)}
                                                            title={t("delete")}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="pagination-container">
                                    <Pagination
                                        pageCount={pageCount}
                                        currentPage={currentPage - 1}
                                        onPageChange={(page) => handlePageChange(page)}
                                        itemsPerPage={itemsPerPage}
                                        totalItems={totalTasks}
                                        onItemsPerPageChange={handleItemsPerPageChange}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="no-tasks-message">
                                <FaTasks />
                                <p>{t("no_tasks_found")}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showTaskForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <TaskForm
                            task={selectedTask}
                            staff={staff}
                            initialDate={newTaskDate}
                            onSubmit={handleTaskSubmit}
                            onCancel={() => {
                                setShowTaskForm(false)
                                setNewTaskDate(null)
                            }}
                            canAssignToAll={true} // Admin can assign tasks to all staff
                        />
                    </div>
                </div>
            )}

            {showTaskDetails && selectedTask && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <TaskDetails
                            task={selectedTask}
                            onClose={() => setShowTaskDetails(false)}
                            onEdit={() => handleEditTask(selectedTask)}
                            onDelete={() => handleDeleteTask(selectedTask.id)}
                            onStatusChange={(newStatus) => handleStatusChange(selectedTask.id, newStatus)}
                        />
                    </div>
                </div>
            )}

            {showDayTasks && selectedDay && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <DayTasksList
                            day={selectedDay}
                            tasks={
                                isMonthView
                                    ? selectedMonthTasks
                                    : tasks.filter((task) => {
                                        if (!task || !task.startDate) return false

                                        const taskDate = new Date(task.startDate)
                                        return (
                                            taskDate.getDate() === selectedDay.date.getDate() &&
                                            taskDate.getMonth() === selectedDay.date.getMonth() &&
                                            taskDate.getFullYear() === selectedDay.date.getFullYear()
                                        )
                                    })
                            }
                            isMonthView={isMonthView}
                            onClose={() => {
                                setShowDayTasks(false)
                                setIsMonthView(false)
                            }}
                            onTaskClick={handleViewTask}
                            onAddTask={() => {
                                setShowDayTasks(false)
                                setIsMonthView(false)
                                handleAddTask(selectedDay.date)
                            }}
                        />
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <ConfirmModal
                            isOpen={showDeleteConfirm}
                            title={t("confirm_delete")}
                            message={t("confirm_delete_task_message")}
                            confirmText={t("delete")}
                            cancelText={t("cancel")}
                            onConfirm={confirmDeleteTask}
                            onClose={() => setShowDeleteConfirm(false)}
                            onCancel={() => setShowDeleteConfirm(false)}
                            type="danger"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
