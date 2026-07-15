"use client"

import { useState, useEffect, useCallback } from "react"
import { useLanguage } from "../../../contexts/LanguageContext"

export default function TaskCalendar({ tasks, currentDate, view, onTaskClick, onDayClick, onMonthClick }) {
    const { t, language } = useLanguage()
    const appLocale = { uz: "uz-UZ", ru: "ru-RU", en: "en-US" }[language] || "uz-UZ"
    const [calendarDays, setCalendarDays] = useState([])

    // Generate calendar days for the current month
    const generateMonthCalendar = useCallback(() => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()

        // First day of the month
        const firstDay = new Date(year, month, 1)
        // Last day of the month
        const lastDay = new Date(year, month + 1, 0)

        // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
        let firstDayOfWeek = firstDay.getDay()

        // Convert Sunday from 0 to 7 for easier calculation (Monday is 1, Sunday is 7)
        if (firstDayOfWeek === 0) firstDayOfWeek = 7

        // Calculate days from previous month to show (adjust for Monday as first day of week)
        const daysFromPrevMonth = firstDayOfWeek - 1

        // Calculate total days to show (including days from previous and next months)
        const totalDays = 42 // Always show 6 weeks (6 * 7 = 42 days)

        // Generate calendar days
        const days = []

        // Add days from previous month
        if (daysFromPrevMonth > 0) {
            // Create a new date for the last day of the previous month
            const prevMonthLastDate = new Date(year, month, 0)
            const prevMonthLastDay = prevMonthLastDate.getDate()

            for (let i = 0; i < daysFromPrevMonth; i++) {
                const day = prevMonthLastDay - daysFromPrevMonth + i + 1
                const exactDate = new Date(year, month - 1, day)
                days.push({
                    date: exactDate,
                    isCurrentMonth: false,
                    tasks: getTasksForDay(exactDate),
                })
            }
        }

        // Add days from current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const exactDate = new Date(year, month, i)
            days.push({
                date: exactDate,
                isCurrentMonth: true,
                isToday: isToday(exactDate),
                tasks: getTasksForDay(exactDate),
            })
        }

        // Add days from next month
        const remainingDays = totalDays - days.length
        for (let i = 1; i <= remainingDays; i++) {
            const exactDate = new Date(year, month + 1, i)
            days.push({
                date: exactDate,
                isCurrentMonth: false,
                tasks: getTasksForDay(exactDate),
            })
        }

        setCalendarDays(days)
    }, [currentDate, tasks])

    // Generate calendar for week view
    const generateWeekCalendar = useCallback(() => {
        const days = []
        const startOfWeek = new Date(currentDate)

        // Get the current day of week (0 = Sunday, 1 = Monday, etc.)
        let dayOfWeek = currentDate.getDay()

        // Convert Sunday from 0 to 7 for easier calculation
        if (dayOfWeek === 0) dayOfWeek = 7

        // Calculate the difference to get to Monday (first day of week)
        const diff = 1 - dayOfWeek

        // Set the date to Monday
        startOfWeek.setDate(currentDate.getDate() + diff)

        // Generate 7 days starting from Monday
        for (let i = 0; i < 7; i++) {
            const exactDate = new Date(startOfWeek)
            exactDate.setDate(startOfWeek.getDate() + i)

            days.push({
                date: exactDate,
                isCurrentMonth: exactDate.getMonth() === currentDate.getMonth(),
                isToday: isToday(exactDate),
                tasks: getTasksForDay(exactDate),
            })
        }

        setCalendarDays(days)
    }, [currentDate, tasks])

    // Generate calendar for day view
    const generateDayCalendar = useCallback(() => {
        const exactDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())

        const days = [
            {
                date: exactDate,
                isCurrentMonth: true,
                isToday: isToday(exactDate),
                tasks: getTasksForDay(exactDate),
            },
        ]

        setCalendarDays(days)
    }, [currentDate, tasks])

    // Generate calendar for year view
    const generateYearCalendar = useCallback(() => {
        const days = []
        const year = currentDate.getFullYear()

        // Generate first day of each month
        for (let month = 0; month < 12; month++) {
            const exactDate = new Date(year, month, 1)
            const monthTasks = getTasksForMonth(year, month)

            days.push({
                date: exactDate,
                isCurrentMonth: month === new Date().getMonth() && year === new Date().getFullYear(),
                isToday: false,
                tasks: monthTasks,
                monthName: exactDate.toLocaleString(appLocale, { month: "long" }),
            })
        }

        setCalendarDays(days)
    }, [currentDate, tasks])

    useEffect(() => {
        if (view === "month") {
            generateMonthCalendar()
        } else if (view === "week") {
            generateWeekCalendar()
        } else if (view === "day") {
            generateDayCalendar()
        } else if (view === "year") {
            generateYearCalendar()
        }
    }, [currentDate, tasks, view, generateMonthCalendar, generateWeekCalendar, generateDayCalendar, generateYearCalendar])

    // Check if a date is today
    const isToday = (date) => {
        const today = new Date()
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    // Get tasks for a specific day
    const getTasksForDay = (date) => {
        if (!tasks || !Array.isArray(tasks)) return []

        return tasks.filter((task) => {
            if (!task || !task.startDate) return false

            const taskDate = new Date(task.startDate)
            return (
                taskDate.getDate() === date.getDate() &&
                taskDate.getMonth() === date.getMonth() &&
                taskDate.getFullYear() === date.getFullYear()
            )
        })
    }

    // Get tasks for a specific month
    const getTasksForMonth = (year, month) => {
        if (!tasks || !Array.isArray(tasks)) return []

        return tasks.filter((task) => {
            if (!task || !task.startDate) return false

            const taskDate = new Date(task.startDate)
            return taskDate.getMonth() === month && taskDate.getFullYear() === year
        })
    }

    // Format date for display
    const formatDate = (date) => {
        return date.getDate()
    }

    // Get short day of week names — ilova tiliga mos
    const getShortDayNames = () => {
        const daysByLang = {
            uz: ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"],
            ru: ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"],
            en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
        }
        return daysByLang[language] || daysByLang.uz
    }

    // Handle task click safely
    const handleTaskClick = (e, task) => {
        e.stopPropagation()
        if (task && onTaskClick) {
            onTaskClick(task)
        }
    }

    // Handle day click safely
    const handleDayClick = (day) => {
        if (day && onDayClick) {
            // Create a deep copy of the day object to avoid reference issues
            const dayClone = {
                ...day,
                date: new Date(day.date),
                tasks: day.tasks ? [...day.tasks] : [],
            }
            onDayClick(dayClone)
        }
    }

    // Handle month click safely
    const handleMonthClick = (month) => {
        if (month && onMonthClick) {
            // Create a deep copy of the month object to avoid reference issues
            const monthClone = {
                ...month,
                date: new Date(month.date),
                tasks: month.tasks ? [...month.tasks] : [],
            }
            onMonthClick(monthClone)
        }
    }

    // Render month view
    const renderMonthView = () => {
        return (
            <>
                <div className="calendar-header">
                    {getShortDayNames().map((day, index) => (
                        <div key={index} className="day-name">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="calendar-grid month-grid">
                    {calendarDays.map((day, index) => (
                        <div
                            key={index}
                            className={`calendar-day ${!day.isCurrentMonth ? "other-month" : ""} ${day.isToday ? "today" : ""}`}
                            onClick={() => handleDayClick(day)}
                        >
                            <div className="day-header">
                                <span className="day-number">{formatDate(day.date)}</span>
                            </div>

                            <div className="day-content">
                                {day.tasks &&
                                    day.tasks.slice(0, 3).map((task) => (
                                        <div
                                            key={task.id}
                                            className={`calendar-task ${task.priority}-priority ${task.status}`}
                                            onClick={(e) => handleTaskClick(e, task)}
                                        >
                                            <div className="task-time">
                                                {new Date(task.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                            <div className="task-title">{task.title}</div>
                                        </div>
                                    ))}

                                {day.tasks && day.tasks.length > 3 && (
                                    <div className="more-tasks">
                                        +{day.tasks.length - 3} {t("more")}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )
    }

    // Render week view
    const renderWeekView = () => {
        return (
            <>
                <div className="calendar-header">
                    {calendarDays.map((day, index) => (
                        <div key={index} className={`day-name ${day.isToday ? "today" : ""}`}>
                            <div>{getShortDayNames()[index]}</div>
                            <div className="day-number-header">{formatDate(day.date)}</div>
                        </div>
                    ))}
                </div>

                <div className="calendar-grid week-grid">
                    {calendarDays.map((day, index) => (
                        <div
                            key={index}
                            className={`calendar-day ${!day.isCurrentMonth ? "other-month" : ""} ${day.isToday ? "today" : ""}`}
                            onClick={() => handleDayClick(day)}
                        >
                            <div className="day-content">
                                {day.tasks &&
                                    day.tasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className={`calendar-task ${task.priority}-priority ${task.status}`}
                                            onClick={(e) => handleTaskClick(e, task)}
                                        >
                                            <div className="task-time">
                                                {new Date(task.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                            <div className="task-title">{task.title}</div>
                                        </div>
                                    ))}

                                {(!day.tasks || day.tasks.length === 0) && (
                                    <div className="no-tasks">
                                        <span>{t("no_tasks")}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )
    }

    // Render day view
    const renderDayView = () => {
        const day = calendarDays[0]
        if (!day) return null

        const hours = []

        // Generate hours from 8 AM to 8 PM
        for (let i = 8; i <= 20; i++) {
            hours.push({
                hour: i,
                tasks: day.tasks ? day.tasks.filter((task) => new Date(task.startDate).getHours() === i) : [],
            })
        }

        return (
            <div className="day-view">
                <div className="day-header">
                    <div className="day-title">
                        {day.date.toLocaleDateString(appLocale, { weekday: "long", day: "numeric", month: "long" })}
                    </div>
                </div>

                <div className="day-hours">
                    {hours.map((hourData, index) => (
                        <div key={index} className="hour-row">
                            <div className="hour-label">{hourData.hour}:00</div>
                            <div className="hour-content" onClick={() => handleDayClick(day)}>
                                {hourData.tasks &&
                                    hourData.tasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className={`calendar-task ${task.priority}-priority ${task.status}`}
                                            onClick={(e) => handleTaskClick(e, task)}
                                        >
                                            <div className="task-time">
                                                {new Date(task.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                {" - "}
                                                {new Date(task.endDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                            <div className="task-title">{task.title}</div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // Render year view
    const renderYearView = () => {
        return (
            <div className="year-view">
                <div className="months-grid">
                    {calendarDays.map((month, index) => (
                        <div
                            key={index}
                            className={`month-card ${month.isCurrentMonth ? "current-month" : ""}`}
                            onClick={() => handleMonthClick(month)}
                        >
                            <div className="month-header">
                                <h3>{month.monthName}</h3>
                            </div>
                            <div className="month-content">
                                <div className="task-count">
                                    {month.tasks ? month.tasks.length : 0} {t("tasks")}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="task-calendar">
            {view === "month" && renderMonthView()}
            {view === "week" && renderWeekView()}
            {view === "day" && renderDayView()}
            {view === "year" && renderYearView()}
        </div>
    )
}
