"use client"

import { useState, useEffect } from "react"
import {
    FaTasks,
    FaCalendarAlt,
    FaSearch,
    FaFilter,
    FaPlus,
    FaChevronLeft,
    FaChevronRight,
    FaListUl,
    FaUser,
    FaFlag,
} from "react-icons/fa"
import { useAuth } from "../../../contexts/AuthContext"
import { useLanguage } from "../../../contexts/LanguageContext"
import TaskCalendar from "../../commonTasks/taskCalendar/TaskCalendar"
import TaskForm from "../../commonTasks/taskForm/TaskForm"
import TaskDetails from "../../commonTasks/taskDetails/TaskDetails"
import Pagination from "../../pagination/Pagination"
import apiTasks from "../../../api/apiTasks"
import apiUsers from "../../../api/apiUsers"
import ConfirmModal from "../../modal/ConfirmModal"

export default function ATasks() {
    const { selectedBranch } = useAuth()
    const { t } = useLanguage()
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState("calendar") // calendar, list
    const [calendarView, setCalendarView] = useState("month") // day, week, month, year
    const [currentDate, setCurrentDate] = useState(new Date())
    const [showTaskForm, setShowTaskForm] = useState(false)
    const [showTaskDetails, setShowTaskDetails] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [priorityFilter, setPriorityFilter] = useState("all")
    const [assigneeFilter, setAssigneeFilter] = useState("all")
    const [tasks, setTasks] = useState([])
    const [staff, setStaff] = useState([])
    const [newTaskDate, setNewTaskDate] = useState(null)
    const [showDayTasks, setShowDayTasks] = useState(false)
    const [selectedDay, setSelectedDay] = useState(null)
    const [pagination, setPagination] = useState({
        page: 0, // React-paginate uses 0-based indexing
        limit: 10,
        total: 0,
        totalPages: 0,
    })
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Fetch tasks from API
    const fetchTasksData = async () => {
        setLoading(true)
        try {
            // Prepare filters for API
            const filters = {
                status: statusFilter !== "all" ? statusFilter : undefined,
                priority: priorityFilter !== "all" ? priorityFilter : undefined,
                assignee: assigneeFilter !== "all" ? assigneeFilter : undefined,
                search: searchQuery || undefined,
                branch: selectedBranch !== "all" ? selectedBranch : undefined,
            }

            // Fetch tasks from API based on calendar view
            let response
            const apiPage = pagination.page + 1 // Convert to 1-based indexing for API

            if (view === "calendar") {
                switch (calendarView) {
                    case "day":
                        response = await apiTasks.fetchDailyTasks(currentDate, selectedBranch)
                        break
                    case "week":
                        response = await apiTasks.fetchWeeklyTasks(currentDate, selectedBranch)
                        break
                    case "year":
                        response = await apiTasks.fetchYearlyTasks(currentDate, selectedBranch)
                        break
                    case "month":
                    default:
                        response = await apiTasks.fetchMonthlyTasks(currentDate, selectedBranch)
                        break
                }

                // Format the response for calendar view
                const formattedTasks = Array.isArray(response) ? response.map(formatTaskData) : []
                setTasks(formattedTasks)
            } else {
                // List view with pagination
                response = await apiTasks.fetchTasks(apiPage, pagination.limit, filters)

                // Format the response for list view
                const formattedTasks = response.results.map(formatTaskData)
                setTasks(formattedTasks)

                setPagination({
                    ...pagination,
                    total: response.count,
                    totalPages: Math.ceil(response.count / pagination.limit),
                })
            }
        } catch (error) {
            console.error("Error fetching tasks:", error)
            // Show error notification or message here
        } finally {
            setLoading(false)
        }
    }

    // Helper function to format task data
    const formatTaskData = (task) => ({
        ...task,
        startDate: new Date(`${task.start_date}T${task.start_time}`),
        endDate: new Date(`${task.end_date}T${task.end_time}`),
        assignee: {
            id: task.assignee.id,
            name: formatUserFullName(task.assignee),
            role: task.assignee.role,
        },
        createdBy: {
            id: task.created_by.id,
            name: formatUserFullName(task.created_by),
            role: task.created_by.role,
        },
        createdAt: new Date(task.created_at),
    })

    // Helper function to format user's full name
    const formatUserFullName = (user) => {
        if (user.first_name && user.last_name) {
            return `${user.first_name} ${user.last_name}`
        } else if (user.name) {
            return user.name
        } else if (user.username) {
            return user.username
        } else {
            return t("unknown_user")
        }
    }

    // Fetch staff from API
    const fetchStaffData = async () => {
        try {
            // Fetch all users with a large page size
            const response = await apiUsers.fetchUsers(1, 10000)
            setStaff(
                response.results.map((user) => ({
                    id: user.id,
                    name: formatUserFullName(user),
                    role: user.role,
                    department: user.department || "",
                })),
            )
        } catch (error) {
            console.error("Error fetching staff:", error)
        }
    }

    // Initial data loading
    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchTasksData(), fetchStaffData()])
        }

        loadData()
    }, [selectedBranch])

    // Refetch when filters or calendar view changes
    useEffect(() => {
        fetchTasksData()
    }, [
        searchQuery,
        statusFilter,
        priorityFilter,
        assigneeFilter,
        pagination.page,
        pagination.limit,
        calendarView,
        view,
        currentDate,
        selectedBranch,
    ])

    // Handle page change
    const handlePageChange = (newPage) => {
        setPagination({
            ...pagination,
            page: newPage,
        })
    }

    // Handle items per page change
    const handleItemsPerPageChange = (newLimit) => {
        setPagination({
            ...pagination,
            page: 0, // Reset to first page
            limit: newLimit,
        })
    }

    // Navigate to previous period based on current view
    const handlePrevious = () => {
        const newDate = new Date(currentDate)

        switch (calendarView) {
            case "day":
                newDate.setDate(newDate.getDate() - 1)
                break
            case "week":
                newDate.setDate(newDate.getDate() - 7)
                break
            case "month":
                newDate.setMonth(newDate.getMonth() - 1)
                break
            case "year":
                newDate.setFullYear(newDate.getFullYear() - 1)
                break
            default:
                // Handle default case
                break
        }

        setCurrentDate(newDate)
    }

    // Navigate to next period based on current view
    const handleNext = () => {
        const newDate = new Date(currentDate)

        switch (calendarView) {
            case "day":
                newDate.setDate(newDate.getDate() + 1)
                break
            case "week":
                newDate.setDate(newDate.getDate() + 7)
                break
            case "month":
                newDate.setMonth(newDate.getMonth() + 1)
                break
            case "year":
                newDate.setFullYear(newDate.getFullYear() + 1)
                break
            default:
                // Handle default case
                break
        }

        setCurrentDate(newDate)
    }

    // Format date for display based on current view
    const formatDateRange = () => {
        switch (calendarView) {
            case "day":
                return new Intl.DateTimeFormat(navigator.language, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                }).format(currentDate)

            case "week": {
                const startOfWeek = new Date(currentDate)
                let dayOfWeek = currentDate.getDay()
                if (dayOfWeek === 0) dayOfWeek = 7
                const diff = 1 - dayOfWeek
                startOfWeek.setDate(currentDate.getDate() + diff)

                const endOfWeek = new Date(startOfWeek)
                endOfWeek.setDate(startOfWeek.getDate() + 6)

                return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`
            }

            case "month":
                return new Intl.DateTimeFormat(navigator.language, {
                    month: "long",
                    year: "numeric",
                }).format(currentDate)

            case "year":
                return currentDate.getFullYear().toString()

            default:
                return new Intl.DateTimeFormat(navigator.language, {
                    month: "long",
                    year: "numeric",
                }).format(currentDate)
        }
    }

    // Go to today
    const goToToday = () => {
        setCurrentDate(new Date())
    }

    // Open task form for creating a new task
    const handleAddTask = (date = null) => {
        setSelectedTask(null)
        setNewTaskDate(date ? new Date(date) : null)
        setShowTaskForm(true)
    }

    // Open task form for editing an existing task
    const handleEditTask = async (task) => {
        try {
            // Fetch the full task details if needed
            const taskDetails = await apiTasks.fetchTaskById(task.id)

            // Format the task data for the form
            const formattedTask = {
                ...taskDetails,
                startDate: new Date(`${taskDetails.start_date}T${taskDetails.start_time}`),
                endDate: new Date(`${taskDetails.end_date}T${taskDetails.end_time}`),
                assignee: {
                    id: taskDetails.assignee.id,
                    name: formatUserFullName(taskDetails.assignee),
                    role: taskDetails.assignee.role,
                },
            }

            setSelectedTask(formattedTask)
            setShowTaskForm(true)
            setShowTaskDetails(false)
        } catch (error) {
            console.error("Error fetching task details:", error)
        }
    }

    // Open task details modal
    const handleViewTask = async (task) => {
        if (!task) return

        try {
            // Fetch the full task details
            const taskDetails = await apiTasks.fetchTaskById(task.id)

            // Format the task data for display
            const formattedTask = {
                ...taskDetails,
                startDate: new Date(`${taskDetails.start_date}T${taskDetails.start_time}`),
                endDate: new Date(`${taskDetails.end_date}T${taskDetails.end_time}`),
                assignee: {
                    id: taskDetails.assignee.id,
                    name: formatUserFullName(taskDetails.assignee),
                    role: taskDetails.assignee.role,
                },
                createdBy: {
                    id: taskDetails.created_by.id,
                    name: formatUserFullName(taskDetails.created_by),
                    role: taskDetails.created_by.role,
                },
                createdAt: new Date(taskDetails.created_at),
            }

            setSelectedTask(formattedTask)
            setShowTaskDetails(true)
        } catch (error) {
            console.error("Error fetching task details:", error)
        }
    }

    // Handle day click in calendar
    const handleDayClick = async (day) => {
        if (!day) return

        // Create a new date object to avoid reference issues
        const dayDate = new Date(day.date)

        try {
            // Fetch tasks for the selected day with correct branch ID
            const response = await apiTasks.fetchDailyTasks(dayDate, selectedBranch)

            // Format the tasks
            const dayTasks = response.map((task) => ({
                ...task,
                startDate: new Date(`${task.start_date}T${task.start_time}`),
                endDate: new Date(`${task.end_date}T${task.end_time}`),
                assignee: {
                    id: task.assignee.id,
                    name: formatUserFullName(task.assignee),
                    role: task.assignee.role,
                },
            }))

            setSelectedDay({
                date: dayDate,
                isCurrentMonth: day.isCurrentMonth,
                isToday: day.isToday,
                tasks: dayTasks,
            })

            // Open add task form with selected date
            handleAddTask(dayDate)
        } catch (error) {
            console.error("Error fetching daily tasks:", error)
        }
    }

    // Handle task form submission
    const handleTaskSubmit = async (taskData) => {
        try {
            if (selectedTask) {
                // Update existing task
                await apiTasks.updateTask(selectedTask.id, taskData)
            } else {
                // Create new task
                await apiTasks.createTask(taskData)
            }

            // Refresh the tasks list
            fetchTasksData()

            setShowTaskForm(false)
            setNewTaskDate(null)
        } catch (error) {
            console.error("Error saving task:", error)
            // Show error notification or message here
        }
    }

    // Handle task deletion
    const handleDeleteTask = async (taskId) => {
        const task = tasks.find((task) => task.id === taskId)
        if (task) {
            setSelectedTask(task)
            setShowDeleteConfirm(true)
        }
    }

    // Confirm task deletion
    const confirmDeleteTask = async () => {
        if (!selectedTask || !selectedTask.id) return

        try {
            await apiTasks.deleteTask(selectedTask.id)

            // Refresh the tasks list
            fetchTasksData()

            // Close modals
            setShowDeleteConfirm(false)
            setShowTaskDetails(false)
        } catch (error) {
            console.error("Error deleting task:", error)
            // Show error notification or message here
        }
    }

    // Handle task status change
    const handleStatusChange = async (taskId, newStatus) => {
        try {
            // Get the current task data
            const taskToUpdate = tasks.find((task) => task.id === taskId)
            if (!taskToUpdate) return

            // Update the task with new status
            await apiTasks.updateTask(taskId, {
                ...taskToUpdate,
                status: newStatus,
            })

            // Refresh the tasks list
            fetchTasksData()

            setShowTaskDetails(false)
        } catch (error) {
            console.error("Error updating task status:", error)
            // Show error notification or message here
        }
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
        <div className="admin-tasks">
            <h1 className="page-title">{t("tasks_management")}</h1>

            <div className="tasks-container">
                <div className="tasks-header">
                    <div className="view-controls">
                        <button
                            className={`btn ${view === "calendar" ? "btn-primary" : "btn-outline"}`}
                            onClick={() => setView("calendar")}
                        >
                            <FaCalendarAlt /> {t("calendar_view")}
                        </button>
                        <button
                            className={`btn ${view === "list" ? "btn-primary" : "btn-outline"}`}
                            onClick={() => setView("list")}
                        >
                            <FaListUl /> {t("list_view")}
                        </button>
                    </div>

                    {view === "calendar" && (
                        <div className="calendar-view-controls">
                            <button
                                className={`btn-sm ${calendarView === "day" ? "active" : ""}`}
                                onClick={() => setCalendarView("day")}
                            >
                                {t("day")}
                            </button>
                            <button
                                className={`btn-sm ${calendarView === "week" ? "active" : ""}`}
                                onClick={() => setCalendarView("week")}
                            >
                                {t("week")}
                            </button>
                            <button
                                className={`btn-sm ${calendarView === "month" ? "active" : ""}`}
                                onClick={() => setCalendarView("month")}
                            >
                                {t("month")}
                            </button>
                            <button
                                className={`btn-sm ${calendarView === "year" ? "active" : ""}`}
                                onClick={() => setCalendarView("year")}
                            >
                                {t("year")}
                            </button>
                        </div>
                    )}

                    <div className="date-navigation">
                        <button className="btn-icon" onClick={handlePrevious}>
                            <FaChevronLeft />
                        </button>
                        <div className="current-date">{formatDateRange()}</div>
                        <button className="btn-icon" onClick={handleNext}>
                            <FaChevronRight />
                        </button>
                        <button className="today-btn btn-sm" onClick={goToToday}>
                            {t("today")}
                        </button>
                    </div>

                    <div className="task-actions">
                        <button className="btn-primary" onClick={() => handleAddTask()}>
                            <FaPlus /> {t("add_task")}
                        </button>
                    </div>
                </div>

                <div className="tasks-filters">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder={t("search_tasks")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <div className="filter-label">
                            <FaFilter /> {t("status")}:
                        </div>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">{t("all")}</option>
                            <option value="pending">{t("pending")}</option>
                            <option value="in_progress">{t("in_progress")}</option>
                            <option value="completed">{t("completed")}</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <div className="filter-label">
                            <FaFlag /> {t("priority")}:
                        </div>
                        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                            <option value="all">{t("all")}</option>
                            <option value="high">{t("high")}</option>
                            <option value="medium">{t("medium")}</option>
                            <option value="low">{t("low")}</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <div className="filter-label">
                            <FaUser /> {t("assignee")}:
                        </div>
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

                {view === "calendar" ? (
                    <div className="calendar-container">
                        <TaskCalendar
                            tasks={tasks}
                            currentDate={currentDate}
                            view={calendarView}
                            onTaskClick={handleViewTask}
                            onDayClick={handleDayClick}
                        />
                    </div>
                ) : (
                    <div className="tasks-list-container">
                        <h2 className="section-title">{t("tasks_list")}</h2>
                        {tasks.length > 0 ? (
                            <div className="tasks-list">
                                {tasks.map((task) => (
                                    <div key={task.id} className="task-card" onClick={() => handleViewTask(task)}>
                                        <div className="task-header">
                                            <h3 className="task-title">{task.title}</h3>
                                            <div className={`status-badge ${task.status}`}>
                                                {task.status === "completed" && t("completed")}
                                                {task.status === "in_progress" && t("in_progress")}
                                                {task.status === "pending" && t("pending")}
                                            </div>
                                        </div>
                                        <div className="task-details">
                                            <div className="task-date">
                                                <FaCalendarAlt />
                                                <span>
                                                    {task.startDate.toLocaleDateString()}{" "}
                                                    {task.startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            </div>
                                            <div className="task-assignee">
                                                <FaUser />
                                                <span>{task.assignee.name}</span>
                                            </div>
                                            <div className={`priority-badge ${task.priority}-priority`}>{t(task.priority)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-tasks-message">
                                <FaTasks />
                                <p>{t("no_tasks_found")}</p>
                            </div>
                        )}

                        {/* Pagination for list view */}
                        {view === "list" && tasks.length > 0 && (
                            <Pagination
                                pageCount={pagination.totalPages}
                                currentPage={pagination.page}
                                onPageChange={handlePageChange}
                                itemsPerPage={pagination.limit}
                                totalItems={pagination.total}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />
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
                            canAssignToAll={true} // Admin can assign tasks to anyone
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
                            type="danger"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
