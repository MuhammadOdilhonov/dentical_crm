"use client"

import { useState, useEffect } from "react"
import {
    FaSearch,
    FaEdit,
    FaTrash,
    FaTimes,
    FaFilter,
    FaCalendarAlt,
    FaCalendarPlus,
    FaBuilding,
    FaClock,
    FaUserMd,
    FaUser,
    FaDoorOpen,
    FaTable,
    FaExclamationCircle,
    FaCalendarDay,
    FaEye,
    FaSpinner,
    FaNotesMedical,
    FaEllipsisV,
    FaCheck,
    FaSync,
    FaTooth,
    FaTicketAlt,
    FaFilePdf,
    FaPrint,
    FaMoneyBillWave,
} from "react-icons/fa"
import { useAuth } from "../../../contexts/AuthContext"
import { useLanguage } from "../../../contexts/LanguageContext"
import Pagination from "../../pagination/Pagination"
import apiAppointments from "../../../api/apiAppointments"
import apiCustomerDebts from "../../../api/apiCustomerDebts"

export default function ASchedule() {
    const { selectedBranch } = useAuth()
    const { t } = useLanguage()

    // State for appointments data
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [totalItems, setTotalItems] = useState(0)

    // State for pagination
    const [currentPage, setCurrentPage] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // State for search and filters
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("all")
    const [filterDate, setFilterDate] = useState("")
    const [filterDoctor, setFilterDoctor] = useState("all")
    const [filterBranch, setFilterBranch] = useState(selectedBranch)
    const [showFilters, setShowFilters] = useState(false)

    // State for sidebars
    const [showSidebar, setShowSidebar] = useState(false)
    const [showEditSidebar, setShowEditSidebar] = useState(false)
    const [showViewSidebar, setShowViewSidebar] = useState(false)
    const [currentAppointment, setCurrentAppointment] = useState(null)
    const [editLoading, setEditLoading] = useState(false)

    // State for new appointment
    const [newAppointment, setNewAppointment] = useState({
        branch: selectedBranch === "all" ? "" : selectedBranch,
        customer: "",
        doctor: "",
        room: "",
        date: "",
        time: "",
        status: "expected",
        comment: "",
    })

    // State for filter data
    const [filterData, setFilterData] = useState({
        branches: [],
        customers: [],
        doctors: [],
        cabinets: [],
    })

    // State for busy times
    const [busyTimes, setBusyTimes] = useState([])
    const [availableTimes, setAvailableTimes] = useState([])

    // State for form steps
    const [step, setStep] = useState(1)
    const [timeError, setTimeError] = useState("")

    // State for view mode
    const [currentView, setCurrentView] = useState("table")
    const [startDate, setStartDate] = useState(new Date())

    // State for time change modal
    const [showTimeChangeModal, setShowTimeChangeModal] = useState(false)
    const [timeChangeAppointment, setTimeChangeAppointment] = useState(null)
    const [newTime, setNewTime] = useState("")

    // State for ticket modal
    const [showTicketModal, setShowTicketModal] = useState(false)
    const [ticketData, setTicketData] = useState(null)
    const [ticketLoading, setTicketLoading] = useState(false)
    const [ticketPrinted, setTicketPrinted] = useState(false)

    // State for action modal
    const [showActionModal, setShowActionModal] = useState(false)
    const [selectedAppointmentForAction, setSelectedAppointmentForAction] = useState(null)

    // State for PDF and printing
    const [pdfLoading, setPdfLoading] = useState(false)
    const [printLoading, setPrintLoading] = useState(false)

    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [selectedAppointmentForPayment, setSelectedAppointmentForPayment] = useState(null)
    const [paymentFormData, setPaymentFormData] = useState({
        amount_paid: "",
        discount: "",
        discount_procent: "",
        comment: "",
    })
    const [paymentLoading, setPaymentLoading] = useState(false)

    // Load appointments when component mounts or when branch/filters change
    useEffect(() => {
        fetchAppointments()
    }, [currentPage, itemsPerPage, searchTerm]) // Faqat asosiy dependency'lar

    // Alohida useEffect filterlar uchun
    useEffect(() => {
        setCurrentPage(0) // Reset to first page when filters change
        fetchAppointments()
    }, [filterStatus, filterDate, filterDoctor, filterBranch, selectedBranch, refreshTrigger])

    // Load filter data when branch changes
    useEffect(() => {
        if (selectedBranch !== "all") {
            fetchFilterData(selectedBranch)
        } else if (filterBranch !== "all") {
            fetchFilterData(filterBranch)
        } else {
            fetchFilterData(1)
        }
    }, [selectedBranch, filterBranch])

    // Update available times when date, doctor, or room changes
    useEffect(() => {
        if (newAppointment.date && newAppointment.doctor && newAppointment.room) {
            fetchBusyTimes()
        }
    }, [newAppointment.date, newAppointment.doctor, newAppointment.room])

    // Fetch appointments from API
    const fetchAppointments = async () => {
        setLoading(true)
        try {
            const params = {
                page: currentPage + 1,
                page_size: itemsPerPage,
            }

            if (filterStatus !== "all") params.status = filterStatus
            if (filterDate) params.date = filterDate
            if (filterDoctor !== "all") params.doctor = filterDoctor
            if (selectedBranch === "all" && filterBranch !== "all") params.branch = filterBranch
            if (selectedBranch !== "all") params.branch = selectedBranch
            if (searchTerm) params.search = searchTerm

            const data = await apiAppointments.fetchAppointments(params)
            setAppointments(data.results || [])
            setTotalItems(data.count || 0)
            setError(null)
        } catch (err) {
            console.error("Qabullarni yuklashda xatolik:", err)
            setError("Qabullarni yuklashda xatolik yuz berdi")
            setAppointments([])
        } finally {
            setLoading(false)
        }
    }

    // Fetch a single appointment by ID
    const fetchAppointmentById = async (id) => {
        setEditLoading(true)
        try {
            const data = await apiAppointments.fetchAppointmentById(id)

            let formattedDate = ""
            let formattedTime = ""

            if (data.date) {
                try {
                    const dateObj = new Date(data.date)
                    if (!isNaN(dateObj.getTime())) {
                        formattedDate = dateObj.toISOString().split("T")[0]
                        formattedTime = dateObj.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })
                    }
                } catch (error) {
                    console.error("Error formatting date/time:", error)
                }
            }

            const appointmentData = {
                ...data,
                formattedDate,
                formattedTime,
            }

            setCurrentAppointment(appointmentData)
            return appointmentData
        } catch (err) {
            console.error("Qabulni yuklashda xatolik:", err)
            alert("Qabulni yuklashda xatolik yuz berdi")
            return null
        } finally {
            setEditLoading(false)
        }
    }

    // Fetch filter data
    const fetchFilterData = async (branchId) => {
        try {
            const data = await apiAppointments.fetchFilterData(branchId)
            setFilterData(data)
        } catch (err) {
            console.error("Filtr ma'lumotlarini yuklashda xatolik:", err)
        }
    }

    // Fetch busy times
    const fetchBusyTimes = async () => {
        try {
            const params = {
                branchId: newAppointment.branch,
                doctorId: newAppointment.doctor,
                cabinetId: newAppointment.room,
                date: newAppointment.date,
            }

            const busyTimesData = await apiAppointments.fetchBusyTimes(params)
            setBusyTimes(busyTimesData)
            generateTimeSlots(busyTimesData)
        } catch (err) {
            console.error("Band vaqtlarni yuklashda xatolik:", err)
        }
    }

    const handleRefreshData = () => setRefreshTrigger((prev) => prev + 1)

    // Generate time slots
    const generateTimeSlots = (busyTimesData = []) => {
        const slots = []
        const busyTimesList = busyTimesData.map((item) => item.time)

        for (let hour = 0; hour <= 23; hour++) {
            const formattedHour = hour.toString().padStart(2, "0")
            const timeSlot = `${formattedHour}:00`

            slots.push({
                time: timeSlot,
                isBooked: busyTimesList.includes(timeSlot),
            })
        }

        setAvailableTimes(slots)
    }

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
    }

    // Handle search submit
    const handleSearchSubmit = (e) => {
        e.preventDefault()
        fetchAppointments()
    }

    // Handle new appointment input change
    const handleNewAppointmentChange = (e) => {
        const { name, value } = e.target
        setTimeError("")

        setNewAppointment({
            ...newAppointment,
            [name]: value,
        })

        if (name === "branch") {
            setNewAppointment({
                ...newAppointment,
                branch: value,
                customer: "",
                doctor: "",
                room: "",
                date: "",
                time: "",
            })
            fetchFilterData(value)
        }
    }

    // Handle time selection
    const handleTimeSelect = (time) => {
        setTimeError("")
        setNewAppointment({
            ...newAppointment,
            time,
        })
    }

    // Handle edit appointment input change
    const handleEditAppointmentChange = async (e) => {
        const { name, value } = e.target
        setTimeError("")

        const updatedAppointment = {
            ...currentAppointment,
            [name]: value,
        }

        if (name === "branch") {
            updatedAppointment.customer = ""
            updatedAppointment.doctor = ""
            updatedAppointment.room = ""
            await fetchFilterData(value)
        }

        if (name === "doctor" || name === "room") {
            if (updatedAppointment.formattedDate && updatedAppointment.doctor && updatedAppointment.room) {
                const params = {
                    branchId: updatedAppointment.branch,
                    doctorId: updatedAppointment.doctor,
                    cabinetId: updatedAppointment.room,
                    date: updatedAppointment.formattedDate,
                }

                const busyTimesData = await apiAppointments.fetchBusyTimes(params)
                setBusyTimes(busyTimesData)
                generateTimeSlots(busyTimesData)
            }
        }

        if (name === "date") {
            updatedAppointment.time = ""
            updatedAppointment.formattedDate = value

            if (updatedAppointment.doctor && updatedAppointment.room) {
                const params = {
                    branchId: updatedAppointment.branch,
                    doctorId: updatedAppointment.doctor,
                    cabinetId: updatedAppointment.room,
                    date: value,
                }

                const busyTimesData = await apiAppointments.fetchBusyTimes(params)
                setBusyTimes(busyTimesData)
                generateTimeSlots(busyTimesData)
            }
        }

        setCurrentAppointment(updatedAppointment)
    }

    // Handle edit time selection
    const handleEditTimeSelect = (time) => {
        setTimeError("")
        setCurrentAppointment({
            ...currentAppointment,
            time: time,
        })
    }

    // Open time change modal
    const openTimeChangeModal = async (appointment) => {
        if (!appointment || !appointment.id) return

        try {
            const latestAppointmentData = await fetchAppointmentById(appointment.id)

            if (latestAppointmentData) {
                setTimeChangeAppointment(latestAppointmentData)
                setNewTime(latestAppointmentData.time || "")

                if (latestAppointmentData.formattedDate && latestAppointmentData.doctor && latestAppointmentData.room) {
                    const params = {
                        branchId: latestAppointmentData.branch,
                        doctorId: latestAppointmentData.doctor,
                        cabinetId: latestAppointmentData.room,
                        date: latestAppointmentData.formattedDate,
                    }

                    const busyTimesData = await apiAppointments.fetchBusyTimes(params)
                    setBusyTimes(busyTimesData)
                    generateTimeSlots(busyTimesData)
                }

                setShowTimeChangeModal(true)
            }
        } catch (error) {
            console.error("Error opening time change modal:", error)
            alert("Qabulni vaqtini o'zgartirishda xatolik yuz berdi")
        }
    }

    // Handle time selection in the time change modal
    const handleTimeChangeSelect = (time) => {
        setTimeError("")
        setNewTime(time)
    }

    // Save the time change
    const saveTimeChange = async () => {
        if (!timeChangeAppointment || !newTime) return

        try {
            const formattedDate = `${timeChangeAppointment.formattedDate}T${newTime}:00Z`

            const appointmentData = {
                branch: Number.parseInt(timeChangeAppointment.branch),
                customer: Number.parseInt(timeChangeAppointment.customer),
                doctor: Number.parseInt(timeChangeAppointment.doctor),
                room: Number.parseInt(timeChangeAppointment.room),
                full_date: formattedDate,
                status: timeChangeAppointment.status,
                comment: timeChangeAppointment.comment || "",
                diognosis: timeChangeAppointment.diognosis || "",
                payment_amount: timeChangeAppointment.payment_amount || "",
                organs: timeChangeAppointment.organs || {},
            }

            await apiAppointments.updateAppointment(timeChangeAppointment.id, appointmentData)
            fetchAppointments()
            closeTimeChangeModal()
            alert("Qabul vaqti muvaffaqiyatli o'zgartirildi")
        } catch (err) {
            console.error("Qabul vaqtini o'zgartirishda xatolik:", err)
            alert("Qabul vaqtini o'zgartirishda xatolik yuz berdi")
        }
    }

    // Close the time change modal
    const closeTimeChangeModal = () => {
        setShowTimeChangeModal(false)
        setTimeChangeAppointment(null)
        setNewTime("")
        setTimeError("")
    }

    // Open add sidebar
    const openAddSidebar = () => {
        setShowSidebar(true)
        setStep(1)
        setTimeError("")
        setNewAppointment({
            branch: selectedBranch === "all" ? "" : selectedBranch,
            customer: "",
            doctor: "",
            room: "",
            date: "",
            time: "",
            status: "expected",
            comment: "",
        })
    }

    // Close add sidebar
    const closeAddSidebar = () => {
        setShowSidebar(false)
        setStep(1)
        setTimeError("")
    }

    // Open view sidebar
    const openViewSidebar = (appointment) => {
        const appointmentCopy = { ...appointment }

        if (appointmentCopy.date) {
            try {
                const dateObj = new Date(appointmentCopy.date)
                if (!isNaN(dateObj.getTime())) {
                    appointmentCopy.formattedDate = dateObj.toLocaleDateString("uz-UZ", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })
                    appointmentCopy.formattedTime = dateObj.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })
                } else {
                    appointmentCopy.formattedDate = ""
                    appointmentCopy.formattedTime = ""
                }
            } catch (error) {
                console.error("Error formatting date/time:", error)
                appointmentCopy.formattedDate = ""
                appointmentCopy.formattedTime = ""
            }
        }

        setCurrentAppointment(appointmentCopy)
        setShowViewSidebar(true)
    }

    // Close view sidebar
    const closeViewSidebar = () => {
        setShowViewSidebar(false)
        setCurrentAppointment(null)
    }

    // Open edit sidebar
    const openEditSidebar = async (appointment) => {
        if (!appointment || !appointment.id) return

        setEditLoading(true)
        try {
            const latestAppointmentData = await fetchAppointmentById(appointment.id)

            if (latestAppointmentData) {
                setCurrentAppointment(latestAppointmentData)
                await fetchFilterData(latestAppointmentData.branch)

                if (latestAppointmentData.formattedDate && latestAppointmentData.doctor && latestAppointmentData.room) {
                    const params = {
                        branchId: latestAppointmentData.branch,
                        doctorId: latestAppointmentData.doctor,
                        cabinetId: latestAppointmentData.room,
                        date: latestAppointmentData.formattedDate,
                    }

                    const busyTimesData = await apiAppointments.fetchBusyTimes(params)
                    setBusyTimes(busyTimesData)
                    generateTimeSlots(busyTimesData)
                }

                setShowEditSidebar(true)
            }
        } catch (error) {
            console.error("Error opening edit sidebar:", error)
            alert("Qabulni tahrirlashda xatolik yuz berdi")
        } finally {
            setEditLoading(false)
        }
    }

    // Close edit sidebar
    const closeEditSidebar = () => {
        setShowEditSidebar(false)
        setTimeError("")
        setCurrentAppointment(null)
    }

    // Toggle filters
    const toggleFilters = () => {
        setShowFilters(!showFilters)
    }

    // Next step in appointment creation
    const nextStep = async () => {
        if (step === 5) {
            try {
                const params = {
                    branchId: newAppointment.branch,
                    doctorId: newAppointment.doctor,
                    cabinetId: newAppointment.room,
                    date: newAppointment.date,
                }

                const busyTimesData = await apiAppointments.checkAvailableTimes(params)
                setBusyTimes(busyTimesData)
                generateTimeSlots(busyTimesData)
                setStep(step + 1)
            } catch (error) {
                console.error("Band vaqtlarni yuklashda xatolik:", error)
                alert("Band vaqtlarni yuklashda xatolik yuz berdi")
            }
        } else {
            setStep(step + 1)
        }
    }

    // Previous step in appointment creation
    const prevStep = () => {
        setStep(step - 1)
    }

    // Add new appointment
    const addAppointment = async (e) => {
        e.preventDefault()

        try {
            const formattedDate = `${newAppointment.date}T${newAppointment.time}:00Z`

            const appointmentData = {
                branch: Number.parseInt(newAppointment.branch),
                customer: Number.parseInt(newAppointment.customer),
                doctor: Number.parseInt(newAppointment.doctor),
                room: Number.parseInt(newAppointment.room),
                full_date: formattedDate,
                status: newAppointment.status,
                comment: newAppointment.comment,
                organs: {},
            }

            await apiAppointments.createAppointment(appointmentData)
            fetchAppointments()
            closeAddSidebar()
        } catch (err) {
            console.error("Qabul yaratishda xatolik:", err)
            alert("Qabul yaratishda xatolik yuz berdi")
        }
    }

    // Update appointment
    const updateAppointment = async (e) => {
        e.preventDefault()

        try {
            let date = ""
            let time = ""

            if (currentAppointment.formattedDate) {
                date = currentAppointment.formattedDate
            } else if (currentAppointment.date) {
                if (typeof currentAppointment.date === "string" && currentAppointment.date.includes("T")) {
                    date = currentAppointment.date.split("T")[0]
                } else {
                    date = new Date(currentAppointment.date).toISOString().split("T")[0]
                }
            } else {
                date = new Date().toISOString().split("T")[0]
            }

            if (currentAppointment.time) {
                time = currentAppointment.time
            } else if (currentAppointment.formattedTime) {
                time = currentAppointment.formattedTime
            } else if (
                currentAppointment.date &&
                typeof currentAppointment.date === "string" &&
                currentAppointment.date.includes("T")
            ) {
                const timePart = currentAppointment.date.split("T")[1]
                if (timePart && timePart.length >= 5) {
                    time = timePart.substring(0, 5)
                } else {
                    time = "00:00"
                }
            } else {
                time = "00:00"
            }

            const formattedDate = `${date}T${time}:00Z`

            const appointmentData = {
                branch: Number.parseInt(currentAppointment.branch),
                customer: Number.parseInt(currentAppointment.customer),
                doctor: Number.parseInt(currentAppointment.doctor),
                room: Number.parseInt(currentAppointment.room),
                full_date: formattedDate,
                status: currentAppointment.status,
                comment: currentAppointment.comment || "",
                diognosis: currentAppointment.diognosis || "",
                payment_amount: currentAppointment.payment_amount || "",
                organs: currentAppointment.organs || {},
            }

            await apiAppointments.updateAppointment(currentAppointment.id, appointmentData)
            fetchAppointments()
            closeEditSidebar()
        } catch (err) {
            console.error("Qabulni yangilashda xatolik:", err)
            alert("Qabulni yangilashda xatolik yuz berdi")
        }
    }

    // Delete appointment
    const deleteAppointment = async (id) => {
        if (window.confirm(t("confirm_delete_appointment"))) {
            try {
                await apiAppointments.deleteAppointment(id)
                fetchAppointments()
            } catch (err) {
                console.error("Qabulni o'chirishda xatolik:", err)
                alert("Qabulni o'chirishda xatolik yuz berdi")
            }
        }
    }

    // Handle status change
    const handleStatusChange = async (id, status) => {
        try {
            await apiAppointments.updateAppointmentStatus(id, status)
            const statusText = status === "accepted" ? t("accepted") : t("cancelled")
            alert(`${t("appointment_status_updated_to")} ${statusText}`)
            fetchAppointments()
        } catch (err) {
            console.error("Qabul holatini yangilashda xatolik:", err)
            alert("Qabul holatini yangilashda xatolik yuz berdi")
        }
    }

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page)
        // setTimeout ni olib tashlash
    }

    // Handle items per page change
    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage)
        setCurrentPage(0)
        // setTimeout ni olib tashlash
    }

    // Get week dates for calendar view
    const getWeekDates = () => {
        const dates = []
        const startOfWeek = new Date(startDate)
        startOfWeek.setDate(startDate.getDate() - startDate.getDay())

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek)
            date.setDate(startOfWeek.getDate() + i)
            dates.push(date)
        }

        return dates
    }

    // Format date for display
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return ""

        let date
        if (typeof dateString === "string" && dateString.includes("T")) {
            date = new Date(dateString)
        } else {
            date = new Date(dateString)
        }

        return date.toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" })
    }

    // Format time for display
    const formatTimeForDisplay = (dateString) => {
        if (!dateString) return ""

        let date
        try {
            if (typeof dateString === "string" && dateString.includes("T")) {
                date = new Date(dateString)
            } else {
                date = new Date(dateString)
            }
            return date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })
        } catch (error) {
            console.error("Error formatting time:", error)
            return ""
        }
    }

    // Set view to today
    const goToToday = () => {
        setStartDate(new Date())
    }

    // Get branch name by ID
    const getBranchName = (branchId) => {
        const branch = filterData.branches.find((b) => b.id === branchId)
        return branch ? branch.name : branchId
    }

    // Get status translation
    const getStatusTranslation = (status) => {
        switch (status) {
            case "expected":
                return t("expected")
            case "accepted":
                return t("accepted")
            case "progress":
                return t("progress")
            case "finished":
                return t("finished")
            case "cancelled":
                return t("cancelled")
            default:
                return status
        }
    }

    // Handle print ticket
    const handlePrintTicket = async (id) => {
        try {
            setTicketLoading(true)
            const data = await apiAppointments.fetchAppointmentTalon(id)
            setTicketData(data)
            setShowTicketModal(true)
            setTicketLoading(false)
        } catch (error) {
            console.error("Talon chiqarishda xatolik:", error)
            alert("Talon chiqarishda xatolik yuz berdi")
            setTicketLoading(false)
        }
    }

    // Close ticket modal
    const closeTicketModal = () => {
        setShowTicketModal(false)
        setTicketData(null)
        setTicketPrinted(false)
    }

    // Simulate printing
    const simulatePrinting = async () => {
        try {
            setPrintLoading(true)
            await apiAppointments.printDocument(ticketData, "talon")
            setTicketPrinted(true)
            setPrintLoading(false)
        } catch (error) {
            console.error("Chiqarishda xatolik:", error)
            alert(error.message || "Chiqarishda xatolik yuz berdi")
            setPrintLoading(false)
        }
    }

    // Open action modal
    const openActionModal = (appointment) => {
        setSelectedAppointmentForAction(appointment)
        setShowActionModal(true)
    }

    // Close action modal
    const closeActionModal = () => {
        setShowActionModal(false)
        setSelectedAppointmentForAction(null)
    }

    // Handle PDF export
    const handleExportPDF = async (id) => {
        try {
            setPdfLoading(true)
            const pdfBlob = await apiAppointments.exportAppointmentPDF(id)

            const url = window.URL.createObjectURL(pdfBlob)
            const link = document.createElement("a")
            link.href = url
            link.download = `qabul-${id}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            setPdfLoading(false)
            alert("PDF muvaffaqiyatli yuklab olindi")
        } catch (error) {
            console.error("PDF eksport qilishda xatolik:", error)
            alert("PDF eksport qilishda xatolik yuz berdi")
            setPdfLoading(false)
        }
    }

    const openPaymentModal = (appointment) => {
        setSelectedAppointmentForPayment(appointment)
        setPaymentFormData({
            amount_paid: "",
            discount: "",
            discount_procent: "",
            comment: "",
        })
        setShowPaymentModal(true)
    }

    const closePaymentModal = () => {
        setShowPaymentModal(false)
        setSelectedAppointmentForPayment(null)
        setPaymentFormData({
            amount_paid: "",
            discount: "",
            discount_procent: "",
            comment: "",
        })
    }

    const handlePaymentFormChange = (e) => {
        const { name, value } = e.target
        setPaymentFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handlePaymentSubmit = async (e) => {
        e.preventDefault()
        if (!selectedAppointmentForPayment) return

        try {
            setPaymentLoading(true)

            const paymentData = {
                customer: selectedAppointmentForPayment.customer,
                meeting: selectedAppointmentForPayment.id,
                amount_paid: Number(paymentFormData.amount_paid),
                discount: Number(paymentFormData.discount),
                discount_procent: Number(paymentFormData.discount_procent),
                comment: paymentFormData.comment,
            }

            await apiCustomerDebts.createCustomerDebt(paymentData)

            alert(t("payment_recorded_successfully"))
            closePaymentModal()
            fetchAppointments()
        } catch (error) {
            console.error("Error recording payment:", error)
            alert(t("error_recording_payment"))
        } finally {
            setPaymentLoading(false)
        }
    }

    // Render step content
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <h3 className="step-title">
                            {t("step")} 1: {t("select_branch_and_patient")}
                        </h3>

                        {selectedBranch === "all" && (
                            <div className="appointments-form-group">
                                <label>{t("branch")}</label>
                                <div className="input-icon-wrapper">
                                    <FaBuilding className="input-icon" />
                                    <select name="branch" value={newAppointment.branch} onChange={handleNewAppointmentChange} required>
                                        <option value="">{t("select_branch")}</option>
                                        {filterData.branches &&
                                            filterData.branches.map((branch) => (
                                                <option key={branch.id} value={branch.id}>
                                                    {branch.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="appointments-form-group">
                            <label>{t("patient")}</label>
                            <div className="input-icon-wrapper">
                                <FaUser className="input-icon" />
                                <select name="customer" value={newAppointment.customer} onChange={handleNewAppointmentChange} required>
                                    <option value="">{t("select_patient")}</option>
                                    {filterData.customers &&
                                        filterData.customers.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.full_name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="appointments-form-actions">
                            <button type="button" className="appointments-btn appointments-btn-secondary" onClick={closeAddSidebar}>
                                {t("cancel")}
                            </button>
                            <button
                                type="button"
                                className="appointments-btn appointments-btn-primary"
                                onClick={nextStep}
                                disabled={!newAppointment.branch || !newAppointment.customer}
                            >
                                {t("next")}
                            </button>
                        </div>
                    </>
                )
            case 2:
                return (
                    <>
                        <h3 className="step-title">
                            {t("step")} 2: {t("select_doctor")}
                        </h3>

                        <div className="appointments-form-group">
                            <label>{t("doctor")}</label>
                            <div className="input-icon-wrapper">
                                <FaUserMd className="input-icon" />
                                <select name="doctor" value={newAppointment.doctor} onChange={handleNewAppointmentChange} required>
                                    <option value="">{t("select_doctor")}</option>
                                    {filterData.doctors &&
                                        filterData.doctors.map((doctor) => (
                                            <option key={doctor.id} value={doctor.id}>
                                                {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="appointments-form-actions">
                            <button type="button" className="appointments-btn appointments-btn-secondary" onClick={prevStep}>
                                {t("back")}
                            </button>
                            <button
                                type="button"
                                className="appointments-btn appointments-btn-primary"
                                onClick={nextStep}
                                disabled={!newAppointment.doctor}
                            >
                                {t("next")}
                            </button>
                        </div>
                    </>
                )
            case 3:
                return (
                    <>
                        <h3 className="step-title">
                            {t("step")} 3: {t("select_room")}
                        </h3>

                        <div className="appointments-form-group">
                            <label>{t("room")}</label>
                            <div className="input-icon-wrapper">
                                <FaDoorOpen className="input-icon" />
                                <select name="room" value={newAppointment.room} onChange={handleNewAppointmentChange} required>
                                    <option value="">{t("select_room")}</option>
                                    {filterData.cabinets &&
                                        filterData.cabinets.map((cabinet) => (
                                            <option key={cabinet.id} value={cabinet.id}>
                                                {cabinet.name} - {cabinet.type}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="appointments-form-actions">
                            <button type="button" className="appointments-btn appointments-btn-secondary" onClick={prevStep}>
                                {t("back")}
                            </button>
                            <button
                                type="button"
                                className="appointments-btn appointments-btn-primary"
                                onClick={nextStep}
                                disabled={!newAppointment.room}
                            >
                                {t("next")}
                            </button>
                        </div>
                    </>
                )
            case 4:
                return (
                    <>
                        <h3 className="step-title">
                            {t("step")} 4: {t("select_date")}
                        </h3>

                        <div className="appointments-form-group">
                            <label>{t("date")}</label>
                            <div className="input-icon-wrapper">
                                <FaCalendarAlt className="input-icon" />
                                <input
                                    type="date"
                                    name="date"
                                    value={newAppointment.date}
                                    onChange={handleNewAppointmentChange}
                                    min={new Date().toISOString().split("T")[0]}
                                    required
                                />
                            </div>
                        </div>

                        <div className="appointments-form-actions">
                            <button type="button" className="appointments-btn appointments-btn-secondary" onClick={prevStep}>
                                {t("back")}
                            </button>
                            <button
                                type="button"
                                className="appointments-btn appointments-btn-primary"
                                onClick={nextStep}
                                disabled={!newAppointment.date}
                            >
                                {t("next")}
                            </button>
                        </div>
                    </>
                )
            case 5:
                return (
                    <>
                        <h3 className="step-title">
                            {t("step")} 5: {t("select_time")}
                        </h3>

                        <div className="appointments-form-group">
                            <label>{t("time")}</label>
                            {timeError && (
                                <div className="time-error">
                                    <FaExclamationCircle /> {timeError}
                                </div>
                            )}
                            <div className="time-slots-container">
                                {availableTimes.map((slot, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`time-slot ${slot.isBooked ? "booked" : ""} ${newAppointment.time === slot.time ? "selected" : ""}`}
                                        onClick={() => !slot.isBooked && handleTimeSelect(slot.time)}
                                        disabled={slot.isBooked}
                                    >
                                        <FaClock className="time-icon" />
                                        {slot.time}
                                    </button>
                                ))}
                                {availableTimes.length === 0 && (
                                    <div className="no-times-message">{t("please_select_date_and_room_first")}</div>
                                )}
                            </div>
                        </div>

                        <div className="appointments-form-actions">
                            <button type="button" className="appointments-btn appointments-btn-secondary" onClick={prevStep}>
                                {t("back")}
                            </button>
                            <button
                                type="button"
                                className="appointments-btn appointments-btn-primary"
                                onClick={nextStep}
                                disabled={!newAppointment.time}
                            >
                                {t("next")}
                            </button>
                        </div>
                    </>
                )
            case 6:
                return (
                    <>
                        <h3 className="step-title">
                            {t("step")} 6: {t("add_notes")}
                        </h3>

                        <div className="appointments-form-group">
                            <label>{t("notes")}</label>
                            <textarea
                                name="comment"
                                value={newAppointment.comment}
                                onChange={handleNewAppointmentChange}
                                rows={3}
                                placeholder={t("enter_notes")}
                            ></textarea>
                        </div>

                        <div className="appointments-form-actions">
                            <button type="button" className="appointments-btn appointments-btn-secondary" onClick={prevStep}>
                                {t("back")}
                            </button>
                            <button type="submit" className="appointments-btn appointments-btn-primary">
                                {t("add_appointment")}
                            </button>
                        </div>
                    </>
                )
            default:
                return null
        }
    }

    return (
        <div className="appointments-container">
            <div className="appointments-page-header">
                <h1 className="appointments-page-title">{t("schedule")}</h1>
                <div className="appointments-header-actions">
                    <button type="submit" className="xodim-btn xodim-btn-outline" onClick={handleRefreshData}>
                        <FaSync />
                    </button>
                    <button className="appointments-btn appointments-btn-primary appointments-btn-icon" onClick={openAddSidebar}>
                        <FaCalendarPlus /> {t("add_new_appointment")}
                    </button>
                </div>
            </div>

            <div className="appointments-filters-container">
                <div className="appointments-search-filter">
                    <form onSubmit={handleSearchSubmit} className="appointments-search-input">
                        <FaSearch className="appointments-search-icon" />
                        <input type="text" placeholder={t("search")} value={searchTerm} onChange={handleSearchChange} />
                    </form>
                    <button className={`appointments-filter-toggle-btn ${showFilters ? "active" : ""}`} onClick={toggleFilters}>
                        <FaFilter /> {t("filters")}
                    </button>
                </div>

                {showFilters && (
                    <div className="appointments-advanced-filters">
                        <div className="appointments-filter-group">
                            <label>{t("status")}:</label>
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="all">{t("all")}</option>
                                <option value="expected">{t("expected")}</option>
                                <option value="accepted">{t("accepted")}</option>
                                <option value="progress">{t("progress")}</option>
                                <option value="finished">{t("finished")}</option>
                                <option value="cancelled">{t("cancelled")}</option>
                            </select>
                        </div>

                        <div className="appointments-filter-group">
                            <label>{t("date")}:</label>
                            <div className="appointments-date-input">
                                <FaCalendarAlt className="appointments-calendar-icon" />
                                <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                            </div>
                        </div>

                        <div className="appointments-filter-group">
                            <label>{t("doctor")}:</label>
                            <select value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)}>
                                <option value="all">{t("all")}</option>
                                {filterData.doctors &&
                                    filterData.doctors.map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.first_name} {doctor.last_name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {selectedBranch === "all" && (
                            <div className="appointments-filter-group">
                                <label>{t("branch")}:</label>
                                <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
                                    <option value="all">{t("all")}</option>
                                    {filterData.branches &&
                                        filterData.branches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="appointments-view-controls">
                <button
                    className={`appointments-view-btn ${currentView === "table" ? "active" : ""}`}
                    onClick={() => setCurrentView("table")}
                >
                    <FaTable /> {t("table_view")}
                </button>
                <button
                    className={`appointments-view-btn ${currentView === "calendar" ? "active" : ""}`}
                    onClick={() => setCurrentView("calendar")}
                >
                    <FaCalendarAlt /> {t("calendar_view")}
                </button>
                {currentView === "calendar" && (
                    <button className="appointments-view-btn" onClick={goToToday}>
                        <FaCalendarDay /> {t("today")}
                    </button>
                )}
            </div>

            {currentView === "table" ? (
                <div className="appointments-dashboard-card">
                    <div className="appointments-table-responsive">
                        <table className="appointments-data-table">
                            <thead>
                                <tr>
                                    <th>{t("patient")}</th>
                                    <th>{t("doctor")}</th>
                                    <th>{t("room")}</th>
                                    <th>{t("date")}</th>
                                    <th>{t("time")}</th>
                                    <th>{t("status")}</th>
                                    {selectedBranch === "all" && <th>{t("branch")}</th>}
                                    <th>{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="appointments-loading">
                                            <FaSpinner className="appointments-spinner" /> {t("loading")}
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="8" className="appointments-error">
                                            <FaExclamationCircle className="appointments-error-icon" /> {error}
                                        </td>
                                    </tr>
                                ) : appointments.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="appointments-no-data">
                                            <FaExclamationCircle className="appointments-no-data-icon" /> {t("no_data_found")}
                                        </td>
                                    </tr>
                                ) : (
                                    appointments.map((appointment) => (
                                        <tr key={appointment.id} onClick={() => openViewSidebar(appointment)} style={{ cursor: "pointer" }}>
                                            <td>{appointment.customer_name}</td>
                                            <td>{appointment.doctor_name}</td>
                                            <td>{appointment.room_name}</td>
                                            <td>{formatDateForDisplay(appointment.date)}</td>
                                            <td>{appointment.time}</td>
                                            <td>
                                                <div className={`appointments-status-badge ${appointment.status}`}>
                                                    {getStatusTranslation(appointment.status)}
                                                </div>
                                                {appointment.late_minutes >= 5 && (
                                                    <div
                                                        className="appointments-status-badge cancelled"
                                                        title={`${t("patient_late")}: ${appointment.late_minutes} ${t("minutes_short")}`}
                                                        style={{ marginTop: 4 }}
                                                    >
                                                        ⏰ {t("patient_late")} {appointment.late_minutes} {t("minutes_short")}
                                                    </div>
                                                )}
                                            </td>
                                            {selectedBranch === "all" && (
                                                <td>
                                                    <div className="appointments-branch-badge">
                                                        <FaBuilding className="appointments-branch-icon" />
                                                        {getBranchName(appointment.branch)}
                                                    </div>
                                                </td>
                                            )}
                                            <td onClick={(e) => e.stopPropagation()}>
                                                {!appointment.arrived_at &&
                                                    (appointment.status === "expected" || appointment.status === "accepted") && (
                                                        <button
                                                            className="appointments-action-toggle"
                                                            title={t("patient_arrived") || "Bemor keldi"}
                                                            style={{ color: "#16a34a", marginRight: 6 }}
                                                            onClick={async () => {
                                                                try {
                                                                    await apiAppointments.markPatientArrived(appointment.id)
                                                                    fetchAppointments()
                                                                } catch (err) {
                                                                    alert(t("error_occurred"))
                                                                }
                                                            }}
                                                        >
                                                            ✓
                                                        </button>
                                                    )}
                                                <button className="appointments-action-toggle" onClick={() => openActionModal(appointment)}>
                                                    <FaEllipsisV />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        pageCount={Math.ceil(totalItems / itemsPerPage)}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        itemsPerPage={itemsPerPage}
                        totalItems={totalItems}
                        onItemsPerPageChange={handleItemsPerPageChange}
                    />
                </div>
            ) : (
                <div className="appointments-calendar-view">
                    <div className="appointments-calendar-header">
                        <div className="appointments-calendar-days">
                            {getWeekDates().map((date, index) => (
                                <div
                                    key={index}
                                    className={`appointments-calendar-day ${date.toDateString() === new Date().toDateString() ? "today" : ""
                                        }`}
                                >
                                    <div className="appointments-day-name">{date.toLocaleDateString("uz-UZ", { weekday: "short" })}</div>
                                    <div className="appointments-day-date">{date.getDate()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="appointments-calendar-body">
                        {getWeekDates().map((date, index) => {
                            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
                                date.getDate(),
                            ).padStart(2, "0")}`
                            const dayAppointments = appointments.filter(
                                (appointment) => appointment.date && appointment.date.startsWith(dateString),
                            )

                            return (
                                <div
                                    key={index}
                                    className={`appointments-calendar-column ${date.toDateString() === new Date().toDateString() ? "today" : ""
                                        }`}
                                >
                                    {dayAppointments.length > 0 ? (
                                        dayAppointments.map((appointment) => (
                                            <div
                                                key={appointment.id}
                                                className={`appointments-calendar-item ${appointment.status}`}
                                                onClick={() => openViewSidebar(appointment)}
                                            >
                                                <div className="appointments-calendar-time">{formatTimeForDisplay(appointment.date)}</div>
                                                <div className="appointments-calendar-patient">{appointment.customer_name}</div>
                                                <div className="appointments-calendar-doctor">{appointment.doctor_name}</div>
                                                <div className="appointments-calendar-room">{appointment.room_name}</div>
                                                <div className="appointments-calendar-status">
                                                    <span className={`appointments-status-badge ${appointment.status}`}>
                                                        {getStatusTranslation(appointment.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="appointments-no-appointments">
                                            <p>{t("no_appointments")}</p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Add Appointment Sidebar */}
            <div className={`appointments-sidebar-overlay ${showSidebar ? "active" : ""}`} onClick={closeAddSidebar}></div>
            <div className={`appointments-sidebar ${showSidebar ? "active" : ""}`}>
                <div className="appointments-sidebar-header">
                    <h2>{t("add_new_appointment")}</h2>
                    <button className="appointments-close-button" onClick={closeAddSidebar}>
                        <FaTimes />
                    </button>
                </div>
                <div className="appointments-sidebar-content">
                    <form onSubmit={addAppointment}>
                        <div className="step-indicator">
                            {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
                                <div
                                    key={stepNumber}
                                    className={`step ${step === stepNumber ? "active" : ""} ${step > stepNumber ? "completed" : ""}`}
                                >
                                    {stepNumber}
                                </div>
                            ))}
                        </div>
                        {renderStepContent()}
                    </form>
                </div>
            </div>

            {/* View Appointment Sidebar */}
            <div
                className={`appointments-sidebar-overlay ${showViewSidebar ? "active" : ""}`}
                onClick={closeViewSidebar}
            ></div>
            <div className={`appointments-sidebar ${showViewSidebar ? "active" : ""}`}>
                {currentAppointment && (
                    <>
                        <div className="appointments-sidebar-header">
                            <h2>{t("view_appointment")}</h2>
                            <button className="appointments-close-button" onClick={closeViewSidebar}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="appointments-sidebar-content">
                            <div className="appointment-view-card">
                                <div className={`appointment-status-indicator ${currentAppointment.status}`}>
                                    {getStatusTranslation(currentAppointment.status)}
                                </div>

                                <div className="appointment-view-header">
                                    <div className="appointment-view-avatar">
                                        <FaUser />
                                    </div>
                                    <div className="appointment-view-title">
                                        <h3>{currentAppointment.customer_name}</h3>
                                        <p className="appointment-view-subtitle">
                                            <FaCalendarAlt />
                                            {currentAppointment.formattedDate || formatDateForDisplay(currentAppointment.date)}
                                            <span className="appointment-time">
                                                <FaClock />
                                                {currentAppointment.formattedTime || formatTimeForDisplay(currentAppointment.date)}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="appointment-view-details">
                                    <div className="appointment-view-section">
                                        <h4>
                                            <FaUserMd />
                                            {t("doctor_information")}
                                        </h4>
                                        <div className="appointment-view-info">
                                            <span className="info-label">{t("doctor")}:</span>
                                            <span className="info-value">{currentAppointment.doctor_name}</span>
                                        </div>
                                        <div className="appointment-view-info">
                                            <span className="info-label">{t("specialization")}:</span>
                                            <span className="info-value">
                                                {currentAppointment.doctor_specialization || t("not_specified")}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="appointment-view-section">
                                        <h4>
                                            <FaBuilding />
                                            {t("location_information")}
                                        </h4>
                                        <div className="appointment-view-info">
                                            <span className="info-label">{t("branch")}:</span>
                                            <span className="info-value">{currentAppointment.branch_name}</span>
                                        </div>
                                        <div className="appointment-view-info">
                                            <span className="info-label">{t("room")}:</span>
                                            <span className="info-value">{currentAppointment.room_name}</span>
                                        </div>
                                    </div>

                                    <div className="appointment-view-section">
                                        <h4>
                                            <FaNotesMedical />
                                            {t("medical_information")}
                                        </h4>
                                        <div className="appointment-view-info">
                                            <span className="info-label">{t("diagnosis")}:</span>
                                            <span className="info-value">{currentAppointment.diognosis || t("no_diagnosis")}</span>
                                        </div>
                                        <div className="appointment-view-info">
                                            <span className="info-label">{t("notes")}:</span>
                                            <span className="info-value">{currentAppointment.comment || t("no_notes")}</span>
                                        </div>
                                    </div>

                                    {currentAppointment.dental_services_data && currentAppointment.dental_services_data.length > 0 && (
                                        <div className="appointment-view-section">
                                            <h4>
                                                <FaTooth />
                                                {t("dental_services")}
                                            </h4>
                                            <div className="dental-services-list">
                                                {currentAppointment.dental_services_data.map((service, index) => (
                                                    <div key={service.id} className="dental-service-item">
                                                        <div className="service-info">
                                                            <span className="service-name">{service.name}</span>
                                                            <span className="service-teeth">Tish #{service.teeth_number}</span>
                                                        </div>
                                                        <div className="service-details">
                                                            <span className="service-description">{service.description}</span>
                                                            <span className="service-amount">{service.amount} so'm</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="appointment-view-actions">
                                    <button
                                        type="button"
                                        className="appointments-btn appointments-btn-primary"
                                        onClick={() => {
                                            closeViewSidebar()
                                            openEditSidebar(currentAppointment)
                                        }}
                                    >
                                        <FaEdit /> {t("edit")}
                                    </button>

                                    {currentAppointment.status === "accepted" && (
                                        <button
                                            type="button"
                                            className="appointments-btn appointments-btn-secondary"
                                            onClick={() => handlePrintTicket(currentAppointment.id)}
                                            disabled={printLoading}
                                        >
                                            {printLoading ? <FaSpinner className="spinner" /> : <FaPrint />} {t("print_ticket")}
                                        </button>
                                    )}

                                    {currentAppointment.status === "finished" && (
                                        <>
                                            <button
                                                type="button"
                                                className="appointments-btn appointments-btn-secondary"
                                                onClick={() => handleExportPDF(currentAppointment.id)}
                                                disabled={pdfLoading}
                                            >
                                                {pdfLoading ? <FaSpinner className="spinner" /> : <FaFilePdf />} {t("export_pdf")}
                                            </button>

                                            <button
                                                className="appointments-btn appointments-btn-secondary"
                                                onClick={() => {
                                                    closeViewSidebar()
                                                    openPaymentModal(currentAppointment)
                                                }}
                                            >
                                                <FaMoneyBillWave /> {t("record_payment")}
                                            </button>
                                        </>
                                    )}

                                    <button
                                        type="button"
                                        className="appointments-btn appointments-btn-secondary"
                                        onClick={closeViewSidebar}
                                    >
                                        {t("close")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Edit Appointment Sidebar */}
            <div
                className={`appointments-sidebar-overlay ${showEditSidebar ? "active" : ""}`}
                onClick={closeEditSidebar}
            ></div>
            <div className={`appointments-sidebar ${showEditSidebar ? "active" : ""}`}>
                {editLoading ? (
                    <div className="appointments-loading-container">
                        <FaSpinner className="appointments-spinner" /> {t("loading")}
                    </div>
                ) : currentAppointment ? (
                    <>
                        <div className="appointments-sidebar-header">
                            <h2>{t("edit_appointment")}</h2>
                            <button className="appointments-close-button" onClick={closeEditSidebar}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="appointments-sidebar-content">
                            <form onSubmit={updateAppointment}>
                                {selectedBranch === "all" && (
                                    <div className="appointments-form-group">
                                        <label>{t("branch")}</label>
                                        <div className="input-icon-wrapper">
                                            <FaBuilding className="input-icon" />
                                            <select name="branch" value={currentAppointment.branch} onChange={handleEditAppointmentChange}>
                                                {filterData.branches &&
                                                    filterData.branches.map((branch) => (
                                                        <option key={branch.id} value={branch.id}>
                                                            {branch.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <div className="appointments-form-group">
                                    <label>{t("patient")}</label>
                                    <div className="input-icon-wrapper">
                                        <FaUser className="input-icon" />
                                        <select
                                            name="customer"
                                            value={currentAppointment.customer}
                                            onChange={handleEditAppointmentChange}
                                            required
                                        >
                                            <option value="">{t("select_patient")}</option>
                                            {filterData.customers &&
                                                filterData.customers.map((customer) => (
                                                    <option key={customer.id} value={customer.id}>
                                                        {customer.full_name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="appointments-form-group">
                                    <label>{t("doctor")}</label>
                                    <div className="input-icon-wrapper">
                                        <FaUserMd className="input-icon" />
                                        <select
                                            name="doctor"
                                            value={currentAppointment.doctor}
                                            onChange={handleEditAppointmentChange}
                                            required
                                        >
                                            <option value="">{t("select_doctor")}</option>
                                            {filterData.doctors &&
                                                filterData.doctors.map((doctor) => (
                                                    <option key={doctor.id} value={doctor.id}>
                                                        {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="appointments-form-group">
                                    <label>{t("room")}</label>
                                    <div className="input-icon-wrapper">
                                        <FaDoorOpen className="input-icon" />
                                        <select name="room" value={currentAppointment.room} onChange={handleEditAppointmentChange} required>
                                            <option value="">{t("select_room")}</option>
                                            {filterData.cabinets &&
                                                filterData.cabinets.map((cabinet) => (
                                                    <option key={cabinet.id} value={cabinet.id}>
                                                        {cabinet.name} - {cabinet.type}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="appointments-form-row">
                                    <div className="appointments-form-group">
                                        <label>{t("date")}</label>
                                        <div className="input-icon-wrapper">
                                            <FaCalendarAlt className="input-icon" />
                                            <input
                                                type="date"
                                                name="date"
                                                value={
                                                    currentAppointment.formattedDate ||
                                                    (currentAppointment.date ? currentAppointment.date.split("T")[0] : "")
                                                }
                                                onChange={handleEditAppointmentChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="appointments-form-group">
                                    <label>{t("time")}</label>
                                    {timeError && (
                                        <div className="time-error">
                                            <FaExclamationCircle /> {timeError}
                                        </div>
                                    )}
                                    <div className="time-slots-container">
                                        {availableTimes.length > 0 ? (
                                            availableTimes.map((slot, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    className={`time-slot ${slot.isBooked ? "booked" : ""} ${currentAppointment.time === slot.time ? "selected" : ""
                                                        }`}
                                                    onClick={() => !slot.isBooked && handleEditTimeSelect(slot.time)}
                                                    disabled={slot.isBooked}
                                                >
                                                    <FaClock className="time-icon" />
                                                    {slot.time}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="no-times-message">{t("please_select_date_and_room_first")}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="appointments-form-group">
                                    <label>{t("status")}</label>
                                    <select name="status" value={currentAppointment.status} onChange={handleEditAppointmentChange}>
                                        <option value="expected">{t("expected")}</option>
                                        <option value="accepted">{t("accepted")}</option>
                                        <option value="progress">{t("progress")}</option>
                                        <option value="finished">{t("finished")}</option>
                                        <option value="cancelled">{t("cancelled")}</option>
                                    </select>
                                </div>

                                <div className="appointments-form-group">
                                    <label>{t("notes")}</label>
                                    <textarea
                                        name="comment"
                                        value={currentAppointment.comment || ""}
                                        onChange={handleEditAppointmentChange}
                                        rows={3}
                                        placeholder={t("enter_notes")}
                                    ></textarea>
                                </div>

                                <div className="appointments-form-actions">
                                    <button type="submit" className="appointments-btn appointments-btn-primary">
                                        {t("save")}
                                    </button>
                                    <button
                                        type="button"
                                        className="appointments-btn appointments-btn-secondary"
                                        onClick={closeEditSidebar}
                                    >
                                        {t("cancel")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : null}
            </div>

            {/* Time Change Modal */}
            {showTimeChangeModal && timeChangeAppointment && (
                <div className="time-change-modal-overlay">
                    <div className="time-change-modal">
                        <div className="time-change-modal-header">
                            <h3>{t("change_appointment_time")}</h3>
                            <button className="close-btn" onClick={closeTimeChangeModal}>
                                ×
                            </button>
                        </div>
                        <div className="time-change-modal-body">
                            <div className="appointment-info">
                                <div className="info-row">
                                    <div className="info-label">{t("patient")}:</div>
                                    <div className="info-value">{timeChangeAppointment.customer_name}</div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label">{t("doctor")}:</div>
                                    <div className="info-value">{timeChangeAppointment.doctor_name}</div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label">{t("room")}:</div>
                                    <div className="info-value">{timeChangeAppointment.room_name}</div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label">{t("date")}:</div>
                                    <div className="info-value">
                                        {timeChangeAppointment.formattedDate || formatDateForDisplay(timeChangeAppointment.date)}
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label">{t("current_time")}:</div>
                                    <div className="info-value">
                                        {timeChangeAppointment.time || formatTimeForDisplay(timeChangeAppointment.date)}
                                    </div>
                                </div>
                            </div>

                            <div className="time-selection">
                                <h4>{t("select_new_time")}</h4>
                                {timeError && (
                                    <div className="time-error">
                                        <FaExclamationCircle /> {timeError}
                                    </div>
                                )}
                                <div className="time-slots-container">
                                    {availableTimes.map((slot, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className={`time-slot ${slot.isBooked && timeChangeAppointment.time !== slot.time ? "booked" : ""
                                                } ${newTime === slot.time ? "selected" : ""}`}
                                            onClick={() =>
                                                (!slot.isBooked || timeChangeAppointment.time === slot.time) &&
                                                handleTimeChangeSelect(slot.time)
                                            }
                                            disabled={slot.isBooked && timeChangeAppointment.time !== slot.time}
                                        >
                                            <FaClock className="time-icon" />
                                            {slot.time}
                                        </button>
                                    ))}
                                    {availableTimes.length === 0 && <div className="no-times-message">{t("no_available_times")}</div>}
                                </div>
                            </div>
                        </div>
                        <div className="time-change-modal-footer">
                            <button className="appointments-btn appointments-btn-secondary" onClick={closeTimeChangeModal}>
                                {t("cancel")}
                            </button>
                            <button
                                className="appointments-btn appointments-btn-primary"
                                onClick={saveTimeChange}
                                disabled={!newTime}
                            >
                                {t("save_changes")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Modal */}
            {showActionModal && selectedAppointmentForAction && (
                <div className="action-modal-overlay" onClick={closeActionModal}>
                    <div className="action-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="action-modal-header">
                            <h3>{t("actions")}</h3>
                            <button className="close-btn" onClick={closeActionModal}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="action-modal-body">
                            <div className="action-buttons">
                                <button
                                    className="action-btn view-btn"
                                    onClick={() => {
                                        closeActionModal()
                                        openViewSidebar(selectedAppointmentForAction)
                                    }}
                                >
                                    <FaEye /> {t("view")}
                                </button>

                                <button
                                    className="action-btn edit-btn"
                                    onClick={() => {
                                        closeActionModal()
                                        openEditSidebar(selectedAppointmentForAction)
                                    }}
                                >
                                    <FaEdit /> {t("edit")}
                                </button>

                                {selectedAppointmentForAction.status === "accepted" && (
                                    <button
                                        className="action-btn print-btn"
                                        onClick={() => {
                                            closeActionModal()
                                            handlePrintTicket(selectedAppointmentForAction.id)
                                        }}
                                    >
                                        <FaTicketAlt /> {t("print_ticket")}
                                    </button>
                                )}

                                {selectedAppointmentForAction.status === "finished" && (
                                    <>
                                        <button
                                            className="action-btn pdf-btn"
                                            onClick={() => {
                                                closeActionModal()
                                                handleExportPDF(selectedAppointmentForAction.id)
                                            }}
                                        >
                                            <FaFilePdf /> {t("export_pdf")}
                                        </button>

                                        <button
                                            className="action-btn payment-btn"
                                            onClick={() => {
                                                closeActionModal()
                                                openPaymentModal(selectedAppointmentForAction)
                                            }}
                                        >
                                            <FaMoneyBillWave /> {t("record_payment")}
                                        </button>
                                    </>
                                )}

                                <button
                                    className="action-btn time-btn"
                                    onClick={() => {
                                        closeActionModal()
                                        openTimeChangeModal(selectedAppointmentForAction)
                                    }}
                                >
                                    <FaClock /> {t("change_time")}
                                </button>

                                {selectedAppointmentForAction.status === "expected" && (
                                    <>
                                        <button
                                            className="action-btn accept-btn"
                                            onClick={() => {
                                                closeActionModal()
                                                handleStatusChange(selectedAppointmentForAction.id, "accepted")
                                            }}
                                        >
                                            <FaCheck /> {t("accept")}
                                        </button>

                                        <button
                                            className="action-btn cancel-btn"
                                            onClick={() => {
                                                closeActionModal()
                                                handleStatusChange(selectedAppointmentForAction.id, "cancelled")
                                            }}
                                        >
                                            <FaTimes /> {t("cancel")}
                                        </button>
                                    </>
                                )}

                                <button
                                    className="action-btn delete-btn"
                                    onClick={() => {
                                        closeActionModal()
                                        deleteAppointment(selectedAppointmentForAction.id)
                                    }}
                                >
                                    <FaTrash /> {t("delete")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ticket Modal */}
            {showTicketModal && ticketData && (
                <div className="ticket-modal-overlay">
                    <div className="ticket-modal">
                        <div className="ticket-modal-header">
                            <h3>{t("appointment_ticket")}</h3>
                            <button className="close-btn" onClick={closeTicketModal}>
                                ×
                            </button>
                        </div>
                        <div className="ticket-modal-body">
                            {ticketPrinted ? (
                                <div className="ticket-printed-message">
                                    <FaCheck className="success-icon" />
                                    <p>{t("ticket_printed_successfully")}</p>
                                    <button className="appointments-btn appointments-btn-primary" onClick={closeTicketModal}>
                                        {t("close")}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="ticket-content">
                                        <pre>{ticketData}</pre>
                                    </div>
                                    <div className="ticket-actions">
                                        <button className="appointments-btn appointments-btn-secondary" onClick={closeTicketModal}>
                                            {t("cancel")}
                                        </button>
                                        <button
                                            className="appointments-btn appointments-btn-primary"
                                            onClick={simulatePrinting}
                                            disabled={printLoading}
                                        >
                                            {printLoading ? <FaSpinner className="spinner" /> : <FaTicketAlt />}
                                            {printLoading ? t("printing") : t("print")}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showPaymentModal && selectedAppointmentForPayment && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal">
                        <div className="payment-modal-header">
                            <h3>
                                <FaMoneyBillWave /> {t("record_payment")}
                            </h3>
                            <button className="close-btn" onClick={closePaymentModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handlePaymentSubmit}>
                            <div className="payment-modal-body">
                                <div className="appointment-info">
                                    <h4>{t("appointment_details")}</h4>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="label">{t("patient")}:</span>
                                            <span className="value">{selectedAppointmentForPayment.customer_name}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">{t("doctor")}:</span>
                                            <span className="value">{selectedAppointmentForPayment.doctor_name}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">{t("date")}:</span>
                                            <span className="value">
                                                {selectedAppointmentForPayment.formattedDate ||
                                                    formatDateForDisplay(selectedAppointmentForPayment.date)}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">{t("time")}:</span>
                                            <span className="value">
                                                {selectedAppointmentForPayment.time || formatTimeForDisplay(selectedAppointmentForPayment.date)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="payment-form">
                                    <h4>{t("payment_information")}</h4>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="amount_paid">{t("amount_paid")} *</label>
                                            <input
                                                type="number"
                                                id="amount_paid"
                                                name="amount_paid"
                                                value={paymentFormData.amount_paid}
                                                onChange={handlePaymentFormChange}
                                                placeholder={t("enter_amount_paid")}
                                                required
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="discount">{t("discount_amount")}</label>
                                            <input
                                                type="number"
                                                id="discount"
                                                name="discount"
                                                value={paymentFormData.discount}
                                                onChange={handlePaymentFormChange}
                                                placeholder={t("enter_discount_amount")}
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="discount_procent">{t("discount_percentage")}</label>
                                            <input
                                                type="number"
                                                id="discount_procent"
                                                name="discount_procent"
                                                value={paymentFormData.discount_procent}
                                                onChange={handlePaymentFormChange}
                                                placeholder={t("enter_discount_percentage")}
                                                min="0"
                                                max="100"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="comment">{t("payment_comment")}</label>
                                        <textarea
                                            id="comment"
                                            name="comment"
                                            value={paymentFormData.comment}
                                            onChange={handlePaymentFormChange}
                                            placeholder={t("enter_payment_comment")}
                                            rows="3"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="payment-modal-footer">
                                <button
                                    type="button"
                                    className="appointments-btn appointments-btn-secondary"
                                    onClick={closePaymentModal}
                                    disabled={paymentLoading}
                                >
                                    {t("cancel")}
                                </button>
                                <button type="submit" className="appointments-btn appointments-btn-primary" disabled={paymentLoading}>
                                    {paymentLoading ? t("recording") : t("record_payment")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
