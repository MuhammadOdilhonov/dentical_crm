"use client"

import { useState, useEffect, useCallback } from "react"
import {
    FaChartBar,
    FaChartLine,
    FaChartPie,
    FaDownload,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaHistory,
    FaFilter,
    FaSearch,
    FaTimes,
    FaArrowLeft,
    FaArrowRight,
    FaExclamationTriangle,
    FaWallet,
    FaUserMd,
    FaUsers,
    FaExclamationCircle,
    FaCreditCard,
    FaCalendarCheck,
} from "react-icons/fa"
import { useAuth } from "../../../contexts/AuthContext"
import { useLanguage } from "../../../contexts/LanguageContext"
import { exportReportToExcel } from "../../../utils/exportReport"
import { getFinancialStatistics, getCashWithdrawals, createCashWithdrawal } from "../../../api/apiFinanceStatistic"
import { getPatientStatistics } from "../../../api/apiPatientsStatistic"
import { getDoctorStatistics } from "../../../api/apiDoctorStatistic"
import apiBranches from "../../../api/apiBranches" // Import apiBranches
import SuccessModal from "../../modal/SuccessModal"
import { getStatistics, getCustomerDebtDynamicStatistics } from "../../../api/apiIndebtedPatients"

// Import Chart.js
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

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement)

export default function Reports() {
    const { selectedBranch } = useAuth()
    const { t, language } = useLanguage()
    const [reportType, setReportType] = useState("financial")
    const [dateRange, setDateRange] = useState("month")
    const [quarter, setQuarter] = useState(1)
    const [financialData, setFinancialData] = useState(null)
    const [patientData, setPatientData] = useState(null)
    const [doctorData, setDoctorData] = useState(null)
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
    const [showHistoryModal, setShowHistoryModal] = useState(false)
    // Update the withdrawalData state to include branch field
    const [withdrawalData, setWithdrawalData] = useState({
        amount: "",
        reason: "",
        description: "",
        branch: "",
    })
    const [historyYear, setHistoryYear] = useState(new Date().getFullYear())
    const [searchTerm, setSearchTerm] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [filterCategory, setFilterCategory] = useState("all")
    const [filterAmount, setFilterAmount] = useState("all")
    const [isLoadingFinancial, setIsLoadingFinancial] = useState(true)
    const [isLoadingPatient, setIsLoadingPatient] = useState(true)
    const [isLoadingDoctor, setIsLoadingDoctor] = useState(true)
    const [financialError, setFinancialError] = useState(null)
    const [patientError, setPatientError] = useState(null)
    const [doctorError, setDoctorError] = useState(null)
    const [cashWithdrawals, setCashWithdrawals] = useState([])
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    // Add a function to get branches (you may need to adjust this based on your actual API)
    const [branches, setBranches] = useState([])
    // Add this state for mobile menu
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const [debtStatistics, setDebtStatistics] = useState(null)
    const [debtDynamicData, setDebtDynamicData] = useState(null)
    const [isLoadingDebt, setIsLoadingDebt] = useState(false)
    const [debtError, setDebtError] = useState(null)
    const [customDateRange, setCustomDateRange] = useState({
        startDate: "",
        endDate: "",
    })

    // Withdrawal reasons
    const withdrawalReasons = [
        { id: "salary", name: t("salary") },
        { id: "salary_increase", name: t("salary_increase") },
        { id: "utilities", name: t("utilities") },
        { id: "rent", name: t("rent") },
        { id: "supplies", name: t("supplies") },
        { id: "medicine", name: t("medicine") },
        { id: "repairs", name: t("repairs") },
        { id: "marketing", name: t("marketing") },
        { id: "taxes", name: t("taxes") },
        { id: "other", name: t("other_expenses") },
    ]

    // Format currency
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return "0 " + t("currency")
        return new Intl.NumberFormat("uz-UZ").format(amount) + " " + t("currency")
    }

    // Format percentage
    const formatPercentage = (value) => {
        if (value === undefined || value === null) return "0%"
        return value.toFixed(2) + "%"
    }

    // Fetch financial data
    const fetchFinancialData = useCallback(async () => {
        setIsLoadingFinancial(true)
        setFinancialError(null)
        try {
            // Use selectedBranch if not "all", otherwise use "all-filial"
            const branchId = selectedBranch && selectedBranch !== "all" ? selectedBranch : null
            const data = await getFinancialStatistics(dateRange, dateRange === "quarter" ? quarter : null, branchId)
            setFinancialData(data)
        } catch (error) {
            console.error("Error fetching financial data:", error)
            setFinancialError(error.message || t("error_fetching_financial_data"))
        } finally {
            setIsLoadingFinancial(false)
        }
    }, [dateRange, quarter, selectedBranch, t])

    // Fetch patient data
    const fetchPatientData = useCallback(async () => {
        setIsLoadingPatient(true)
        setPatientError(null)
        try {
            // Use selectedBranch if not "all", otherwise use "all-filial"
            const branchId = selectedBranch && selectedBranch !== "all" ? selectedBranch : null
            const data = await getPatientStatistics(dateRange, dateRange === "quarter" ? quarter : null, branchId)
            setPatientData(data)
        } catch (error) {
            console.error("Error fetching patient data:", error)
            setPatientError(error.message || t("error_fetching_patient_data"))
        } finally {
            setIsLoadingPatient(false)
        }
    }, [dateRange, quarter, selectedBranch, t])

    // Fetch doctor data
    const fetchDoctorData = useCallback(async () => {
        setIsLoadingDoctor(true)
        setDoctorError(null)
        try {
            // Use selectedBranch if not "all", otherwise use "all-filial"
            const branchId = selectedBranch && selectedBranch !== "all" ? selectedBranch : null
            const data = await getDoctorStatistics(dateRange, dateRange === "quarter" ? quarter : null, branchId)
            setDoctorData(data)
        } catch (error) {
            console.error("Error fetching doctor data:", error)
            setDoctorError(error.message || t("error_fetching_doctor_data"))
        } finally {
            setIsLoadingDoctor(false)
        }
    }, [dateRange, quarter, selectedBranch, t])

    // Fetch cash withdrawals
    const fetchCashWithdrawals = useCallback(async () => {
        try {
            const data = await getCashWithdrawals()
            setCashWithdrawals(data.results || [])
        } catch (error) {
            console.error("Error fetching cash withdrawals:", error)
        }
    }, [])

    // Update the fetchBranches function to use apiBranches.fetchBranches()
    const fetchBranches = useCallback(async () => {
        try {
            // Use the existing apiBranches.fetchBranches method
            const branchesData = await apiBranches.fetchBranches()
            setBranches(branchesData || [])
        } catch (error) {
            console.error("Error fetching branches:", error)
        }
    }, [])

    const fetchDebtStatistics = useCallback(async () => {
        setIsLoadingDebt(true)
        setDebtError(null)
        try {
            const [statsData, dynamicData] = await Promise.all([
                getStatistics(dateRange),
                getCustomerDebtDynamicStatistics(
                    dateRange === "month" ? "monthly" : dateRange === "quarter" ? "quarterly" : "yearly",
                ),
            ])
            setDebtStatistics(statsData)
            setDebtDynamicData(dynamicData)
        } catch (error) {
            console.error("Error fetching debt statistics:", error)
            setDebtError(error.message || t("error_fetching_debt_data"))
        } finally {
            setIsLoadingDebt(false)
        }
    }, [dateRange, t])

    // Update report data when report type, date range or branch changes
    useEffect(() => {
        if (reportType === "financial") {
            fetchFinancialData()
        } else if (reportType === "patients") {
            fetchPatientData()
        } else if (reportType === "staff") {
            fetchDoctorData()
        } else if (reportType === "debts") {
            fetchDebtStatistics()
        }

        fetchCashWithdrawals()
        fetchBranches() // Add this line to fetch branches
    }, [
        reportType,
        dateRange,
        quarter,
        selectedBranch,
        fetchFinancialData,
        fetchPatientData,
        fetchDoctorData,
        fetchDebtStatistics,
        fetchCashWithdrawals,
        fetchBranches, // Add this to dependencies
        language,
    ])

    // Handle report type change
    const handleReportTypeChange = (type) => {
        setReportType(type)
    }

    // Handle date range change
    const handleDateRangeChange = (e) => {
        setDateRange(e.target.value)
    }

    // Handle quarter change
    const handleQuarterChange = (newQuarter) => {
        setQuarter(newQuarter)
    }

    // Davr matnini tayyorlash (fayl sarlavhasi uchun)
    const getPeriodLabel = () => {
        if (dateRange === "month") return t("month")
        if (dateRange === "quarter") return `${t("quarter")} Q${quarter}`
        return t("year")
    }

    // Hisobotni yuklab olish — hozir ochiq turgan hisobot turi va davriga qarab Excel fayl yaratadi
    const handleDownload = () => {
        const today = new Date().toISOString().split("T")[0]
        const subtitle = `${t("period")}: ${getPeriodLabel()} | ${new Date().toLocaleDateString()}`

        if (reportType === "financial") {
            if (!financialData) {
                alert(t("no_data"))
                return
            }
            exportReportToExcel({
                title: `${t("reports")} — ${t("financial")}`,
                subtitle,
                sections: [
                    {
                        heading: t("financial_indicators"),
                        summary: [
                            [t("total_income"), formatCurrency(financialData.total_income)],
                            [t("total_expenses"), formatCurrency(financialData.total_expenses)],
                            [t("net_profit"), formatCurrency(financialData.net_profit)],
                            [t("profitability"), formatPercentage(financialData.profitability)],
                        ],
                    },
                    {
                        heading: t("financial_details"),
                        columns: [t("period"), t("income"), t("expenses"), t("profit")],
                        rows: (financialData.detailed_stats || []).map((item) => [
                            item.label,
                            formatCurrency(item.income),
                            formatCurrency(item.expenses),
                            formatCurrency(item.income - item.expenses),
                        ]),
                    },
                ],
                fileName: `hisobot_moliyaviy_${dateRange}_${today}`,
            })
        } else if (reportType === "patients") {
            if (!patientData) {
                alert(t("no_data"))
                return
            }
            exportReportToExcel({
                title: `${t("reports")} — ${t("patients")}`,
                subtitle,
                sections: [
                    {
                        heading: t("patients"),
                        summary: [
                            [t("total_patients"), patientData.total_patients || 0],
                            [t("average_weekly"), patientData.avg_weekly_patients ?? "-"],
                            [t("average_monthly"), patientData.avg_monthly_patients ?? "-"],
                            [t("growth"), formatPercentage(patientData.growth_rate)],
                        ],
                    },
                    {
                        heading: t("patient_details"),
                        columns: [t("period"), t("patients")],
                        rows: (patientData.detailed_stats || []).map((item) => [item.label, item.patients]),
                    },
                ],
                fileName: `hisobot_bemorlar_${dateRange}_${today}`,
            })
        } else if (reportType === "staff") {
            if (!doctorData) {
                alert(t("no_data"))
                return
            }
            const totalPatients = (doctorData.doctor_stats || []).reduce((sum, d) => sum + d.total_patients, 0)
            exportReportToExcel({
                title: `${t("reports")} — ${t("staff")}`,
                subtitle,
                sections: [
                    {
                        heading: t("doctor_efficiency"),
                        summary: [
                            [t("top_performing_doctor"), doctorData.most_effective_doctor?.doctor_name || "-"],
                            [t("total_patients"), totalPatients],
                        ],
                    },
                    {
                        heading: t("doctor_details"),
                        columns: [t("doctor"), t("patients"), t("income")],
                        rows: (doctorData.doctor_stats || []).map((doc) => [
                            doc.doctor_name,
                            doc.total_patients,
                            formatCurrency(doc.total_income),
                        ]),
                    },
                ],
                fileName: `hisobot_xodimlar_${dateRange}_${today}`,
            })
        } else if (reportType === "debts") {
            if (!debtStatistics) {
                alert(t("no_data"))
                return
            }
            exportReportToExcel({
                title: `${t("reports")} — ${t("indebted_patients")}`,
                subtitle,
                sections: [
                    {
                        heading: t("indebted_patients"),
                        summary: [
                            [t("total_paid"), formatCurrency(debtStatistics.total_paid)],
                            [t("total_discount"), formatCurrency(debtStatistics.total_discount)],
                            [t("transactions_count"), debtStatistics.count],
                        ],
                    },
                    {
                        heading: t("debt_details"),
                        columns: [t("period"), t("amount")],
                        rows: (debtDynamicData?.data || []).map((item) => [
                            debtDynamicData.type === "monthly"
                                ? `${t("day")} ${item.day}`
                                : item.month || new Date(item.date).toLocaleDateString(),
                            formatCurrency(item.total_amount),
                        ]),
                    },
                ],
                fileName: `hisobot_qarzdorlar_${dateRange}_${today}`,
            })
        }
    }

    // Handle withdrawal form change
    const handleWithdrawalChange = (e) => {
        const { name, value } = e.target
        setWithdrawalData({
            ...withdrawalData,
            [name]: value,
        })
    }

    // Update the handleWithdrawalSubmit function to include branch in the request
    const handleWithdrawalSubmit = async (e) => {
        e.preventDefault()

        try {
            await createCashWithdrawal(withdrawalData)

            // Reset form and close modal
            setWithdrawalData({
                amount: "",
                reason: "",
                description: "",
                branch: "",
            })
            setShowWithdrawalModal(false)

            // Show success message
            setSuccessMessage(t("withdrawal_success"))
            setShowSuccessModal(true)

            // Refresh withdrawals
            fetchCashWithdrawals()
        } catch (error) {
            console.error("Error creating withdrawal:", error)
            alert(t("error_creating_withdrawal"))
        }
    }

    // Filter withdrawal history
    const getFilteredWithdrawalHistory = () => {
        let filteredHistory = cashWithdrawals.filter((item) => {
            const itemDate = new Date(item.created_at)
            return itemDate.getFullYear() === historyYear
        })

        if (selectedBranch !== "all") {
            filteredHistory = filteredHistory.filter((item) => item.branch === selectedBranch)
        }

        if (searchTerm) {
            filteredHistory = filteredHistory.filter(
                (item) =>
                    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (item.clinic && item.clinic.toLowerCase().includes(searchTerm.toLowerCase())),
            )
        }

        if (filterCategory !== "all") {
            filteredHistory = filteredHistory.filter((item) => item.reason === filterCategory)
        }

        if (filterAmount !== "all") {
            filteredHistory = filteredHistory.filter((item) => {
                const amount = Number.parseFloat(item.amount)
                if (filterAmount === "high") {
                    return amount >= 2000000
                } else if (filterAmount === "medium") {
                    return amount >= 1000000 && amount < 2000000
                } else if (filterAmount === "low") {
                    return amount < 1000000
                }
                return false
            })
        }

        return filteredHistory
    }

    // Get branch name by ID
    const getBranchNameById = (branchId) => {
        if (!branchId) return "-"
        const branch = branches.find((b) => b.id === branchId)
        return branch ? branch.name : branchId.toString()
    }

    // Toggle filters
    const toggleFilters = () => {
        setShowFilters(!showFilters)
    }

    // Prepare financial chart data
    const prepareFinancialChartData = () => {
        if (!financialData || !financialData.detailed_stats) {
            return {
                labels: [],
                datasets: [
                    {
                        label: t("income"),
                        data: [],
                        backgroundColor: "rgba(75, 192, 192, 0.5)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                    },
                    {
                        label: t("expense"),
                        data: [],
                        backgroundColor: "rgba(255, 99, 132, 0.5)",
                        borderColor: "rgba(255, 99, 132, 1)",
                        borderWidth: 1,
                    },
                ],
            }
        }

        return {
            labels: financialData.detailed_stats.map((item) => item.label),
            datasets: [
                {
                    label: t("income"),
                    data: financialData.detailed_stats.map((item) => item.income),
                    backgroundColor: "rgba(75, 192, 192, 0.5)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
                {
                    label: t("expense"),
                    data: financialData.detailed_stats.map((item) => item.expenses),
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                },
            ],
        }
    }

    // Prepare patient chart data
    const preparePatientChartData = () => {
        if (!patientData || !patientData.detailed_stats) {
            return {
                labels: [],
                datasets: [
                    {
                        label: t("patients_count"),
                        data: [],
                        backgroundColor: "rgba(54, 162, 235, 0.5)",
                        borderColor: "rgba(54, 162, 235, 1)",
                        borderWidth: 1,
                    },
                ],
            }
        }

        return {
            labels: patientData.detailed_stats.map((item) => item.label),
            datasets: [
                {
                    label: t("patients_count"),
                    data: patientData.detailed_stats.map((item) => item.patients),
                    backgroundColor: "rgba(54, 162, 235, 0.5)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                },
            ],
        }
    }

    // Prepare doctor chart data
    const prepareDoctorChartData = () => {
        if (!doctorData || !doctorData.doctor_stats) {
            return {
                labels: [],
                datasets: [
                    {
                        label: t("patients_count"),
                        data: [],
                        backgroundColor: [
                            "rgba(255, 99, 132, 0.5)",
                            "rgba(54, 162, 235, 0.5)",
                            "rgba(255, 206, 86, 0.5)",
                            "rgba(75, 192, 192, 0.5)",
                            "rgba(153, 102, 255, 0.5)",
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
        }

        return {
            labels: doctorData.doctor_stats.map((item) => item.doctor_name),
            datasets: [
                {
                    label: t("patients_count"),
                    data: doctorData.doctor_stats.map((item) => item.total_patients),
                    backgroundColor: [
                        "rgba(255, 99, 132, 0.5)",
                        "rgba(54, 162, 235, 0.5)",
                        "rgba(255, 206, 86, 0.5)",
                        "rgba(75, 192, 192, 0.5)",
                        "rgba(153, 102, 255, 0.5)",
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
    }

    const prepareDebtChartData = () => {
        if (!debtDynamicData || !debtDynamicData.data) {
            return {
                labels: [],
                datasets: [
                    {
                        label: t("debt_amount"),
                        data: [],
                        backgroundColor: "rgba(255, 159, 64, 0.5)",
                        borderColor: "rgba(255, 159, 64, 1)",
                        borderWidth: 1,
                    },
                ],
            }
        }

        const labels = debtDynamicData.data.map((item) => {
            if (debtDynamicData.type === "monthly") {
                return `${t("day")} ${item.day}`
            } else if (debtDynamicData.type === "yearly") {
                return item.month
            } else if (debtDynamicData.type === "quarterly") {
                return item.month
            } else {
                return new Date(item.date).toLocaleDateString()
            }
        })

        return {
            labels,
            datasets: [
                {
                    label: t("debt_amount"),
                    data: debtDynamicData.data.map((item) => item.total_amount),
                    backgroundColor: "rgba(255, 159, 64, 0.5)",
                    borderColor: "rgba(255, 159, 64, 1)",
                    borderWidth: 1,
                    fill: true,
                },
            ],
        }
    }

    // Chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    }

    // Loading state
    const isLoading = () => {
        if (reportType === "financial") return isLoadingFinancial
        if (reportType === "patients") return isLoadingPatient
        if (reportType === "staff") return isLoadingDoctor
        if (reportType === "debts") return isLoadingDebt
        return false
    }

    // Get current error
    const getCurrentError = () => {
        if (reportType === "financial") return financialError
        if (reportType === "patients") return patientError
        if (reportType === "staff") return doctorError
        if (reportType === "debts") return debtError
        return null
    }

    // Retry loading data
    const retryLoading = () => {
        if (reportType === "financial") fetchFinancialData()
        else if (reportType === "patients") fetchPatientData()
        else if (reportType === "staff") fetchDoctorData()
        else if (reportType === "debts") fetchDebtStatistics()
    }

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString()
    }

    return (
        <div className="reports-container">
            <div className="reports-header">
                <div className="reports-header-content">
                    <h1 className="reports-title">{t("reports")}</h1>
                    <button className="mobile-menu-toggle" onClick={() => setShowMobileMenu(!showMobileMenu)}>
                        <FaFilter />
                    </button>
                </div>
                <div className={`reports-actions ${showMobileMenu ? "mobile-show" : ""}`}>
                    <button className="reports-btn reports-btn-outline" onClick={() => setShowHistoryModal(true)}>
                        <FaHistory /> {t("history")}
                    </button>
                    <button className="reports-btn reports-btn-outline" onClick={() => setShowWithdrawalModal(true)}>
                        <FaWallet /> {t("withdraw_cash")}
                    </button>
                    <button className="reports-btn reports-btn-primary" onClick={handleDownload}>
                        <FaDownload /> {t("download_report")}
                    </button>
                </div>
            </div>

            <div className="reports-controls">
                <div className="reports-tabs-container">
                    <div className="reports-tabs">
                        <button
                            className={`reports-tab ${reportType === "financial" ? "active" : ""}`}
                            onClick={() => handleReportTypeChange("financial")}
                        >
                            <FaMoneyBillWave /> <span>{t("financial")}</span>
                        </button>
                        <button
                            className={`reports-tab ${reportType === "patients" ? "active" : ""}`}
                            onClick={() => handleReportTypeChange("patients")}
                        >
                            <FaUsers /> <span>{t("patients")}</span>
                        </button>
                        <button
                            className={`reports-tab ${reportType === "staff" ? "active" : ""}`}
                            onClick={() => handleReportTypeChange("staff")}
                        >
                            <FaUserMd /> <span>{t("staff")}</span>
                        </button>
                        <button
                            className={`reports-tab ${reportType === "debts" ? "active" : ""}`}
                            onClick={() => handleReportTypeChange("debts")}
                        >
                            <FaCreditCard /> <span>{t("indebted_patients")}</span>
                        </button>
                    </div>
                </div>

                <div className="reports-filters-container">
                    <div className="reports-filters">
                        <div className="reports-filter-group">
                            <label>
                                <FaCalendarAlt /> <span>{t("period")}:</span>
                            </label>
                            <select value={dateRange} onChange={handleDateRangeChange} className="reports-select">
                                <option value="month">{t("month")}</option>
                                <option value="quarter">{t("quarter")}</option>
                                <option value="year">{t("year")}</option>
                            </select>
                        </div>

                        {(dateRange === "quarter" && reportType !== "debts") && (
                            <div className="reports-filter-group quarter-group">
                                <label>{t("quarter")}:</label>
                                <div className="reports-quarter-selector">
                                    <button
                                        className={`reports-quarter-btn ${quarter === 1 ? "active" : ""}`}
                                        onClick={() => handleQuarterChange(1)}
                                    >
                                        Q1
                                    </button>
                                    <button
                                        className={`reports-quarter-btn ${quarter === 2 ? "active" : ""}`}
                                        onClick={() => handleQuarterChange(2)}
                                    >
                                        Q2
                                    </button>
                                    <button
                                        className={`reports-quarter-btn ${quarter === 3 ? "active" : ""}`}
                                        onClick={() => handleQuarterChange(3)}
                                    >
                                        Q3
                                    </button>
                                    <button
                                        className={`reports-quarter-btn ${quarter === 4 ? "active" : ""}`}
                                        onClick={() => handleQuarterChange(4)}
                                    >
                                        Q4
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {getCurrentError() && (
                <div className="reports-error">
                    <FaExclamationTriangle /> {getCurrentError()}
                    <button className="reports-btn reports-btn-primary reports-retry-btn" onClick={retryLoading}>
                        {t("try_again")}
                    </button>
                </div>
            )}

            {isLoading() ? (
                <div className="reports-loading">
                    <div className="reports-spinner"></div>
                    <p>{t("loading")}...</p>
                </div>
            ) : (
                <div className="reports-content">
                    {/* Financial Report */}
                    {reportType === "financial" && financialData && (
                        <>
                            <div className="reports-stats-grid">
                                <div className="reports-stat-card reports-income">
                                    <div className="reports-stat-icon">
                                        <FaMoneyBillWave />
                                    </div>
                                    <div className="reports-stat-info">
                                        <div className="reports-stat-value">{formatCurrency(financialData.total_income)}</div>
                                        <div className="reports-stat-label">{t("total_income")}</div>
                                    </div>
                                </div>

                                <div className="reports-stat-card reports-expense">
                                    <div className="reports-stat-icon">
                                        <FaMoneyBillWave />
                                    </div>
                                    <div className="reports-stat-info">
                                        <div className="reports-stat-value">{formatCurrency(financialData.total_expenses)}</div>
                                        <div className="reports-stat-label">{t("total_expenses")}</div>
                                    </div>
                                </div>

                                <div className="reports-stat-card reports-profit">
                                    <div className="reports-stat-icon">
                                        <FaMoneyBillWave />
                                    </div>
                                    <div className="reports-stat-info">
                                        <div className="reports-stat-value">{formatCurrency(financialData.net_profit)}</div>
                                        <div className="reports-stat-label">{t("net_profit")}</div>
                                    </div>
                                </div>

                                <div className="reports-stat-card">
                                    <div className="reports-stat-icon">
                                        <FaChartPie />
                                    </div>
                                    <div className="reports-stat-info">
                                        <div className="reports-stat-value">
                                            {financialData.profitability !== undefined ? formatPercentage(financialData.profitability) : "0%"}
                                        </div>
                                        <div className="reports-stat-label">{t("profitability")}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="reports-card">
                                <div className="reports-card-header">
                                    <h2>
                                        <FaChartBar /> {t("financial_indicators")}
                                        {dateRange === "month" && ` (${t("month")})`}
                                        {dateRange === "quarter" && ` (${t("quarter")} ${quarter})`}
                                        {dateRange === "year" && ` (${t("year")})`}
                                    </h2>
                                </div>
                                <div className="reports-chart-container">
                                    <Bar data={prepareFinancialChartData()} options={chartOptions} />
                                </div>
                            </div>

                            {financialData.detailed_stats && financialData.detailed_stats.length > 0 && (
                                <div className="reports-card">
                                    <div className="reports-card-header">
                                        <h2>{t("financial_details")}</h2>
                                    </div>
                                    <div className="reports-table-container">
                                        <table className="reports-table">
                                            <thead>
                                                <tr>
                                                    <th>{t("period")}</th>
                                                    <th>{t("income")}</th>
                                                    <th>{t("expenses")}</th>
                                                    <th>{t("profit")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {financialData.detailed_stats.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.label}</td>
                                                        <td className="reports-income-cell">{formatCurrency(item.income)}</td>
                                                        <td className="reports-expense-cell">{formatCurrency(item.expenses)}</td>
                                                        <td
                                                            className={item.income - item.expenses >= 0 ? "reports-profit-cell" : "reports-loss-cell"}
                                                        >
                                                            {formatCurrency(item.income - item.expenses)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Patients Report */}
                    {reportType === "patients" && patientData && (
                        <>
                            <div className="reports-stats-grid">
                                <div className="reports-stat-card">
                                    <div className="reports-stat-icon">
                                        <FaUsers />
                                    </div>
                                    <div className="reports-stat-info">
                                        <div className="reports-stat-value">{patientData.total_patients || 0}</div>
                                        <div className="reports-stat-label">{t("total_patients")}</div>
                                    </div>
                                </div>

                                {patientData.avg_weekly_patients !== undefined && (
                                    <div className="reports-stat-card">
                                        <div className="reports-stat-icon">
                                            <FaChartBar />
                                        </div>
                                        <div className="reports-stat-info">
                                            <div className="reports-stat-value">{patientData.avg_weekly_patients || 0}</div>
                                            <div className="reports-stat-label">{t("average_weekly")}</div>
                                        </div>
                                    </div>
                                )}

                                {patientData.avg_monthly_patients !== undefined && (
                                    <div className="reports-stat-card">
                                        <div className="reports-stat-icon">
                                            <FaChartBar />
                                        </div>
                                        <div className="reports-stat-info">
                                            <div className="reports-stat-value">{patientData.avg_monthly_patients || 0}</div>
                                            <div className="reports-stat-label">{t("average_monthly")}</div>
                                        </div>
                                    </div>
                                )}

                                <div className="reports-stat-card">
                                    <div className="reports-stat-icon">
                                        <FaChartLine />
                                    </div>
                                    <div className="reports-stat-info">
                                        <div className="reports-stat-value">
                                            {patientData.growth_rate !== undefined ? formatPercentage(patientData.growth_rate) : "0%"}
                                        </div>
                                        <div className="reports-stat-label">{t("growth")}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="reports-card">
                                <div className="reports-card-header">
                                    <h2>
                                        <FaChartLine /> {t("patient_dynamics")}
                                        {dateRange === "month" && ` (${t("month")})`}
                                        {dateRange === "quarter" && ` (${t("quarter")} ${quarter})`}
                                        {dateRange === "year" && ` (${t("year")})`}
                                    </h2>
                                </div>
                                <div className="reports-chart-container">
                                    <Line data={preparePatientChartData()} options={chartOptions} />
                                </div>
                            </div>

                            {patientData.detailed_stats && patientData.detailed_stats.length > 0 && (
                                <div className="reports-card">
                                    <div className="reports-card-header">
                                        <h2>{t("patient_details")}</h2>
                                    </div>
                                    <div className="reports-table-container">
                                        <table className="reports-table">
                                            <thead>
                                                <tr>
                                                    <th>{t("period")}</th>
                                                    <th>{t("patients")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {patientData.detailed_stats.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.label}</td>
                                                        <td>{item.patients}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Staff Report */}
                    {reportType === "staff" && doctorData && (
                        <>
                            <div className="reports-stats-grid">
                                {doctorData.most_effective_doctor && (
                                    <div className="reports-stat-card reports-top-performer">
                                        <div className="reports-stat-icon">
                                            <FaUserMd />
                                        </div>
                                        <div className="reports-stat-info">
                                            <div className="reports-stat-value">{doctorData.most_effective_doctor.doctor_name}</div>
                                            <div className="reports-stat-label">{t("top_performing_doctor")}</div>
                                        </div>
                                    </div>
                                )}

                                <div className="reports-stat-card">
                                    <div className="reports-stat-icon">
                                        <FaUsers />
                                    </div>
                                    <div className="reports-stat-info">
                                        <div className="reports-stat-value">
                                            {doctorData.doctor_stats
                                                ? doctorData.doctor_stats.reduce((sum, doctor) => sum + doctor.total_patients, 0)
                                                : 0}
                                        </div>
                                        <div className="reports-stat-label">{t("total_patients")}</div>
                                    </div>
                                </div>

                                <div className="reports-stat-card">
                                    <div className="reports-stat-icon">
                                        <FaChartPie />
                                    </div>
                                    <div className="reports-stat-info">
                                        <div className="reports-stat-value">
                                            {doctorData.doctor_stats && doctorData.doctor_stats.length > 0
                                                ? Math.round(
                                                    doctorData.doctor_stats.reduce((sum, doctor) => sum + doctor.total_patients, 0) /
                                                    doctorData.doctor_stats.length,
                                                )
                                                : 0}
                                        </div>
                                        <div className="reports-stat-label">{t("average_patients_per_doctor")}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="reports-card">
                                <div className="reports-card-header">
                                    <h2>
                                        <FaChartPie /> {t("doctor_efficiency")}
                                        {dateRange === "month" && ` (${t("month")})`}
                                        {dateRange === "quarter" && ` (${t("quarter")} ${quarter})`}
                                        {dateRange === "year" && ` (${t("year")})`}
                                    </h2>
                                </div>
                                <div className="reports-chart-container">
                                    <Pie data={prepareDoctorChartData()} options={chartOptions} />
                                </div>
                            </div>

                            {doctorData.doctor_stats && doctorData.doctor_stats.length > 0 && (
                                <div className="reports-card">
                                    <div className="reports-card-header">
                                        <h2>{t("doctor_details")}</h2>
                                    </div>
                                    <div className="reports-table-container">
                                        <table className="reports-table">
                                            <thead>
                                                <tr>
                                                    <th>{t("doctor")}</th>
                                                    <th>{t("patients")}</th>
                                                    <th>{t("income")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {doctorData.doctor_stats.map((doctor, index) => (
                                                    <tr key={index}>
                                                        <td>{doctor.doctor_name}</td>
                                                        <td>{doctor.total_patients}</td>
                                                        <td className="reports-income-cell">{formatCurrency(doctor.total_income)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {reportType === "debts" && debtStatistics && (
                        <>
                            <div className="reports-stats-grid">
                                <div className="reports-stat-card reports-debt">
                                    <div className="reports-stat-icon">
                                        <FaCreditCard />
                                    </div>
                                    <div className="reports-stat-info">
                                        <div className="reports-stat-value">{formatCurrency(debtStatistics.total_paid)}</div>
                                        <div className="reports-stat-label">{t("total_paid")}</div>
                                    </div>
                                </div>

                                <div className="reports-stat-card reports-discount">
                                    <div className="reports-stat-icon">
                                        <FaExclamationCircle />
                                    </div>
                                    <div className="reports-stat-info">
                                        <div className="reports-stat-value">{formatCurrency(debtStatistics.total_discount)}</div>
                                        <div className="reports-stat-label">{t("total_discount")}</div>
                                    </div>
                                </div>

                                <div className="reports-stat-card reports-count">
                                    <div className="reports-stat-icon">
                                        <FaUsers />
                                    </div>
                                    <div className="reports-stat-info">
                                        <div className="reports-stat-value">{debtStatistics.count}</div>
                                        <div className="reports-stat-label">{t("transactions_count")}</div>
                                    </div>
                                </div>

                                <div className="reports-stat-card reports-period">
                                    <div className="reports-stat-icon">
                                        <FaCalendarCheck />
                                    </div>
                                    <div className="reports-stat-info">
                                        <div className="reports-stat-value">{t(debtStatistics.period)}</div>
                                        <div className="reports-stat-label">{t("period")}</div>
                                    </div>
                                </div>
                            </div>

                            {debtDynamicData && (
                                <div className="reports-card">
                                    <div className="reports-card-header">
                                        <h2>
                                            <FaChartLine /> {t("debt_dynamics")}
                                            {dateRange === "month" && ` (${t("monthly")})`}
                                            {dateRange === "quarter" && ` (${t("quarterly")})`}
                                            {dateRange === "year" && ` (${t("yearly")})`}
                                        </h2>
                                    </div>
                                    <div className="reports-chart-container">
                                        <Line data={prepareDebtChartData()} options={chartOptions} />
                                    </div>
                                </div>
                            )}

                            {debtDynamicData && debtDynamicData.data && debtDynamicData.data.length > 0 && (
                                <div className="reports-card">
                                    <div className="reports-card-header">
                                        <h2>{t("debt_details")}</h2>
                                    </div>
                                    <div className="reports-table-container">
                                        <table className="reports-table">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        {debtDynamicData.type === "monthly"
                                                            ? t("day")
                                                            : debtDynamicData.type === "yearly"
                                                                ? t("month")
                                                                : debtDynamicData.type === "quarterly"
                                                                    ? t("month")
                                                                    : t("date")}
                                                    </th>
                                                    <th>{t("amount")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {debtDynamicData.data.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            {debtDynamicData.type === "monthly"
                                                                ? `${t("day")} ${item.day}`
                                                                : debtDynamicData.type === "yearly"
                                                                    ? item.month
                                                                    : debtDynamicData.type === "quarterly"
                                                                        ? item.month
                                                                        : new Date(item.date).toLocaleDateString()}
                                                        </td>
                                                        <td className="reports-debt-cell">{formatCurrency(item.total_amount)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Withdrawal Modal */}
            {showWithdrawalModal && (
                <div className="reports-modal-overlay">
                    <div className="reports-modal">
                        <div className="reports-modal-header">
                            <h2>{t("withdraw_cash")}</h2>
                            <button className="reports-close-btn" onClick={() => setShowWithdrawalModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="reports-modal-content">
                            <form onSubmit={handleWithdrawalSubmit} className="reports-form">
                                <div className="reports-form-group">
                                    <label>{t("branch")}</label>
                                    <select name="branch" value={withdrawalData.branch} onChange={handleWithdrawalChange} required>
                                        <option value="">{t("select_branch")}</option>
                                        {branches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="reports-form-group">
                                    <label>
                                        {t("amount")} ({t("currency")})
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={withdrawalData.amount}
                                        onChange={handleWithdrawalChange}
                                        placeholder={t("enter_amount")}
                                        required
                                        min="1"
                                    />
                                </div>

                                <div className="reports-form-group">
                                    <label>{t("reason")}</label>
                                    <select name="reason" value={withdrawalData.reason} onChange={handleWithdrawalChange} required>
                                        <option value="">{t("select_reason")}</option>
                                        {withdrawalReasons.map((reason) => (
                                            <option key={reason.id} value={reason.id}>
                                                {reason.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="reports-form-group">
                                    <label>{t("description")}</label>
                                    <textarea
                                        name="description"
                                        value={withdrawalData.description}
                                        onChange={handleWithdrawalChange}
                                        placeholder={t("enter_description")}
                                        rows={3}
                                        required
                                    ></textarea>
                                </div>

                                <div className="reports-form-actions">
                                    <button
                                        type="button"
                                        className="reports-btn reports-btn-secondary"
                                        onClick={() => setShowWithdrawalModal(false)}
                                    >
                                        {t("cancel")}
                                    </button>
                                    <button type="submit" className="reports-btn reports-btn-primary">
                                        {t("confirm")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {showHistoryModal && (
                <div className="reports-modal-overlay">
                    <div className="reports-modal reports-history-modal">
                        <div className="reports-modal-header">
                            <h2>{t("expense_history")}</h2>
                            <button className="reports-close-btn" onClick={() => setShowHistoryModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="reports-modal-content">
                            <div className="reports-history-controls">
                                <div className="reports-year-selector">
                                    <button
                                        className="reports-btn reports-btn-icon reports-year-nav"
                                        onClick={() => setHistoryYear(historyYear - 1)}
                                        disabled={historyYear <= 2019}
                                    >
                                        <FaArrowLeft />
                                    </button>
                                    <span className="reports-year-display">{historyYear}</span>
                                    <button
                                        className="reports-btn reports-btn-icon reports-year-nav"
                                        onClick={() => setHistoryYear(historyYear + 1)}
                                        disabled={historyYear >= new Date().getFullYear()}
                                    >
                                        <FaArrowRight />
                                    </button>
                                </div>

                                <div className="reports-search-filter">
                                    <div className="reports-search-input">
                                        <FaSearch className="reports-search-icon" />
                                        <input
                                            type="text"
                                            placeholder={t("search")}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <button className={`reports-filter-toggle ${showFilters ? "active" : ""}`} onClick={toggleFilters}>
                                        <FaFilter /> {t("filters")}
                                    </button>
                                </div>

                                {showFilters && (
                                    <div className="reports-history-filters">
                                        <div className="reports-filter-group">
                                            <label>{t("category")}:</label>
                                            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                                                <option value="all">{t("all")}</option>
                                                {withdrawalReasons.map((reason) => (
                                                    <option key={reason.id} value={reason.id}>
                                                        {reason.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="reports-filter-group">
                                            <label>{t("amount")}:</label>
                                            <select value={filterAmount} onChange={(e) => setFilterAmount(e.target.value)}>
                                                <option value="all">{t("all")}</option>
                                                <option value="high">Yuqori {"(> 2,000,000)"}</option>
                                                <option value="medium">O'rta (1,000,000 - 2,000,000)</option>
                                                <option value="low">Past {"(< 1,000,000)"}</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="reports-table-container">
                                <table className="reports-table">
                                    <thead>
                                        <tr>
                                            <th>{t("date")}</th>
                                            <th>{t("amount")}</th>
                                            <th>{t("reason")}</th>
                                            <th>{t("description")}</th>
                                            <th>{t("branch")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getFilteredWithdrawalHistory().length > 0 ? (
                                            getFilteredWithdrawalHistory().map((item) => (
                                                <tr key={item.id}>
                                                    <td>{formatDate(item.created_at)}</td>
                                                    <td className="reports-amount-cell">{formatCurrency(Number.parseFloat(item.amount))}</td>
                                                    <td>{item.reason}</td>
                                                    <td>{item.description}</td>
                                                    <td>
                                                        {item.branch ? (
                                                            <span className="reports-branch-name">{getBranchNameById(item.branch)}</span>
                                                        ) : (
                                                            <span className="reports-clinic-name">{item.clinic || "-"}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="reports-no-data">
                                                    {t("no_data_found")}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <SuccessModal
                    isOpen={showSuccessModal}
                    message={successMessage}
                    buttonText={t("ok")}
                    onClose={() => setShowSuccessModal(false)}
                />
            )}
        </div>
    )
}
