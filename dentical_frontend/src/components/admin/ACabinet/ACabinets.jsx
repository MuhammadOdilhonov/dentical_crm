"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../../../contexts/AuthContext"
import { useLanguage } from "../../../contexts/LanguageContext"
import {
    FaDoorOpen,
    FaHospital,
    FaUserMd,
    FaSearch,
    FaFilter,
    FaPlus,
    FaEdit,
    FaTrash,
    FaInfoCircle,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimes,
    FaUserNurse,
    FaTools,
    FaBuilding,
    FaChartBar,
    FaFlask,
    FaAmbulance,
    FaTooth,
} from "react-icons/fa"
import { getCabinets, createCabinet, updateCabinet, deleteCabinet, getCabinetById } from "../../../api/apiCabinets"
import { getCabinetStatistics } from "../../../api/apiCabinetsStatistic"
import Pagination from "../../pagination/Pagination"
import ConfirmModal from "../../modal/ConfirmModal"
import SuccessModal from "../../modal/SuccessModal"
import apiUsers from "../../../api/apiUsers"
import apiBranches from "../../../api/apiBranches"

export default function ACabinets() {
    const { selectedBranch } = useAuth()
    const { t } = useLanguage()

    // Tanlangan filialning qavatlar soniga qarab qavat variantlari
    const getFloorOptions = (branchesList, branchId) => {
        const selected = (branchesList || []).find((b) => String(b.id) === String(branchId))
        const floorsCount = selected?.floors && selected.floors > 0 ? selected.floors : 4
        return Array.from({ length: floorsCount }, (_, i) => String(i + 1))
    }

    // Xodimlarni kabinet filiali bo'yicha filtrlash
    const filterStaffByBranch = (staffList, branchId) => {
        if (!branchId) return staffList || []
        return (staffList || []).filter((s) => String(s.branch) === String(branchId))
    }

    // State for cabinets data
    const [cabinetsData, setCabinetsData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [totalItems, setTotalItems] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [pageCount, setPageCount] = useState(0)

    // State for branches
    const [branches, setBranches] = useState([])
    const [isLoadingBranches, setIsLoadingBranches] = useState(false)
    const [branchError, setBranchError] = useState(null)

    // State for staff
    const [doctors, setDoctors] = useState([])
    const [nurses, setNurses] = useState([])
    const [isLoadingStaff, setIsLoadingStaff] = useState(false)
    const [staffError, setStaffError] = useState(null)

    // State for statistics
    const [statistics, setStatistics] = useState({
        total_cabinets: 0,
        available_cabinets: 0,
        occupied_cabinets: 0,
        repair_cabinets: 0,
        type_distribution: [],
    })
    const [isLoadingStats, setIsLoadingStats] = useState(false)

    // UI state
    const [searchTerm, setSearchTerm] = useState("")
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [showStatsModal, setShowStatsModal] = useState(true)
    const [showFilters, setShowFilters] = useState(false)
    const [filterType, setFilterType] = useState("all")
    const [filterFloor, setFilterFloor] = useState("all")
    const [filterStatus, setFilterStatus] = useState("all")
    const [filterBranch, setFilterBranch] = useState("")
    const [currentCabinet, setCurrentCabinet] = useState(null)
    const [showDoctorWarning, setShowDoctorWarning] = useState(false)
    const [showNurseWarning, setShowNurseWarning] = useState(false)

    // Modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [cabinetToDelete, setCabinetToDelete] = useState(null)

    // Form data
    const [formData, setFormData] = useState({
        name: "",
        type: "",
        floor: "1",
        status: "available",
        description: "",
        branch: selectedBranch?.id || "",
        userDoctor: "",
        userNurses: [],
    })

    // Fetch branches
    const fetchBranchData = useCallback(async () => {
        setIsLoadingBranches(true)
        setBranchError(null)
        try {
            const branchData = await apiBranches.fetchBranches()
            // Check if branchData has results property
            if (branchData && branchData.results) {
                setBranches(branchData.results)
            } else {
                // Ensure branchData is an array
                setBranches(Array.isArray(branchData) ? branchData : [])
            }
        } catch (error) {
            console.error("Error fetching branches:", error)
            setBranchError(t("error_fetching_branches"))
            setBranches([]) // Set to empty array on error
        } finally {
            setIsLoadingBranches(false)
        }
    }, [t])

    useEffect(() => {
        fetchBranchData()
    }, [fetchBranchData])

    // Fetch staff (doctors and nurses)
    const fetchStaffData = useCallback(async () => {
        setIsLoadingStaff(true)
        setStaffError(null)
        try {
            // Fetch all doctors (role = doctor) without additional filters
            const doctorsData = await apiUsers.fetchUsers(1, 100, { role: "doctor" })
            setDoctors(doctorsData.results || [])
            console.log("doctor>>", doctorsData.results)

            // Fetch all nurses (role = nurse) without additional filters
            const nursesData = await apiUsers.fetchUsers(1, 100, { role: "nurse" })
            setNurses(nursesData.results || [])
        } catch (error) {
            console.error("Error fetching staff:", error)
            setStaffError(t("error_fetching_staff"))
            setDoctors([])
            setNurses([])
        } finally {
            setIsLoadingStaff(false)
        }
    }, [t])

    useEffect(() => {
        fetchStaffData()
    }, [fetchStaffData])

    // Fetch cabinets when dependencies change
    const fetchCabinetsData = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            // Use filterBranch if set, otherwise use selectedBranch if not "all"
            const branchId = filterBranch || (selectedBranch && selectedBranch !== "all" ? selectedBranch : null)
            const data = await getCabinets(currentPage, itemsPerPage, branchId, searchTerm)

            setCabinetsData(data.results || [])
            setTotalItems(data.count || 0)
            setPageCount(Math.ceil((data.count || 0) / itemsPerPage))
        } catch (err) {
            console.error("Error fetching cabinets:", err)
            setError(err.message || t("error_fetching_cabinets"))
            setCabinetsData([])
        } finally {
            setIsLoading(false)
        }
    }, [currentPage, itemsPerPage, filterBranch, selectedBranch, searchTerm, t])

    // useEffect ni yangilash - faqat kerakli dependency'lar
    useEffect(() => {
        fetchCabinetsData()
    }, [currentPage, itemsPerPage, searchTerm]) // filterBranch va selectedBranch ni olib tashlash

    // Alohida useEffect filterlar uchun
    useEffect(() => {
        setCurrentPage(1) // Reset to first page when filters change
        fetchCabinetsData()
    }, [filterBranch, selectedBranch])

    // Fetch statistics
    const fetchStatisticsData = useCallback(async () => {
        setIsLoadingStats(true)
        try {
            // Use filterBranch if set, otherwise use selectedBranch if not "all"
            const branchId = filterBranch || (selectedBranch && selectedBranch !== "all" ? selectedBranch : null)
            let url = ""
            if (branchId) {
                url = `?branch_id=${branchId}`
            }
            const data = await getCabinetStatistics(url)
            setStatistics(
                data || {
                    total_cabinets: 0,
                    available_cabinets: 0,
                    occupied_cabinets: 0,
                    repair_cabinets: 0,
                    type_distribution: [],
                },
            )
        } catch (err) {
            console.error("Error fetching statistics:", err)
        } finally {
            setIsLoadingStats(false)
        }
    }, [filterBranch, selectedBranch])

    useEffect(() => {
        fetchStatisticsData()
    }, [fetchStatisticsData])

    // Get cabinet type icon
    const getCabinetTypeIcon = (type) => {
        switch (type) {
            case "jarrohlik":
                return <FaUserMd className="cab-type-icon" />
            case "laboratoriya":
                return <FaFlask className="cab-type-icon" />
            case "tezyordam":
                return <FaAmbulance className="cab-type-icon" />
            case "stomatalogiya":
                return <FaTooth className="cab-type-icon" />
            case "qabulxona":
                return <FaHospital className="cab-type-icon" />
            case "terapevtik_stomatologiya":
                return <FaTooth className="cab-type-icon" />
            case "ortopedik_stomatologiya":
                return <FaTooth className="cab-type-icon" />
            case "ortodontiya":
                return <FaTooth className="cab-type-icon" />
            case "xirurgik_stomatologiya":
                return <FaTooth className="cab-type-icon" />
            case "pediatrik_stomatologiya":
                return <FaTooth className="cab-type-icon" />
            case "estetik_stomatologiya":
                return <FaTooth className="cab-type-icon" />
            case "parodontologiya":
                return <FaTooth className="cab-type-icon" />
            case "implantologiya":
                return <FaTooth className="cab-type-icon" />
            case "radiologik_stomatologiya":
                return <FaTooth className="cab-type-icon" />
            case "profilaktik_stomatologiya":
                return <FaTooth className="cab-type-icon" />
            default:
                return <FaDoorOpen className="cab-type-icon" />
        }
    }

    // Get cabinet type label
    const getCabinetTypeLabel = (type) => {
        switch (type) {
            case "jarrohlik":
                return t("surgery")
            case "laboratoriya":
                return t("laboratoriya")
            case "tezyordam":
                return t("tezyordam")
            case "stomatalogiya":
                return t("stomatalogiya")
            case "qabulxona":
                return t("qabulxona")
            case "terapevtik_stomatologiya":
                return "Terapevtik stomatologiya"
            case "ortopedik_stomatologiya":
                return "Ortopedik stomatologiya"
            case "ortodontiya":
                return "Ortodontiya"
            case "xirurgik_stomatologiya":
                return "Xirurgik stomatologiya"
            case "pediatrik_stomatologiya":
                return "Pediatrik stomatologiya"
            case "estetik_stomatologiya":
                return "Estetik stomatologiya"
            case "parodontologiya":
                return "Parodontologiya"
            case "implantologiya":
                return "Implantologiya"
            case "radiologik_stomatologiya":
                return "Radiologik stomatologiya"
            case "profilaktik_stomatologiya":
                return "Profilaktik stomatologiya"
            default:
                return type
        }
    }

    // Handle search
    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1) // Reset to first page on new search
    }

    // Toggle filters
    const toggleFilters = () => {
        setShowFilters(!showFilters)
    }

    // Apply filters
    const applyFilters = () => {
        setCurrentPage(1) // Reset to first page when applying filters
        fetchCabinetsData()
    }

    // Reset filters
    const resetFilters = () => {
        setFilterType("all")
        setFilterFloor("all")
        setFilterStatus("all")
        // Only reset filterBranch if selectedBranch is "all"
        if (!selectedBranch || selectedBranch === "all") {
            setFilterBranch("")
        } else {
            setFilterBranch(selectedBranch)
        }
        setSearchTerm("")
        setCurrentPage(1) // Reset to first page
    }

    // Filter cabinets based on local filters (type, floor, status)
    const filteredCabinets = cabinetsData.filter((cabinet) => {
        // Type filter
        const matchesType = filterType === "all" || cabinet.type === filterType

        // Floor filter
        const matchesFloor = filterFloor === "all" || cabinet.floor === filterFloor

        // Status filter
        const matchesStatus = filterStatus === "all" || cabinet.status === filterStatus

        return matchesType && matchesFloor && matchesStatus
    })

    // Обновить функцию handleInputChange, чтобы правильно обрабатывать выбор доктора
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })

        // Check if doctor is already assigned to another cabinet
        if (name === "userDoctor" && value) {
            const doctorId = Number.parseInt(value)
            const selectedDoctor = doctors.find((doctor) => doctor.id === doctorId)
            // Показывать предупреждение только если доктор уже назначен и это не текущий кабинет
            const isAssigned =
                selectedDoctor &&
                selectedDoctor.has_cabinet &&
                (!currentCabinet ||
                    !currentCabinet.user_doctor ||
                    !currentCabinet.user_doctor.some((doc) => doc.id === doctorId))
            setShowDoctorWarning(isAssigned)
        }
    }

    // Handle nurse selection
    // Обновить функцию handleNurseSelection, чтобы правильно обрабатывать выбор медсестры
    const handleNurseSelection = (e) => {
        const nurseId = Number.parseInt(e.target.value)

        if (nurseId) {
            // Check if nurse is already in the list
            if (formData.userNurses.includes(nurseId)) {
                return
            }

            // Check if nurse is already assigned to another cabinet
            const selectedNurse = nurses.find((nurse) => nurse.id === nurseId)
            // Показывать предупреждение только если медсестра уже назначена и это не текущий кабинет
            const isAssigned =
                selectedNurse &&
                selectedNurse.has_cabinet &&
                (!currentCabinet ||
                    !currentCabinet.user_nurse ||
                    !currentCabinet.user_nurse.some((nurse) => nurse.id === nurseId))
            setShowNurseWarning(isAssigned)

            // Add nurse to the list
            setFormData({
                ...formData,
                userNurses: [...formData.userNurses, nurseId],
            })
        }
    }

    // Remove nurse from selection
    const removeNurse = (nurseId) => {
        setFormData({
            ...formData,
            userNurses: formData.userNurses.filter((id) => id !== nurseId),
        })
    }

    // Open add modal
    const openAddModal = () => {
        // Reset form and fetch fresh data
        setFormData({
            name: "",
            type: "",
            floor: "1",
            status: "available",
            description: "",
            branch: selectedBranch?.id || "",
            userDoctor: "",
            userNurses: [],
        })

        // Make sure we have the latest staff data
        fetchStaffData()

        // Show the modal
        setShowAddModal(true)
    }

    // Handle add cabinet
    const handleAddCabinet = async (e) => {
        e.preventDefault()
        try {
            setIsLoading(true)

            // Get selected doctor name for alert
            let doctorName = ""
            if (formData.userDoctor) {
                const selectedDoctor = doctors.find((d) => d.id === Number.parseInt(formData.userDoctor))
                if (selectedDoctor) {
                    doctorName = `${selectedDoctor.first_name} ${selectedDoctor.last_name}`
                }
            }

            // Prepare data for API
            const cabinetData = {
                ...formData,
                branch: Number.parseInt(formData.branch),
                user_doctor: formData.userDoctor ? [Number.parseInt(formData.userDoctor)] : [],
                user_nurse: formData.userNurses.map((id) => Number.parseInt(id)),
            }

            await createCabinet(cabinetData)
            setShowAddModal(false)

            // Set success message with doctor name if available
            let message = t("cabinet_added_successfully")
            if (doctorName) {
                message += `. ${t("doctor_assigned")}: ${doctorName}`
            }

            setSuccessMessage(message)
            setShowSuccessModal(true)

            // Reset form
            setFormData({
                name: "",
                type: "",
                floor: "1",
                status: "available",
                description: "",
                branch: selectedBranch?.id || "",
                userDoctor: "",
                userNurses: [],
            })

            // Refresh data
            fetchCabinetsData()
            fetchStatisticsData()
        } catch (err) {
            setError(err.message || t("error_adding_cabinet"))
        } finally {
            setIsLoading(false)
        }
    }

    // Open edit modal
    const openEditModal = async (cabinet) => {
        try {
            setIsLoading(true)

            // Fetch the latest cabinet data
            const cabinetData = await getCabinetById(cabinet.id)

            // Make sure we have the latest staff data
            await fetchStaffData()

            // Правильно установить ID доктора и медсестер
            const doctorId =
                cabinetData.user_doctor && cabinetData.user_doctor.length > 0 ? cabinetData.user_doctor[0].id : ""

            const nurseIds = (cabinetData.user_nurse || []).map((nurse) => nurse.id)

            setFormData({
                name: cabinetData.name,
                type: cabinetData.type,
                floor: cabinetData.floor,
                status: cabinetData.status,
                description: cabinetData.description,
                branch: cabinetData.branch,
                userDoctor: doctorId,
                userNurses: nurseIds,
            })

            setCurrentCabinet(cabinetData)
            setShowEditModal(true)
        } catch (err) {
            setError(err.message || t("error_fetching_cabinet_details"))
        } finally {
            setIsLoading(false)
        }
    }

    // Handle update cabinet
    const handleUpdateCabinet = async (e) => {
        e.preventDefault()
        try {
            setIsLoading(true)

            // Get selected doctor name for alert
            let doctorName = ""
            if (formData.userDoctor) {
                const selectedDoctor = doctors.find((d) => d.id === Number.parseInt(formData.userDoctor))
                if (selectedDoctor) {
                    doctorName = `${selectedDoctor.first_name} ${selectedDoctor.last_name}`
                }
            }

            // Prepare data for API
            const cabinetData = {
                name: formData.name,
                type: formData.type,
                floor: formData.floor,
                status: formData.status,
                description: formData.description,
                branch: Number.parseInt(formData.branch),
                user_doctor: formData.userDoctor ? [Number.parseInt(formData.userDoctor)] : [],
                user_nurse: formData.userNurses.map((id) => Number.parseInt(id)),
            }

            await updateCabinet(currentCabinet.id, cabinetData)
            setShowEditModal(false)

            // Set success message with doctor name if available
            let message = t("cabinet_updated_successfully")
            if (doctorName) {
                message += `. ${t("doctor_assigned")}: ${doctorName}`
            }

            setSuccessMessage(message)
            setShowSuccessModal(true)

            // Refresh data
            fetchCabinetsData()
            fetchStatisticsData()
        } catch (err) {
            setError(err.message || t("error_updating_cabinet"))
        } finally {
            setIsLoading(false)
        }
    }

    // Open cabinet details modal
    const openDetailsModal = async (cabinet) => {
        try {
            setIsLoading(true)

            // Fetch the latest cabinet data
            const cabinetData = await getCabinetById(cabinet.id)

            setCurrentCabinet(cabinetData)
            setShowDetailsModal(true)
        } catch (err) {
            setError(err.message || t("error_fetching_cabinet_details"))
        } finally {
            setIsLoading(false)
        }
    }

    // Open delete confirmation
    const openDeleteConfirmation = (cabinet) => {
        setCabinetToDelete(cabinet)
        setShowConfirmModal(true)
    }

    // Handle delete cabinet
    const handleDeleteCabinet = async () => {
        try {
            setIsLoading(true)

            // Make sure we have a valid cabinet ID
            if (!cabinetToDelete || !cabinetToDelete.id) {
                setError(t("invalid_cabinet_id"))
                setShowConfirmModal(false)
                setIsLoading(false)
                return
            }

            // Call the API to delete the cabinet
            await deleteCabinet(cabinetToDelete.id)

            // Close the modal and show success message
            setShowConfirmModal(false)
            setSuccessMessage(t("cabinet_deleted_successfully"))
            setShowSuccessModal(true)

            // Refresh data after successful deletion
            fetchCabinetsData()
            fetchStatisticsData()
        } catch (err) {
            console.error("Error deleting cabinet:", err)
            setError(err.message || t("error_deleting_cabinet"))
            setShowConfirmModal(false) // Close the modal even on error
        } finally {
            setIsLoading(false)
            setCabinetToDelete(null)
        }
    }

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page + 1) // API uses 1-based indexing
    }

    // Handle items per page change
    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage)
        setCurrentPage(1) // Reset to first page when changing items per page
    }

    // Get branch name by ID
    const getBranchName = (branchId) => {
        const branch = branches.find((b) => b.id === branchId)
        return branch ? branch.name : t("unknown_branch")
    }

    // Get status label
    const getStatusLabel = (status) => {
        switch (status) {
            case "available":
                return t("there_is")
            case "creating":
                return t("creating")
            case "repair":
                return t("repair")
            default:
                return status
        }
    }

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case "available":
                return <FaCheckCircle className="status-icon available" />
            case "creating":
                return <FaUserMd className="status-icon occupied" />
            case "repair":
                return <FaTools className="status-icon repair" />
            default:
                return <FaExclamationTriangle className="status-icon" />
        }
    }

    // Get nurse name by ID
    const getNurseName = (nurseId) => {
        const nurse = nurses.find((n) => n.id === nurseId)
        return nurse ? `${nurse.first_name} ${nurse.last_name}` : t("unknown_nurse")
    }

    const [initialSelectedBranch, setInitialSelectedBranch] = useState(selectedBranch)

    useEffect(() => {
        setInitialSelectedBranch(selectedBranch)
    }, [selectedBranch])

    useEffect(() => {
        if (initialSelectedBranch && initialSelectedBranch !== "all") {
            setFilterBranch(initialSelectedBranch)
        } else {
            setFilterBranch("")
        }
    }, [initialSelectedBranch])

    // Loading state
    if (isLoading && !cabinetsData.length) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>{t("loading")}...</p>
            </div>
        )
    }

    // Error state
    if (error && !cabinetsData.length) {
        return (
            <div className="error-container">
                <FaExclamationTriangle className="error-icon" />
                <h2>{t("error_occurred")}</h2>
                <p>{error}</p>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        fetchCabinetsData()
                    }}
                >
                    {t("try_again")}
                </button>
            </div>
        )
    }

    return (
        <div className="admin-cabinet">
            <div className="page-header">
                <h1>
                    <FaDoorOpen /> {t("cabinets_management")}
                </h1>
                <div className="header-actions">
                    <button className="btn btn-outline" onClick={() => setShowStatsModal(!showStatsModal)}>
                        {showStatsModal ? (
                            <FaTimes />
                        ) : (
                            <>
                                <FaChartBar /> {t("show_stats")}
                            </>
                        )}
                    </button>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <FaPlus /> {t("add_cabinet")}
                    </button>
                </div>
            </div>

            {showStatsModal && (
                <div className="cabinets-stats">
                    {isLoadingStats ? (
                        <div className="stats-loading">
                            <div className="loading-spinner"></div>
                            <p>{t("loading_statistics")}...</p>
                        </div>
                    ) : (
                        <>
                            <div className="stat-cards">
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <FaDoorOpen />
                                    </div>
                                    <div className="stat-content">
                                        <h3>{statistics.total_cabinets}</h3>
                                        <p>{t("total_cabinets")}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon available">
                                        <FaCheckCircle />
                                    </div>
                                    <div className="stat-content">
                                        <h3>{statistics.available_cabinets}</h3>
                                        <p>{t("available_cabinets")}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon occupied">
                                        <FaUserMd />
                                    </div>
                                    <div className="stat-content">
                                        <h3>{statistics.occupied_cabinets}</h3>
                                        <p>{t("create_cabinet")}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon maintenance">
                                        <FaTools />
                                    </div>
                                    <div className="stat-content">
                                        <h3>{statistics.repair_cabinets}</h3>
                                        <p>{t("repair_cabinets")}</p>
                                    </div>
                                </div>
                            </div>

                            {statistics.type_distribution && statistics.type_distribution.length > 0 && (
                                <div className="type-distribution">
                                    <h3 className="section-title">
                                        <FaChartBar className="section-icon" /> {t("type_distribution")}
                                    </h3>
                                    <div className="type-bars">
                                        {statistics.type_distribution.map((type, index) => (
                                            <div className="type-bar-container" key={index}>
                                                <div className="type-bar-header">
                                                    <div className="type-name-container">
                                                        {getCabinetTypeIcon(type.type)}
                                                        <span className="type-name">{getCabinetTypeLabel(type.type)}</span>
                                                    </div>
                                                    <span className="type-count">{type.count}</span>
                                                </div>
                                                <div className="type-bar-wrapper">
                                                    <div
                                                        className={`type-bar type-${type.type}`}
                                                        style={{
                                                            width: `${(type.count / (statistics.total_cabinets || 1)) * 100}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            <div className="search-filter-container">
                <div className="search-input-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder={t("search_cabinets")}
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <button className={`filter-toggle ${showFilters ? "active" : ""}`} onClick={toggleFilters}>
                    <FaFilter /> {t("filters")}
                </button>
            </div>

            {showFilters && (
                <div className="filters">
                    {(!selectedBranch || selectedBranch === "all") && (
                        <div className="filter-group">
                            <label>{t("branch")}:</label>
                            <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
                                <option value="">{t("all_branches")}</option>
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="filter-group">
                        <label>{t("type")}:</label>
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="all">{t("all")}</option>
                            <option value="jarrohlik">{t("surgery")}</option>
                            <option value="laboratoriya">{t("laboratoriya")}</option>
                            <option value="tezyordam">{t("tezyordam")}</option>
                            <option value="stomatalogiya">{t("stomatalogiya")}</option>
                            <option value="qabulxona">{t("qabulxona")}</option>

                            <option value="terapevtik_stomatologiya">Terapevtik stomatologiya</option>
                            <option value="ortopedik_stomatologiya">Ortopedik stomatologiya</option>
                            <option value="ortodontiya">Ortodontiya</option>
                            <option value="xirurgik_stomatologiya">Xirurgik stomatologiya</option>
                            <option value="pediatrik_stomatologiya">Pediatrik stomatologiya</option>
                            <option value="estetik_stomatologiya">Estetik stomatologiya</option>
                            <option value="parodontologiya">Parodontologiya</option>
                            <option value="implantologiya">Implantologiya</option>
                            <option value="radiologik_stomatologiya">Radiologik stomatologiya</option>
                            <option value="profilaktik_stomatologiya">Profilaktik stomatologiya</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>{t("floor")}:</label>
                        <select value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)}>
                            <option value="all">{t("all")}</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>{t("status")}:</label>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="all">{t("all")}</option>
                            <option value="available">{t("there_is")}</option>
                            <option value="creating">{t("creating")}</option>
                            <option value="repair">{t("repair")}</option>
                        </select>
                    </div>
                    <div className="filter-actions">
                        <button className="btn btn-outline" onClick={resetFilters}>
                            {t("reset")}
                        </button>
                        <button className="btn btn-primary" onClick={applyFilters}>
                            {t("apply")}
                        </button>
                    </div>
                </div>
            )}

            <div className="cabinets-grid">
                {isLoading && cabinetsData.length > 0 ? (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                    </div>
                ) : null}

                {filteredCabinets.length > 0 ? (
                    <>
                        <div className="cabinets-table-container">
                            <table className="cabinets-table">
                                <thead>
                                    <tr>
                                        <th>{t("name")}</th>
                                        <th>{t("type")}</th>
                                        <th>{t("floor")}</th>
                                        <th>{t("status")}</th>
                                        <th>{t("branch")}</th>
                                        <th>{t("doctor")}</th>
                                        <th>{t("nurse")}</th>
                                        <th>{t("equipment")}</th>
                                        <th>{t("actions")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCabinets.map((cabinet) => (
                                        <tr key={cabinet.id}>
                                            <td>{cabinet.name}</td>
                                            <td>
                                                <div className="cabinet-type">
                                                    {getCabinetTypeIcon(cabinet.type)}
                                                    <span>{getCabinetTypeLabel(cabinet.type)}</span>
                                                </div>
                                            </td>
                                            <td>{cabinet.floor}</td>
                                            <td>
                                                <div className="cabinet-status">
                                                    {getStatusIcon(cabinet.status)}
                                                    <span className={`status-badge ${cabinet.status}`}>{getStatusLabel(cabinet.status)}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="cabinet-branch">
                                                    <FaBuilding className="branch-icon" />
                                                    {getBranchName(cabinet.branch)}
                                                </div>
                                            </td>
                                            <td>
                                                {cabinet.user_doctor && cabinet.user_doctor.length > 0 ? (
                                                    <div className="cabinet-staff">
                                                        {cabinet.user_doctor.map((doctor) => (
                                                            <div key={doctor.id} className="staff-item">
                                                                <FaUserMd className="staff-icon" />
                                                                {`${doctor.first_name} ${doctor.last_name}`}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="no-staff">{t("no_doctor_assigned")}</span>
                                                )}
                                            </td>
                                            <td>
                                                {cabinet.user_nurse && cabinet.user_nurse.length > 0 ? (
                                                    <div className="cabinet-staff">
                                                        {cabinet.user_nurse.map((nurse) => (
                                                            <div key={nurse.id} className="staff-item">
                                                                <FaUserNurse className="staff-icon" />
                                                                {`${nurse.first_name} ${nurse.last_name}`}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="no-staff">{t("no_nurse_assigned")}</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="cabinet-equipment">{cabinet.description || t("no_equipment")}</div>
                                            </td>
                                            <td>
                                                <div className="cabinet-actions">
                                                    <button
                                                        className="action-btn info"
                                                        onClick={() => openDetailsModal(cabinet)}
                                                        title={t("details")}
                                                    >
                                                        <FaInfoCircle />
                                                    </button>
                                                    <button className="action-btn edit" onClick={() => openEditModal(cabinet)} title={t("edit")}>
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => openDeleteConfirmation(cabinet)}
                                                        title={t("delete")}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="pagination-container">
                            <Pagination
                                pageCount={pageCount}
                                currentPage={currentPage - 1} // Convert to 0-based for component
                                onPageChange={handlePageChange}
                                itemsPerPage={itemsPerPage}
                                totalItems={totalItems}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />
                        </div>
                    </>
                ) : (
                    <div className="no-data">
                        <FaExclamationTriangle className="no-data-icon" />
                        <p>{t("no_cabinets_found")}</p>
                        {error && <p className="error-message">{error}</p>}
                    </div>
                )}
            </div>

            {/* Add Cabinet Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{t("add_cabinet")}</h2>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleAddCabinet} className="cabinet-form">
                            <div className="form-group">
                                <label htmlFor="name">{t("name")}</label>
                                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="branch">{t("branch")}</label>
                                <select id="branch" name="branch" value={formData.branch} onChange={handleInputChange} required>
                                    <option value="">{t("select_branch")}</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="type">{t("type")}</label>
                                    <select id="type" name="type" value={formData.type} onChange={handleInputChange} required>
                                        <option value="">{t("select_type")}</option>
                                        <option value="jarrohlik">{t("surgery")}</option>
                                        <option value="laboratoriya">{t("laboratoriya")}</option>
                                        <option value="tezyordam">{t("tezyordam")}</option>
                                        <option value="stomatalogiya">{t("stomatalogiya")}</option>
                                        <option value="qabulxona">{t("qabulxona")}</option>

                                        <option value="terapevtik_stomatologiya">Terapevtik stomatologiya</option>
                                        <option value="ortopedik_stomatologiya">Ortopedik stomatologiya</option>
                                        <option value="ortodontiya">Ortodontiya</option>
                                        <option value="xirurgik_stomatologiya">Xirurgik stomatologiya</option>
                                        <option value="pediatrik_stomatologiya">Pediatrik stomatologiya</option>
                                        <option value="estetik_stomatologiya">Estetik stomatologiya</option>
                                        <option value="parodontologiya">Parodontologiya</option>
                                        <option value="implantologiya">Implantologiya</option>
                                        <option value="radiologik_stomatologiya">Radiologik stomatologiya</option>
                                        <option value="profilaktik_stomatologiya">Profilaktik stomatologiya</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="floor">{t("floor")}</label>
                                    <select id="floor" name="floor" value={formData.floor} onChange={handleInputChange} required>
                                        {getFloorOptions(branches, formData.branch).map((fl) => (
                                            <option key={fl} value={fl}>{fl}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">{t("status")}</label>
                                <select id="status" name="status" value={formData.status} onChange={handleInputChange} required>
                                    <option value="available">{t("there_is")}</option>
                                    <option value="creating">{t("creating")}</option>
                                    <option value="repair">{t("repair")}</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="userDoctor">{t("doctor")}</label>
                                <select
                                    id="userDoctor"
                                    name="userDoctor"
                                    value={formData.userDoctor || ""}
                                    onChange={handleInputChange}
                                >
                                    <option value="">{t("select_doctor")}</option>
                                    {filterStaffByBranch(doctors, formData.branch).map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.first_name} {doctor.last_name}
                                            {doctor.has_cabinet ? ` (${t("already_assigned")})` : ""}
                                        </option>
                                    ))}
                                </select>
                                {showDoctorWarning && (
                                    <div className="warning">
                                        <FaInfoCircle /> {t("doctor_already_assigned_warning")}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="userNurses">{t("nurses")}</label>
                                <select id="userNurses" name="userNurses" value="" onChange={handleNurseSelection}>
                                    <option value="">{t("select_nurse")}</option>
                                    {filterStaffByBranch(nurses, formData.branch).map((nurse) => (
                                        <option key={nurse.id} value={nurse.id}>
                                            {nurse.first_name} {nurse.last_name}
                                            {nurse.has_cabinet ? ` (${t("already_assigned")})` : ""}
                                        </option>
                                    ))}
                                </select>
                                {showNurseWarning && (
                                    <div className="warning">
                                        <FaInfoCircle /> {t("nurse_already_assigned_warning")}
                                    </div>
                                )}

                                {formData.userNurses.length > 0 && (
                                    <div className="selected-items">
                                        <h4>{t("selected_nurses")}</h4>
                                        <ul>
                                            {formData.userNurses.map((nurseId) => (
                                                <li key={nurseId}>
                                                    {getNurseName(nurseId)}
                                                    <button type="button" className="remove-item" onClick={() => removeNurse(nurseId)}>
                                                        <FaTimes />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">{t("equipment")}</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder={t("enter_equipment_details")}
                                ></textarea>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                    {t("cancel")}
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                    {isLoading ? t("adding") : t("add")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Cabinet Modal */}
            {showEditModal && currentCabinet && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{t("edit_cabinet")}</h2>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateCabinet} className="cabinet-form">
                            <div className="form-group">
                                <label htmlFor="edit-name">{t("name")}</label>
                                <input
                                    type="text"
                                    id="edit-name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit-branch">{t("branch")}</label>
                                <select id="edit-branch" name="branch" value={formData.branch} onChange={handleInputChange} required>
                                    <option value="">{t("select_branch")}</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="edit-type">{t("type")}</label>
                                    <select id="edit-type" name="type" value={formData.type} onChange={handleInputChange} required>
                                        <option value="">{t("select_type")}</option>
                                        <option value="jarrohlik">{t("surgery")}</option>
                                        <option value="laboratoriya">{t("laboratoriya")}</option>
                                        <option value="tezyordam">{t("tezyordam")}</option>
                                        <option value="stomatalogiya">{t("stomatalogiya")}</option>
                                        <option value="qabulxona">{t("qabulxona")}</option>

                                        <option value="terapevtik_stomatologiya">Terapevtik stomatologiya</option>
                                        <option value="ortopedik_stomatologiya">Ortopedik stomatologiya</option>
                                        <option value="ortodontiya">Ortodontiya</option>
                                        <option value="xirurgik_stomatologiya">Xirurgik stomatologiya</option>
                                        <option value="pediatrik_stomatologiya">Pediatrik stomatologiya</option>
                                        <option value="estetik_stomatologiya">Estetik stomatologiya</option>
                                        <option value="parodontologiya">Parodontologiya</option>
                                        <option value="implantologiya">Implantologiya</option>
                                        <option value="radiologik_stomatologiya">Radiologik stomatologiya</option>
                                        <option value="profilaktik_stomatologiya">Profilaktik stomatologiya</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="edit-floor">{t("floor")}</label>
                                    <select id="edit-floor" name="floor" value={formData.floor} onChange={handleInputChange} required>
                                        {getFloorOptions(branches, formData.branch).map((fl) => (
                                            <option key={fl} value={fl}>{fl}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit-status">{t("status")}</label>
                                <select id="edit-status" name="status" value={formData.status} onChange={handleInputChange} required>
                                    <option value="available">{t("there_is")}</option>
                                    <option value="creating">{t("creating")}</option>
                                    <option value="repair">{t("repair")}</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit-userDoctor">{t("doctor")}</label>
                                <select
                                    id="edit-userDoctor"
                                    name="userDoctor"
                                    value={formData.userDoctor || ""}
                                    onChange={handleInputChange}
                                >
                                    <option value="">{t("select_doctor")}</option>
                                    {filterStaffByBranch(doctors, formData.branch).map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.first_name} {doctor.last_name}
                                            {doctor.has_cabinet && doctor.id !== Number(formData.userDoctor)
                                                ? ` (${t("already_assigned")})`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                                {showDoctorWarning && (
                                    <div className="warning">
                                        <FaInfoCircle /> {t("doctor_already_assigned_warning")}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit-userNurses">{t("nurses")}</label>
                                <select id="edit-userNurses" name="userNurses" value="" onChange={handleNurseSelection}>
                                    <option value="">{t("select_nurse")}</option>
                                    {filterStaffByBranch(nurses, formData.branch).map((nurse) => (
                                        <option key={nurse.id} value={nurse.id}>
                                            {nurse.first_name} {nurse.last_name}
                                            {nurse.has_cabinet && !formData.userNurses.includes(nurse.id)
                                                ? ` (${t("already_assigned")})`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                                {showNurseWarning && (
                                    <div className="warning">
                                        <FaInfoCircle /> {t("nurse_already_assigned_warning")}
                                    </div>
                                )}

                                {formData.userNurses.length > 0 && (
                                    <div className="selected-items">
                                        <h4>{t("selected_nurses")}</h4>
                                        <ul>
                                            {formData.userNurses.map((nurseId) => (
                                                <li key={nurseId}>
                                                    {getNurseName(nurseId)}
                                                    <button type="button" className="remove-item" onClick={() => removeNurse(nurseId)}>
                                                        <FaTimes />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit-description">{t("equipment")}</label>
                                <textarea
                                    id="edit-description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder={t("enter_equipment_details")}
                                ></textarea>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                    {t("cancel")}
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                    {isLoading ? t("saving") : t("save")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cabinet Details Modal */}
            {showDetailsModal && currentCabinet && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>
                                {t("cabinet")} {currentCabinet.name} {t("details")}
                            </h3>
                            <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="cabinet-details">
                                <div className="detail-row">
                                    <div className="detail-label">{t("name")}:</div>
                                    <div className="detail-value">{currentCabinet.name}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">{t("type")}:</div>
                                    <div className="detail-value">{getCabinetTypeLabel(currentCabinet.type)}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">{t("branch")}:</div>
                                    <div className="detail-value">{getBranchName(currentCabinet.branch)}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">{t("floor")}:</div>
                                    <div className="detail-value">{currentCabinet.floor}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">{t("status")}:</div>
                                    <div className="detail-value">
                                        <span className={`status-badge ${currentCabinet.status}`}>
                                            {getStatusLabel(currentCabinet.status)}
                                        </span>
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">{t("doctor")}:</div>
                                    <div className="detail-value">
                                        {currentCabinet.user_doctor && currentCabinet.user_doctor.length > 0
                                            ? currentCabinet.user_doctor
                                                .map((doctor) => `${doctor.first_name} ${doctor.last_name}`)
                                                .join(", ")
                                            : t("no_doctor_assigned")}
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">{t("nurses")}:</div>
                                    <div className="detail-value">
                                        {currentCabinet.user_nurse && currentCabinet.user_nurse.length > 0
                                            ? currentCabinet.user_nurse.map((nurse) => `${nurse.first_name} ${nurse.last_name}`).join(", ")
                                            : t("no_nurse_assigned")}
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">{t("equipment")}:</div>
                                    <div className="detail-value">{currentCabinet.description || t("no_equipment")}</div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setShowDetailsModal(false)}>
                                {t("close")}
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    setShowDetailsModal(false)
                                    openEditModal(currentCabinet)
                                }}
                            >
                                <FaEdit /> {t("edit")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            {showConfirmModal && (
                <ConfirmModal
                    isOpen={showConfirmModal}
                    title={t("confirm_delete")}
                    message={t("confirm_delete_cabinet_message", { name: cabinetToDelete?.name })}
                    confirmText={t("delete")}
                    cancelText={t("cancel")}
                    onConfirm={handleDeleteCabinet}
                    onCancel={() => setShowConfirmModal(false)}
                    isLoading={isLoading}
                    type="danger"
                />
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
