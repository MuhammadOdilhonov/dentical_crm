"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    FaUserInjured,
    FaTasks,
    FaCalendarAlt,
    FaClipboardList,
    FaChevronRight,
    FaRegClock,
} from "react-icons/fa"
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Filler,
} from "chart.js"
import { Doughnut, Line } from "react-chartjs-2"
import {
    getDashboardStats,
    getTodayAppointments,
    getPatientTrend,
    getWeeklyTasks,
    getMonthlyMeetingsStatus,
    getWeeklyCustomers,
} from "../../../api/apiDoctorDashboard"
import { useLanguage } from "../../../contexts/LanguageContext"

// Register ChartJS components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Filler,
)

const DocDoshboard = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { t } = useLanguage()

    // State variables for dashboard data
    const [stats, setStats] = useState({
        todayAppointments: 0,
        pendingTasks: 0,
        totalPatients: 0,
        completedAppointments: 0,
    })
    const [upcomingAppointments, setUpcomingAppointments] = useState([])
    const [pendingTasks, setPendingTasks] = useState([])
    const [recentPatients, setRecentPatients] = useState([])
    const [patientTrendData, setPatientTrendData] = useState({})
    const [appointmentTypeData, setAppointmentTypeData] = useState({})

    // Live clock for the header
    const [currentTime, setCurrentTime] = useState(
        new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
    )

    const currentDate = new Date().toLocaleDateString("uz-UZ", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }))
        }, 30000)

        return () => clearInterval(timer)
    }, [])

    // Fetch all dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true)
                setError(null)

                const [statsData, appointmentsData, patientTrend, tasksData, meetingsStatus, customersData] = await Promise.all(
                    [
                        getDashboardStats(),
                        getTodayAppointments(),
                        getPatientTrend(),
                        getWeeklyTasks(),
                        getMonthlyMeetingsStatus(),
                        getWeeklyCustomers(),
                    ],
                )

                setStats({
                    todayAppointments: statsData.todays_meetings.count,
                    pendingTasks: statsData.todays_tasks.count,
                    totalPatients: statsData.weekly_customers.count,
                    completedAppointments: statsData.completed_tasks_today.count,
                })

                // Appointments
                const formattedAppointments = (appointmentsData.appointments || []).map((appointment, index) => {
                    const appointmentDate = new Date(appointment.date)
                    const hours = appointmentDate.getUTCHours().toString().padStart(2, "0")
                    const minutes = appointmentDate.getUTCMinutes().toString().padStart(2, "0")
                    const time = `${hours}:${minutes}`

                    const nameParts = (appointment.customer__full_name || "?").split(" ")
                    const initials = nameParts
                        .map((part) => part[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()

                    return {
                        id: appointment.id ?? index + 1,
                        patientName: appointment.customer__full_name,
                        avatar: initials,
                        time,
                        type: appointment.branch__name,
                        status: appointment.status,
                    }
                })
                setUpcomingAppointments(formattedAppointments)

                // Patient trend
                const trendData = patientTrend.patient_trend
                setPatientTrendData({
                    labels: Object.keys(trendData).slice(0, 6),
                    datasets: [
                        {
                            label: t("patients_treated"),
                            data: Object.values(trendData).slice(0, 6),
                            borderColor: "#10B981",
                            backgroundColor: "rgba(16, 185, 129, 0.1)",
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: "#10B981",
                            pointBorderColor: "#fff",
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                        },
                    ],
                })

                // Tasks
                const formattedTasks = (tasksData.weekly_tasks || []).map((task, index) => ({
                    id: index + 1,
                    title: task.title,
                    description: task.description,
                    priority: task.priority === "high" ? t("high") : task.priority === "medium" ? t("medium") : t("low"),
                    dueDate: new Date(task.end_date).toLocaleDateString("uz-UZ", { month: "short", day: "numeric" }),
                    status:
                        task.status === "in_progress"
                            ? t("in_progress")
                            : task.status === "pending"
                                ? t("pending")
                                : task.status === "completed"
                                    ? t("completed")
                                    : t("not_started"),
                }))
                setPendingTasks(formattedTasks)

                // Appointment types
                const meetingsData = meetingsStatus.monthly_meetings_status
                setAppointmentTypeData({
                    labels: [t("accepted"), t("finished"), t("cancelled")],
                    datasets: [
                        {
                            data: [meetingsData.accepted, meetingsData.finished, meetingsData.cancelled],
                            backgroundColor: ["#4F46E5", "#10B981", "#EF4444"],
                            borderWidth: 0,
                            hoverOffset: 4,
                        },
                    ],
                })

                // Recent patients
                const formattedPatients = (customersData.weekly_customers || []).map((patient, index) => {
                    const nameParts = (patient.full_name || "?").split(" ")
                    const initials = nameParts
                        .map((part) => part[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()

                    return {
                        id: patient.id ?? index + 1,
                        name: patient.full_name,
                        avatar: initials,
                        age: patient.age,
                        lastVisit: patient.last_visit,
                        condition: patient.status === "faol" ? t("stable") : patient.status,
                    }
                })
                setRecentPatients(formattedPatients)

                setLoading(false)
            } catch (err) {
                console.error("Error fetching dashboard data:", err)
                setError(t("loading_error"))
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [t])

    // Chart options
    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#1E293B",
                titleFont: { size: 14, weight: "bold" },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
            },
        },
        scales: {
            y: { beginAtZero: true, grid: { color: "rgba(0, 0, 0, 0.05)" }, ticks: { font: { size: 12 } } },
            x: { grid: { display: false }, ticks: { font: { size: 12 } } },
        },
    }

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
            legend: { position: "bottom", labels: { usePointStyle: true, padding: 20, font: { size: 12 } } },
            tooltip: {
                backgroundColor: "#1E293B",
                titleFont: { size: 14, weight: "bold" },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
            },
        },
    }

    if (loading) {
        return (
            <div className="doctor-dashboard">
                <div className="dashboard-loading">
                    <div className="spinner"></div>
                    <p>{t("loading_data")}</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="doctor-dashboard">
                <div className="dashboard-error">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="retry-btn">
                        {t("retry")}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="doctor-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-header-text">
                    <h1 className="page-title">{t("doctors_dashboard")}</h1>
                    <p className="dashboard-subtitle">{currentDate}</p>
                </div>
                <div className="dashboard-clock">
                    <FaRegClock />
                    <span>{currentTime}</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-container">
                <div className="stat-card" onClick={() => navigate("/dashboard/doctor/schedule")}>
                    <div className="stat-icon appointments">
                        <FaCalendarAlt />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.todayAppointments}</h3>
                        <p>{t("todays_appointments")}</p>
                    </div>
                    <div className="stat-trend up">{stats.todayAppointments} {t("today")}</div>
                </div>

                <div className="stat-card" onClick={() => navigate("/dashboard/doctor/tasks")}>
                    <div className="stat-icon tasks">
                        <FaTasks />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.pendingTasks}</h3>
                        <p>{t("pending_tasks")}</p>
                    </div>
                    <div className="stat-trend down">{stats.pendingTasks} {t("today")}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon patients">
                        <FaUserInjured />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.totalPatients}</h3>
                        <p>{t("total_patients")}</p>
                    </div>
                    <div className="stat-trend up">{t("this_week")}</div>
                </div>

                <div className="stat-card" onClick={() => navigate("/dashboard/doctor/tasks")}>
                    <div className="stat-icon completed">
                        <FaClipboardList />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.completedAppointments}</h3>
                        <p>{t("completed_today")}</p>
                    </div>
                    <div className="stat-trend">{stats.completedAppointments} {t("today")}</div>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="dashboard-content">
                <div className="dashboard-row">
                    {/* Today's Appointments */}
                    <div className="dashboard-card today-appointments">
                        <div className="card-header">
                            <h2>{t("todays_appointments")}</h2>
                            <button className="view-all-btn" onClick={() => navigate("/dashboard/doctor/schedule")}>
                                {t("view_all")} <FaChevronRight />
                            </button>
                        </div>
                        <div className="appointments-container">
                            {upcomingAppointments.length > 0 ? (
                                upcomingAppointments.map((appointment) => (
                                    <div key={appointment.id} className="appointment-card">
                                        <div className="appointment-time">
                                            <span>{appointment.time}</span>
                                            <div
                                                className={`status-indicator status-${(appointment.status || "").toLowerCase()}`}
                                            ></div>
                                        </div>
                                        <div className="appointment-details">
                                            <div className="patient-info">
                                                <div className="patient-avatar">{appointment.avatar}</div>
                                                <div className="patient-name-type">
                                                    <h4>{appointment.patientName}</h4>
                                                    <span className="appointment-type">{appointment.type}</span>
                                                </div>
                                            </div>
                                            <div className="appointment-actions">
                                                <button
                                                    className="appointment-btn start"
                                                    onClick={() => navigate("/dashboard/doctor/schedule")}
                                                >
                                                    {t("view")}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data-message">
                                    <p>{t("no_appointments_today")}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Patient Treatment Trend */}
                    <div className="dashboard-card patient-treatment">
                        <div className="card-header">
                            <h2>{t("patient_treatment_trend")}</h2>
                        </div>
                        <div className="chart-container">
                            {patientTrendData.labels && patientTrendData.datasets ? (
                                <Line data={patientTrendData} options={lineOptions} />
                            ) : (
                                <div className="no-data-message">
                                    <p>{t("no_trend_data")}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="dashboard-row">
                    {/* Pending Tasks */}
                    <div className="dashboard-card pending-tasks">
                        <div className="card-header">
                            <h2>{t("pending_tasks")}</h2>
                            <button className="view-all-btn" onClick={() => navigate("/dashboard/doctor/tasks")}>
                                {t("view_all")} <FaChevronRight />
                            </button>
                        </div>
                        <div className="tasks-container">
                            {pendingTasks.length > 0 ? (
                                pendingTasks.map((task) => (
                                    <div key={task.id} className="task-card">
                                        <div className={`priority-badge priority-${task.priority.toLowerCase()}`}>{task.priority}</div>
                                        <h3>{task.title}</h3>
                                        <div className="task-meta">
                                            <div className="due-date">
                                                <span>{t("due")}:</span> {task.dueDate}
                                            </div>
                                            <div className={`task-status status-${task.status.toLowerCase().replace(" ", "-")}`}>
                                                {task.status}
                                            </div>
                                        </div>
                                        <div className="task-actions">
                                            <button
                                                className="task-btn view"
                                                onClick={() => navigate("/dashboard/doctor/tasks")}
                                            >
                                                {t("view")}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data-message">
                                    <p>{t("no_pending_tasks")}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Appointment Types */}
                    <div className="dashboard-card appointment-types">
                        <div className="card-header">
                            <h2>{t("appointment_types")}</h2>
                        </div>
                        <div className="chart-container">
                            {appointmentTypeData.labels && appointmentTypeData.datasets ? (
                                <Doughnut data={appointmentTypeData} options={doughnutOptions} />
                            ) : (
                                <div className="no-data-message">
                                    <p>{t("no_appointment_data")}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="dashboard-row">
                    {/* Recent Patients */}
                    <div className="dashboard-card recent-patients">
                        <div className="card-header">
                            <h2>{t("recent_patients")}</h2>
                        </div>
                        <div className="table-container">
                            {recentPatients.length > 0 ? (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>{t("patient")}</th>
                                            <th>{t("age")}</th>
                                            <th>{t("last_visit")}</th>
                                            <th>{t("condition")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentPatients.map((patient) => (
                                            <tr key={patient.id}>
                                                <td>
                                                    <div className="patient-info">
                                                        <div className="patient-avatar">{patient.avatar}</div>
                                                        <span>{patient.name}</span>
                                                    </div>
                                                </td>
                                                <td>{patient.age}</td>
                                                <td>{patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : "-"}</td>
                                                <td>
                                                    <span className={`condition condition-${(patient.condition || "").toLowerCase()}`}>
                                                        {patient.condition}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="no-data-message">
                                    <p>{t("no_recent_patients")}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DocDoshboard
