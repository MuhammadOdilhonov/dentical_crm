"use client"

import { useState, useEffect, useCallback } from "react"
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
import ConfirmModal from "../../modal/ConfirmModal"

export default function DocTasks() {
    const { user } = useAuth()
    const { t, language } = useLanguage()
    const appLocale = { uz: "uz-UZ", ru: "ru-RU", en: "en-US" }[language] || "uz-UZ"
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState("calendar") // calendar, list
    const [calendarView, setCalendarView] = useState("month") // month, week, day, year
    const [currentDate, setCurrentDate] = useState(new Date())
    const [showTaskForm, setShowTaskForm] = useState(false)
    const [showTaskDetails, setShowTaskDetails] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [priorityFilter, setPriorityFilter] = useState("all")
    const [tasks, setTasks] = useState([])
    const [staff, setStaff] = useState([])
    const [newTaskDate, setNewTaskDate] = useState(null)
    const [selectedDay, setSelectedDay] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Используем ID филиала доктора вместо selectedBranch
    const doctorBranch = user.branch_id || user.branchId || null

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    // Fetch tasks based on current filters and pagination
    const fetchTasks = useCallback(async () => {
        setLoading(true)
        try {
            // Prepare filters
            const filters = {
                status: statusFilter !== "all" ? statusFilter : undefined,
                priority: priorityFilter !== "all" ? priorityFilter : undefined,
                search: searchQuery || undefined,
                // Используем ID филиала доктора
                branch: doctorBranch,
                // Для доктора показываем только его задачи
                assignee: user.id,
            }

            // Fetch tasks from API — faqat shu shifokorning vazifalari (filtrlar bilan)
            const response = await apiTasks.fetchTasks(currentPage + 1, itemsPerPage, filters)

            // Format dates for each task
            const formattedTasks = (response.results || []).map((task) => ({
                ...task,
                id: task.id,
                title: task.title,
                description: task.description,
                startDate: new Date(`${task.start_date}T${task.start_time}`),
                endDate: new Date(`${task.end_date}T${task.end_time}`),
                status: task.status,
                priority: task.priority,
                assignee: {
                    id: task.assignee_data?.id ?? task.assignee,
                    name: task.assignee_data
                        ? `${task.assignee_data.first_name} ${task.assignee_data.last_name}`.trim()
                        : `${user.first_name || ""} ${user.last_name || ""}`.trim() || "—",
                    role: task.assignee_data?.role || "doctor",
                },
                createdBy: task.created_by,
                createdAt: new Date(task.created_at),
            }))

            setTasks(formattedTasks)
            setTotalItems(response.count)
            setTotalPages(Math.ceil(response.count / itemsPerPage))
        } catch (error) {
            console.error("Error fetching tasks:", error)
        } finally {
            setLoading(false)
        }
    }, [currentPage, itemsPerPage, searchQuery, statusFilter, priorityFilter, doctorBranch, user.id])

    // Fetch calendar tasks based on view and date
    const fetchCalendarTasks = useCallback(async () => {
        setLoading(true)
        try {
            let response

            // Fetch tasks based on calendar view
            if (calendarView === "day") {
                response = await apiTasks.fetchDailyTasks(currentDate, doctorBranch)
            } else if (calendarView === "week") {
                response = await apiTasks.fetchWeeklyTasks(currentDate, doctorBranch)
            } else if (calendarView === "month") {
                response = await apiTasks.fetchMonthlyTasks(currentDate, doctorBranch)
            } else if (calendarView === "year") {
                response = await apiTasks.fetchYearlyTasks(currentDate, doctorBranch)
            }

            // Format dates for each task (javob massiv yoki {results} bo'lishi mumkin)
            const taskItems = Array.isArray(response) ? response : response?.results || []
            const formattedTasks = taskItems.map((task) => ({
                ...task,
                id: task.id,
                title: task.title,
                description: task.description,
                startDate: new Date(`${task.start_date}T${task.start_time}`),
                endDate: new Date(`${task.end_date}T${task.end_time}`),
                status: task.status,
                priority: task.priority,
                assignee: {
                    id: task.assignee_data?.id ?? task.assignee,
                    name: task.assignee_data
                        ? `${task.assignee_data.first_name} ${task.assignee_data.last_name}`.trim()
                        : `${user.first_name || ""} ${user.last_name || ""}`.trim() || "—",
                    role: task.assignee_data?.role || "doctor",
                },
                createdBy: task.created_by,
                createdAt: new Date(task.created_at),
            }))

            setTasks(formattedTasks)
        } catch (error) {
            console.error(`Error fetching ${calendarView} tasks:`, error)
        } finally {
            setLoading(false)
        }
    }, [calendarView, currentDate, doctorBranch])

    // Shifokor faqat o'ziga vazifa biriktiradi — staff ro'yxati o'zidan iborat
    const fetchStaffData = useCallback(async () => {
        try {
            const self = [
                {
                    id: user.id,
                    name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.name || "—",
                    role: "doctor",
                },
            ]
            setStaff(self)
        } catch (error) {
            console.error("Error fetching staff data:", error)
        }
    }, [user])

    // Initial data loading
    useEffect(() => {
        fetchStaffData()
    }, [fetchStaffData])

    // Fetch tasks when filters, pagination or view changes
    useEffect(() => {
        if (view === "list") {
            fetchTasks()
        } else {
            fetchCalendarTasks()
        }
    }, [view, fetchTasks, fetchCalendarTasks])

    // Fetch tasks when calendar view or date changes
    useEffect(() => {
        if (view === "calendar") {
            fetchCalendarTasks()
        }
    }, [calendarView, currentDate, view, fetchCalendarTasks])

    // Filter tasks based on search query and filters
    const filteredTasks = tasks.filter((task) => {
        // Search query filter
        const matchesSearch =
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))

        // Status filter
        const matchesStatus = statusFilter === "all" || task.status === statusFilter

        // Priority filter
        const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter

        return matchesSearch && matchesStatus && matchesPriority
    })

    // Navigate to previous month/week/day
    const handlePrevious = () => {
        const newDate = new Date(currentDate)
        if (calendarView === "month") {
            newDate.setMonth(newDate.getMonth() - 1)
        } else if (calendarView === "week") {
            newDate.setDate(newDate.getDate() - 7)
        } else if (calendarView === "day") {
            newDate.setDate(newDate.getDate() - 1)
        } else if (calendarView === "year") {
            newDate.setFullYear(newDate.getFullYear() - 1)
        }
        setCurrentDate(newDate)
    }

    // Navigate to next month/week/day
    const handleNext = () => {
        const newDate = new Date(currentDate)
        if (calendarView === "month") {
            newDate.setMonth(newDate.getMonth() + 1)
        } else if (calendarView === "week") {
            newDate.setDate(newDate.getDate() + 7)
        } else if (calendarView === "day") {
            newDate.setDate(newDate.getDate() + 1)
        } else if (calendarView === "year") {
            newDate.setFullYear(newDate.getFullYear() + 1)
        }
        setCurrentDate(newDate)
    }

    // Format date for display
    const formatDateRange = () => {
        if (calendarView === "month") {
            return new Intl.DateTimeFormat(appLocale, { month: "long", year: "numeric" }).format(currentDate)
        } else if (calendarView === "week") {
            const startOfWeek = new Date(currentDate)
            let dayOfWeek = currentDate.getDay()
            if (dayOfWeek === 0) dayOfWeek = 7
            const diff = 1 - dayOfWeek
            startOfWeek.setDate(currentDate.getDate() + diff)

            const endOfWeek = new Date(startOfWeek)
            endOfWeek.setDate(startOfWeek.getDate() + 6)

            return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`
        } else if (calendarView === "day") {
            return new Intl.DateTimeFormat(appLocale, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            }).format(currentDate)
        } else if (calendarView === "year") {
            return new Intl.DateTimeFormat(appLocale, { year: "numeric" }).format(currentDate)
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
            // Fetch full task details
            const taskDetails = await apiTasks.fetchTaskById(task.id)

            // Format dates
            const formattedTask = {
                ...taskDetails,
                id: taskDetails.id,
                title: taskDetails.title,
                description: taskDetails.description,
                startDate: new Date(`${taskDetails.start_date}T${taskDetails.start_time}`),
                endDate: new Date(`${taskDetails.end_date}T${taskDetails.end_time}`),
                status: taskDetails.status,
                priority: taskDetails.priority,
                assignee: taskDetails.assignee,
                createdBy: taskDetails.created_by,
                createdAt: new Date(taskDetails.created_at),
            }

            setSelectedTask(formattedTask)
            setShowTaskForm(true)
            setShowTaskDetails(false)
        } catch (error) {
            console.error(`Error fetching task details for ID ${task.id}:`, error)
        }
    }

    // Open task details modal
    const handleViewTask = async (task) => {
        if (!task) return

        try {
            // Fetch full task details
            const taskDetails = await apiTasks.fetchTaskById(task.id)

            // Format dates
            const formattedTask = {
                ...taskDetails,
                id: taskDetails.id,
                title: taskDetails.title,
                description: taskDetails.description,
                startDate: new Date(`${taskDetails.start_date}T${taskDetails.start_time}`),
                endDate: new Date(`${taskDetails.end_date}T${taskDetails.end_time}`),
                status: taskDetails.status,
                priority: taskDetails.priority,
                assignee: taskDetails.assignee,
                createdBy: taskDetails.created_by,
                createdAt: new Date(taskDetails.created_at),
            }

            setSelectedTask(formattedTask)
            setShowTaskDetails(true)
        } catch (error) {
            console.error(`Error fetching task details for ID ${task.id}:`, error)
        }
    }

    // Handle day click in calendar
    const handleDayClick = (day) => {
        if (!day) return

        // Create a new date object to avoid reference issues
        const dayDate = new Date(day.date)

        // Get tasks for the selected day
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

        // Open add task form with selected date
        handleAddTask(dayDate)
    }

    // Handle month click in year view
    const handleMonthClick = (month) => {
        if (!month) return

        // Set the current date to the selected month
        setCurrentDate(new Date(month.date))

        // Change view to month
        setCalendarView("month")
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

            // Refresh tasks
            if (view === "list") {
                fetchTasks()
            } else {
                fetchCalendarTasks()
            }

            setShowTaskForm(false)
            setNewTaskDate(null)
        } catch (error) {
            console.error("Error saving task:", error)
            alert(t("error_saving_task"))
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

            // Refresh tasks
            if (view === "list") {
                fetchTasks()
            } else {
                fetchCalendarTasks()
            }

            setShowDeleteConfirm(false)
            setShowTaskDetails(false)
        } catch (error) {
            console.error(`Error deleting task with ID ${selectedTask.id}:`, error)
            alert(t("error_deleting_task"))
        }
    }

    // Handle task status change
    const handleStatusChange = async (taskId, newStatus) => {
        try {
            // Fetch current task data
            const taskDetails = await apiTasks.fetchTaskById(taskId)

            // Update status
            await apiTasks.updateTask(taskId, {
                ...taskDetails,
                status: newStatus,
            })

            // Refresh tasks
            if (view === "list") {
                fetchTasks()
            } else {
                fetchCalendarTasks()
            }

            setShowTaskDetails(false)
        } catch (error) {
            console.error(`Error updating task status for ID ${taskId}:`, error)
            alert(t("error_updating_task"))
        }
    }

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    // Handle items per page change
    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage)
        setCurrentPage(0) // Reset to first page when changing items per page
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
        <div className="doctor-tasks">
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
                                className={`btn-sm ${calendarView === "day" ? "btn-primary" : "btn-outline"}`}
                                onClick={() => setCalendarView("day")}
                            >
                                {t("day")}
                            </button>
                            <button
                                className={`btn-sm ${calendarView === "week" ? "btn-primary" : "btn-outline"}`}
                                onClick={() => setCalendarView("week")}
                            >
                                {t("week")}
                            </button>
                            <button
                                className={`btn-sm ${calendarView === "month" ? "btn-primary" : "btn-outline"}`}
                                onClick={() => setCalendarView("month")}
                            >
                                {t("month")}
                            </button>
                            <button
                                className={`btn-sm ${calendarView === "year" ? "btn-primary" : "btn-outline"}`}
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
                </div>

                {view === "calendar" ? (
                    <div className="calendar-container">
                        <TaskCalendar
                            tasks={filteredTasks}
                            currentDate={currentDate}
                            view={calendarView}
                            onTaskClick={handleViewTask}
                            onDayClick={handleDayClick}
                            onMonthClick={handleMonthClick}
                        />
                    </div>
                ) : (
                    <div className="tasks-list-container">
                        <h2 className="section-title">{t("tasks_list")}</h2>
                        {filteredTasks.length > 0 ? (
                            <div className="tasks-list">
                                {filteredTasks.map((task) => (
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

                        {/* Pagination */}
                        {view === "list" && (
                            <Pagination
                                pageCount={totalPages}
                                currentPage={currentPage}
                                onPageChange={handlePageChange}
                                itemsPerPage={itemsPerPage}
                                totalItems={totalItems}
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
