"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../../contexts/AuthContext"
import { useLanguage } from "../../../contexts/LanguageContext"
import { useNavigate } from "react-router-dom"
import {
    FaSearch,
    FaFilter,
    FaPlus,
    FaEdit,
    FaTrash,
    FaExclamationTriangle,
    FaFileExport,
    FaFileImport,
    FaUserInjured,
    FaMoneyBillWave,
} from "react-icons/fa"
import apiPatients from "../../../api/apiPatients"
import apiBranches from "../../../api/apiBranches"
import apiCustomerDebts from "../../../api/apiCustomerDebts"
import Pagination from "../../pagination/Pagination"
import ConfirmModal from "../../modal/ConfirmModal"
import SuccessModal from "../../modal/SuccessModal"

export default function APatients() {
    const { selectedBranch } = useAuth()
    const { t } = useLanguage()
    const navigate = useNavigate()

    // State management
    const [patients, setPatients] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [filterGender, setFilterGender] = useState("all")
    const [filterAge, setFilterAge] = useState("all")
    const [filterStatus, setFilterStatus] = useState("all")
    const [filterBranch, setFilterBranch] = useState(selectedBranch)
    const [showFilters, setShowFilters] = useState(false)
    const [sortBy, setSortBy] = useState("name")
    const [sortOrder, setSortOrder] = useState("asc")
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [branches, setBranches] = useState([])
    const [branchesLoading, setBranchesLoading] = useState(true)

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    // Modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [confirmModalProps, setConfirmModalProps] = useState({
        title: "",
        message: "",
        confirmText: "",
        cancelText: "",
        type: "warning",
        onConfirm: () => { },
    })
    const [successModalProps, setSuccessModalProps] = useState({
        title: "",
        message: "",
    })

    // New patient state
    const [newPatient, setNewPatient] = useState({
        full_name: "",
        age: 18,
        gender: "male",
        phone_number: "",
        passport_id: "",
        location: "",
        status: "faol",
        branch: selectedBranch === "all" ? 1 : Number.parseInt(selectedBranch),
    })

    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [selectedPatientForPayment, setSelectedPatientForPayment] = useState(null)
    const [paymentData, setPaymentData] = useState({
        debtSummary: null,
        debtStats: null,
        loading: false,
        error: null,
    })

    // Fetch branches from API
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                setBranchesLoading(true)
                const branchesData = await apiBranches.fetchBranches()
                setBranches(branchesData)
                setBranchesLoading(false)
            } catch (err) {
                console.error("Error fetching branches:", err)
                setBranchesLoading(false)
            }
        }

        fetchBranches()
    }, [])

    // Update branch in new patient form when selected branch changes
    useEffect(() => {
        setNewPatient({
            ...newPatient,
            branch: selectedBranch === "all" ? 1 : Number.parseInt(selectedBranch),
        })

        setFilterBranch(selectedBranch)
    }, [selectedBranch, setNewPatient, setFilterBranch])

    // Fetch patients data from API
    const fetchPatients = async () => {
        try {
            setLoading(true)
            setError(null)

            // Convert currentPage from 0-based to 1-based for API
            const apiPage = currentPage + 1

            // Get branch ID for filtering
            const branchId = filterBranch === "all" ? null : filterBranch

            // Call API with correct branch ID
            const response = await apiPatients.fetchPatients(apiPage, itemsPerPage, searchTerm, branchId)

            // Transform API data to match component structure
            const transformedPatients = response.results.map((patient) => ({
                id: patient.id,
                name: patient.full_name,
                age: patient.age,
                gender: patient.gender,
                phone: patient.phone_number,
                passport_id: patient.passport_id || "",
                address: patient.location || "",
                lastVisit: patient.updated_at ? new Date(patient.updated_at).toISOString().split("T")[0] : "",
                registrationDate: patient.created_at ? new Date(patient.created_at).toISOString().split("T")[0] : "",
                diagnosis: patient.diagnosis || "",
                doctor: patient.doctor || "",
                branch: patient.branch,
                status: patient.status || "faol",
            }))

            setPatients(transformedPatients)
            setTotalItems(response.count)
            setTotalPages(Math.ceil(response.count / itemsPerPage))
            setLoading(false)
        } catch (err) {
            console.error("Error fetching patients:", err)
            setError(err.message || "An error occurred while fetching patients")
            setLoading(false)
        }
    }

    // Fetch patients when dependencies change
    useEffect(() => {
        fetchPatients()
    }, [currentPage, itemsPerPage, filterBranch])

    // 3. selectedBranch o'zgarganda filterBranch ni yangilash va fetchPatients() ni chaqirish:
    useEffect(() => {
        setFilterBranch(selectedBranch)
        fetchPatients()
    }, [selectedBranch, setFilterBranch])

    // Qidiruv — yozish to'xtagach avtomatik yuklanadi (debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(0)
            fetchPatients()
        }, 450)
        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm])

    // Handle search input
    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
    }

    // Handle filter changes
    const handleFilterGender = (e) => {
        setFilterGender(e.target.value)
    }

    const handleFilterAge = (e) => {
        setFilterAge(e.target.value)
    }

    const handleFilterStatus = (e) => {
        setFilterStatus(e.target.value)
    }

    const handleFilterBranch = (e) => {
        setFilterBranch(e.target.value)
    }

    // Toggle filters
    const toggleFilters = () => {
        setShowFilters(!showFilters)
    }

    // Handle sort changes
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortBy(field)
            setSortOrder("asc")
        }
    }

    // Apply filters to patients
    const applyFilters = () => {
        setCurrentPage(0) // Reset to first page when applying filters
        fetchPatients()
    }

    // Filtrlarni tozalash
    const resetFilters = () => {
        setFilterGender("all")
        setFilterAge("all")
        setFilterStatus("all")
        setFilterBranch(selectedBranch)
        setSearchTerm("")
        setCurrentPage(0)
    }

    // Jins / yosh / status filtrlari va saralash (joriy sahifadagi ro'yxatga qo'llanadi)
    const matchesAgeRange = (age, range) => {
        if (range === "all") return true
        if (range === "51+") return age >= 51
        const [min, max] = range.split("-").map(Number)
        return age >= min && age <= max
    }

    const displayedPatients = patients
        .filter((p) => {
            const genderOk = filterGender === "all" || p.gender === filterGender
            const ageOk = matchesAgeRange(Number(p.age) || 0, filterAge)
            const statusOk = filterStatus === "all" || p.status === filterStatus
            return genderOk && ageOk && statusOk
        })
        .sort((a, b) => {
            let result = 0
            if (sortBy === "age") {
                result = (Number(a.age) || 0) - (Number(b.age) || 0)
            } else if (sortBy === "lastVisit") {
                result = new Date(a.lastVisit || 0) - new Date(b.lastVisit || 0)
            } else {
                result = (a.name || "").localeCompare(b.name || "")
            }
            return sortOrder === "asc" ? result : -result
        })

    // Open add patient modal
    const openAddModal = () => {
        setNewPatient({
            full_name: "",
            age: 18,
            gender: "male",
            phone_number: "",
            passport_id: "",
            location: "",
            status: "faol",
            branch: selectedBranch === "all" ? 1 : Number.parseInt(selectedBranch),
        })
        setShowAddModal(true)
    }

    // Open edit patient modal
    const openEditModal = (patient) => {
        // Transform patient data to match API format
        const apiPatient = {
            id: patient.id,
            full_name: patient.name,
            age: patient.age,
            gender: patient.gender,
            phone_number: patient.phone,
            passport_id: patient.passport_id,
            location: patient.address,
            status: patient.status,
            branch: patient.branch,
        }

        setSelectedPatient(apiPatient)
        setShowEditModal(true)
    }

    // Handle new patient form input changes
    const handleNewPatientChange = (e) => {
        const { name, value } = e.target
        setNewPatient({
            ...newPatient,
            [name]: name === "age" || name === "branch" ? (value === "" ? "" : Number.parseInt(value)) : value,
        })
    }

    // Handle selected patient form input changes
    const handleSelectedPatientChange = (e) => {
        const { name, value } = e.target
        setSelectedPatient({
            ...selectedPatient,
            [name]: name === "age" || name === "branch" ? Number.parseInt(value) : value,
        })
    }

    // Handle add patient form submission
    const handleAddPatient = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)

            // Create patient using API
            await apiPatients.createPatient(newPatient)

            // Close the modal
            setShowAddModal(false)
            setLoading(false)

            // Show success modal
            setSuccessModalProps({
                title: t("success"),
                message: t("patient_added_successfully"),
            })
            setShowSuccessModal(true)

            // Refresh the patient list
            fetchPatients()
        } catch (err) {
            console.error("Error adding patient:", err)
            setError(err.message || "An error occurred while adding the patient")
            setLoading(false)
        }
    }

    const handleViewPatientDetails = (patientId) => {
        navigate(`/dashboard/admin/patients/${patientId}`)
    }

    // Handle edit patient form submission
    const handleEditPatient = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)

            // Extract ID and remove it from the data to send
            const { id, ...patientData } = selectedPatient

            // Update patient using API
            await apiPatients.updatePatient(id, patientData)

            // Close the modal
            setShowEditModal(false)
            setLoading(false)

            // Show success modal
            setSuccessModalProps({
                title: t("success"),
                message: t("patient_updated_successfully"),
            })
            setShowSuccessModal(true)

            // Refresh the patient list
            fetchPatients()
        } catch (err) {
            console.error("Error updating patient:", err)
            setError(err.message || "An error occurred while updating the patient")
            setLoading(false)
        }
    }

    // Confirm delete patient
    const confirmDeletePatient = (id, name) => {
        setConfirmModalProps({
            title: t("confirm_delete"),
            message: t("confirm_delete_patient_message", { name }),
            confirmText: t("delete"),
            cancelText: t("cancel"),
            type: "danger",
            onConfirm: () => deletePatient(id),
        })
        setShowConfirmModal(true)
    }

    // Delete patient
    const deletePatient = async (id) => {
        try {
            setLoading(true)
            setShowConfirmModal(false)

            // Delete patient using API
            await apiPatients.deletePatient(id)

            // Show success modal
            setSuccessModalProps({
                title: t("success"),
                message: t("patient_deleted_successfully"),
            })
            setShowSuccessModal(true)

            // Refresh the patient list
            fetchPatients()
            setLoading(false)
        } catch (err) {
            console.error("Error deleting patient:", err)
            setError(err.message || "An error occurred while deleting the patient")
            setLoading(false)
        }
    }

    // Handle pagination page change
    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    // Handle items per page change
    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage)
        setCurrentPage(0) // Reset to first page when changing items per page
    }

    // Export to PDF
    const exportToPDF = async () => {
        try {
            setLoading(true)
            // Call the API function to get PDF data
            const pdfBlob = await apiPatients.exportToPDF()

            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([pdfBlob]))

            // Create a temporary link element
            const link = document.createElement("a")
            link.href = url

            // Set the filename for download
            const currentDate = new Date().toISOString().split("T")[0]
            link.setAttribute("download", `patients_${currentDate}.pdf`)

            // Append to body, click to download, then remove
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // Clean up the URL object
            window.URL.revokeObjectURL(url)

            setLoading(false)
        } catch (err) {
            console.error("Error exporting to PDF:", err)
            setError(err.message || "An error occurred while exporting to PDF")
            setLoading(false)

            // Show error in a user-friendly way
            alert(t("error_exporting_pdf"))
        }
    }

    // Export to Excel
    const exportToExcel = async () => {
        try {
            setLoading(true)

            // Call the API function to get Excel data
            const excelBlob = await apiPatients.exportToExcel()

            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([excelBlob]))

            // Create a temporary link element
            const link = document.createElement("a")
            link.href = url

            // Set the filename for download
            const currentDate = new Date().toISOString().split("T")[0]
            link.setAttribute("download", `patients_${currentDate}.xlsx`)

            // Append to body, click to download, then remove
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // Clean up the URL object
            window.URL.revokeObjectURL(url)

            setLoading(false)
        } catch (err) {
            console.error("Error exporting to Excel:", err)
            setError(err.message || "An error occurred while exporting to Excel")
            setLoading(false)

            // Show error in a user-friendly way
            alert(t("error_exporting_excel"))
        }
    }

    const openPaymentModal = async (patient) => {
        setSelectedPatientForPayment(patient)
        setPaymentData({ ...paymentData, loading: true })
        setShowPaymentModal(true)

        try {
            // Fetch debt summary and stats
            const [debtSummary, debtStats] = await Promise.all([
                apiCustomerDebts.fetchCustomerDebtSummary(patient.id),
                apiCustomerDebts.fetchCustomerDebtStats(patient.id),
            ])

            setPaymentData({
                debtSummary,
                debtStats,
                loading: false,
                error: null,
            })
        } catch (error) {
            console.error("Error fetching payment data:", error)
            setPaymentData({
                debtSummary: null,
                debtStats: null,
                loading: false,
                error: error.message || "Failed to load payment data",
            })
        }
    }

    const closePaymentModal = () => {
        setShowPaymentModal(false)
        setSelectedPatientForPayment(null)
        setPaymentData({
            debtSummary: null,
            debtStats: null,
            loading: false,
            error: null,
        })
    }

    // Get branch name by ID
    const getBranchName = (branchId) => {
        const branch = branches.find((b) => b.id === branchId)
        return branch ? branch.name : t("unknown_branch")
    }

    // Loading state
    if (loading && patients.length === 0) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>{t("loading")}...</p>
            </div>
        )
    }

    // Error state
    if (error && patients.length === 0) {
        return (
            <div className="error-container">
                <FaExclamationTriangle className="error-icon" />
                <h2>{t("error_occurred")}</h2>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={fetchPatients}>
                    {t("try_again")}
                </button>
            </div>
        )
    }

    return (
        <div className="admin-patients">
            <div className="page-header">
                <h1>
                    <FaUserInjured /> {t("patients_management")}
                </h1>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <FaPlus /> {t("add_patient")}
                    </button>
                    <button className="btn btn-outline" onClick={exportToPDF}>
                        <FaFileExport /> PDF
                    </button>
                    <button className="btn btn-outline" onClick={exportToExcel}>
                        <FaFileImport /> Excel
                    </button>
                </div>
            </div>

            <div className="filters-bar">
                <div className="search-filter">
                    <div className="search-box">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder={t("search_patients")}
                            value={searchTerm}
                            onChange={handleSearch}
                            onKeyPress={(e) => e.key === "Enter" && applyFilters()}
                        />
                    </div>
                    <button className={`filter-toggle-btn ${showFilters ? "active" : ""}`} onClick={toggleFilters}>
                        <FaFilter /> {t("filters")}
                    </button>
                </div>

                {showFilters && (
                    <div className="advanced-filters">
                        <div className="filter-row">
                            <div className="filter-group">
                                <label>{t("gender")}:</label>
                                <select value={filterGender} onChange={handleFilterGender}>
                                    <option value="all">{t("all")}</option>
                                    <option value="male">{t("male")}</option>
                                    <option value="female">{t("female")}</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>{t("age")}:</label>
                                <select value={filterAge} onChange={handleFilterAge}>
                                    <option value="all">{t("all")}</option>
                                    <option value="0-18">0-18</option>
                                    <option value="19-35">19-35</option>
                                    <option value="36-50">36-50</option>
                                    <option value="51+">51+</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>{t("status")}:</label>
                                <select value={filterStatus} onChange={handleFilterStatus}>
                                    <option value="all">{t("all")}</option>
                                    <option value="faol">{t("active")}</option>
                                    <option value="nofaol">{t("inactive")}</option>
                                </select>
                            </div>

                            {selectedBranch === "all" && !branchesLoading && (
                                <div className="filter-group">
                                    <label>{t("branch")}:</label>
                                    <select value={filterBranch} onChange={handleFilterBranch}>
                                        <option value="all">{t("all")}</option>
                                        {branches.map((branch) => (
                                            <option key={branch.id} value={branch.id.toString()}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button className="btn btn-primary apply-filters-btn" onClick={applyFilters}>
                                {t("apply_filters")}
                            </button>
                            <button className="btn btn-secondary apply-filters-btn" onClick={resetFilters}>
                                {t("reset")}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="patients-table-container">
                <table className="patients-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort("name")} className={sortBy === "name" ? `sort-${sortOrder}` : ""}>
                                {t("name")}
                            </th>
                            <th onClick={() => handleSort("age")} className={sortBy === "age" ? `sort-${sortOrder}` : ""}>
                                {t("age")}
                            </th>
                            <th>{t("gender")}</th>
                            <th>{t("phone")}</th>
                            <th>{t("diagnosis")}</th>
                            <th>{t("doctor")}</th>
                            <th>{t("branch")}</th>
                            <th onClick={() => handleSort("lastVisit")} className={sortBy === "lastVisit" ? `sort-${sortOrder}` : ""}>
                                {t("last_visit")}
                            </th>
                            <th>{t("status")}</th>
                            <th>{t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedPatients.length > 0 ? (
                            displayedPatients.map((patient) => (
                                <tr key={patient.id} onClick={() => handleViewPatientDetails(patient.id)}>
                                    <td>{patient.name}</td>
                                    <td>{patient.age}</td>
                                    <td>{t(patient.gender)}</td>
                                    <td>{patient.phone}</td>
                                    <td>{patient.diagnosis}</td>
                                    <td>{patient.doctor}</td>
                                    <td>{getBranchName(patient.branch)}</td>
                                    <td>{patient.lastVisit}</td>
                                    <td>
                                        <span className={`status-badge ${patient.status}`}>
                                            {patient.status === "faol" ? t("active") : t("inactive")}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon payment"
                                                title={t("view_payments")}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    openPaymentModal(patient)
                                                }}
                                            >
                                                <FaMoneyBillWave />
                                            </button>
                                            <button
                                                className="btn-icon edit"
                                                title={t("edit")}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    openEditModal(patient)
                                                }}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn-icon delete"
                                                title={t("delete")}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    confirmDeletePatient(patient.id, patient.name)
                                                }}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="no-data">
                                    <p>{t("no_patients_found")}</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {patients.length > 0 && (
                <Pagination
                    pageCount={totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />
            )}

            {/* Add Patient Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{t("add_new_patient")}</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleAddPatient}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="full_name">{t("full_name")}</label>
                                        <input
                                            type="text"
                                            id="full_name"
                                            name="full_name"
                                            value={newPatient.full_name}
                                            onChange={handleNewPatientChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="age">{t("age")}</label>
                                        <input
                                            type="number"
                                            id="age"
                                            name="age"
                                            value={newPatient.age}
                                            onChange={handleNewPatientChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="gender">{t("gender")}</label>
                                        <select id="gender" name="gender" value={newPatient.gender} onChange={handleNewPatientChange}>
                                            <option value="male">{t("male")}</option>
                                            <option value="female">{t("female")}</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="phone_number">{t("phone")}</label>
                                        <input
                                            type="text"
                                            id="phone_number"
                                            name="phone_number"
                                            value={newPatient.phone_number}
                                            onChange={handleNewPatientChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="email">{t("passport_id")}</label>
                                        <input
                                            type="text"
                                            id="email"
                                            name="passport_id"
                                            value={newPatient.passport_id}
                                            onChange={handleNewPatientChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="location">{t("address")}</label>
                                        <input
                                            type="text"
                                            id="location"
                                            name="location"
                                            value={newPatient.location}
                                            onChange={handleNewPatientChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="branch">{t("branch")}</label>

                                        <select name="branch" value={newPatient.branch} onChange={handleNewPatientChange}>
                                            <option value={0}>Filial tanlang</option>
                                            {branchesLoading ? (
                                                <option value="">{t("loading")}</option>
                                            ) : (
                                                branches.map((branch) => (
                                                    <option key={branch.id} value={branch.id}>
                                                        {branch.name}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="status">{t("status")}</label>
                                        <select name="status" value={newPatient.status} onChange={handleNewPatientChange}>
                                            <option value="faol">{t("active")}</option>
                                            <option value="nofaol">{t("inactive")}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                    {t("cancel")}
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {loading ? `${t("adding")}...` : t("add_patient")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Patient Modal */}
            {showEditModal && selectedPatient && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{t("edit_patient")}</h3>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleEditPatient}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="edit-full_name">{t("full_name")}</label>
                                        <input
                                            type="text"
                                            id="edit-full_name"
                                            name="full_name"
                                            value={selectedPatient.full_name}
                                            onChange={handleSelectedPatientChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="edit-age">{t("age")}</label>
                                        <input
                                            type="number"
                                            id="edit-age"
                                            name="age"
                                            value={selectedPatient.age}
                                            onChange={handleSelectedPatientChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="edit-gender">{t("gender")}</label>
                                        <select
                                            id="edit-gender"
                                            name="gender"
                                            value={selectedPatient.gender}
                                            onChange={handleSelectedPatientChange}
                                        >
                                            <option value="male">{t("male")}</option>
                                            <option value="female">{t("female")}</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="edit-phone_number">{t("phone")}</label>
                                        <input
                                            type="text"
                                            id="edit-phone_number"
                                            name="phone_number"
                                            value={selectedPatient.phone_number}
                                            onChange={handleSelectedPatientChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="edit-email">{t("passport_id")}</label>
                                        <input
                                            type="text"
                                            id="edit-email"
                                            name="passport_id"
                                            value={selectedPatient.passport_id}
                                            onChange={handleSelectedPatientChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="edit-location">{t("address")}</label>
                                        <input
                                            type="text"
                                            id="edit-location"
                                            name="location"
                                            value={selectedPatient.location}
                                            onChange={handleSelectedPatientChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="edit-branch">{t("branch")}</label>
                                        <select
                                            id="edit-branch"
                                            name="branch"
                                            value={selectedPatient.branch}
                                            onChange={handleSelectedPatientChange}
                                        >
                                            {branchesLoading ? (
                                                <option value="">{t("loading")}</option>
                                            ) : (
                                                branches.map((branch) => (
                                                    <option key={branch.id} value={branch.id}>
                                                        {branch.name}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="edit-status">{t("status")}</label>
                                        <select
                                            id="edit-status"
                                            name="status"
                                            value={selectedPatient.status}
                                            onChange={handleSelectedPatientChange}
                                        >
                                            <option value="faol">{t("active")}</option>
                                            <option value="nofaol">{t("inactive")}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                    {t("cancel")}
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {loading ? `${t("saving")}...` : t("save_changes")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPaymentModal && selectedPatientForPayment && (
                <div className="modal-overlay">
                    <div className="modal payment-modal">
                        <div className="modal-header">
                            <h3>
                                <FaMoneyBillWave /> {t("payment_information")} - {selectedPatientForPayment.name}
                            </h3>
                            <button className="close-btn" onClick={closePaymentModal}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            {paymentData.loading ? (
                                <div className="loading-container">
                                    <div className="loading-spinner"></div>
                                    <p>{t("loading_payment_data")}...</p>
                                </div>
                            ) : paymentData.error ? (
                                <div className="error-container">
                                    <FaExclamationTriangle className="error-icon" />
                                    <p>{paymentData.error}</p>
                                </div>
                            ) : (
                                <div className="payment-content">
                                    {paymentData.debtSummary && (
                                        <div className="debt-summary-section">
                                            <h4>{t("debt_summary")}</h4>
                                            <div className="summary-cards">
                                                <div className="summary-card total-service">
                                                    <div className="card-label">{t("total_service_amount")}</div>
                                                    <div className="card-value">
                                                        {Number(paymentData.debtSummary.total_service_amount).toLocaleString()} {t("currency")}
                                                    </div>
                                                </div>
                                                <div className="summary-card total-paid">
                                                    <div className="card-label">{t("total_amount_paid")}</div>
                                                    <div className="card-value">
                                                        {Number(paymentData.debtSummary.total_amount_paid).toLocaleString()} {t("currency")}
                                                    </div>
                                                </div>
                                                <div className="summary-card total-discount">
                                                    <div className="card-label">{t("total_discount")}</div>
                                                    <div className="card-value">
                                                        {Number(paymentData.debtSummary.total_discount).toLocaleString()} {t("currency")}
                                                    </div>
                                                </div>
                                                <div className="summary-card total-debt">
                                                    <div className="card-label">{t("total_debt")}</div>
                                                    <div className="card-value debt-amount">
                                                        {Number(paymentData.debtSummary.total_debt).toLocaleString()} {t("currency")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {paymentData.debtStats && paymentData.debtStats.debts && (
                                        <div className="debt-stats-section">
                                            <h4>{t("detailed_debt_breakdown")}</h4>
                                            <div className="debt-table-container">
                                                <table className="debt-table">
                                                    <thead>
                                                        <tr>
                                                            <th>{t("meeting_date")}</th>
                                                            <th>{t("service_amount")}</th>
                                                            <th>{t("amount_paid")}</th>
                                                            <th>{t("discount")}</th>
                                                            <th>{t("remaining_debt")}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paymentData.debtStats.debts.map((debt, index) => (
                                                            <tr key={debt.meeting_id || index}>
                                                                <td>{new Date(debt.meeting_date).toLocaleDateString()}</td>
                                                                <td>
                                                                    {Number(debt.total_service_amount).toLocaleString()} {t("currency")}
                                                                </td>
                                                                <td>
                                                                    {Number(debt.amount_paid).toLocaleString()} {t("currency")}
                                                                </td>
                                                                <td>
                                                                    {Number(debt.discount).toLocaleString()} {t("currency")}
                                                                </td>
                                                                <td className="debt-amount">
                                                                    {Number(debt.debt).toLocaleString()} {t("currency")}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {paymentData.debtSummary && Number(paymentData.debtSummary.total_debt) === 0 && (
                                        <div className="no-debt-message">
                                            <FaMoneyBillWave className="success-icon" />
                                            <p>{t("no_outstanding_debt")}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closePaymentModal}>
                                {t("close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Modal for Delete */}
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmModalProps.onConfirm}
                title={confirmModalProps.title}
                message={confirmModalProps.message}
                confirmText={confirmModalProps.confirmText}
                cancelText={confirmModalProps.cancelText}
                type={confirmModalProps.type}
                isLoading={loading}
            />

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title={successModalProps.title}
                message={successModalProps.message}
                autoClose={true}
                autoCloseTime={3000}
            />
        </div>
    )
}
