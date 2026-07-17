"use client"

import { useState, useEffect, useCallback } from "react"
import {
    FaUserMd,
    FaUserNurse,
    FaUserCog,
    FaEdit,
    FaTrash,
    FaSync,
    FaFilter,
    FaSearch,
    FaPlus,
    FaEye,
    FaTimes,
    FaCheck,
    FaCalendarAlt,
    FaSpinner,
    FaUserTie,
    FaChevronDown,
    FaChevronUp,
    FaMoneyBillWave,
    FaUserAlt,
} from "react-icons/fa"
import { useAuth } from "../../../contexts/AuthContext"
import { useLanguage } from "../../../contexts/LanguageContext"
import apiUsers from "../../../api/apiUsers"
import apiBranches from "../../../api/apiBranches"
import apiUsersStatistics from "../../../api/apiUsersStatistics"
import Pagination from "../../pagination/Pagination"
import ConfirmModal from "../../modal/ConfirmModal"
import SuccessModal from "../../modal/SuccessModal"
import StaffDetailsModal from "./StaffDetailsModal" // Assuming this will also be updated or KPI won't be shown there
import StaffScheduleModal from "./StaffScheduleModal"
import getApiErrorMessage from "../../../utils/apiError"

export default function Staff() {
    const { selectedBranch } = useAuth()
    const { t } = useLanguage()

    // Staff positions
    const staffPositions = [
        { value: "doctor", label: t("doctor") },
        { value: "admin", label: t("admin") },
        // Add other roles if necessary, e.g., director, nurse
    ]

    // Tish shifokori (stomatolog) mutaxassisliklari
    const specializationOptions = [
        { value: "general", label: "Umumiy stomatolog" },
        { value: "therapist", label: "Terapevt stomatolog" },
        { value: "surgeon", label: "Jarroh stomatolog" },
        { value: "orthodontist", label: "Ortodont" },
        { value: "orthopedist", label: "Ortoped (protezist)" },
        { value: "periodontist", label: "Parodontolog" },
        { value: "endodontist", label: "Endodont" },
        { value: "pediatric", label: "Bolalar stomatologi" },
        { value: "implantologist", label: "Implantolog" },
        { value: "hygienist", label: "Gigienist" },
        { value: "other", label: "Boshqa" },
    ]

    // Status options
    const statusOptions = [
        { value: "faol", label: t("active") },
        { value: "nofaol", label: t("inactive") },
        { value: "tatilda", label: t("on_vacation") },
    ]

    // State for branches
    const [branches, setBranches] = useState([])
    const [isLoadingBranches, setIsLoadingBranches] = useState(true)
    const [branchError, setBranchError] = useState(null)

    // State for staff data
    const [staff, setStaff] = useState([])
    const [isLoadingStaff, setIsLoadingStaff] = useState(true)
    const [staffError, setStaffError] = useState(null)
    const [totalStaff, setTotalStaff] = useState(0)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // State for staff statistics
    const [staffStats, setStaffStats] = useState({
        total_users: 0,
        active_users: 0,
        on_leave_users: 0,
        total_salary: 0,
        inactive_users: 0,
        role_distribution: [],
        doctor_kpi_stats: [], // New state for KPI stats
    })
    const [isLoadingStats, setIsLoadingStats] = useState(true)
    const [showStats, setShowStats] = useState(false)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // State for filters
    const [showFilters, setShowFilters] = useState(false)
    const [filterRole, setFilterRole] = useState("all")
    const [filterStatus, setFilterStatus] = useState("all")
    const [filterBranch, setFilterBranch] = useState(selectedBranch)
    const [searchTerm, setSearchTerm] = useState("")

    // State for user form
    const [showSidebar, setShowSidebar] = useState(false)
    const [formMode, setFormMode] = useState("add")
    const [currentStaffMember, setCurrentStaffMember] = useState(null)
    const [formErrors, setFormErrors] = useState({})

    // State for new staff
    const [newStaff, setNewStaff] = useState({
        email: "",
        first_name: "",
        last_name: "",
        role: "doctor",
        phone_number: "",
        specialization: "general",
        status: "faol",
        branch: selectedBranch === "all" ? "" : selectedBranch,
        salary: "",
        kpi: "", // New KPI field
        work_type: "salary", // oylik / kpi / salary_kpi / trainee
        reason_holiday: "",
        start_holiday: "",
        end_holiday: "",
    })

    // Modal states
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
        type: "warning",
    })

    const [successModal, setSuccessModal] = useState({
        isOpen: false,
        title: "",
        message: "",
    })

    // User details modal state
    const [userDetailsModal, setUserDetailsModal] = useState({
        isOpen: false,
        user: null,
    })

    // Haftalik ish jadvali modali
    const [scheduleModal, setScheduleModal] = useState({
        isOpen: false,
        userId: null,
        userName: "",
    })

    const openScheduleModal = (userId, userName) => {
        setScheduleModal({ isOpen: true, userId, userName })
    }
    const closeScheduleModal = () => setScheduleModal({ isOpen: false, userId: null, userName: "" })

    // Fetch branches from API
    useEffect(() => {
        const fetchBranchData = async () => {
            setIsLoadingBranches(true)
            setBranchError(null)
            try {
                const branchData = await apiBranches.fetchBranches()
                setBranches(Array.isArray(branchData) ? branchData : [])
            } catch (error) {
                console.error("Error fetching branches:", error)
                setBranchError(t("error_fetching_branches"))
                setBranches([])
            } finally {
                setIsLoadingBranches(false)
            }
        }
        fetchBranchData()
    }, [t])

    // Fetch staff statistics
    useEffect(() => {
        const fetchStaffStatistics = async () => {
            if (!showStats) return

            setIsLoadingStats(true)
            try {
                const stats = await apiUsersStatistics.fetchUsersStatistics(filterBranch !== "all" ? filterBranch : null)
                setStaffStats({
                    ...stats,
                    doctor_kpi_stats: stats.doctor_kpi_stats || [], // Ensure it's an array
                })
            } catch (error) {
                console.error("Error fetching staff statistics:", error)
                setStaffStats({
                    total_users: 0,
                    active_users: 0,
                    on_leave_users: 0,
                    total_salary: 0,
                    inactive_users: 0,
                    role_distribution: [],
                    doctor_kpi_stats: [], // Reset on error
                })
            } finally {
                setIsLoadingStats(false)
            }
        }
        fetchStaffStatistics()
    }, [filterBranch, refreshTrigger, showStats, t])

    // Fetch staff data
    const fetchStaffData = useCallback(async () => {
        setIsLoadingStaff(true)
        setStaffError(null)
        try {
            const filters = {
                branch: filterBranch !== "all" ? filterBranch : null,
                role: filterRole !== "all" ? filterRole : null,
                status: filterStatus !== "all" ? filterStatus : null,
                search: searchTerm || null,
            }
            const response = await apiUsers.fetchUsers(currentPage + 1, itemsPerPage, filters)
            setStaff(response.results || [])
            setTotalStaff(response.count || 0)
        } catch (error) {
            console.error("Error fetching staff data:", error)
            setStaffError(t("error_fetching_staff"))
            setStaff([])
            setTotalStaff(0)
        } finally {
            setIsLoadingStaff(false)
        }
    }, [currentPage, itemsPerPage, filterRole, filterStatus, filterBranch, searchTerm, t])

    useEffect(() => {
        fetchStaffData()
    }, [fetchStaffData, refreshTrigger])

    useEffect(() => {
        setFilterBranch(selectedBranch)
        setCurrentPage(0)
        setRefreshTrigger((prev) => prev + 1)
    }, [selectedBranch])

    const handlePageChange = (selectedPage) => {
        setCurrentPage(selectedPage)
    }

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage)
        setCurrentPage(0)
    }

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
        setCurrentPage(0)
    }

    const toggleFilters = () => setShowFilters(!showFilters)
    const toggleStats = () => setShowStats(!showStats)

    const resetFilters = () => {
        setFilterRole("all")
        setFilterStatus("all")
        setFilterBranch(selectedBranch)
        setSearchTerm("")
        setCurrentPage(0)
    }

    const handleNewStaffChange = (e) => {
        const { name, value } = e.target
        setNewStaff((prev) => ({ ...prev, [name]: value }))
        if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }))
    }

    const handleEditStaffChange = (e) => {
        const { name, value } = e.target
        setCurrentStaffMember((prev) => ({ ...prev, [name]: value }))
        if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }))
    }

    const validateForm = (data) => {
        const errors = {}
        const workType = data.work_type || "salary"
        if (!data.email) errors.email = t("email_required")
        if (!data.first_name) errors.first_name = t("first_name_required")
        if (!data.last_name) errors.last_name = t("last_name_required")
        if (!data.phone_number) errors.phone_number = t("phone_required")
        // Oylik faqat ish turi oylikni o'z ichiga olganda majburiy
        if ((workType === "salary" || workType === "salary_kpi") && !data.salary) {
            errors.salary = t("salary_required")
        }

        // KPI ish turi KPI'ni o'z ichiga olganda tekshiriladi
        if (workType === "kpi" || workType === "salary_kpi") {
            if (data.kpi === undefined || data.kpi === null || data.kpi === "") {
                errors.kpi = t("kpi_must_be_between_0_and_100")
            } else if (
                isNaN(Number.parseFloat(data.kpi)) ||
                Number.parseFloat(data.kpi) < 0 ||
                Number.parseFloat(data.kpi) > 100
            ) {
                errors.kpi = t("kpi_must_be_between_0_and_100")
            }
        }

        if (data.status === "nofaol" && !data.reason_holiday) errors.reason_holiday = t("reason_required_for_inactive")
        if (data.status === "tatilda") {
            if (!data.start_holiday) errors.start_holiday = t("start_date_required")
            if (!data.end_holiday) errors.end_holiday = t("end_date_required")
            if (!data.reason_holiday) errors.reason_holiday = t("reason_required_for_vacation")
        }
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const openAddSidebar = () => {
        setFormMode("add")
        setShowSidebar(true)
        setFormErrors({})
        setNewStaff({
            email: "",
            first_name: "",
            last_name: "",
            role: "doctor",
            phone_number: "",
            specialization: "general",
            status: "faol",
            branch: selectedBranch === "all" ? (branches.length > 0 ? branches[0].id.toString() : "") : selectedBranch,
            salary: "",
            kpi: "", // Reset KPI
            work_type: "salary",
            reason_holiday: "",
            start_holiday: "",
            end_holiday: "",
        })
    }

    const closeAddSidebar = () => {
        setShowSidebar(false)
        setFormErrors({})
    }

    const openEditSidebar = async (staffId) => {
        try {
            setIsLoadingStaff(true)
            setFormMode("edit")
            setFormErrors({})
            const staffMember = await apiUsers.fetchUserById(staffId)
            setCurrentStaffMember({
                ...staffMember,
                kpi: staffMember.kpi !== undefined && staffMember.kpi !== null ? staffMember.kpi.toString() : "", // Ensure KPI is a string for input
                _prevBranch: staffMember.branch,
            })
            setShowSidebar(true)
        } catch (error) {
            console.error("Error fetching staff member details:", error)
            showErrorModal(t("error"), t("error_fetching_staff_details"))
        } finally {
            setIsLoadingStaff(false)
        }
    }

    const closeEditSidebar = () => {
        setShowSidebar(false)
        setCurrentStaffMember(null)
        setFormErrors({})
    }

    const showConfirmModal = (title, message, onConfirm, type = "warning") => {
        setConfirmModal({ isOpen: true, title, message, onConfirm, type })
    }
    const closeConfirmModal = () => setConfirmModal((prev) => ({ ...prev, isOpen: false }))
    const showSuccessModal = (title, message) => setSuccessModal({ isOpen: true, title, message })
    const closeSuccessModal = () => setSuccessModal((prev) => ({ ...prev, isOpen: false }))
    const showErrorModal = (title, message) => {
        setConfirmModal({ isOpen: true, title, message, onConfirm: closeConfirmModal, type: "danger" })
    }

    const openUserDetailsModal = (user) => setUserDetailsModal({ isOpen: true, user })
    const closeUserDetailsModal = () => setUserDetailsModal({ isOpen: false, user: null })

    const prepareStaffData = (data) => {
        const staffData = { ...data }
        const workType = staffData.work_type || "salary"

        // Ish turiga qarab oylik/KPI maydonlarini tayyorlash
        if (workType === "kpi" || workType === "salary_kpi") {
            staffData.kpi = staffData.kpi === "" || staffData.kpi === null || staffData.kpi === undefined
                ? 0
                : Number.parseFloat(staffData.kpi)
        } else {
            staffData.kpi = 0 // Oylik yoki o'rganuvchi uchun KPI yo'q
        }
        if (workType === "kpi" || workType === "trainee") {
            staffData.salary = 0 // Faqat KPI yoki ish o'rganuvchi uchun oylik yo'q
        }

        if (staffData.status !== "tatilda") {
            delete staffData.start_holiday
            delete staffData.end_holiday
        } else {
            if (staffData.start_holiday)
                staffData.start_holiday = new Date(staffData.start_holiday).toISOString().split("T")[0]
            if (staffData.end_holiday) staffData.end_holiday = new Date(staffData.end_holiday).toISOString().split("T")[0]
        }
        if (staffData.status === "faol") delete staffData.reason_holiday

        // Ensure branch is an ID (number) if it's a string
        if (staffData.branch && typeof staffData.branch === "string" && !isNaN(Number.parseInt(staffData.branch))) {
            staffData.branch = Number.parseInt(staffData.branch)
        }

        return staffData
    }

    const addStaff = async (e) => {
        e.preventDefault()
        if (!validateForm(newStaff)) return

        try {
            setIsLoadingStaff(true)
            const dataToSubmit = prepareStaffData(newStaff)
            const createdUser = await apiUsers.createUser(dataToSubmit)
            setRefreshTrigger((prev) => prev + 1)
            closeAddSidebar()
            // Yangi xodim yaratilishi bilan haftalik ish jadvali modali ochiladi
            if (createdUser?.id) {
                openScheduleModal(
                    createdUser.id,
                    formatFullName(createdUser.first_name, createdUser.last_name) ||
                    formatFullName(dataToSubmit.first_name, dataToSubmit.last_name),
                )
            } else {
                showSuccessModal(t("success"), t("staff_added_successfully"))
            }
        } catch (error) {
            console.error("Error adding staff member:", error.response?.data || error.message)
            showErrorModal(t("error"), getApiErrorMessage(error, t("error_adding_staff")))
        } finally {
            setIsLoadingStaff(false)
        }
    }

    const updateStaff = async (e) => {
        e.preventDefault()
        if (!currentStaffMember || !currentStaffMember.id || !validateForm(currentStaffMember)) return

        try {
            setIsLoadingStaff(true)
            const dataToSubmit = prepareStaffData(currentStaffMember)
            delete dataToSubmit._prevBranch // Clean up helper field
            await apiUsers.updateUser(currentStaffMember.id, dataToSubmit)
            setRefreshTrigger((prev) => prev + 1)
            closeEditSidebar()
            showSuccessModal(t("success"), t("staff_updated_successfully"))
        } catch (error) {
            console.error("Error updating staff member:", error.response?.data || error.message)
            showErrorModal(t("error"), getApiErrorMessage(error, t("error_updating_staff")))
        } finally {
            setIsLoadingStaff(false)
        }
    }

    const confirmDeleteStaff = (staffId, staffName) => {
        showConfirmModal(
            t("confirm_delete"),
            t("confirm_delete_staff_message", { name: staffName }),
            () => deleteStaff(staffId),
            "danger",
        )
    }

    const deleteStaff = async (staffId) => {
        try {
            setIsLoadingStaff(true)
            await apiUsers.deleteUser(staffId)
            setRefreshTrigger((prev) => prev + 1)
            closeConfirmModal()
            showSuccessModal(t("success"), t("staff_deleted_successfully"))
        } catch (error) {
            console.error("Error deleting staff member:", error)
            showErrorModal(t("error"), getApiErrorMessage(error, t("error_deleting_staff")))
        } finally {
            setIsLoadingStaff(false)
        }
    }

    const handleRefreshData = () => setRefreshTrigger((prev) => prev + 1)

    const getRoleLabel = (roleValue) => staffPositions.find((pos) => pos.value === roleValue)?.label || roleValue
    const getSpecializationLabel = (specValue) =>
        specializationOptions.find((s) => s.value === specValue)?.label || specValue
    const getBranchName = (branchId) => {
        if (isLoadingBranches) return t("loading")
        if (branchError) return t("unknown")
        const branch = branches.find((b) => b.id.toString() === branchId?.toString())
        return branch ? branch.name : t("unknown_branch")
    }
    const formatFullName = (firstName, lastName) => `${firstName || ""} ${lastName || ""}`.trim()
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined || isNaN(Number(amount))) return "0"
        return new Intl.NumberFormat("uz-UZ", { style: "decimal", maximumFractionDigits: 0 }).format(Number(amount))
    }

    const pageCount = Math.ceil(totalStaff / itemsPerPage)
    const getProgressPercentage = (count) => {
        if (!staffStats.total_users || staffStats.total_users === 0) return 0 // Changed from totalStaff to total_users
        return (count / staffStats.total_users) * 100
    }

    return (
        <div className="xodim-container">
            <div className="xodim-header">
                <h1 className="xodim-title">{t("staff")}</h1>
                <div className="xodim-actions">
                    <button className="xodim-btn xodim-btn-outline" onClick={handleRefreshData} title={t("refresh_data")}>
                        <FaSync className={isLoadingStaff || isLoadingStats ? "xodim-spinner" : ""} />
                    </button>
                    <button className="xodim-btn xodim-btn-primary" onClick={openAddSidebar}>
                        <FaPlus /> {t("add_new_staff")}
                    </button>
                </div>
            </div>

            <div className="xodim-stats-toggle" onClick={toggleStats}>
                <h2>
                    {t("statistics")} {showStats ? <FaChevronUp /> : <FaChevronDown />}
                </h2>
            </div>

            {showStats && (
                <div className="xodim-stats-container">
                    <div className="xodim-stats-grid">
                        {/* Stat Cards */}
                        <div className="xodim-stat-card">
                            <div className="xodim-stat-icon-wrapper">
                                <FaUserAlt className="xodim-stat-icon" />
                            </div>
                            <div className="xodim-stat-content">
                                <div className="xodim-stat-value">
                                    {isLoadingStats ? <FaSpinner className="xodim-spinner" /> : staffStats.total_users}
                                </div>
                                <div className="xodim-stat-label">{t("total_staff")}</div>
                            </div>
                        </div>
                        <div className="xodim-stat-card">
                            <div className="xodim-stat-icon-wrapper">
                                <FaCheck className="xodim-stat-icon" />
                            </div>
                            <div className="xodim-stat-content">
                                <div className="xodim-stat-value">
                                    {isLoadingStats ? <FaSpinner className="xodim-spinner" /> : staffStats.active_users}
                                </div>
                                <div className="xodim-stat-label">{t("active_staff")}</div>
                            </div>
                        </div>
                        <div className="xodim-stat-card">
                            <div className="xodim-stat-icon-wrapper">
                                <FaTimes className="xodim-stat-icon" />
                            </div>{" "}
                            {/* Changed icon */}
                            <div className="xodim-stat-content">
                                <div className="xodim-stat-value">
                                    {isLoadingStats ? <FaSpinner className="xodim-spinner" /> : staffStats.inactive_users}
                                </div>
                                <div className="xodim-stat-label">{t("inactive_employee")}</div>
                            </div>
                        </div>
                        <div className="xodim-stat-card">
                            <div className="xodim-stat-icon-wrapper">
                                <FaCalendarAlt className="xodim-stat-icon" />
                            </div>
                            <div className="xodim-stat-content">
                                <div className="xodim-stat-value">
                                    {isLoadingStats ? <FaSpinner className="xodim-spinner" /> : staffStats.on_leave_users}
                                </div>
                                <div className="xodim-stat-label">{t("staff_on_leave")}</div>
                            </div>
                        </div>
                        <div className="xodim-stat-card">
                            <div className="xodim-stat-icon-wrapper">
                                <FaMoneyBillWave className="xodim-stat-icon" />
                            </div>
                            <div className="xodim-stat-content">
                                <div className="xodim-stat-value">
                                    {isLoadingStats ? (
                                        <FaSpinner className="xodim-spinner" />
                                    ) : (
                                        `${formatCurrency(staffStats.total_salary)} ${t("so'm")}`
                                    )}
                                </div>
                                <div className="xodim-stat-label">{t("total_salary")}</div>
                            </div>
                        </div>
                    </div>

                    {!isLoadingStats && staffStats.role_distribution && staffStats.role_distribution.length > 0 && (
                        <div className="xodim-position-stats">
                            <h3>{t("position_distribution")}</h3>
                            <div className="xodim-position-stats-list">
                                {staffStats.role_distribution.map((position, index) => (
                                    <div key={index} className="xodim-position-stat-item">
                                        <div className="xodim-position-stat-header">
                                            <span className="xodim-position-name">{getRoleLabel(position.role)}</span>
                                            <span className="xodim-position-count">{position.count}</span>
                                        </div>
                                        <div className="xodim-position-progress-bar">
                                            <div
                                                className="xodim-position-progress"
                                                style={{ width: `${getProgressPercentage(position.count)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Doctor KPI Statistics Section */}
                    {!isLoadingStats && staffStats.doctor_kpi_stats && staffStats.doctor_kpi_stats.length > 0 && (
                        <div className="xodim-kpi-stats">
                            <h3>{t("doctor_kpi_statistics")}</h3>
                            <div className="xodim-table-responsive">
                                <table className="xodim-data-table xodim-kpi-table">
                                    <thead>
                                        <tr>
                                            <th>{t("doctor_name")}</th>
                                            <th>{t("kpi_target_percentage")}</th>
                                            <th>{t("total_payment_short")}</th>
                                            <th>{t("kpi_earned_amount")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staffStats.doctor_kpi_stats.map((kpiStat) => (
                                            <tr key={kpiStat.doctor_id}>
                                                <td>{kpiStat.doctor_name}</td>
                                                <td>
                                                    {kpiStat.kpi_percent !== null && kpiStat.kpi_percent !== undefined
                                                        ? `${kpiStat.kpi_percent}%`
                                                        : t("not_set")}
                                                </td>
                                                <td>
                                                    {formatCurrency(kpiStat.total_payment)} {t("so'm")}
                                                </td>
                                                <td>
                                                    {formatCurrency(kpiStat.kpi_amount)} {t("so'm")}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {/* Show message if no KPI stats and not loading */}
                    {!isLoadingStats && (!staffStats.doctor_kpi_stats || staffStats.doctor_kpi_stats.length === 0) && (
                        <div className="xodim-kpi-stats">
                            <h3>{t("doctor_kpi_statistics")}</h3>
                            <p className="xodim-no-data">{t("no_kpi_data_found")}</p>
                        </div>
                    )}
                </div>
            )}

            <div className="xodim-filters-container">
                <div className="xodim-search-filter">
                    <div className="xodim-search-input">
                        <FaSearch className="xodim-search-icon" />
                        <input type="text" placeholder={t("search")} value={searchTerm} onChange={handleSearchChange} />
                    </div>
                    <button className={`xodim-filter-toggle-btn ${showFilters ? "active" : ""}`} onClick={toggleFilters}>
                        <FaFilter /> {t("filters")}
                    </button>
                </div>

                {showFilters && (
                    <div className="xodim-advanced-filters">
                        <div className="xodim-filter-group">
                            <label>{t("position")}:</label>
                            <select
                                value={filterRole}
                                onChange={(e) => {
                                    setFilterRole(e.target.value)
                                    setCurrentPage(0)
                                }}
                            >
                                <option value="all">{t("all")}</option>
                                {staffPositions.map((position) => (
                                    <option key={position.value} value={position.value}>
                                        {position.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="xodim-filter-group">
                            <label>{t("status")}:</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value)
                                    setCurrentPage(0)
                                }}
                            >
                                <option value="all">{t("all")}</option>
                                {statusOptions.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {selectedBranch === "all" && (
                            <div className="xodim-filter-group">
                                <label>{t("branch")}:</label>
                                <select
                                    value={filterBranch}
                                    onChange={(e) => {
                                        setFilterBranch(e.target.value)
                                        setCurrentPage(0)
                                    }}
                                >
                                    <option value="all">{t("all")}</option>
                                    {Array.isArray(branches) &&
                                        branches.map((branch) => (
                                            <option key={branch.id} value={branch.id.toString()}>
                                                {branch.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        )}
                        <div className="xodim-filter-group">
                            <button className="xodim-btn xodim-btn-outline" onClick={resetFilters}>
                                {t("reset_filters")}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isLoadingStaff && (
                <div className="xodim-loading-container">
                    <div className="xodim-loading">
                        <FaSpinner className="xodim-spinner" /> {t("loading_staff")}
                    </div>
                </div>
            )}
            {staffError && !isLoadingStaff && (
                <div className="xodim-error-container">
                    <div className="xodim-error">
                        {staffError}{" "}
                        <button className="xodim-btn xodim-btn-outline xodim-btn-sm" onClick={handleRefreshData}>
                            <FaSync /> {t("try_again")}
                        </button>
                    </div>
                </div>
            )}

            {!isLoadingStaff && !staffError && (
                <div className="xodim-dashboard-card">
                    <div className="xodim-table-responsive">
                        <table className="xodim-data-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>{t("name")}</th>
                                    <th>{t("position")}</th>
                                    <th>{t("specialization")}</th>
                                    <th>{t("phone")}</th>
                                    <th>{t("status")}</th>
                                    <th>{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.length > 0 ? (
                                    staff.map((person) => (
                                        <tr key={person.id}>
                                            <td>
                                                <button
                                                    className="xodim-btn-icon xodim-view"
                                                    onClick={() => openUserDetailsModal(person)}
                                                    title={t("view_details")}
                                                >
                                                    <FaEye />
                                                </button>
                                            </td>
                                            <td>{formatFullName(person.first_name, person.last_name)}</td>
                                            <td>
                                                <div className={`xodim-role-badge ${person.role}`}>
                                                    {person.role === "doctor" ? (
                                                        <FaUserMd />
                                                    ) : person.role === "nurse" ? (
                                                        <FaUserNurse />
                                                    ) : person.role === "director" ? (
                                                        <FaUserTie />
                                                    ) : (
                                                        <FaUserCog />
                                                    )}
                                                    {getRoleLabel(person.role)}
                                                </div>
                                            </td>
                                            <td>{person.specialization_name || getSpecializationLabel(person.specialization)}</td>
                                            <td>{person.phone_number}</td>
                                            <td>
                                                <div
                                                    className={`xodim-status-badge ${person.status === "faol" ? "active" : person.status === "nofaol" ? "inactive" : "vacation"}`}
                                                >
                                                    {person.status === "faol" ? (
                                                        <>
                                                            <FaCheck /> {t("active")}
                                                        </>
                                                    ) : person.status === "nofaol" ? (
                                                        <>
                                                            <FaTimes /> {t("inactive")}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaCalendarAlt /> {t("on_vacation")}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="xodim-action-buttons">
                                                    <button
                                                        className="xodim-btn-icon xodim-schedule"
                                                        onClick={() =>
                                                            openScheduleModal(person.id, formatFullName(person.first_name, person.last_name))
                                                        }
                                                        title={t("weekly_schedule")}
                                                    >
                                                        <FaCalendarAlt />
                                                    </button>
                                                    <button
                                                        className="xodim-btn-icon xodim-edit"
                                                        onClick={() => openEditSidebar(person.id)}
                                                        title={t("edit")}
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="xodim-btn-icon xodim-delete"
                                                        onClick={() =>
                                                            confirmDeleteStaff(person.id, formatFullName(person.first_name, person.last_name))
                                                        }
                                                        title={t("delete")}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="xodim-no-data">
                                            {t("no_data_found")}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!isLoadingStaff && !staffError && staff.length > 0 && (
                <Pagination
                    pageCount={pageCount}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalStaff}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />
            )}

            {showSidebar && (
                <>
                    <div
                        className="xodim-sidebar-overlay active"
                        onClick={formMode === "add" ? closeAddSidebar : closeEditSidebar}
                    ></div>
                    <div className="xodim-sidebar active">
                        <div className="xodim-sidebar-header">
                            <h2>{formMode === "add" ? t("add_new_staff") : t("edit_staff")}</h2>
                            <button className="xodim-close-button" onClick={formMode === "add" ? closeAddSidebar : closeEditSidebar}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="xodim-sidebar-content">
                            <form onSubmit={formMode === "add" ? addStaff : updateStaff}>
                                <div className="xodim-form-group">
                                    <label>{t("email")} *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formMode === "add" ? newStaff.email : currentStaffMember?.email || ""}
                                        onChange={formMode === "add" ? handleNewStaffChange : handleEditStaffChange}
                                        required
                                        className={formErrors.email ? "error" : ""}
                                    />
                                    {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                                </div>
                                <div className="xodim-form-group">
                                    <label>{t("first_name")} *</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formMode === "add" ? newStaff.first_name : currentStaffMember?.first_name || ""}
                                        onChange={formMode === "add" ? handleNewStaffChange : handleEditStaffChange}
                                        required
                                        className={formErrors.first_name ? "error" : ""}
                                    />
                                    {formErrors.first_name && <div className="error-message">{formErrors.first_name}</div>}
                                </div>
                                <div className="xodim-form-group">
                                    <label>{t("last_name")} *</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formMode === "add" ? newStaff.last_name : currentStaffMember?.last_name || ""}
                                        onChange={formMode === "add" ? handleNewStaffChange : handleEditStaffChange}
                                        required
                                        className={formErrors.last_name ? "error" : ""}
                                    />
                                    {formErrors.last_name && <div className="error-message">{formErrors.last_name}</div>}
                                </div>
                                <div className="xodim-form-group">
                                    <label>{t("role")}</label>
                                    <select
                                        name="role"
                                        value={formMode === "add" ? newStaff.role : currentStaffMember?.role || "doctor"}
                                        onChange={formMode === "add" ? handleNewStaffChange : handleEditStaffChange}
                                    >
                                        {staffPositions.map((position) => (
                                            <option key={position.value} value={position.value}>
                                                {position.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Ish turi: Oylik / KPI / Ikkalasi / Ish o'rganuvchi */}
                                <div className="xodim-form-group">
                                    <label>{t("work_type")} *</label>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {[
                                            { value: "salary", label: t("work_type_salary") },
                                            { value: "kpi", label: t("work_type_kpi") },
                                            { value: "salary_kpi", label: t("work_type_salary_kpi") },
                                            { value: "trainee", label: t("work_type_trainee") },
                                        ].map((option) => {
                                            const currentWorkType =
                                                (formMode === "add" ? newStaff.work_type : currentStaffMember?.work_type) || "salary"
                                            const isActive = currentWorkType === option.value
                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() =>
                                                        formMode === "add"
                                                            ? handleNewStaffChange({ target: { name: "work_type", value: option.value } })
                                                            : handleEditStaffChange({ target: { name: "work_type", value: option.value } })
                                                    }
                                                    style={{
                                                        padding: "8px 14px",
                                                        borderRadius: 8,
                                                        border: isActive ? "2px solid #0ea5e9" : "1px solid #cbd5e1",
                                                        background: isActive ? "#e0f2fe" : "#ffffff",
                                                        color: isActive ? "#0369a1" : "#475569",
                                                        fontWeight: isActive ? 700 : 400,
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {isActive ? "✓ " : ""}{option.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Oylik — faqat ish turi oylikni o'z ichiga olganda */}
                                {(() => {
                                    const wt = (formMode === "add" ? newStaff.work_type : currentStaffMember?.work_type) || "salary"
                                    return wt === "salary" || wt === "salary_kpi"
                                })() && (
                                        <div className="xodim-form-group">
                                            <label>{t("salary")} (UZS) *</label>
                                            <input
                                                type="text"
                                                name="salary"
                                                value={formMode === "add" ? newStaff.salary : currentStaffMember?.salary || ""}
                                                onChange={formMode === "add" ? handleNewStaffChange : handleEditStaffChange}
                                                className={formErrors.salary ? "error" : ""}
                                            />
                                            {formErrors.salary && <div className="error-message">{formErrors.salary}</div>}
                                        </div>
                                    )}

                                {/* KPI — faqat ish turi KPI'ni o'z ichiga olganda */}
                                {(() => {
                                    const wt = (formMode === "add" ? newStaff.work_type : currentStaffMember?.work_type) || "salary"
                                    return wt === "kpi" || wt === "salary_kpi"
                                })() && (
                                        <div className="xodim-form-group">
                                            <label>{t("kpi_percentage")} *</label>
                                            <input
                                                type="number"
                                                name="kpi"
                                                value={formMode === "add" ? newStaff.kpi : currentStaffMember?.kpi || ""}
                                                onChange={formMode === "add" ? handleNewStaffChange : handleEditStaffChange}
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                placeholder={t("enter_kpi_percentage_placeholder")} // e.g. 10 for 10%
                                                className={formErrors.kpi ? "error" : ""}
                                            />
                                            {formErrors.kpi && <div className="error-message">{formErrors.kpi}</div>}
                                        </div>
                                    )}

                                {/* Mutaxassislik faqat shifokor (doctor) tanlanganda ko'rsatiladi */}
                                {(formMode === "add" ? newStaff.role : currentStaffMember?.role) === "doctor" && (
                                    <div className="xodim-form-group">
                                        <label>{t("specialization")}</label>
                                        <select
                                            name="specialization"
                                            value={
                                                formMode === "add" ? newStaff.specialization : currentStaffMember?.specialization || "general"
                                            }
                                            onChange={formMode === "add" ? handleNewStaffChange : handleEditStaffChange}
                                        >
                                            {specializationOptions.map((spec) => (
                                                <option key={spec.value} value={spec.value}>
                                                    {spec.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="xodim-form-group">
                                    <label>{t("phone")} *</label>
                                    <input
                                        type="text"
                                        name="phone_number"
                                        value={formMode === "add" ? newStaff.phone_number : currentStaffMember?.phone_number || ""}
                                        onChange={formMode === "add" ? handleNewStaffChange : handleEditStaffChange}
                                        required
                                        className={formErrors.phone_number ? "error" : ""}
                                    />
                                    {formErrors.phone_number && <div className="error-message">{formErrors.phone_number}</div>}
                                </div>
                                <div className="xodim-form-group">
                                    <label>{t("status")}</label>
                                    <select
                                        name="status"
                                        value={formMode === "add" ? newStaff.status : currentStaffMember?.status || "faol"}
                                        onChange={formMode === "add" ? handleNewStaffChange : handleEditStaffChange}
                                    >
                                        {statusOptions.map((status) => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {(formMode === "add" ? newStaff.status : currentStaffMember?.status) === "nofaol" && (
                                    <div className="xodim-form-group">
                                        <label>{t("reason_for_inactive")} *</label>
                                        <input
                                            type="text"
                                            name="reason_holiday"
                                            value={formMode === "add" ? newStaff.reason_holiday : currentStaffMember?.reason_holiday || ""}
                                            onChange={formMode === "add" ? handleNewStaffChange : handleEditStaffChange}
                                            required
                                            className={formErrors.reason_holiday ? "error" : ""}
                                        />
                                        {formErrors.reason_holiday && <div className="error-message">{formErrors.reason_holiday}</div>}
                                    </div>
                                )}
                                {(formMode === "add" ? newStaff.status : currentStaffMember?.status) === "tatilda" && (
                                    <>
                                        <div className="xodim-form-group">
                                            <label>{t("vacation_start_date")} *</label>
                                            <input
                                                type="date"
                                                name="start_holiday"
                                                value={formMode === "add" ? newStaff.start_holiday : currentStaffMember?.start_holiday || ""}
                                                onChange={formMode === "add" ? handleNewStaffChange : handleEditStaffChange}
                                                required
                                                className={formErrors.start_holiday ? "error" : ""}
                                            />
                                            {formErrors.start_holiday && <div className="error-message">{formErrors.start_holiday}</div>}
                                        </div>
                                        <div className="xodim-form-group">
                                            <label>{t("vacation_end_date")} *</label>
                                            <input
                                                type="date"
                                                name="end_holiday"
                                                value={formMode === "add" ? newStaff.end_holiday : currentStaffMember?.end_holiday || ""}
                                                onChange={formMode === "add" ? handleNewStaffChange : handleEditStaffChange}
                                                required
                                                className={formErrors.end_holiday ? "error" : ""}
                                            />
                                            {formErrors.end_holiday && <div className="error-message">{formErrors.end_holiday}</div>}
                                        </div>
                                        <div className="xodim-form-group">
                                            <label>{t("vacation_reason")} *</label>
                                            <input
                                                type="text"
                                                name="reason_holiday"
                                                value={formMode === "add" ? newStaff.reason_holiday : currentStaffMember?.reason_holiday || ""}
                                                onChange={formMode === "add" ? handleNewStaffChange : handleEditStaffChange}
                                                required
                                                className={formErrors.reason_holiday ? "error" : ""}
                                            />
                                            {formErrors.reason_holiday && <div className="error-message">{formErrors.reason_holiday}</div>}
                                        </div>
                                    </>
                                )}
                                {selectedBranch === "all" && (
                                    <div className="xodim-form-group">
                                        <label>{t("branch")}</label>
                                        <select
                                            name="branch"
                                            value={formMode === "add" ? newStaff.branch : currentStaffMember?.branch?.toString() || ""}
                                            onChange={formMode === "add" ? handleNewStaffChange : handleEditStaffChange}
                                            required
                                        >
                                            {isLoadingBranches ? (
                                                <option value="">{t("loading")}</option>
                                            ) : branchError ? (
                                                <option value="">{t("error_loading_branches")}</option>
                                            ) : Array.isArray(branches) && branches.length > 0 ? (
                                                branches.map((branch) => (
                                                    <option key={branch.id} value={branch.id.toString()}>
                                                        {branch.name}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="">{t("no_branches_available")}</option>
                                            )}
                                        </select>
                                    </div>
                                )}
                                <div className="xodim-form-actions">
                                    <button type="submit" className="xodim-btn xodim-btn-primary" disabled={isLoadingStaff}>
                                        {isLoadingStaff ? <FaSpinner className="xodim-spinner" /> : null}{" "}
                                        {formMode === "add" ? t("add") : t("save")}
                                    </button>
                                    <button
                                        type="button"
                                        className="xodim-btn xodim-btn-secondary"
                                        onClick={formMode === "add" ? closeAddSidebar : closeEditSidebar}
                                    >
                                        {t("cancel")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {scheduleModal.isOpen && (
                <StaffScheduleModal
                    isOpen={scheduleModal.isOpen}
                    onClose={closeScheduleModal}
                    userId={scheduleModal.userId}
                    userName={scheduleModal.userName}
                    onSaved={() => showSuccessModal(t("success"), t("schedule_saved_successfully"))}
                />
            )}

            {userDetailsModal.isOpen && (
                <StaffDetailsModal
                    isOpen={userDetailsModal.isOpen}
                    onClose={closeUserDetailsModal}
                    user={userDetailsModal.user}
                    staffPositions={staffPositions}
                    specializationOptions={specializationOptions}
                    getBranchName={getBranchName}
                />
            )}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={t("confirm")}
                cancelText={t("cancel")}
                type={confirmModal.type}
            />
            <SuccessModal
                isOpen={successModal.isOpen}
                onClose={closeSuccessModal}
                title={successModal.title}
                message={successModal.message}
            />
        </div>
    )
}
