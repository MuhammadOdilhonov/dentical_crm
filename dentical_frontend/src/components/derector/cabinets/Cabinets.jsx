"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "../../../contexts/LanguageContext"
import { useAuth } from "../../../contexts/AuthContext"
import {
    FaPlus,
    FaSearch,
    FaTimes,
    FaDoorOpen,
    FaEdit,
    FaTrash,
    FaFilter,
    FaUserMd,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTools,
    FaBuilding,
    FaInfoCircle,
    FaChartBar,
    FaFlask,
    FaAmbulance,
    FaTooth,
    FaHospital,
} from "react-icons/fa"
import { getCabinets, createCabinet, updateCabinet, deleteCabinet } from "../../../api/apiCabinets"
import { getCabinetStatistics } from "../../../api/apiCabinetsStatistic"
import Pagination from "../../pagination/Pagination"
import ConfirmModal from "../../modal/ConfirmModal"
import SuccessModal from "../../modal/SuccessModal"
import apiUsers from "../../../api/apiUsers"
import apiBranches from "../../../api/apiBranches"

export default function Cabinets() {
    const { t } = useLanguage()
    const navigate = useNavigate()

    // Tanlangan filialning qavatlar soniga qarab qavat variantlarini qaytaradi
    const getFloorOptions = (branchesList, branchId) => {
        const selected = (branchesList || []).find((b) => String(b.id) === String(branchId))
        const floorsCount = selected?.floors && selected.floors > 0 ? selected.floors : 4
        return Array.from({ length: floorsCount }, (_, i) => String(i + 1))
    }

    // Xodimlarni kabinet filiali bo'yicha filtrlash (boshqa filial xodimi biriktirilmasin)
    const filterStaffByBranch = (staffList, branchId) => {
        if (!branchId) return staffList || []
        return (staffList || []).filter((s) => String(s.branch) === String(branchId))
    }
    const { user, selectedBranch } = useAuth()

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
    const [showStatsModal, setShowStatsModal] = useState(false)
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
    const [newCabinet, setNewCabinet] = useState({
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
            // Fetch doctors (position = doctor)
            const doctorsFilters = { role: "doctor" }
            const doctorsData = await apiUsers.fetchUsers(1, 100, doctorsFilters)
            setDoctors(doctorsData.results || [])

            // Fetch nurses (position = nurse)
            const nursesFilters = { role: "nurse" }
            const nursesData = await apiUsers.fetchUsers(1, 100, nursesFilters)
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

    // Handle input change for new cabinet
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setNewCabinet({
            ...newCabinet,
            [name]: value,
        })

        // Check if doctor is already assigned to another cabinet
        if (name === "userDoctor" && value) {
            const doctorId = Number.parseInt(value)
            const isAssigned = doctors.some((doctor) => doctor.id === doctorId && doctor.has_cabinet)
            setShowDoctorWarning(isAssigned)
        }
    }

    // Handle nurse selection
    const handleNurseSelection = (e) => {
        const nurseId = Number.parseInt(e.target.value)

        if (nurseId) {
            // Check if nurse is already in the list
            if (newCabinet.userNurses.includes(nurseId)) {
                return
            }

            // Check if nurse is already assigned to another cabinet
            const isAssigned = nurses.some((nurse) => nurse.id === nurseId && nurse.has_cabinet)
            setShowNurseWarning(isAssigned)

            // Add nurse to the list
            setNewCabinet({
                ...newCabinet,
                userNurses: [...newCabinet.userNurses, nurseId],
            })
        }
    }

    // Remove nurse from selection
    const removeNurse = (nurseId) => {
        setNewCabinet({
            ...newCabinet,
            userNurses: newCabinet.userNurses.filter((id) => id !== nurseId),
        })
    }

    // Handle edit input change
    const handleEditInputChange = (e) => {
        const { name, value } = e.target
        setCurrentCabinet({
            ...currentCabinet,
            [name]: value,
        })

        // Check if doctor is already assigned to another cabinet
        if (name === "userDoctor" && value) {
            const doctorId = Number.parseInt(value)
            const currentDoctorId =
                currentCabinet.useruser_doctor && currentCabinet.useruser_doctor.length > 0
                    ? currentCabinet.useruser_doctor[0]
                    : null

            const isAssigned = doctors.some(
                (doctor) => doctor.id === doctorId && doctor.has_cabinet && doctorId !== currentDoctorId,
            )
            setShowDoctorWarning(isAssigned)
        }
    }

    // Handle edit nurse selection
    const handleEditNurseSelection = (e) => {
        const nurseId = Number.parseInt(e.target.value)

        if (nurseId) {
            // Check if nurse is already in the list
            const currentNurseIds = (currentCabinet.selectedNurses || []).map((nurse) => nurse.id)

            if (currentNurseIds.includes(nurseId)) {
                return
            }

            // Find the nurse object
            const selectedNurse = nurses.find((nurse) => nurse.id === nurseId)
            if (!selectedNurse) return

            // Check if nurse is already assigned to another cabinet
            const isAssigned = nurses.some(
                (nurse) => nurse.id === nurseId && nurse.has_cabinet && !currentNurseIds.includes(nurseId),
            )
            setShowNurseWarning(isAssigned)

            // Add nurse to the list
            setCurrentCabinet({
                ...currentCabinet,
                selectedNurses: [...(currentCabinet.selectedNurses || []), selectedNurse],
            })
        }
    }

    // Remove nurse from edit selection
    const removeEditNurse = (nurseId) => {
        setCurrentCabinet({
            ...currentCabinet,
            selectedNurses: (currentCabinet.selectedNurses || []).filter((nurse) => nurse.id !== nurseId),
        })
    }

    // Open add modal
    const openAddModal = () => {
        // Reset form and fetch fresh data
        setNewCabinet({
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
            if (newCabinet.userDoctor) {
                const selectedDoctor = doctors.find((d) => d.id === Number.parseInt(newCabinet.userDoctor))
                if (selectedDoctor) {
                    doctorName = `${selectedDoctor.first_name} ${selectedDoctor.last_name}`
                }
            }

            // Prepare data for API
            const cabinetData = {
                ...newCabinet,
                branch: Number.parseInt(newCabinet.branch),
                user_doctor: newCabinet.userDoctor ? [Number.parseInt(newCabinet.userDoctor)] : [],
                user_nurse: newCabinet.userNurses.map((id) => Number.parseInt(id)),
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
            setNewCabinet({
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
    const openEditModal = (cabinet) => {
        // Make sure we have the latest staff data
        fetchStaffData()

        setCurrentCabinet({
            ...cabinet,
            // Extract doctor ID if available
            userDoctor: cabinet.user_doctor && cabinet.user_doctor.length > 0 ? cabinet.user_doctor[0].id : "",
            // Keep the original user_nurse array for display
            selectedNurses: cabinet.user_nurse || [],
        })
        setShowEditModal(true)
    }

    // Handle update cabinet
    const handleUpdateCabinet = async (e) => {
        e.preventDefault()
        try {
            setIsLoading(true)

            // Get selected doctor name for alert
            let doctorName = ""
            if (currentCabinet.userDoctor) {
                const selectedDoctor = doctors.find((d) => d.id === Number.parseInt(currentCabinet.userDoctor))
                if (selectedDoctor) {
                    doctorName = `${selectedDoctor.first_name} ${selectedDoctor.last_name}`
                }
            }

            // Prepare data for API
            const cabinetData = {
                id: currentCabinet.id,
                name: currentCabinet.name,
                type: currentCabinet.type,
                floor: currentCabinet.floor,
                status: currentCabinet.status,
                description: currentCabinet.description,
                branch: Number.parseInt(currentCabinet.branch),
                user_doctor: currentCabinet.userDoctor ? [Number.parseInt(currentCabinet.userDoctor)] : [],
                user_nurse: (currentCabinet.selectedNurses || []).map((nurse) => nurse.id),
            }
            console.log("Updating cabinet with data:", cabinetData)

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

    // Get doctor name by ID
    const getDoctorName = (doctorId) => {
        const doctor = doctors.find((d) => d.id === doctorId)
        return doctor ? `${doctor.first_name} ${doctor.last_name}` : t("unknown_doctor")
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
            <div className="cab-loading-container">
                <div className="cab-loading-spinner"></div>
                <p>{t("loading")}...</p>
            </div>
        )
    }

    // Error state
    if (error && !cabinetsData.length) {
        return (
            <div className="cab-error-container">
                <FaExclamationTriangle className="cab-error-icon" />
                <h2>{t("error_occurred")}</h2>
                <p>{error}</p>
                <button
                    className="cab-btn cab-btn-primary"
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
        <div className="cab-page">
            <div className="cab-page-header">
                <h1 className="cab-page-title">
                    <FaDoorOpen className="cab-title-icon" /> {t("cabinets")}
                </h1>
                <div className="cab-page-actions">
                    <button className="cab-action-button close-stats" onClick={() => setShowStatsModal(!showStatsModal)}>
                        {showStatsModal ? (
                            <FaTimes />
                        ) : (
                            <>
                                <FaChartBar /> {t("show_stats")}
                            </>
                        )}
                    </button>
                    <button className="cab-action-button add-cabinet" onClick={openAddModal}>
                        <FaPlus /> {t("add_new_cabinet")}
                    </button>
                </div>
            </div>

            {showStatsModal && (
                <div className="cab-stats-container">
                    {isLoadingStats ? (
                        <div className="cab-stats-loading">
                            <div className="cab-loading-spinner"></div>
                            <p>{t("loading_statistics")}...</p>
                        </div>
                    ) : (
                        <>
                            <div className="cab-stats-grid">
                                <div className="cab-stat-card total-card">
                                    <div className="cab-stat-icon total">
                                        <FaDoorOpen />
                                    </div>
                                    <div className="cab-stat-content">
                                        <h3 className="cab-stat-value">{statistics.total_cabinets}</h3>
                                        <p className="cab-stat-label">{t("total_cabinets")}</p>
                                    </div>
                                </div>

                                <div className="cab-stat-card available-card">
                                    <div className="cab-stat-icon available">
                                        <FaCheckCircle />
                                    </div>
                                    <div className="cab-stat-content">
                                        <h3 className="cab-stat-value">{statistics.available_cabinets}</h3>
                                        <p className="cab-stat-label">{t("available_cabinets")}</p>
                                    </div>
                                </div>

                                <div className="cab-stat-card occupied-card">
                                    <div className="cab-stat-icon occupied">
                                        <FaUserMd />
                                    </div>
                                    <div className="cab-stat-content">
                                        <h3 className="cab-stat-value">{statistics.occupied_cabinets}</h3>
                                        <p className="cab-stat-label">{t("create_cabinet")}</p>
                                    </div>
                                </div>

                                <div className="cab-stat-card repair-card">
                                    <div className="cab-stat-icon repair">
                                        <FaTools />
                                    </div>
                                    <div className="cab-stat-content">
                                        <h3 className="cab-stat-value">{statistics.repair_cabinets}</h3>
                                        <p className="cab-stat-label">{t("repair_cabinets")}</p>
                                    </div>
                                </div>
                            </div>

                            {statistics.type_distribution && statistics.type_distribution.length > 0 && (
                                <div className="cab-type-distribution">
                                    <h3 className="cab-section-title">
                                        <FaChartBar className="cab-section-icon" /> {t("type_distribution")}
                                    </h3>
                                    <div className="cab-type-bars">
                                        {statistics.type_distribution.map((type, index) => (
                                            <div className="cab-type-bar-container" key={index}>
                                                <div className="cab-type-bar-header">
                                                    <div className="cab-type-name-container">
                                                        {getCabinetTypeIcon(type.type)}
                                                        <span className="cab-type-name">{getCabinetTypeLabel(type.type)}</span>
                                                    </div>
                                                    <span className="cab-type-count">{type.count}</span>
                                                </div>
                                                <div className="cab-type-bar-wrapper">
                                                    <div
                                                        className={`cab-type-bar cab-type-${type.type}`}
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

            <div className="cab-content">
                <div className="cab-search-container">
                    <div className="cab-search-input-wrapper">
                        <FaSearch className="cab-search-icon" />
                        <input
                            type="text"
                            className="cab-search-input"
                            placeholder={t("search_cabinets")}
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <button className={`cab-filter-toggle ${showFilters ? "active" : ""}`} onClick={toggleFilters}>
                        <FaFilter /> {t("filters")}
                    </button>
                </div>

                {showFilters && (
                    <div className="cab-filters">
                        {(!selectedBranch || selectedBranch === "all") && (
                            <div className="cab-filter-group">
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
                        <div className="cab-filter-group">
                            <label>{t("type")}:</label>
                            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                <option value="all">{t("all")}</option>
                                <option value="qabulxona">{t("qabulxona")}</option>
                                <option value="jarrohlik">{t("surgery")}</option>
                                <option value="laboratoriya">{t("laboratoriya")}</option>
                                <option value="tezyordam">{t("tezyordam")}</option>
                                <option value="stomatalogiya">{t("stomatalogiya")}</option>
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
                        <div className="cab-filter-group">
                            <label>{t("floor")}:</label>
                            <select value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)}>
                                <option value="all">{t("all")}</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>
                        <div className="cab-filter-group">
                            <label>{t("status")}:</label>
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="all">{t("all")}</option>
                                <option value="available">{t("there_is")}</option>
                                <option value="creating">{t("creating")}</option>
                                <option value="repair">{t("repair")}</option>
                            </select>
                        </div>
                        <div className="cab-filter-actions">
                            <button className="cab-btn cab-btn-outline" onClick={resetFilters}>
                                {t("reset")}
                            </button>
                            <button className="cab-btn cab-btn-primary" onClick={applyFilters}>
                                {t("apply")}
                            </button>
                        </div>
                    </div>
                )}

                <div className="cab-table-container">
                    {isLoading && cabinetsData.length > 0 ? (
                        <div className="cab-loading-overlay">
                            <div className="cab-loading-spinner"></div>
                        </div>
                    ) : null}

                    {filteredCabinets.length > 0 ? (
                        <>
                            <table className="cab-table">
                                <thead>
                                    <tr>
                                        <th>{t("name")}</th>
                                        <th>{t("type")}</th>
                                        <th>{t("floor")}</th>
                                        <th>{t("status")}</th>
                                        <th>{t("branch")}</th>
                                        <th>{t("doctor")}</th>
                                        <th>{t("equipment")}</th>
                                        <th>{t("actions")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCabinets.map((cabinet) => (
                                        <tr key={cabinet.id}>
                                            <td>{cabinet.name}</td>
                                            <td>
                                                <div className="cab-type">
                                                    {getCabinetTypeIcon(cabinet.type)}
                                                    <span>{getCabinetTypeLabel(cabinet.type)}</span>
                                                </div>
                                            </td>
                                            <td>{cabinet.floor}</td>
                                            <td>
                                                <div className="cab-status">
                                                    {getStatusIcon(cabinet.status)}
                                                    <span className={`cab-status-badge ${cabinet.status}`}>{getStatusLabel(cabinet.status)}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="cab-branch">
                                                    <FaBuilding className="cab-branch-icon" />
                                                    {getBranchName(cabinet.branch)}
                                                </div>
                                            </td>
                                            <td>
                                                {cabinet.user_doctor && cabinet.user_doctor.length > 0 ? (
                                                    <div className="cab-staff">
                                                        {cabinet.user_doctor.map((doctor) => (
                                                            <div key={doctor.id} className="cab-staff-item">
                                                                <FaUserMd className="cab-staff-icon" />
                                                                {`${doctor.first_name} ${doctor.last_name}`}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="cab-no-staff">{t("no_doctor_assigned")}</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="cab-equipment">{cabinet.description || t("no_equipment")}</div>
                                            </td>
                                            <td>
                                                <div className="cab-actions">
                                                    <button
                                                        className="cab-action-btn edit"
                                                        onClick={() => openEditModal(cabinet)}
                                                        title={t("edit")}
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="cab-action-btn delete"
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
                        </>
                    ) : (
                        <div className="cab-no-data">
                            <FaExclamationTriangle className="cab-no-data-icon" />
                            <p>{t("no_cabinets_found")}</p>
                            {error && <p className="cab-error-message">{error}</p>}
                        </div>
                    )}
                </div>
            </div>
            <div className="cab-pagination-container">
                <Pagination
                    pageCount={pageCount}
                    currentPage={currentPage - 1} // Convert to 0-based for component
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />
            </div>

            {/* Add Cabinet Modal */}
            {showAddModal && (
                <div className="cab-modal-backdrop">
                    <div className="cab-modal">
                        <div className="cab-modal-header">
                            <h2>{t("add_cabinet")}</h2>
                            <button className="cab-modal-close" onClick={() => setShowAddModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleAddCabinet} className="cab-form">
                            {/* Avval filial tanlanadi — filial bo'lmasa yaratish tugmasi */}
                            <div className="cab-form-group">
                                <label htmlFor="branch">{t("branch")}</label>
                                {branches.length === 0 ? (
                                    <div className="cab-warning">
                                        <FaInfoCircle /> {t("no_branches_yet")}{" "}
                                        <button
                                            type="button"
                                            className="cab-form-submit"
                                            style={{ marginLeft: 8, padding: "6px 12px" }}
                                            onClick={() => navigate("/dashboard/director/settings?tab=branches")}
                                        >
                                            <FaPlus /> {t("create_branch_first")}
                                        </button>
                                    </div>
                                ) : (
                                    <select id="branch" name="branch" value={newCabinet.branch} onChange={handleInputChange} required>
                                        <option value="">{t("select_branch")}</option>
                                        {branches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="cab-form-group">
                                <label htmlFor="name">{t("name")}</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newCabinet.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="cab-form-row">
                                <div className="cab-form-group">
                                    <label htmlFor="type">{t("type")}</label>
                                    <select id="type" name="type" value={newCabinet.type} onChange={handleInputChange} required>
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

                                <div className="cab-form-group">
                                    <label htmlFor="floor">{t("floor")}</label>
                                    <select id="floor" name="floor" value={newCabinet.floor} onChange={handleInputChange} required>
                                        {getFloorOptions(branches, newCabinet.branch).map((fl) => (
                                            <option key={fl} value={fl}>{fl}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="cab-form-group">
                                <label htmlFor="status">{t("status")}</label>
                                <select id="status" name="status" value={newCabinet.status} onChange={handleInputChange} required>
                                    <option value="available">{t("there_is")}</option>
                                    <option value="creating">{t("creating")}</option>
                                    <option value="repair">{t("repair")}</option>
                                </select>
                            </div>

                            <div className="cab-form-group">
                                <label htmlFor="userDoctor">{t("doctor")}</label>
                                <select
                                    id="userDoctor"
                                    name="userDoctor"
                                    value={newCabinet.userDoctor || ""}
                                    onChange={handleInputChange}
                                >
                                    <option value="">{t("select_doctor")}</option>
                                    {filterStaffByBranch(doctors, newCabinet.branch).map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.first_name} {doctor.last_name}
                                        </option>
                                    ))}
                                </select>
                                {showDoctorWarning && (
                                    <div className="cab-warning">
                                        <FaInfoCircle /> {t("doctor_already_assigned_warning")}
                                    </div>
                                )}
                            </div>

                            <div className="cab-form-group">
                                <label htmlFor="description">{t("equipment")}</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={newCabinet.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder={t("enter_equipment_details")}
                                ></textarea>
                            </div>

                            <div className="cab-form-actions">
                                <button type="button" className="cab-form-cancel" onClick={() => setShowAddModal(false)}>
                                    {t("cancel")}
                                </button>
                                <button type="submit" className="cab-form-submit" disabled={isLoading}>
                                    {isLoading ? t("adding") : t("add")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Cabinet Modal */}
            {showEditModal && currentCabinet && (
                <div className="cab-modal-backdrop">
                    <div className="cab-modal">
                        <div className="cab-modal-header">
                            <h2>{t("edit_cabinet")}</h2>
                            <button className="cab-modal-close" onClick={() => setShowEditModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateCabinet} className="cab-form">
                            <div className="cab-form-group">
                                <label htmlFor="edit-name">{t("name")}</label>
                                <input
                                    type="text"
                                    id="edit-name"
                                    name="name"
                                    value={currentCabinet.name}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>

                            <div className="cab-form-group">
                                <label htmlFor="edit-branch">{t("branch")}</label>
                                <select
                                    id="edit-branch"
                                    name="branch"
                                    value={currentCabinet.branch}
                                    onChange={handleEditInputChange}
                                    required
                                >
                                    <option value="">{t("select_branch")}</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="cab-form-row">
                                <div className="cab-form-group">
                                    <label htmlFor="edit-type">{t("type")}</label>
                                    <select
                                        id="edit-type"
                                        name="type"
                                        value={currentCabinet.type}
                                        onChange={handleEditInputChange}
                                        required
                                    >
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

                                <div className="cab-form-group">
                                    <label htmlFor="edit-floor">{t("floor")}</label>
                                    <select
                                        id="edit-floor"
                                        name="floor"
                                        value={currentCabinet.floor}
                                        onChange={handleEditInputChange}
                                        required
                                    >
                                        {getFloorOptions(branches, currentCabinet.branch).map((fl) => (
                                            <option key={fl} value={fl}>{fl}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="cab-form-group">
                                <label htmlFor="edit-status">{t("status")}</label>
                                <select
                                    id="edit-status"
                                    name="status"
                                    value={currentCabinet.status}
                                    onChange={handleEditInputChange}
                                    required
                                >
                                    <option value="available">{t("there_is")}</option>
                                    <option value="creating">{t("creating")}</option>
                                    <option value="repair">{t("repair")}</option>
                                </select>
                            </div>

                            <div className="cab-form-group">
                                <label htmlFor="edit-userDoctor">{t("doctor")}</label>
                                <select
                                    id="edit-userDoctor"
                                    name="userDoctor"
                                    value={currentCabinet.userDoctor || ""}
                                    onChange={handleEditInputChange}
                                >
                                    <option value="">{t("select_doctor")}</option>
                                    {filterStaffByBranch(doctors, currentCabinet.branch).map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.first_name} {doctor.last_name}
                                        </option>
                                    ))}
                                </select>
                                {showDoctorWarning && (
                                    <div className="cab-warning">
                                        <FaInfoCircle /> {t("doctor_already_assigned_warning")}
                                    </div>
                                )}
                            </div>

                            <div className="cab-form-group">
                                <label htmlFor="edit-description">{t("equipment")}</label>
                                <textarea
                                    id="edit-description"
                                    name="description"
                                    value={currentCabinet.description}
                                    onChange={handleEditInputChange}
                                    rows={3}
                                    placeholder={t("enter_equipment_details")}
                                ></textarea>
                            </div>

                            <div className="cab-form-actions">
                                <button type="button" className="cab-form-cancel" onClick={() => setShowEditModal(false)}>
                                    {t("cancel")}
                                </button>
                                <button type="submit" className="cab-form-submit" disabled={isLoading}>
                                    {isLoading ? t("saving") : t("save")}
                                </button>
                            </div>
                        </form>
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
