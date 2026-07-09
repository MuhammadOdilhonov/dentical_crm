"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"
import apiPatientId from "../../api/apiPatientsId"
import apiBranches from "../../api/apiBranches"
import apiPatientDetailReception from "../../api/apiPatientDetailReception"
import apiCustomerDebts from "../../api/apiCustomerDebts"
import apiCustomerMedicine from "../../api/apiCustomerMedicine"
import Pagination from "../pagination/Pagination"
import ConfirmModal from "../modal/ConfirmModal"
import SuccessModal from "../modal/SuccessModal"
import {
    FaArrowLeft,
    FaEdit,
    FaFilePdf,
    FaFileExcel,
    FaUser,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaStethoscope,
    FaUserMd,
    FaRulerVertical,
    FaWeight,
    FaTint,
    FaBirthdayCake,
    FaExclamationTriangle,
    FaSave,
    FaTimes,
    FaClinicMedical,
    FaMoneyBillWave,
    FaDoorOpen,
    FaCheckCircle,
    FaHourglass,
    FaTimesCircle,
    FaExternalLinkAlt,
    FaCommentMedical,
    FaHospital,
    FaCalendarCheck,
    FaIdCard,
    FaRegClock,
    FaCreditCard,
    FaPlus,
    FaEye,
    FaSpinner,
    FaPercent,
    FaCalculator,
    FaCommentDots,
    FaClock,
    FaPills,
    FaReceipt,
    FaHashtag,
    FaNotesMedical,
} from "react-icons/fa"

export default function PatientDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { t } = useLanguage()
    const { selectedBranch, user } = useAuth()

    // State variables
    const [patient, setPatient] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editedPatient, setEditedPatient] = useState(null)
    const [branches, setBranches] = useState([])
    const [branchesLoading, setBranchesLoading] = useState(true)

    // Appointments state
    const [appointments, setAppointments] = useState([])
    const [appointmentsLoading, setAppointmentsLoading] = useState(true)
    const [appointmentsError, setAppointmentsError] = useState(null)
    const [appointmentsTotalCount, setAppointmentsTotalCount] = useState(0)
    const [appointmentsCurrentPage, setAppointmentsCurrentPage] = useState(0)
    const [appointmentsItemsPerPage, setAppointmentsItemsPerPage] = useState(6)

    const [medicines, setMedicines] = useState([])
    const [medicinesLoading, setMedicinesLoading] = useState(true)
    const [medicinesError, setMedicinesError] = useState(null)
    const [medicinesTotalCount, setMedicinesTotalCount] = useState(0)
    const [medicinesCurrentPage, setMedicinesCurrentPage] = useState(0)
    const [medicinesItemsPerPage, setMedicinesItemsPerPage] = useState(6)

    const [debtStats, setDebtStats] = useState(null)
    const [debtLoading, setDebtLoading] = useState(false)
    const [debtError, setDebtError] = useState(null)

    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false)
    const [paymentData, setPaymentData] = useState({
        debtSummary: null,
        debtStats: [],
    })
    const [paymentLoading, setPaymentLoading] = useState(false)
    const [paymentError, setPaymentError] = useState(null)
    const [customerMeetings, setCustomerMeetings] = useState([])
    const [selectedMeeting, setSelectedMeeting] = useState("")
    const [newPayment, setNewPayment] = useState({
        amount_paid: "",
        discount_amount: "",
        discount_percentage: "",
        comment: "",
    })

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

    const hasPaymentAccess = useCallback(() => {
        return user && (user.role === "admin" || user.role === "director")
    }, [user])

    // Fetch patient data
    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await apiPatientId.fetchPatientById(id)
                setPatient(data)
                setEditedPatient(data)
            } catch (err) {
                console.error("Error fetching patient:", err)
                setError(err.message || t("error_fetching_patient"))
            } finally {
                setLoading(false)
            }
        }

        fetchPatientData()
    }, [id, t])

    // Fetch branches
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                setBranchesLoading(true)
                const branchesData = await apiBranches.fetchBranches()
                setBranches(branchesData.results || branchesData)
                setBranchesLoading(false)
            } catch (err) {
                console.error("Error fetching branches:", err)
                setBranchesLoading(false)
            }
        }

        fetchBranches()
    }, [])

    // Fetch patient appointments
    useEffect(() => {
        const fetchPatientAppointments = async () => {
            if (!id) return

            try {
                setAppointmentsLoading(true)
                setAppointmentsError(null)
                const data = await apiPatientDetailReception.fetchPatientAppointments(
                    id,
                    appointmentsCurrentPage + 1,
                    appointmentsItemsPerPage,
                )
                setAppointments(data.results || [])
                setAppointmentsTotalCount(data.count || 0)
                setAppointmentsLoading(false)
            } catch (err) {
                console.error("Error fetching patient appointments:", err)
                setAppointmentsError(err.message || t("error_fetching_appointments"))
                setAppointmentsLoading(false)
            }
        }

        fetchPatientAppointments()
    }, [id, appointmentsCurrentPage, appointmentsItemsPerPage, t])

    useEffect(() => {
        const fetchPatientMedicines = async () => {
            if (!id) return

            try {
                setMedicinesLoading(true)
                setMedicinesError(null)
                const data = await apiCustomerMedicine.fetchCustomerMedicine(
                    id,
                    medicinesCurrentPage + 1,
                    medicinesItemsPerPage,
                )
                setMedicines(data.results || [])
                setMedicinesTotalCount(data.count || 0)
                setMedicinesLoading(false)
            } catch (err) {
                console.error("Error fetching patient medicines:", err)
                setMedicinesError(err.message || t("error_fetching_medicines"))
                setMedicinesLoading(false)
            }
        }

        fetchPatientMedicines()
    }, [id, medicinesCurrentPage, medicinesItemsPerPage, t])

    useEffect(() => {
        const fetchDebtData = async () => {
            if (!id || !hasPaymentAccess()) return

            try {
                setDebtLoading(true)
                setDebtError(null)
                const data = await apiCustomerDebts.fetchCustomerDebtStats(id)
                setDebtStats(data)
                setDebtLoading(false)
            } catch (err) {
                console.error("Error fetching debt stats:", err)
                setDebtError(err.message || t("error_fetching_debt_data"))
                setDebtLoading(false)
            }
        }

        fetchDebtData()
    }, [id, hasPaymentAccess, t])

    useEffect(() => {
        if (id && hasPaymentAccess()) {
            fetchPaymentData()
        }
    }, [id, hasPaymentAccess])

    const fetchPaymentData = async () => {
        try {
            setPaymentLoading(true)
            setPaymentError("")

            const [summaryData, statsData] = await Promise.all([
                apiCustomerDebts.fetchCustomerDebtSummary(id),
                apiCustomerDebts.fetchCustomerDebtStats(id),
            ])

            setPaymentData({
                debtSummary: summaryData,
                debtStats: statsData.debts || [],
            })

            // Also fetch meetings for payment selection
            await fetchCustomerMeetings()
        } catch (err) {
            console.error("Error fetching payment data:", err)
            setPaymentError(err.message || t("error_loading_payment_data"))
        } finally {
            setPaymentLoading(false)
        }
    }

    const fetchCustomerMeetings = async () => {
        try {
            const meetingsData = await apiCustomerDebts.fetchCustomerMeetings(id)
            setCustomerMeetings(meetingsData.meetings || [])
        } catch (err) {
            console.error("Error fetching customer meetings:", err)
        }
    }

    const handleViewPayments = () => {
        setShowPaymentHistoryModal(true)
    }

    const handleAddPayment = () => {
        setNewPayment({
            amount_paid: "",
            discount_amount: "",
            discount_percentage: "",
            comment: "",
        })
        setSelectedMeeting("")
        setShowPaymentModal(true)
    }

    const handlePaymentInputChange = (e) => {
        const { name, value } = e.target
        setNewPayment((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handlePaymentSubmit = async (e) => {
        e.preventDefault()

        if (!selectedMeeting) {
            setPaymentError(t("please_select_meeting"))
            return
        }

        try {
            setPaymentLoading(true)

            const paymentPayload = {
                customer: Number.parseInt(id),
                meeting: Number.parseInt(selectedMeeting),
                amount_paid: Number.parseFloat(newPayment.amount_paid) || 0,
                discount: Number.parseFloat(newPayment.discount_amount) || 0,
                discount_procent: Number.parseFloat(newPayment.discount_percentage) || 0,
                comment: newPayment.comment || "",
            }

            await apiCustomerDebts.createCustomerDebt(paymentPayload)

            // Refresh payment data
            await fetchPaymentData()

            // Reset form
            setNewPayment({
                amount_paid: "",
                discount_amount: "",
                discount_percentage: "",
                comment: "",
            })
            setSelectedMeeting("")

            setShowPaymentModal(false)
            setSuccessModalProps({
                title: t("success"),
                message: t("payment_recorded_successfully"),
            })
            setShowSuccessModal(true)
        } catch (err) {
            console.error("Error recording payment:", err)
            setPaymentError(err.message || t("error_recording_payment"))
        } finally {
            setPaymentLoading(false)
        }
    }

    const calculateTotalDiscount = () => {
        const discountAmount = Number.parseFloat(newPayment.discount_amount) || 0
        const discountPercentage = Number.parseFloat(newPayment.discount_percentage) || 0
        const amountPaid = Number.parseFloat(newPayment.amount_paid) || 0

        const percentageDiscount = (amountPaid * discountPercentage) / 100
        return discountAmount + percentageDiscount
    }

    // Handle back button click
    const handleBack = () => {
        navigate("/dashboard/director/patients")
    }

    // Handle edit button click
    const handleEdit = () => {
        setIsEditing(true)
    }

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditedPatient(patient)
        setIsEditing(false)
    }

    // Handle input change in edit form
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setEditedPatient({
            ...editedPatient,
            [name]: name === "age" || name === "branch" ? Number(value) : value,
        })
    }

    // Handle save changes
    const handleSaveChanges = async () => {
        try {
            setLoading(true)
            await apiPatientId.updatePatient(id, editedPatient)
            setPatient(editedPatient)
            setIsEditing(false)
            setSuccessModalProps({
                title: t("success"),
                message: t("patient_updated_successfully"),
            })
            setShowSuccessModal(true)
        } catch (err) {
            console.error("Error updating patient:", err)
            setError(err.message || t("error_updating_patient"))
        } finally {
            setLoading(false)
        }
    }

    // Handle export as PDF
    const handleExportPDF = async () => {
        try {
            setLoading(true)
            const pdfBlob = await apiPatientId.exportPatientAsPDF(id)

            // Create a download link for the PDF
            const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `patient_${id}_${patient?.full_name || "details"}.pdf`)
            document.body.appendChild(link)
            link.click()

            // Clean up
            window.URL.revokeObjectURL(url)
            link.remove()

            setLoading(false)
        } catch (err) {
            console.error("Error exporting PDF:", err)
            setError(err.message || t("error_exporting_pdf"))
            setLoading(false)

            // Show error modal
            setConfirmModalProps({
                title: t("export_error"),
                message: t("error_exporting_pdf"),
                confirmText: t("ok"),
                type: "error",
                onConfirm: () => setShowConfirmModal(false),
            })
            setShowConfirmModal(true)
        }
    }

    // Handle export as Excel
    const handleExportExcel = async () => {
        try {
            setLoading(true)
            const excelBlob = await apiPatientId.exportPatientAsExcel(id)

            // Create a download link for the Excel file
            const url = window.URL.createObjectURL(
                new Blob([excelBlob], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
            )
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `patient_${id}_${patient?.full_name || "details"}.xlsx`)
            document.body.appendChild(link)
            link.click()

            // Clean up
            window.URL.revokeObjectURL(url)
            link.remove()

            setLoading(false)
        } catch (err) {
            console.error("Error exporting Excel:", err)
            setError(err.message || t("error_exporting_excel"))
            setLoading(false)

            // Show error modal
            setConfirmModalProps({
                title: t("export_error"),
                message: t("error_exporting_excel"),
                confirmText: t("ok"),
                type: "error",
                onConfirm: () => setShowConfirmModal(false),
            })
            setShowConfirmModal(true)
        }
    }

    // Handle appointment page change
    const handleAppointmentPageChange = (selectedPage) => {
        setAppointmentsCurrentPage(selectedPage)
    }

    // Handle items per page change
    const handleAppointmentsItemsPerPageChange = (newItemsPerPage) => {
        setAppointmentsItemsPerPage(newItemsPerPage)
        setAppointmentsCurrentPage(0) // Reset to first page when changing items per page
    }

    const handleMedicinePageChange = (selectedPage) => {
        setMedicinesCurrentPage(selectedPage)
    }

    const handleMedicinesItemsPerPageChange = (newItemsPerPage) => {
        setMedicinesItemsPerPage(newItemsPerPage)
        setMedicinesCurrentPage(0)
    }

    // Handle appointment card click
    const handleAppointmentClick = (appointmentId) => {
        // Open in a new tab
        window.open(`/appointment-details/${appointmentId}`, "_blank")
    }

    // Get branch name by ID
    const getBranchName = (branchId) => {
        if (branchesLoading) return t("loading")
        const branch = branches.find((b) => b.id === branchId)
        return branch ? branch.name : t("unknown_branch")
    }

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "-"
        return new Date(dateString).toLocaleDateString()
    }

    // Format time
    const formatTime = (dateString) => {
        if (!dateString) return "-"
        return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // Format datetime
    const formatDateTime = (dateString) => {
        if (!dateString) return "-"
        return `${formatDate(dateString)} ${formatTime(dateString)}`
    }

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "completed":
                return "status-badge completed"
            case "scheduled":
                return "status-badge scheduled"
            case "cancelled":
                return "status-badge cancelled"
            default:
                return "status-badge"
        }
    }

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return <FaCheckCircle />
            case "scheduled":
                return <FaHourglass />
            case "cancelled":
                return <FaTimesCircle />
            default:
                return null
        }
    }

    // Translate status
    const translateStatus = (status) => {
        switch (status) {
            case "completed":
                return t("completed")
            case "scheduled":
                return t("scheduled")
            case "cancelled":
                return t("cancelled")
            default:
                return status
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("uz-UZ").format(amount || 0)
    }

    const formatSaleType = (saleType) => {
        switch (saleType) {
            case "retail":
                return t("retail")
            case "wholesale":
                return t("wholesale")
            default:
                return saleType
        }
    }

    // Loading state
    if (loading && !patient) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>{t("loading")}...</p>
            </div>
        )
    }

    // Error state
    if (error && !patient) {
        return (
            <div className="error-container">
                <FaExclamationTriangle className="error-icon" />
                <h2>{t("error_occurred")}</h2>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                    {t("try_again")}
                </button>
            </div>
        )
    }

    return (
        <div className="patient-details-container">
            <div className="patient-details-header">
                <button className="btn-back" onClick={handleBack}>
                    <FaArrowLeft /> {t("back_to_patients")}
                </button>
                <div className="patient-details-actions">
                    <button className="btn btn-outline btn-icon" onClick={handleExportPDF}>
                        <FaFilePdf /> PDF
                    </button>
                    <button className="btn btn-outline btn-icon" onClick={handleExportExcel}>
                        <FaFileExcel /> Excel
                    </button>
                    {hasPaymentAccess() && (
                        <>
                            <button className="btn btn-success btn-icon" onClick={handleViewPayments}>
                                <FaEye /> {t("view_payments")}
                            </button>
                            <button className="btn btn-primary btn-icon" onClick={handleAddPayment}>
                                <FaPlus /> {t("add_payment")}
                            </button>
                        </>
                    )}
                    {!isEditing && (
                        <button className="btn btn-primary btn-icon" onClick={handleEdit}>
                            <FaEdit /> {t("edit")}
                        </button>
                    )}
                </div>
            </div>

            {patient && (
                <div className="patient-details-content">

                    {isEditing ? (
                        <div className="patient-edit-form">
                            <h2 className="section-title">{t("edit_patient_information")}</h2>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="full_name">{t("full_name")}</label>
                                    <input
                                        type="text"
                                        id="full_name"
                                        name="full_name"
                                        value={editedPatient.full_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="age">{t("age")}</label>
                                    <input
                                        type="number"
                                        id="age"
                                        name="age"
                                        value={editedPatient.age}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="gender">{t("gender")}</label>
                                    <select id="gender" name="gender" value={editedPatient.gender} onChange={handleInputChange} required>
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
                                        value={editedPatient.phone_number}
                                        onChange={handleInputChange}
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
                                        value={editedPatient.passport_id}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="status">{t("status")}</label>
                                    <select id="status" name="status" value={editedPatient.status} onChange={handleInputChange}>
                                        <option value="faol">{t("active")}</option>
                                        <option value="nofaol">{t("inactive")}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">{t("address")}</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={editedPatient.location}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="branch">{t("branch")}</label>
                                    <select id="branch" name="branch" value={editedPatient.branch} onChange={handleInputChange}>
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
                                    <label htmlFor="birth_date">{t("birth_date")}</label>
                                    <input
                                        type="date"
                                        id="birth_date"
                                        name="birth_date"
                                        value={editedPatient.birth_date || ""}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="height">{t("height")} (cm)</label>
                                    <input
                                        type="number"
                                        id="height"
                                        name="height"
                                        value={editedPatient.height || ""}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="weight">{t("weight")} (kg)</label>
                                    <input
                                        type="number"
                                        id="weight"
                                        name="weight"
                                        value={editedPatient.weight || ""}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="blood_type">{t("blood_type")}</label>
                                <select
                                    id="blood_type"
                                    name="blood_type"
                                    value={editedPatient.blood_type || ""}
                                    onChange={handleInputChange}
                                >
                                    <option value="">{t("select_blood_type")}</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                                    <FaTimes /> {t("cancel")}
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleSaveChanges}>
                                    <FaSave /> {t("save_changes")}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="patient-info-card">
                                <h1 className="patient-details-title">{t("patient_details")}</h1>
                                <div className="patient-info-header">
                                    <div className="patient-avatar">
                                        <FaUser />
                                    </div>
                                    <div className="patient-basic-info">
                                        <h2 className="patient-name">{patient.full_name}</h2>
                                        <div className="patient-meta">
                                            <span className="patient-id">ID: {patient.id}</span>
                                            <span className={`patient-status ${patient.status}`}>
                                                {patient.status === "faol" ? t("active") : t("inactive")}
                                            </span>
                                        </div>
                                    </div>
                                    {hasPaymentAccess() && debtStats && (
                                        <div className="payment-summary-card">
                                            <h3 className="payment-summary-title">
                                                <FaCreditCard /> {t("debt_summary")}
                                            </h3>
                                                <div className="payment-summary-grid">
                                                    <div className="payment-item">
                                                        <span className="payment-label">{t("customer_name")}:</span>
                                                        <span className="payment-value">{debtStats?.customer_name}</span>
                                                    </div>
                                                    {paymentData.debtSummary && (
                                                        <>
                                                            <div className="payment-item">
                                                                <span className="payment-label">{t("total_service_amount")}:</span>
                                                                <span className="payment-value total">
                                                                    {formatCurrency(paymentData.debtSummary.total_service_amount)}
                                                                </span>
                                                            </div>
                                                            <div className="payment-item">
                                                                <span className="payment-label">{t("total_paid")}:</span>
                                                                <span className="payment-value paid">
                                                                    {formatCurrency(paymentData.debtSummary.total_amount_paid)}
                                                                </span>
                                                            </div>
                                                            <div className="payment-item">
                                                                <span className="payment-label">{t("total_discount")}:</span>
                                                                <span className="payment-value discount">
                                                                    {formatCurrency(paymentData.debtSummary.total_discount)}
                                                                </span>
                                                            </div>
                                                            <div className="payment-item debt">
                                                                <span className="payment-label">{t("remaining_debt")}:</span>
                                                                <span className="payment-value debt-amount">
                                                                    {formatCurrency(paymentData.debtSummary.total_debt)}
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                        </div>
                                    )}
                                </div>

                                <div className="patient-info-body">
                                    <div className="info-section">
                                        <h3 className="section-title">{t("personal_information")}</h3>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <div className="info-label">
                                                    <FaUser /> {t("age")}
                                                </div>
                                                <div className="info-value">{patient.age}</div>
                                            </div>
                                            <div className="info-item">
                                                <div className="info-label">
                                                    <FaUser /> {t("gender")}
                                                </div>
                                                <div className="info-value">{t(patient.gender)}</div>
                                            </div>
                                            <div className="info-item">
                                                <div className="info-label">
                                                    <FaPhone /> {t("phone")}
                                                </div>
                                                <div className="info-value">{patient.phone_number}</div>
                                            </div>
                                            <div className="info-item">
                                                <div className="info-label">
                                                    <FaEnvelope /> {t("passport_id")}
                                                </div>
                                                <div className="info-value">{patient.passport_id || "-"}</div>
                                            </div>
                                            <div className="info-item">
                                                <div className="info-label">
                                                    <FaMapMarkerAlt /> {t("address")}
                                                </div>
                                                <div className="info-value">{patient.location || "-"}</div>
                                            </div>
                                            <div className="info-item">
                                                <div className="info-label">
                                                    <FaClinicMedical /> {t("branch")}
                                                </div>
                                                <div className="info-value">{getBranchName(patient.branch)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="info-section">
                                        <h3 className="section-title">{t("medical_information")}</h3>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <div className="info-label">
                                                    <FaRulerVertical /> {t("height")}
                                                </div>
                                                <div className="info-value">{patient.height ? `${patient.height} cm` : "-"}</div>
                                            </div>
                                            <div className="info-item">
                                                <div className="info-label">
                                                    <FaWeight /> {t("weight")}
                                                </div>
                                                <div className="info-value">{patient.weight ? `${patient.weight} kg` : "-"}</div>
                                            </div>
                                            <div className="info-item">
                                                <div className="info-label">
                                                    <FaTint /> {t("blood_type")}
                                                </div>
                                                <div className="info-value">{patient.blood_type || "-"}</div>
                                            </div>
                                            <div className="info-item">
                                                <div className="info-label">
                                                    <FaBirthdayCake /> {t("birth_date")}
                                                </div>
                                                <div className="info-value">{patient.birth_date ? formatDate(patient.birth_date) : "-"}</div>
                                            </div>
                                            <div className="info-item">
                                                <div className="info-label">
                                                    <FaStethoscope /> {t("diagnosis")}
                                                </div>
                                                <div className="info-value">{patient.last_hospitalization_info?.diagnosis || "-"}</div>
                                            </div>
                                            <div className="info-item">
                                                <div className="info-label">
                                                    <FaUserMd /> {t("doctor")}
                                                </div>
                                                <div className="info-value">{patient.last_hospitalization_info?.doctor || "-"}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="info-section">
                                        <h3 className="section-title">{t("registration_information")}</h3>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <div className="info-label">
                                                    <FaCalendarAlt /> {t("created_at")}
                                                </div>
                                                <div className="info-value">{formatDate(patient.created_at)}</div>
                                            </div>
                                            <div className="info-item">
                                                <div className="info-label">
                                                    <FaCalendarAlt /> {t("updated_at")}
                                                </div>
                                                <div className="info-value">{formatDate(patient.updated_at)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {hasPaymentAccess() && debtStats && debtStats.debts && debtStats.debts.length > 0 && (
                                <div className="debt-details-section">
                                    <h3 className="section-title">
                                        <FaCreditCard /> {t("debt_details")}
                                    </h3>
                                    <div className="debt-cards-grid">
                                        {debtStats.debts.map((debt, index) => (
                                            <div key={debt.meeting_id || index} className="debt-card">
                                                <div className="debt-card-header">
                                                    <h4 className="meeting-date">
                                                        <FaCalendarAlt /> {formatDate(debt.meeting_date)}
                                                    </h4>
                                                    <span className="meeting-id">#{debt.meeting_id}</span>
                                                </div>

                                                <div className="debt-amounts-grid">
                                                    <div className="amount-item">
                                                        <span className="amount-label">{t("service_amount")}:</span>
                                                        <span className="amount-value total">
                                                            {formatCurrency(debt.total_service_amount)}
                                                        </span>
                                                    </div>
                                                    <div className="amount-item">
                                                        <span className="amount-label">{t("amount_paid")}:</span>
                                                        <span className="amount-value paid">
                                                            {formatCurrency(debt.amount_paid)}
                                                        </span>
                                                    </div>
                                                    <div className="amount-item">
                                                        <span className="amount-label">{t("discount")}:</span>
                                                        <span className="amount-value discount">
                                                            {formatCurrency(debt.discount)}
                                                        </span>
                                                    </div>
                                                    <div className="amount-item debt-highlight">
                                                        <span className="amount-label">{t("remaining_debt")}:</span>
                                                        <span className="amount-value debt">
                                                            {formatCurrency(debt.debt)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {debt.debt_comments && debt.debt_comments.length > 0 && (
                                                    <div className="debt-comments-section">
                                                        <h5 className="comments-title">
                                                            <FaCommentDots /> {t("payment_history")}
                                                        </h5>
                                                        <div className="comments-list">
                                                            {debt.debt_comments.map((comment) => (
                                                                <div key={comment.id} className="comment-item">
                                                                    <div className="comment-details">
                                                                        <div className="comment-amounts">
                                                                            <span className="comment-amount paid">
                                                                                {t("paid")}: {formatCurrency(comment.amount_paid)}
                                                                            </span>
                                                                            {comment.discount > 0 && (
                                                                                <span className="comment-amount discount">
                                                                                    {t("discount")}: {formatCurrency(comment.discount)}
                                                                                </span>
                                                                            )}
                                                                            {comment.discount_procent > 0 && (
                                                                                <span className="comment-amount discount">
                                                                                    {t("discount_percent")}: {comment.discount_procent}%
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {comment.comment && <p className="comment-text">{comment.comment}</p>}
                                                                    </div>
                                                                    <div className="comment-meta">
                                                                        <span className="comment-date">
                                                                            <FaClock /> {formatDateTime(comment.updated_at)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Patient Appointments Section */}
                            <div className="patient-appointments-section">
                                <h3 className="section-title">
                                    <FaCalendarCheck /> {t("appointments")}
                                </h3>

                                {appointmentsLoading ? (
                                    <div className="loading-container">
                                        <div className="loading-spinner"></div>
                                        <p>{t("loading_appointments")}...</p>
                                    </div>
                                ) : appointmentsError ? (
                                    <div className="error-container">
                                        <FaExclamationTriangle className="error-icon" />
                                        <p>{appointmentsError}</p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => {
                                                setAppointmentsLoading(true)
                                                setAppointmentsError(null)
                                                apiPatientDetailReception
                                                    .fetchPatientAppointments(id, appointmentsCurrentPage + 1, appointmentsItemsPerPage)
                                                    .then((data) => {
                                                        setAppointments(data.results || [])
                                                        setAppointmentsTotalCount(data.count || 0)
                                                        setAppointmentsLoading(false)
                                                    })
                                                    .catch((err) => {
                                                        console.error("Error fetching patient appointments:", err)
                                                        setAppointmentsError(err.message || t("error_fetching_appointments"))
                                                        setAppointmentsLoading(false)
                                                    })
                                            }}
                                        >
                                            {t("try_again")}
                                        </button>
                                    </div>
                                ) : appointments.length === 0 ? (
                                    <div className="no-appointments">
                                        <p>{t("no_appointments_found")}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="appointments-grid">
                                            {appointments.map((appointment) => (
                                                <div
                                                    key={appointment.id}
                                                    className={`appointment-card ${appointment.status}`}
                                                    onClick={() => handleAppointmentClick(appointment.id)}
                                                >
                                                    <div className="appointment-card-header">
                                                        <div className={getStatusBadgeClass(appointment.status)}>
                                                            {getStatusIcon(appointment.status)} {translateStatus(appointment.status)}
                                                        </div>
                                                        <div className="appointment-id">
                                                            <FaIdCard /> ID: {appointment.id}
                                                        </div>
                                                    </div>

                                                    <div className="appointment-card-body">
                                                        <div className="appointment-info-item">
                                                            <div className="appointment-info-label">
                                                                <FaCalendarCheck /> {t("date")}:
                                                            </div>
                                                            <div className="appointment-info-value">{formatDate(appointment.date)}</div>
                                                        </div>

                                                        <div className="appointment-info-item">
                                                            <div className="appointment-info-label">
                                                                <FaRegClock /> {t("time")}:
                                                            </div>
                                                            <div className="appointment-info-value">{formatTime(appointment.date)}</div>
                                                        </div>

                                                        <div className="appointment-info-item">
                                                            <div className="appointment-info-label">
                                                                <FaUserMd /> {t("doctor")}:
                                                            </div>
                                                            <div className="appointment-info-value">{appointment.doctor_name}</div>
                                                        </div>

                                                        <div className="appointment-info-item">
                                                            <div className="appointment-info-label">
                                                                <FaHospital /> {t("branch")}:
                                                            </div>
                                                            <div className="appointment-info-value">{getBranchName(appointment.branch)}</div>
                                                        </div>

                                                        <div className="appointment-info-item">
                                                            <div className="appointment-info-label">
                                                                <FaDoorOpen /> {t("room")}:
                                                            </div>
                                                            <div className="appointment-info-value">{appointment.room_name}</div>
                                                        </div>

                                                        <div className="appointment-info-item">
                                                            <div className="appointment-info-label">
                                                                <FaMoneyBillWave /> {t("payment")}:
                                                            </div>
                                                            <div className="appointment-info-value">
                                                                {appointment.payment_amount} {t("currency")}
                                                            </div>
                                                        </div>

                                                        {appointment.comment && (
                                                            <div className="appointment-info-item appointment-comment">
                                                                <div className="appointment-info-label">
                                                                    <FaCommentMedical /> {t("comment")}:
                                                                </div>
                                                                <div className="appointment-info-value">{appointment.comment}</div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="appointment-card-footer">
                                                        <span className="view-details">
                                                            {t("view_details")} <FaExternalLinkAlt />
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination for appointments */}
                                        <Pagination
                                            pageCount={Math.ceil(appointmentsTotalCount / appointmentsItemsPerPage)}
                                            currentPage={appointmentsCurrentPage}
                                            onPageChange={handleAppointmentPageChange}
                                            itemsPerPage={appointmentsItemsPerPage}
                                            totalItems={appointmentsTotalCount}
                                            onItemsPerPageChange={handleAppointmentsItemsPerPageChange}
                                        />
                                    </>
                                )}
                            </div>

                            <div className="patient-medicines-section">
                                <h3 className="section-title">
                                    <FaPills /> {t("medicine_purchases")}
                                </h3>

                                {medicinesLoading ? (
                                    <div className="loading-container">
                                        <div className="loading-spinner"></div>
                                        <p>{t("loading_medicines")}...</p>
                                    </div>
                                ) : medicinesError ? (
                                    <div className="error-container">
                                        <FaExclamationTriangle className="error-icon" />
                                        <p>{medicinesError}</p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => {
                                                setMedicinesLoading(true)
                                                setMedicinesError(null)
                                                apiCustomerMedicine
                                                    .fetchCustomerMedicine(id, medicinesCurrentPage + 1, medicinesItemsPerPage)
                                                    .then((data) => {
                                                        setMedicines(data.results || [])
                                                        setMedicinesTotalCount(data.count || 0)
                                                        setMedicinesLoading(false)
                                                    })
                                                    .catch((err) => {
                                                        console.error("Error fetching patient medicines:", err)
                                                        setMedicinesError(err.message || t("error_fetching_medicines"))
                                                        setMedicinesLoading(false)
                                                    })
                                            }}
                                        >
                                            {t("try_again")}
                                        </button>
                                    </div>
                                ) : medicines.length === 0 ? (
                                    <div className="no-medicines">
                                        <FaPills className="no-data-icon" />
                                        <p>{t("no_medicines_found")}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="medicines-grid">
                                            {medicines.map((medicine) => (
                                                <div key={medicine.id} className="medicine-card">
                                                    <div className="medicine-card-header">
                                                        <div className="medicine-id">
                                                            <FaHashtag /> ID: {medicine.id}
                                                        </div>
                                                        <div className="medicine-date">
                                                            <FaCalendarAlt /> {formatDate(medicine.created_at)}
                                                        </div>
                                                    </div>

                                                    <div className="medicine-card-body">
                                                        <div className="medicine-info-grid">
                                                            <div className="medicine-info-item">
                                                                <div className="medicine-info-label">
                                                                    <FaPills /> {t("medicine_id")}:
                                                                </div>
                                                                <div className="medicine-info-value">#{medicine.medicine}</div>
                                                            </div>

                                                            <div className="medicine-info-item">
                                                                <div className="medicine-info-label">
                                                                    <FaHashtag /> {t("quantity")}:
                                                                </div>
                                                                <div className="medicine-info-value">{medicine.quantity}</div>
                                                            </div>

                                                            <div className="medicine-info-item">
                                                                <div className="medicine-info-label">
                                                                    <FaMoneyBillWave /> {t("unit_price")}:
                                                                </div>
                                                                <div className="medicine-info-value">
                                                                    {formatCurrency(medicine.unit_price)}
                                                                </div>
                                                            </div>

                                                            <div className="medicine-info-item">
                                                                <div className="medicine-info-label">
                                                                    <FaCalculator /> {t("total_price")}:
                                                                </div>
                                                                <div className="medicine-info-value total-price">
                                                                    {formatCurrency(medicine.total_price)}
                                                                </div>
                                                            </div>

                                                            {medicine.discount_amount > 0 && (
                                                                <div className="medicine-info-item">
                                                                    <div className="medicine-info-label">
                                                                        <FaPercent /> {t("discount_amount")}:
                                                                    </div>
                                                                    <div className="medicine-info-value discount">
                                                                        {formatCurrency(medicine.discount_amount)}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {medicine.discount_percent > 0 && (
                                                                <div className="medicine-info-item">
                                                                    <div className="medicine-info-label">
                                                                        <FaPercent /> {t("discount_percent")}:
                                                                    </div>
                                                                    <div className="medicine-info-value discount">{medicine.discount_percent}%</div>
                                                                </div>
                                                            )}

                                                            <div className="medicine-info-item final-price">
                                                                <div className="medicine-info-label">
                                                                    <FaCreditCard /> {t("final_price")}:
                                                                </div>
                                                                <div className="medicine-info-value final-price-value">
                                                                    {formatCurrency(medicine.final_price)}
                                                                </div>
                                                            </div>

                                                            <div className="medicine-info-item">
                                                                <div className="medicine-info-label">
                                                                    <FaReceipt /> {t("sale_type")}:
                                                                </div>
                                                                <div className="medicine-info-value">{formatSaleType(medicine.sale_type)}</div>
                                                            </div>

                                                            {medicine.prescription_number && (
                                                                <div className="medicine-info-item">
                                                                    <div className="medicine-info-label">
                                                                        <FaNotesMedical /> {t("prescription_number")}:
                                                                    </div>
                                                                    <div className="medicine-info-value">{medicine.prescription_number}</div>
                                                                </div>
                                                            )}

                                                            <div className="medicine-info-item">
                                                                <div className="medicine-info-label">
                                                                    <FaUserMd /> {t("doctor_id")}:
                                                                </div>
                                                                <div className="medicine-info-value">#{medicine.doctor}</div>
                                                            </div>

                                                            <div className="medicine-info-item">
                                                                <div className="medicine-info-label">
                                                                    <FaUser /> {t("sold_by")}:
                                                                </div>
                                                                <div className="medicine-info-value">#{medicine.sold_by}</div>
                                                            </div>
                                                        </div>

                                                        {medicine.notes && (
                                                            <div className="medicine-notes">
                                                                <div className="medicine-notes-label">
                                                                    <FaCommentMedical /> {t("notes")}:
                                                                </div>
                                                                <div className="medicine-notes-value">{medicine.notes}</div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="medicine-card-footer">
                                                        <span className="medicine-updated">
                                                            <FaClock /> {t("updated")}: {formatDateTime(medicine.updated_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination for medicines */}
                                        <Pagination
                                            pageCount={Math.ceil(medicinesTotalCount / medicinesItemsPerPage)}
                                            currentPage={medicinesCurrentPage}
                                            onPageChange={handleMedicinePageChange}
                                            itemsPerPage={medicinesItemsPerPage}
                                            totalItems={medicinesTotalCount}
                                            onItemsPerPageChange={handleMedicinesItemsPerPageChange}
                                        />
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {showPaymentHistoryModal && (
                <div className="modal-overlay" onClick={() => setShowPaymentHistoryModal(false)}>
                    <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <FaEye /> {t("payment_history")} - {patient?.full_name}
                            </h2>
                            <button className="modal-close" onClick={() => setShowPaymentHistoryModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            {paymentLoading ? (
                                <div className="loading-state">
                                    <FaSpinner className="spinner" />
                                    <p>{t("loading_payment_data")}</p>
                                </div>
                            ) : paymentError ? (
                                <div className="error-state">
                                    <FaExclamationTriangle />
                                    <p>{paymentError}</p>
                                </div>
                            ) : (
                                <>
                                    {paymentData.debtSummary && (
                                        <div className="payment-summary-section">
                                            <h3>{t("payment_summary")}</h3>
                                            <div className="summary-grid">
                                                <div className="summary-item">
                                                    <span className="label">{t("total_service_amount")}:</span>
                                                    <span className="value total">
                                                        {formatCurrency(paymentData.debtSummary.total_service_amount)}
                                                    </span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="label">{t("total_paid")}:</span>
                                                    <span className="value paid">
                                                        {formatCurrency(paymentData.debtSummary.total_amount_paid)}
                                                    </span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="label">{t("total_discount")}:</span>
                                                    <span className="value discount">
                                                        {formatCurrency(paymentData.debtSummary.total_discount)}
                                                    </span>
                                                </div>
                                                <div className="summary-item debt">
                                                    <span className="label">{t("remaining_debt")}:</span>
                                                    <span className="value debt-amount">
                                                        {formatCurrency(paymentData.debtSummary.total_debt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="payment-history-section">
                                        <h3>{t("payment_history_by_meetings")}</h3>
                                        {paymentData.debtStats && paymentData.debtStats.length > 0 ? (
                                            <div className="payment-history-cards">
                                                {paymentData.debtStats.map((debt, index) => (
                                                    <div key={debt.meeting_id || index} className="debt-card">
                                                        <div className="debt-card-header">
                                                            <h4 className="meeting-date">
                                                                <FaCalendarAlt /> {formatDate(debt.meeting_date)}
                                                            </h4>
                                                            <span className="meeting-id">#{debt.meeting_id}</span>
                                                        </div>

                                                        <div className="debt-amounts-grid">
                                                            <div className="amount-item">
                                                                <span className="amount-label">{t("service_amount")}:</span>
                                                                <span className="amount-value total">
                                                                    {formatCurrency(debt.total_service_amount)}
                                                                </span>
                                                            </div>
                                                            <div className="amount-item">
                                                                <span className="amount-label">{t("amount_paid")}:</span>
                                                                <span className="amount-value paid">
                                                                    {formatCurrency(debt.amount_paid)}
                                                                </span>
                                                            </div>
                                                            <div className="amount-item">
                                                                <span className="amount-label">{t("discount")}:</span>
                                                                <span className="amount-value discount">
                                                                    {formatCurrency(debt.discount)}
                                                                </span>
                                                            </div>
                                                            <div className="amount-item debt-highlight">
                                                                <span className="amount-label">{t("remaining_debt")}:</span>
                                                                <span className="amount-value debt">
                                                                    {formatCurrency(debt.debt)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {debt.debt_comments && debt.debt_comments.length > 0 && (
                                                            <div className="debt-comments-section">
                                                                <h5 className="comments-title">
                                                                    <FaCommentDots /> {t("payment_comments")}
                                                                </h5>
                                                                <div className="comments-list">
                                                                    {debt.debt_comments.map((comment) => (
                                                                        <div key={comment.id} className="comment-item">
                                                                            {comment.comment && <p className="comment-text">{comment.comment}</p>}
                                                                            <div className="comment-meta">
                                                                                <span className="comment-date">
                                                                                    <FaClock /> {formatDate(comment.updated_at)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="no-data">
                                                <p>{t("no_payment_history")}</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showPaymentModal && (
                <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
                    <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <FaPlus /> {t("add_payment")} - {patient?.full_name}
                            </h2>
                            <button className="modal-close" onClick={() => setShowPaymentModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handlePaymentSubmit} className="payment-form">
                                <div className="form-group">
                                    <label htmlFor="meeting_select">
                                        <FaCalendarAlt /> {t("select_meeting")}
                                    </label>
                                    <select
                                        id="meeting_select"
                                        value={selectedMeeting}
                                        onChange={(e) => setSelectedMeeting(e.target.value)}
                                        required
                                        className="meeting-select"
                                    >
                                        <option value="">{t("choose_meeting")}</option>
                                        {customerMeetings.map((meeting) => (
                                            <option key={meeting.meeting_id} value={meeting.meeting_id}>
                                                {new Date(meeting.meeting_date).toLocaleDateString()} --
                                                {formatCurrency(meeting.total_service_amount)} --
                                                {meeting.status === "expected"
                                                    ? t("expected")
                                                    : meeting.status === "finished"
                                                        ? t("finished")
                                                        : meeting.status === "cancelled"
                                                            ? t("cancelled")
                                                            : meeting.status}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="amount_paid">
                                            <FaMoneyBillWave /> {t("amount_paid")}
                                        </label>
                                        <input
                                            type="number"
                                            id="amount_paid"
                                            name="amount_paid"
                                            value={newPayment.amount_paid}
                                            onChange={handlePaymentInputChange}
                                            min="0"
                                            step="0.01"
                                            required
                                            placeholder={t("enter_amount_paid")}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="discount_amount">
                                            <FaCalculator /> {t("discount_amount")}
                                        </label>
                                        <input
                                            type="number"
                                            id="discount_amount"
                                            name="discount_amount"
                                            value={newPayment.discount_amount}
                                            onChange={handlePaymentInputChange}
                                            min="0"
                                            step="0.01"
                                            placeholder={t("enter_discount_amount")}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="discount_percentage">
                                            <FaPercent /> {t("discount_percentage")} (%)
                                        </label>
                                        <input
                                            type="number"
                                            id="discount_percentage"
                                            name="discount_percentage"
                                            value={newPayment.discount_percentage}
                                            onChange={handlePaymentInputChange}
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            placeholder={t("enter_discount_percentage")}
                                        />
                                    </div>
                                </div>

                                {(newPayment.discount_amount || newPayment.discount_percentage) && (
                                    <div className="discount-calculation">
                                        <p>
                                            <strong>
                                                {t("total_discount")}: {formatCurrency(calculateTotalDiscount())}
                                            </strong>
                                        </p>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label htmlFor="comment">
                                        <FaCommentMedical /> {t("comment")}
                                    </label>
                                    <textarea
                                        id="comment"
                                        name="comment"
                                        value={newPayment.comment}
                                        onChange={handlePaymentInputChange}
                                        rows="3"
                                        placeholder={t("enter_payment_comment")}
                                    />
                                </div>

                                {paymentError && (
                                    <div className="error-message">
                                        <FaExclamationTriangle />
                                        <span>{paymentError}</span>
                                    </div>
                                )}

                                <div className="form-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                                        <FaTimes /> {t("cancel")}
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={paymentLoading}>
                                        {paymentLoading ? (
                                            <>
                                                <FaSpinner className="spinner" /> {t("saving")}
                                            </>
                                        ) : (
                                            <>
                                                <FaSave /> {t("save_payment")}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title={successModalProps.title}
                message={successModalProps.message}
                autoClose={true}
                autoCloseTime={3000}
            />

            {/* Confirm Modal */}
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
        </div>
    )
}
