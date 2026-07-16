"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    FaUsers,
    FaDoorOpen,
    FaCalendarAlt,
    FaUserMd,
    FaChartLine,
    FaChartBar,
    FaChartPie,
    FaMoneyBillWave,
    FaArrowUp,
    FaArrowDown,
    FaSpinner,
    FaExclamationTriangle,
    FaCalendarCheck,
} from "react-icons/fa"
import { useAuth } from "../../../contexts/AuthContext"
import { useLanguage } from "../../../contexts/LanguageContext"
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    PointElement,
    LineElement,
} from "chart.js"
import { Pie, Bar, Line } from "react-chartjs-2"
import { getAllDashboardData } from "../../../api/apiDirectorDashboard"

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement)

// Helper function to format date
const formatDate = (dateString) => {
    const date = new Date(dateString)
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
}

// Helper function to format date for display
const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    return `${day}.${month}.${year} ${hours}:${minutes}`
}

// Helper function to get month name from number
const getMonthName = (monthNumber, t) => {
    const monthNames = [
        t("january"),
        t("february"),
        t("march"),
        t("april"),
        t("may"),
        t("june"),
        t("july"),
        t("august"),
        t("september"),
        t("october"),
        t("november"),
        t("december"),
    ]
    return monthNames[monthNumber - 1] || `${t("month")} ${monthNumber}`
}

// Helper function to translate status
const translateStatus = (status, t) => {
    const statusMap = {
        accepted: t("accepted"),
        expected: t("expected"),
        finished: t("finished"),
        cancelled: t("cancelled"),
    }
    return statusMap[status] || status
}

// Helper function to get status class
const getStatusClass = (status) => {
    const statusClassMap = {
        accepted: "in_progress",
        expected: "pending",
        finished: "completed",
        cancelled: "cancelled",
    }
    return statusClassMap[status] || "pending"
}

export default function DirectorDashboard() {
    const { selectedBranch } = useAuth()
    const { t } = useLanguage()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [dashboardData, setDashboardData] = useState(null)

    // Fetch dashboard data based on selected branch
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Use the branch ID from selectedBranch or default to "all-filial"
                const branchId = selectedBranch || "all"
                const data = await getAllDashboardData(branchId)
                setDashboardData(data)
            } catch (err) {
                console.error("Error fetching dashboard data:", err)
                setError(t("data_loading_error"))
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [selectedBranch, t])

    // Loading state
    if (loading) {
        return (
            <div className="loading-container">
                <FaSpinner className="spinner" />
                <p>{t("loading_data")}</p>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="error-container">
                <FaExclamationTriangle className="error-icon" />
                <p>{error}</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                    {t("try_again")}
                </button>
            </div>
        )
    }

    // If data is not loaded yet, show nothing
    if (!dashboardData) {
        return null
    }

    // Extract data from the API response
    const {
        financialMetrics,
        doctorEfficiency,
        customersByDepartment,
        monthlyCustomerDynamics,
        departmentEfficiency,
        todaysAppointments,
        newStaff,
        financialReport,
        patientStatistics,
        doctorStatistics,
    } = dashboardData

    // Calculate total income and expenses from financial metrics
    const totalIncome = financialReport?.total_income || 0
    const totalExpenses = financialReport?.total_expenses || 0
    const netProfit = financialReport?.net_profit || 0

    // Calculate stats from API data
    const stats = {
        totalStaff: doctorStatistics?.doctor_stats?.length || 0,
        totalDoctors: doctorStatistics?.doctor_stats?.length || 0,
        totalCabinets: departmentEfficiency?.department_data?.length || 0,
        totalPatients: patientStatistics?.total_patients || customersByDepartment?.total_customers || 0,
        appointmentsToday: todaysAppointments?.total_appointments || 0,
        totalIncome: totalIncome,
        totalExpenses: totalExpenses,
        netProfit: netProfit,
        incomeChange: financialReport?.profitability || 0,
        patientChange: monthlyCustomerDynamics?.growth_rate || 0,
        appointmentChange: 0, // Not provided in API
        totalTasks: 0, // Not provided in API
        completedTasks: 0, // Not provided in API
        pendingTasks: 0, // Not provided in API
    }

    // Format department data for charts
    const departmentDistributionData = {
        labels: customersByDepartment?.department_data?.map((dept) => dept.doctor__specialization) || [],
        datasets: [
            {
                label: t("customers_count"),
                data: customersByDepartment?.department_data?.map((dept) => dept.customer_count) || [],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.8)",
                    "rgba(54, 162, 235, 0.8)",
                    "rgba(255, 206, 86, 0.8)",
                    "rgba(75, 192, 192, 0.8)",
                    "rgba(153, 102, 255, 0.8)",
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                ],
                borderWidth: 1,
            },
        ],
    }

    // Format monthly patient data for charts
    const monthlyPatientsData = {
        labels: monthlyCustomerDynamics?.monthly_data?.map((item) => getMonthName(item.date__month, t)) || [],
        datasets: [
            {
                label: t("customers_count"),
                data: monthlyCustomerDynamics?.monthly_data?.map((item) => item.customer_count) || [],
                backgroundColor: "rgba(54, 162, 235, 0.5)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 2,
                tension: 0.4,
                fill: true,
            },
        ],
    }

    // Format financial data for charts
    const financialData = {
        labels: financialMetrics?.monthly_data?.map((item) => item.month) || [],
        datasets: [
            {
                label: t("income"),
                data: financialMetrics?.monthly_data?.map((item) => item.income) || [],
                backgroundColor: "rgba(75, 192, 192, 0.5)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 2,
            },
            {
                label: t("expenses"),
                data: financialMetrics?.monthly_data?.map((item) => item.expenses) || [],
                backgroundColor: "rgba(255, 99, 132, 0.5)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 2,
            },
        ],
    }

    // Format doctor performance data for charts
    const doctorPerformanceData = {
        labels: doctorStatistics?.doctor_stats?.map((doc) => doc.doctor_name) || [],
        datasets: [
            {
                label: t("customers_count"),
                data: doctorStatistics?.doctor_stats?.map((doc) => doc.total_patients) || [],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.8)",
                    "rgba(54, 162, 235, 0.8)",
                    "rgba(255, 206, 86, 0.8)",
                    "rgba(75, 192, 192, 0.8)",
                    "rgba(153, 102, 255, 0.8)",
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                ],
                borderWidth: 1,
            },
        ],
    }

    // Dashboardda faqat oxirgi 5 ta yozuv ko'rsatiladi, qolgani tegishli sahifada
    const recentAppointments = [...(todaysAppointments?.appointments || [])]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)

    const recentStaff = [...(newStaff?.recent_staff || [])]
        .sort((a, b) => new Date(b.date_joined) - new Date(a.date_joined))
        .slice(0, 5)

    // Format department efficiency data
    const performanceData =
        departmentEfficiency?.department_data?.map((dept) => ({
            id: dept.id,
            name: dept.name,
            patients: dept.customer_count || 0,
            satisfaction: dept.avg_satisfaction || 0,
        })) || []

    return (
        <div className="director-dashboard">
            <h1 className="page-title">{t("directors_dashboard")}</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon-wrapper">
                        <FaUsers className="stat-icon director" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totalStaff}</div>
                        <div className="stat-label">{t("total_staff")}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper">
                        <FaUserMd className="stat-icon director" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totalDoctors}</div>
                        <div className="stat-label">{t("doctors")}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper">
                        <FaDoorOpen className="stat-icon director" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totalCabinets}</div>
                        <div className="stat-label">{t("branches")}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper">
                        <FaCalendarAlt className="stat-icon director" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.appointmentsToday}</div>
                        <div className="stat-label">{t("todays_appointments")}</div>
                        {stats.appointmentChange !== 0 && (
                            <div className={`stat-change ${stats.appointmentChange >= 0 ? "positive" : "negative"}`}>
                                {stats.appointmentChange >= 0 ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(stats.appointmentChange)}%
                            </div>
                        )}
                    </div>
                </div>

                <div className="stat-card patients">
                    <div className="stat-icon-wrapper">
                        <FaUsers className="stat-icon" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totalPatients}</div>
                        <div className="stat-label">{t("total_customers")}</div>
                        {stats.patientChange !== 0 && (
                            <div className={`stat-change ${stats.patientChange >= 0 ? "positive" : "negative"}`}>
                                {stats.patientChange >= 0 ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(stats.patientChange)}%
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card income">
                    <div className="stat-icon-wrapper">
                        <FaMoneyBillWave className="stat-icon" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totalIncome.toLocaleString()} {t("currency")}</div>
                        <div className="stat-label">{t("total_income")}</div>
                    </div>
                </div>

                <div className="stat-card expense">
                    <div className="stat-icon-wrapper">
                        <FaMoneyBillWave className="stat-icon" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totalExpenses.toLocaleString()} {t("currency")}</div>
                        <div className="stat-label">{t("total_expenses")}</div>
                    </div>
                </div>

                <div className="stat-card profit">
                    <div className="stat-icon-wrapper">
                        <FaMoneyBillWave className="stat-icon" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.netProfit.toLocaleString()} {t("currency")}</div>
                        <div className="stat-label">{t("net_profit")}</div>
                        {stats.incomeChange !== 0 && (
                            <div className={`stat-change ${stats.incomeChange >= 0 ? "positive" : "negative"}`}>
                                {stats.incomeChange >= 0 ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(stats.incomeChange)}%
                            </div>
                        )}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper">
                        <FaCalendarCheck className="stat-icon director" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{doctorEfficiency?.avg_patients_per_doctor || 0}</div>
                        <div className="stat-label">{t("avg_customers_per_doctor")}</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-row">
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2>{t("todays_appointments")}</h2>
                        <button className="btn btn-text" onClick={() => navigate("/dashboard/director/appointments")}>
                            {t("view_all")}
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t("time")}</th>
                                    <th>{t("customer")}</th>
                                    <th>{t("doctor")}</th>
                                    <th>{t("branch")}</th>
                                    <th>{t("status")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentAppointments.map((appointment, index) => (
                                    <tr key={index}>
                                        <td>{formatDate(appointment.date)}</td>
                                        <td>{appointment.customer__full_name}</td>
                                        <td>{`${appointment.doctor__first_name} ${appointment.doctor__last_name}`}</td>
                                        <td>{appointment.branch__name}</td>
                                        <td>
                                            <div className={`status-badge ${getStatusClass(appointment.status)}`}>
                                                {translateStatus(appointment.status, t)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {recentAppointments.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="no-data">
                                            {t("no_appointments_today")}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <h2>{t("new_staff_members")}</h2>
                        <button className="btn btn-text" onClick={() => navigate("/dashboard/director/staff")}>
                            {t("view_all")}
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t("name")}</th>
                                    <th>{t("position")}</th>
                                    <th>{t("branch")}</th>
                                    <th>{t("date")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentStaff.map((staff, index) => (
                                    <tr key={index}>
                                        <td>{`${staff.first_name} ${staff.last_name}`}</td>
                                        <td>
                                            {staff.role === "doctor"
                                                ? t("doctor")
                                                : staff.role === "nurse"
                                                    ? t("nurse")
                                                    : staff.role === "admin"
                                                        ? t("admin")
                                                        : staff.role === "director"
                                                            ? t("director")
                                                            : staff.role}
                                        </td>
                                        <td>{staff.branch__name || t("head_office")}</td>
                                        <td>{formatDateForDisplay(staff.date_joined)}</td>
                                    </tr>
                                ))}
                                {recentStaff.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="no-data">
                                            {t("no_new_staff")}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="dashboard-card">
                <div className="card-header">
                    <h2>{t("branch_efficiency")}</h2>
                    <button className="btn btn-text">{t("detailed_info")}</button>
                </div>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t("branch")}</th>
                                <th>{t("customers_count")}</th>
                                <th>{t("customer_satisfaction")}</th>
                                <th>{t("status")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {performanceData.map((dept, index) => (
                                <tr key={index}>
                                    <td>{dept.name}</td>
                                    <td>{dept.patients}</td>
                                    <td>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${dept.satisfaction ? dept.satisfaction : 0}%` }}
                                            ></div>
                                            <span>{dept.satisfaction ? `${dept.satisfaction}%` : t("no_data")}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {dept.satisfaction ? (
                                            <div className={`status-badge ${dept.satisfaction >= 90 ? "high" : "medium"}`}>
                                                {dept.satisfaction >= 90 ? t("excellent") : t("good")}
                                            </div>
                                        ) : (
                                            <div className="status-badge pending">{t("not_rated")}</div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {performanceData.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="no-data">
                                        {t("no_branch_efficiency_data")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                <div className="dashboard-row">
                    <div className="dashboard-card chart-card">
                        <div className="card-header">
                            <h2>
                                <FaChartPie /> {t("customers_by_departments")}
                            </h2>
                        </div>
                        <div className="chart-container">
                            {customersByDepartment?.department_data?.length > 0 ? (
                                <Pie
                                    data={departmentDistributionData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: "right",
                                            },
                                        },
                                    }}
                                />
                            ) : (
                                <div className="no-chart-data">{t("no_data")}</div>
                            )}
                        </div>
                    </div>

                    <div className="dashboard-card chart-card">
                        <div className="card-header">
                            <h2>
                                <FaChartLine /> {t("monthly_customer_dynamics")}
                            </h2>
                        </div>
                        <div className="chart-container">
                            {monthlyCustomerDynamics?.monthly_data?.length > 0 ? (
                                <Line
                                    data={monthlyPatientsData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                            },
                                        },
                                    }}
                                />
                            ) : (
                                <div className="no-chart-data">{t("no_data")}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="dashboard-row">
                    <div className="dashboard-card chart-card">
                        <div className="card-header">
                            <h2>
                                <FaChartBar /> {t("financial_indicators")}
                            </h2>
                        </div>
                        <div className="chart-container">
                            {financialMetrics?.monthly_data?.some((item) => item.income > 0 || item.expenses > 0) ? (
                                <Bar
                                    data={financialData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                            },
                                        },
                                    }}
                                />
                            ) : (
                                <div className="no-chart-data">{t("no_data")}</div>
                            )}
                        </div>
                    </div>

                    <div className="dashboard-card chart-card">
                        <div className="card-header">
                            <h2>
                                <FaChartBar /> {t("doctor_efficiency")}
                            </h2>
                        </div>
                        <div className="chart-container">
                            {doctorStatistics?.doctor_stats?.length > 0 ? (
                                <Bar
                                    data={doctorPerformanceData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        indexAxis: "y",
                                        scales: {
                                            x: {
                                                beginAtZero: true,
                                            },
                                        },
                                    }}
                                />
                            ) : (
                                <div className="no-chart-data">{t("no_data")}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}