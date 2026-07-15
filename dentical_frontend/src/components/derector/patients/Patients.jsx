"use client"

import { useState, useEffect } from "react"
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
  FaFilter,
  FaFilePdf,
  FaFileExcel,
  FaUserPlus,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaStethoscope,
  FaUserMd,
  FaExclamationTriangle,
  FaExclamation,
} from "react-icons/fa"
import { useAuth } from "../../../contexts/AuthContext"
import { useLanguage } from "../../../contexts/LanguageContext"
import { useNavigate } from "react-router-dom"
import apiPatients from "../../../api/apiPatients"
import apiBranches from "../../../api/apiBranches"
import Pagination from "../../pagination/Pagination"
import ConfirmModal from "../../modal/ConfirmModal"
import SuccessModal from "../../modal/SuccessModal"

export default function Patients() {
  const { selectedBranch } = useAuth()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showSidebar, setShowSidebar] = useState(false)
  const [showEditSidebar, setShowEditSidebar] = useState(false)
  const [currentPatient, setCurrentPatient] = useState(null)
  const [newPatient, setNewPatient] = useState({
    full_name: "",
    age: 18,
    gender: "male",
    phone_number: "",
    passport_id: "AD12345678",
    location: "",
    status: "faol",
    branch: selectedBranch === "all" ? 0 : Number.parseInt(selectedBranch),
  })
  const [filterGender, setFilterGender] = useState("all")
  const [filterAge, setFilterAge] = useState("all")
  const [filterBranch, setFilterBranch] = useState(selectedBranch)
  const [filterStatus, setFilterStatus] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState("table") // table or grid
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Validation states
  const [branchError, setBranchError] = useState(false)
  const [editBranchError, setEditBranchError] = useState(false)

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

  // Branches state
  const [branches, setBranches] = useState([])
  const [branchesLoading, setBranchesLoading] = useState(true)

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

  // Fetch patients data from API
  const fetchPatients = async () => {
    try {
      setLoading(true)
      setError(null)

      // Convert currentPage from 0-based to 1-based for API
      const apiPage = currentPage + 1

      // Get branch ID for filtering - use filterBranch instead of selectedBranch
      const branchId = filterBranch === "all" ? null : Number(filterBranch)

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
        diagnosis: patient.diagnosis || "",
        doctor: patient.doctor || "",
        branch: patient.branch,
        visited_branches: patient.visited_branches || [],
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
  }, [currentPage, itemsPerPage, searchTerm, filterBranch])

  // Update branch in new patient form when selected branch changes
  useEffect(() => {
    setNewPatient({
      ...newPatient,
      branch: selectedBranch === "all" ? 0 : Number.parseInt(selectedBranch),
    })

    setFilterBranch(selectedBranch)
  }, [selectedBranch])

  // Apply filters to patients
  const applyFilters = () => {
    // Reset to first page when applying filters
    setCurrentPage(0)
    fetchPatients()
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(0) // Reset to first page when searching
  }

  // Handle new patient input change
  const handleNewPatientChange = (e) => {
    const { name, value } = e.target

    // Для поля branch нужно сохранять значение как число без преобразования через parseInt
    if (name === "branch") {
      const branchValue = Number(value)
      setNewPatient({
        ...newPatient,
        [name]: branchValue,
      })

      // Сбрасываем ошибку, если выбран валидный филиал
      if (branchValue > 0) {
        setBranchError(false)
      }

      console.log("Branch selected:", branchValue) // Для отладки
    } else {
      setNewPatient({
        ...newPatient,
        [name]: name === "age" ? (value === "" ? "" : Number.parseInt(value)) : value,
      })
    }
  }

  // Handle edit patient input change
  const handleEditPatientChange = (e) => {
    const { name, value } = e.target

    // Для поля branch нужно сохранять значение как число без преобразования через parseInt
    if (name === "branch") {
      const branchValue = Number(value)
      setCurrentPatient({
        ...currentPatient,
        [name]: branchValue,
      })

      // Сбрасываем ошибку, если выбран валидный филиал
      if (branchValue > 0) {
        setEditBranchError(false)
      }
    } else {
      setCurrentPatient({
        ...currentPatient,
        [name]: name === "age" ? Number.parseInt(value) : value,
      })
    }
  }

  // Open add sidebar
  const openAddSidebar = () => {
    setBranchError(false)
    setShowSidebar(true)
  }

  // Close add sidebar
  const closeAddSidebar = () => {
    setShowSidebar(false)
    setBranchError(false)
    setNewPatient({
      full_name: "",
      age: 18,
      gender: "male",
      phone_number: "",
      passport_id: "Ad12345678",
      location: "",
      status: "faol",
      branch: selectedBranch === "all" ? 0 : Number.parseInt(selectedBranch),
    })
  }

  // Open edit sidebar
  const openEditSidebar = (patient) => {
    setEditBranchError(false)

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
      diagnosis: patient.diagnosis,
      doctor: patient.doctor,
    }

    setCurrentPatient(apiPatient)
    setShowEditSidebar(true)
  }

  const handleViewPatientDetails = (patientId) => {
    navigate(`/dashboard/director/patients/${patientId}`)
  }

  // Close edit sidebar
  const closeEditSidebar = () => {
    setShowEditSidebar(false)
    setEditBranchError(false)
    setCurrentPatient(null)
  }

  // Toggle filters
  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(viewMode === "table" ? "grid" : "table")
  }

  // Validate form before submission
  const validateForm = (patient) => {
    // Filial endi IXTIYORIY — bemor klinika darajasida saqlanadi
    return true
  }

  // Add new patient
  const addPatient = async (e) => {
    e.preventDefault()

    // Проверяем валидность формы
    if (!validateForm(newPatient)) {
      // Если филиал не выбран, показываем ошибку
      setBranchError(true)
      return
    }

    try {
      setLoading(true)

      // Create patient using API
      await apiPatients.createPatient(newPatient)

      // Close the sidebar and reset form
      closeAddSidebar()
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

  // Update patient
  const updatePatient = async (e) => {
    e.preventDefault()

    // Проверяем валидность формы
    if (!validateForm(currentPatient)) {
      // Если филиал не выбран, показываем ошибку
      setEditBranchError(true)
      return
    }

    try {
      setLoading(true)

      // Extract ID and remove it from the data to send
      const { id, ...patientData } = currentPatient

      // Update patient using API
      await apiPatients.updatePatient(id, patientData)

      // Close the sidebar
      closeEditSidebar()
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

  // Get patient initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
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
    <div className="mijoz-container">
      <div className="mijoz-header">
        <h1 className="mijoz-title">{t("patients")}</h1>
        <div className="mijoz-actions">
          <button className="mijoz-btn mijoz-btn-outline mijoz-btn-icon" onClick={exportToPDF}>
            <FaFilePdf /> PDF
          </button>
          <button className="mijoz-btn mijoz-btn-outline mijoz-btn-icon" onClick={exportToExcel}>
            <FaFileExcel /> Excel
          </button>
          <button className="mijoz-btn mijoz-btn-outline mijoz-btn-icon" onClick={toggleViewMode}>
            {viewMode === "table" ? "Grid View" : "Table View"}
          </button>
          <button className="mijoz-btn mijoz-btn-primary mijoz-btn-icon" onClick={openAddSidebar}>
            <FaUserPlus /> {t("add_new_patient")}
          </button>
        </div>
      </div>
      <div className="mijoz-filters-container">
        <div className="mijoz-search-filter">
          <div className="mijoz-search-input">
            <FaSearch className="mijoz-search-icon" />
            <input
              type="text"
              placeholder={t("search")}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === "Enter" && applyFilters()}
            />
          </div>
          <button className={`mijoz-filter-toggle-btn ${showFilters ? "active" : ""}`} onClick={toggleFilters}>
            <FaFilter /> {t("filters")}
          </button>
        </div>

        {showFilters && (
          <div className="mijoz-advanced-filters">
            <div className="mijoz-filter-group">
              <label>{t("gender")}:</label>
              <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
                <option value="all">{t("all")}</option>
                <option value="male">{t("male")}</option>
                <option value="female">{t("female")}</option>
              </select>
            </div>

            <div className="mijoz-filter-group">
              <label>{t("age")}:</label>
              <select value={filterAge} onChange={(e) => setFilterAge(e.target.value)}>
                <option value="all">{t("all")}</option>
                <option value="0-18">0-18</option>
                <option value="19-35">19-35</option>
                <option value="36-50">36-50</option>
                <option value="51+">51+</option>
              </select>
            </div>

            <div className="mijoz-filter-group">
              <label>{t("status")}:</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">{t("all")}</option>
                <option value="faol">{t("active")}</option>
                <option value="nofaol">{t("inactive")}</option>
              </select>
            </div>

            {selectedBranch === "all" && !branchesLoading && (
              <div className="mijoz-filter-group">
                <label>{t("branch")}:</label>
                <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
                  <option value="all">{t("all")}</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button className="mijoz-btn mijoz-btn-primary" onClick={applyFilters}>
              {t("apply_filters")}
            </button>
          </div>
        )}
      </div>
      {viewMode === "table" ? (
        <div className="mijoz-card">
          <div className="mijoz-table-responsive">
            <table className="mijoz-data-table">
              <thead>
                <tr>
                  <th>{t("name")}</th>
                  <th>{t("age")}</th>
                  <th>{t("gender")}</th>
                  <th>{t("phone")}</th>
                  <th>{t("diagnosis")}</th>
                  <th>{t("doctor")}</th>
                  <th>{t("visited_branches")}</th>
                  <th>{t("last_visit")}</th>
                  <th>{t("status")}</th>
                  <th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <tr key={patient.id} onClick={() => handleViewPatientDetails(patient.id)}>
                      <td>{patient.name}</td>
                      <td>{patient.age}</td>
                      <td>{patient.gender === "male" ? t("male") : t("female")}</td>
                      <td>{patient.phone}</td>
                      <td>{patient.diagnosis || "-"}</td>
                      <td>{patient.doctor || "-"}</td>
                      <td>
                        {patient.visited_branches && patient.visited_branches.length > 0
                          ? patient.visited_branches.join(", ")
                          : getBranchName(patient.branch)}
                      </td>
                      <td>{patient.lastVisit}</td>
                      <td>
                        <span className={`mijoz-status-badge ${patient.status}`}>
                          {patient.status === "faol" ? t("active") : t("inactive")}
                        </span>
                      </td>
                      <td>
                        <div className="mijoz-action-buttons">
                          <button
                            className="mijoz-btn-icon edit"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditSidebar(patient)
                            }}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="mijoz-btn-icon delete"
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
                    <td colSpan="10" className="mijoz-no-data">
                      {t("no_data_found")}
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
        </div>
      ) : (
        <div className="mijoz-grid">
          {patients.length > 0 ? (
            patients.map((patient) => (
              <div className="mijoz-patient-card" key={patient.id} onClick={() => handleViewPatientDetails(patient.id)}>
                <div className="mijoz-patient-header">
                  <div className="mijoz-patient-avatar">{getInitials(patient.name)}</div>
                  <div className="mijoz-patient-info">
                    <h3 className="mijoz-patient-name">{patient.name}</h3>
                    <p className="mijoz-patient-id">ID: {patient.id}</p>
                    <span className={`mijoz-status-badge ${patient.status}`}>
                      {patient.status === "faol" ? t("active") : t("inactive")}
                    </span>
                  </div>
                </div>
                <div className="mijoz-patient-body">
                  <div className="mijoz-patient-detail">
                    <div className="mijoz-detail-icon">
                      <FaPhone />
                    </div>
                    <div className="mijoz-detail-content">
                      <div className="mijoz-detail-label">{t("phone")}</div>
                      <div className="mijoz-detail-value">{patient.phone}</div>
                    </div>
                  </div>
                  <div className="mijoz-patient-detail">
                    <div className="mijoz-detail-icon">
                      <FaEnvelope />
                    </div>
                    <div className="mijoz-detail-content">
                      <div className="mijoz-detail-label">{t("passport_id")}</div>
                      <div className="mijoz-detail-value">{patient.passport_id || "-"}</div>
                    </div>
                  </div>
                  <div className="mijoz-patient-detail">
                    <div className="mijoz-detail-icon">
                      <FaMapMarkerAlt />
                    </div>
                    <div className="mijoz-detail-content">
                      <div className="mijoz-detail-label">{t("address")}</div>
                      <div className="mijoz-detail-value">{patient.address || "-"}</div>
                    </div>
                  </div>
                  <div className="mijoz-patient-detail">
                    <div className="mijoz-detail-icon">
                      <FaCalendarAlt />
                    </div>
                    <div className="mijoz-detail-content">
                      <div className="mijoz-detail-label">{t("last_visit")}</div>
                      <div className="mijoz-detail-value">{patient.lastVisit}</div>
                    </div>
                  </div>
                  <div className="mijoz-patient-detail">
                    <div className="mijoz-detail-icon">
                      <FaStethoscope />
                    </div>
                    <div className="mijoz-detail-content">
                      <div className="mijoz-detail-label">{t("diagnosis")}</div>
                      <div className="mijoz-detail-value">{patient.diagnosis || t("no_diagnosis")}</div>
                    </div>
                  </div>
                  <div className="mijoz-patient-detail">
                    <div className="mijoz-detail-icon">
                      <FaUserMd />
                    </div>
                    <div className="mijoz-detail-content">
                      <div className="mijoz-detail-label">{t("doctor")}</div>
                      <div className="mijoz-detail-value">{patient.doctor || t("no_doctor")}</div>
                    </div>
                  </div>
                </div>
                <div className="mijoz-patient-footer">
                  <div className="mijoz-action-buttons">
                    <button
                      className="mijoz-btn-icon edit"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditSidebar(patient)
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="mijoz-btn-icon delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        confirmDeletePatient(patient.id, patient.name)
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="mijoz-no-data-grid">{t("no_data_found")}</div>
          )}

          {/* Pagination for grid view */}
          {patients.length > 0 && (
            <div className="mijoz-grid-pagination">
              <Pagination
                pageCount={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          )}
        </div>
      )}
      {/* Add Patient Sidebar */}
      <div className={`mijoz-panel-overlay ${showSidebar ? "active" : ""}`} onClick={closeAddSidebar}></div>
      <div className={`mijoz-panel ${showSidebar ? "active" : ""}`}>
        <div className="mijoz-panel-header">
          <h2>{t("add_new_patient")}</h2>
          <button className="mijoz-panel-close-button" onClick={closeAddSidebar}>
            <FaTimes />
          </button>
        </div>
        <div className="mijoz-panel-content">
          <form onSubmit={addPatient}>
            <div className="mijoz-form-group">
              <label>{t("full_name")}</label>
              <input
                type="text"
                name="full_name"
                value={newPatient.full_name}
                onChange={handleNewPatientChange}
                required
              />
            </div>

            <div className="mijoz-form-row">
              <div className="mijoz-form-group">
                <label>{t("age")}</label>
                <input type="number" name="age" value={newPatient.age} onChange={handleNewPatientChange} required />
              </div>

              <div className="mijoz-form-group">
                <label>{t("gender")}</label>
                <select name="gender" value={newPatient.gender} onChange={handleNewPatientChange} required>
                  <option value="male">{t("male")}</option>
                  <option value="female">{t("female")}</option>
                </select>
              </div>
            </div>

            <div className="mijoz-form-group">
              <label>{t("phone")}</label>
              <input
                type="text"
                name="phone_number"
                value={newPatient.phone_number}
                onChange={handleNewPatientChange}
                required
              />
            </div>

            <div className="mijoz-form-group">
              <label>{t("passport_id")}</label>
              <input type="text" name="passport_id" value={newPatient.passport_id} onChange={handleNewPatientChange} />
            </div>

            <div className="mijoz-form-group">
              <label>{t("address")}</label>
              <input type="text" name="location" value={newPatient.location} onChange={handleNewPatientChange} />
            </div>

            <div className="mijoz-form-row">
              <div className="mijoz-form-group">
                <label>{t("branch")} ({t("optional") || "ixtiyoriy"})</label>
                <select
                  name="branch"
                  value={newPatient.branch}
                  onChange={handleNewPatientChange}
                  className={branchError ? "mijoz-input-error" : ""}
                >
                  <option value={0}>{t("select_branch")}</option>
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
                {branchError && (
                  <div className="mijoz-error-message">
                    <FaExclamation /> Илтимос, филиални танланг
                  </div>
                )}
              </div>

              <div className="mijoz-form-group">
                <label>{t("status")}</label>
                <select name="status" value={newPatient.status} onChange={handleNewPatientChange}>
                  <option value="faol">{t("active")}</option>
                  <option value="nofaol">{t("inactive")}</option>
                </select>
              </div>
            </div>

            <div className="mijoz-form-actions">
              <button type="submit" className="mijoz-btn mijoz-btn-primary">
                {loading ? `${t("adding")}...` : t("add")}
              </button>
              <button
                type="button"
                className="mijoz-btn mijoz-btn-secondary"
                onClick={closeAddSidebar}
                disabled={loading}
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Edit Patient Sidebar */}
      <div className={`mijoz-panel-overlay ${showEditSidebar ? "active" : ""}`} onClick={closeEditSidebar}></div>
      <div className={`mijoz-panel ${showEditSidebar ? "active" : ""}`}>
        {currentPatient && (
          <>
            <div className="mijoz-panel-header">
              <h2>{t("edit_patient")}</h2>
              <button className="mijoz-panel-close-button" onClick={closeEditSidebar}>
                <FaTimes />
              </button>
            </div>
            <div className="mijoz-panel-content">
              <form onSubmit={updatePatient}>
                <div className="mijoz-form-group">
                  <label>{t("full_name")}</label>
                  <input
                    type="text"
                    name="full_name"
                    value={currentPatient.full_name}
                    onChange={handleEditPatientChange}
                    required
                  />
                </div>

                <div className="mijoz-form-row">
                  <div className="mijoz-form-group">
                    <label>{t("age")}</label>
                    <input
                      type="number"
                      name="age"
                      value={currentPatient.age}
                      onChange={handleEditPatientChange}
                      required
                    />
                  </div>

                  <div className="mijoz-form-group">
                    <label>{t("gender")}</label>
                    <select name="gender" value={currentPatient.gender} onChange={handleEditPatientChange} required>
                      <option value="male">{t("male")}</option>
                      <option value="female">{t("female")}</option>
                    </select>
                  </div>
                </div>

                <div className="mijoz-form-group">
                  <label>{t("phone")}</label>
                  <input
                    type="text"
                    name="phone_number"
                    value={currentPatient.phone_number}
                    onChange={handleEditPatientChange}
                    required
                  />
                </div>

                <div className="mijoz-form-group">
                  <label>{t("passport_id")}</label>
                  <input type="text" name="passport_id" value={currentPatient.passport_id} onChange={handleEditPatientChange} />
                </div>

                <div className="mijoz-form-group">
                  <label>{t("address")}</label>
                  <input
                    type="text"
                    name="location"
                    value={currentPatient.location}
                    onChange={handleEditPatientChange}
                  />
                </div>

                <div className="mijoz-form-row">
                  <div className="mijoz-form-group">
                    <label>{t("branch")} ({t("optional") || "ixtiyoriy"})</label>
                    <select
                      name="branch"
                      value={currentPatient.branch}
                      onChange={handleEditPatientChange}
                      className={editBranchError ? "mijoz-input-error" : ""}
                    >
                      <option value={0}>{t("select_branch")}</option>
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
                    {editBranchError && (
                      <div className="mijoz-error-message">
                        <FaExclamation /> Илтимос, филиални танланг
                      </div>
                    )}
                  </div>

                  <div className="mijoz-form-group">
                    <label>{t("status")}</label>
                    <select name="status" value={currentPatient.status} onChange={handleEditPatientChange}>
                      <option value="faol">{t("active")}</option>
                      <option value="nofaol">{t("inactive")}</option>
                    </select>
                  </div>
                </div>

                <div className="mijoz-form-actions">
                  <button type="submit" className="mijoz-btn mijoz-btn-primary">
                    {loading ? `${t("saving")}...` : t("save")}
                  </button>
                  <button
                    type="button"
                    className="mijoz-btn mijoz-btn-secondary"
                    onClick={closeEditSidebar}
                    disabled={loading}
                  >
                    {t("cancel")}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
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
