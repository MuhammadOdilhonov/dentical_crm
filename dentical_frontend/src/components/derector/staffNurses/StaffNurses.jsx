"use client"

import { useState, useEffect } from "react"
import {
    FaUserNurse,
    FaSearch,
    FaPlus,
    FaEdit,
    FaTrash,
    FaFilter,
    FaSortAmountDown,
    FaSortAmountUp,
    FaEye,
    FaUserMd,
    FaCalendarAlt,
    FaEnvelope,
    FaPhone,
    FaIdCard,
    FaMapMarkerAlt,
    FaUserCog,
    FaTimes,
    FaCheck,
    FaExchangeAlt,
    FaClock,
} from "react-icons/fa"
import { useAuth } from "../../../contexts/AuthContext"
import { useLanguage } from "../../../contexts/LanguageContext"

export default function StaffNurses() {
    const { user, selectedBranch } = useAuth()
    const { t } = useLanguage()
    const [loading, setLoading] = useState(true)
    const [nurses, setNurses] = useState([])
    const [filteredNurses, setFilteredNurses] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [showAddForm, setShowAddForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [showViewDetails, setShowViewDetails] = useState(false)
    const [showScheduleModal, setShowScheduleModal] = useState(false)
    const [showSwapModal, setShowSwapModal] = useState(false)
    const [selectedNurse, setSelectedNurse] = useState(null)
    const [selectedSchedule, setSelectedSchedule] = useState(null)
    const [otherNurses, setOtherNurses] = useState([])
    const [selectedOtherNurse, setSelectedOtherNurse] = useState(null)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gender: "female",
        birthDate: "",
        address: "",
        specialization: "",
        experience: "",
        education: "",
        startDate: "",
        department: "",
        status: "active",
    })
    const [scheduleData, setScheduleData] = useState({
        monday: { working: false, startTime: "08:00", endTime: "17:00" },
        tuesday: { working: false, startTime: "08:00", endTime: "17:00" },
        wednesday: { working: false, startTime: "08:00", endTime: "17:00" },
        thursday: { working: false, startTime: "08:00", endTime: "17:00" },
        friday: { working: false, startTime: "08:00", endTime: "17:00" },
        saturday: { working: false, startTime: "08:00", endTime: "13:00" },
        sunday: { working: false, startTime: "08:00", endTime: "13:00" },
    })
    const [sortConfig, setSortConfig] = useState({
        key: "lastName",
        direction: "ascending",
    })
    const [filterConfig, setFilterConfig] = useState({
        department: "all",
        status: "all",
        gender: "all",
    })
    const [departments, setDepartments] = useState([])
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        setLoading(true)

        // Simulate API call to fetch nurses
        setTimeout(() => {
            // Mock nurses data
            const mockNurses = [
                {
                    id: 1,
                    firstName: "Nilufar",
                    lastName: "Rahimova",
                    email: "nilufar.rahimova@clinic.uz",
                    phone: "+998 90 123 45 67",
                    gender: "female",
                    birthDate: "1990-05-15",
                    address: "Toshkent sh., Chilonzor tumani, 19-kvartal, 10-uy",
                    specialization: "Kardiologiya hamshirasi",
                    experience: "5 yil",
                    education: "Toshkent tibbiyot kolleji",
                    startDate: "2018-03-10",
                    department: "Kardiologiya",
                    status: "active",
                    avatar: "/placeholder.svg?height=150&width=150",
                    schedule: {
                        monday: { working: true, startTime: "08:00", endTime: "17:00" },
                        tuesday: { working: true, startTime: "08:00", endTime: "17:00" },
                        wednesday: { working: true, startTime: "08:00", endTime: "17:00" },
                        thursday: { working: true, startTime: "08:00", endTime: "17:00" },
                        friday: { working: true, startTime: "08:00", endTime: "17:00" },
                        saturday: { working: false, startTime: "08:00", endTime: "13:00" },
                        sunday: { working: false, startTime: "08:00", endTime: "13:00" },
                    },
                },
                {
                    id: 2,
                    firstName: "Zarina",
                    lastName: "Aliyeva",
                    email: "zarina.aliyeva@clinic.uz",
                    phone: "+998 90 234 56 78",
                    gender: "female",
                    birthDate: "1992-08-20",
                    address: "Toshkent sh., Yunusobod tumani, 12-kvartal, 5-uy",
                    specialization: "Pediatriya hamshirasi",
                    experience: "3 yil",
                    education: "Samarqand tibbiyot kolleji",
                    startDate: "2020-01-15",
                    department: "Pediatriya",
                    status: "active",
                    avatar: "/placeholder.svg?height=150&width=150",
                    schedule: {
                        monday: { working: true, startTime: "09:00", endTime: "18:00" },
                        tuesday: { working: true, startTime: "09:00", endTime: "18:00" },
                        wednesday: { working: true, startTime: "09:00", endTime: "18:00" },
                        thursday: { working: true, startTime: "09:00", endTime: "18:00" },
                        friday: { working: true, startTime: "09:00", endTime: "18:00" },
                        saturday: { working: true, startTime: "09:00", endTime: "14:00" },
                        sunday: { working: false, startTime: "09:00", endTime: "14:00" },
                    },
                },
                {
                    id: 3,
                    firstName: "Gulnora",
                    lastName: "Karimova",
                    email: "gulnora.karimova@clinic.uz",
                    phone: "+998 90 345 67 89",
                    gender: "female",
                    birthDate: "1988-11-10",
                    address: "Toshkent sh., Mirzo Ulug'bek tumani, 6-kvartal, 12-uy",
                    specialization: "Jarrohlik hamshirasi",
                    experience: "8 yil",
                    education: "Toshkent tibbiyot kolleji",
                    startDate: "2015-06-20",
                    department: "Jarrohlik",
                    status: "active",
                    avatar: "/placeholder.svg?height=150&width=150",
                    schedule: {
                        monday: { working: true, startTime: "08:00", endTime: "17:00" },
                        tuesday: { working: true, startTime: "08:00", endTime: "17:00" },
                        wednesday: { working: true, startTime: "08:00", endTime: "17:00" },
                        thursday: { working: true, startTime: "08:00", endTime: "17:00" },
                        friday: { working: true, startTime: "08:00", endTime: "17:00" },
                        saturday: { working: false, startTime: "08:00", endTime: "13:00" },
                        sunday: { working: false, startTime: "08:00", endTime: "13:00" },
                    },
                },
                {
                    id: 4,
                    firstName: "Malika",
                    lastName: "Umarova",
                    email: "malika.umarova@clinic.uz",
                    phone: "+998 90 456 78 90",
                    gender: "female",
                    birthDate: "1995-03-25",
                    address: "Toshkent sh., Shayxontohur tumani, 15-kvartal, 8-uy",
                    specialization: "Nevrologiya hamshirasi",
                    experience: "2 yil",
                    education: "Farg'ona tibbiyot kolleji",
                    startDate: "2021-02-10",
                    department: "Nevrologiya",
                    status: "active",
                    avatar: "/placeholder.svg?height=150&width=150",
                    schedule: {
                        monday: { working: true, startTime: "08:00", endTime: "17:00" },
                        tuesday: { working: true, startTime: "08:00", endTime: "17:00" },
                        wednesday: { working: true, startTime: "08:00", endTime: "17:00" },
                        thursday: { working: true, startTime: "08:00", endTime: "17:00" },
                        friday: { working: true, startTime: "08:00", endTime: "17:00" },
                        saturday: { working: false, startTime: "08:00", endTime: "13:00" },
                        sunday: { working: false, startTime: "08:00", endTime: "13:00" },
                    },
                },
                {
                    id: 5,
                    firstName: "Dilnoza",
                    lastName: "Saidova",
                    email: "dilnoza.saidova@clinic.uz",
                    phone: "+998 90 567 89 01",
                    gender: "female",
                    birthDate: "1991-07-12",
                    address: "Toshkent sh., Olmazor tumani, 8-kvartal, 15-uy",
                    specialization: "Terapiya hamshirasi",
                    experience: "6 yil",
                    education: "Toshkent tibbiyot kolleji",
                    startDate: "2017-09-05",
                    department: "Terapiya",
                    status: "active",
                    avatar: "/placeholder.svg?height=150&width=150",
                    schedule: {
                        monday: { working: true, startTime: "08:00", endTime: "17:00" },
                        tuesday: { working: true, startTime: "08:00", endTime: "17:00" },
                        wednesday: { working: true, startTime: "08:00", endTime: "17:00" },
                        thursday: { working: true, startTime: "08:00", endTime: "17:00" },
                        friday: { working: true, startTime: "08:00", endTime: "17:00" },
                        saturday: { working: false, startTime: "08:00", endTime: "13:00" },
                        sunday: { working: false, startTime: "08:00", endTime: "13:00" },
                    },
                },
                {
                    id: 6,
                    firstName: "Aziza",
                    lastName: "Toshmatova",
                    email: "aziza.toshmatova@clinic.uz",
                    phone: "+998 90 678 90 12",
                    gender: "female",
                    birthDate: "1993-12-30",
                    address: "Toshkent sh., Yashnobod tumani, 10-kvartal, 20-uy",
                    specialization: "Ginekologiya hamshirasi",
                    experience: "4 yil",
                    education: "Andijon tibbiyot kolleji",
                    startDate: "2019-04-15",
                    department: "Ginekologiya",
                    status: "inactive",
                    avatar: "/placeholder.svg?height=150&width=150",
                    schedule: {
                        monday: { working: false, startTime: "08:00", endTime: "17:00" },
                        tuesday: { working: false, startTime: "08:00", endTime: "17:00" },
                        wednesday: { working: false, startTime: "08:00", endTime: "17:00" },
                        thursday: { working: false, startTime: "08:00", endTime: "17:00" },
                        friday: { working: false, startTime: "08:00", endTime: "17:00" },
                        saturday: { working: false, startTime: "08:00", endTime: "13:00" },
                        sunday: { working: false, startTime: "08:00", endTime: "13:00" },
                    },
                },
            ]

            // Extract unique departments
            const uniqueDepartments = [...new Set(mockNurses.map((nurse) => nurse.department))]

            setNurses(mockNurses)
            setFilteredNurses(mockNurses)
            setDepartments(uniqueDepartments)
            setLoading(false)
        }, 800)
    }, [selectedBranch])

    // Apply search, sort, and filters
    useEffect(() => {
        let result = [...nurses]

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(
                (nurse) =>
                    nurse.firstName.toLowerCase().includes(query) ||
                    nurse.lastName.toLowerCase().includes(query) ||
                    nurse.email.toLowerCase().includes(query) ||
                    nurse.phone.toLowerCase().includes(query) ||
                    nurse.department.toLowerCase().includes(query) ||
                    nurse.specialization.toLowerCase().includes(query),
            )
        }

        // Apply filters
        if (filterConfig.department !== "all") {
            result = result.filter((nurse) => nurse.department === filterConfig.department)
        }

        if (filterConfig.status !== "all") {
            result = result.filter((nurse) => nurse.status === filterConfig.status)
        }

        if (filterConfig.gender !== "all") {
            result = result.filter((nurse) => nurse.gender === filterConfig.gender)
        }

        // Apply sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === "ascending" ? -1 : 1
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === "ascending" ? 1 : -1
                }
                return 0
            })
        }

        setFilteredNurses(result)
    }, [nurses, searchQuery, sortConfig, filterConfig])

    // Handle sort request
    const requestSort = (key) => {
        let direction = "ascending"
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending"
        }
        setSortConfig({ key, direction })
    }

    // Get sort icon
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return null
        }
        return sortConfig.direction === "ascending" ? <FaSortAmountUp /> : <FaSortAmountDown />
    }

    // Handle filter change
    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilterConfig({
            ...filterConfig,
            [name]: value,
        })
    }

    // Reset filters
    const resetFilters = () => {
        setFilterConfig({
            department: "all",
            status: "all",
            gender: "all",
        })
        setSearchQuery("")
    }

    // Toggle filters visibility
    const toggleFilters = () => {
        setShowFilters(!showFilters)
    }

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })
    }

    // Handle schedule input change
    const handleScheduleChange = (day, field, value) => {
        setScheduleData({
            ...scheduleData,
            [day]: {
                ...scheduleData[day],
                [field]: value,
            },
        })
    }

    // Open add form
    const handleAddNurse = () => {
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            gender: "female",
            birthDate: "",
            address: "",
            specialization: "",
            experience: "",
            education: "",
            startDate: new Date().toISOString().split("T")[0],
            department: departments[0] || "",
            status: "active",
        })
        setShowAddForm(true)
    }

    // Open edit form
    const handleEditNurse = (nurse) => {
        setSelectedNurse(nurse)
        setFormData({
            firstName: nurse.firstName,
            lastName: nurse.lastName,
            email: nurse.email,
            phone: nurse.phone,
            gender: nurse.gender,
            birthDate: nurse.birthDate,
            address: nurse.address,
            specialization: nurse.specialization,
            experience: nurse.experience,
            education: nurse.education,
            startDate: nurse.startDate,
            department: nurse.department,
            status: nurse.status,
        })
        setShowEditForm(true)
    }

    // Open view details
    const handleViewNurse = (nurse) => {
        setSelectedNurse(nurse)
        setShowViewDetails(true)
    }

    // Open schedule modal
    const handleScheduleModal = (nurse) => {
        setSelectedNurse(nurse)
        setScheduleData(
            nurse.schedule || {
                monday: { working: false, startTime: "08:00", endTime: "17:00" },
                tuesday: { working: false, startTime: "08:00", endTime: "17:00" },
                wednesday: { working: false, startTime: "08:00", endTime: "17:00" },
                thursday: { working: false, startTime: "08:00", endTime: "17:00" },
                friday: { working: false, startTime: "08:00", endTime: "17:00" },
                saturday: { working: false, startTime: "08:00", endTime: "13:00" },
                sunday: { working: false, startTime: "08:00", endTime: "13:00" },
            },
        )
        setShowScheduleModal(true)
    }

    // Open swap schedule modal
    const handleSwapSchedule = (nurse, day) => {
        setSelectedNurse(nurse)
        setSelectedSchedule(day)
        // Filter other active nurses from the same department
        const availableNurses = nurses.filter(
            (n) => n.id !== nurse.id && n.department === nurse.department && n.status === "active",
        )
        setOtherNurses(availableNurses)
        setSelectedOtherNurse(null)
        setShowSwapModal(true)
    }

    // Handle form submission for adding a new nurse
    const handleAddSubmit = (e) => {
        e.preventDefault()

        // Create new nurse object
        const newNurse = {
            id: nurses.length + 1,
            ...formData,
            avatar: "/placeholder.svg?height=150&width=150",
            schedule: {
                monday: { working: true, startTime: "08:00", endTime: "17:00" },
                tuesday: { working: true, startTime: "08:00", endTime: "17:00" },
                wednesday: { working: true, startTime: "08:00", endTime: "17:00" },
                thursday: { working: true, startTime: "08:00", endTime: "17:00" },
                friday: { working: true, startTime: "08:00", endTime: "17:00" },
                saturday: { working: false, startTime: "08:00", endTime: "13:00" },
                sunday: { working: false, startTime: "08:00", endTime: "13:00" },
            },
        }

        // Add to nurses list
        setNurses([...nurses, newNurse])
        setShowAddForm(false)
    }

    // Handle form submission for editing a nurse
    const handleEditSubmit = (e) => {
        e.preventDefault()

        // Update nurse object
        const updatedNurses = nurses.map((nurse) =>
            nurse.id === selectedNurse.id
                ? {
                    ...nurse,
                    ...formData,
                }
                : nurse,
        )

        // Update nurses list
        setNurses(updatedNurses)
        setShowEditForm(false)
    }

    // Handle schedule update
    const handleScheduleSubmit = (e) => {
        e.preventDefault()

        // Update nurse schedule
        const updatedNurses = nurses.map((nurse) =>
            nurse.id === selectedNurse.id
                ? {
                    ...nurse,
                    schedule: scheduleData,
                }
                : nurse,
        )

        // Update nurses list
        setNurses(updatedNurses)
        setShowScheduleModal(false)
    }

    // Handle schedule swap
    const handleSwapSubmit = (e) => {
        e.preventDefault()

        if (!selectedOtherNurse) {
            alert(t("please_select_nurse"))
            return
        }

        // Swap schedules between nurses
        const updatedNurses = nurses.map((nurse) => {
            if (nurse.id === selectedNurse.id) {
                const updatedSchedule = { ...nurse.schedule }
                updatedSchedule[selectedSchedule] = { ...selectedOtherNurse.schedule[selectedSchedule] }
                return {
                    ...nurse,
                    schedule: updatedSchedule,
                }
            } else if (nurse.id === selectedOtherNurse.id) {
                const updatedSchedule = { ...nurse.schedule }
                updatedSchedule[selectedSchedule] = { ...selectedNurse.schedule[selectedSchedule] }
                return {
                    ...nurse,
                    schedule: updatedSchedule,
                }
            }
            return nurse
        })

        // Update nurses list
        setNurses(updatedNurses)
        setShowSwapModal(false)
    }

    // Handle nurse deletion
    const handleDeleteNurse = (nurseId) => {
        if (window.confirm(t("confirm_delete_nurse"))) {
            setNurses(nurses.filter((nurse) => nurse.id !== nurseId))
        }
    }

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toLocaleDateString()
    }

    // Get day name in Uzbek
    const getDayName = (day) => {
        switch (day) {
            case "monday":
                return "Dushanba"
            case "tuesday":
                return "Seshanba"
            case "wednesday":
                return "Chorshanba"
            case "thursday":
                return "Payshanba"
            case "friday":
                return "Juma"
            case "saturday":
                return "Shanba"
            case "sunday":
                return "Yakshanba"
            default:
                return day
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>{t("loading")}...</p>
            </div>
        )
    }

    return (
        <div className="director-staff-nurses">
            <div className="page-header">
                <h1 className="page-title">
                    <FaUserNurse /> {t("nurses_management")}
                </h1>
                <div className="header-actions">
                    <div className="search-box">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder={t("search_nurses")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="filter-button" onClick={toggleFilters}>
                        <FaFilter /> {t("filters")}
                    </button>
                    <button className="add-button" onClick={handleAddNurse}>
                        <FaPlus /> {t("add_nurse")}
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="filters-panel">
                    <div className="filter-group">
                        <label>{t("department")}:</label>
                        <select name="department" value={filterConfig.department} onChange={handleFilterChange}>
                            <option value="all">{t("all_departments")}</option>
                            {departments.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>{t("status")}:</label>
                        <select name="status" value={filterConfig.status} onChange={handleFilterChange}>
                            <option value="all">{t("all_statuses")}</option>
                            <option value="active">{t("active")}</option>
                            <option value="inactive">{t("inactive")}</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>{t("gender")}:</label>
                        <select name="gender" value={filterConfig.gender} onChange={handleFilterChange}>
                            <option value="all">{t("all_genders")}</option>
                            <option value="male">{t("male")}</option>
                            <option value="female">{t("female")}</option>
                        </select>
                    </div>

                    <button className="reset-filters" onClick={resetFilters}>
                        {t("reset_filters")}
                    </button>
                </div>
            )}

            <div className="nurses-container">
                {filteredNurses.length > 0 ? (
                    <div className="nurses-grid">
                        {filteredNurses.map((nurse) => (
                            <div key={nurse.id} className={`nurse-card ${nurse.status === "inactive" ? "inactive" : ""}`}>
                                <div className="nurse-header">
                                    <div className="nurse-avatar">
                                        <img src={nurse.avatar || "/placeholder.svg"} alt={`${nurse.firstName} ${nurse.lastName}`} />
                                    </div>
                                    <div className="nurse-info">
                                        <h3 className="nurse-name">{`${nurse.firstName} ${nurse.lastName}`}</h3>
                                        <p className="nurse-specialization">{nurse.specialization}</p>
                                        <p className="nurse-department">{nurse.department}</p>
                                        <div className={`status-badge ${nurse.status}`}>
                                            {nurse.status === "active" ? t("active") : t("inactive")}
                                        </div>
                                    </div>
                                </div>
                                <div className="nurse-contact">
                                    <p>
                                        <FaEnvelope /> {nurse.email}
                                    </p>
                                    <p>
                                        <FaPhone /> {nurse.phone}
                                    </p>
                                </div>
                                <div className="nurse-actions">
                                    <button className="view-button" onClick={() => handleViewNurse(nurse)}>
                                        <FaEye /> {t("view")}
                                    </button>
                                    <button className="edit-button" onClick={() => handleEditNurse(nurse)}>
                                        <FaEdit /> {t("edit")}
                                    </button>
                                    <button className="schedule-button" onClick={() => handleScheduleModal(nurse)}>
                                        <FaCalendarAlt /> {t("schedule")}
                                    </button>
                                    <button className="delete-button" onClick={() => handleDeleteNurse(nurse.id)}>
                                        <FaTrash /> {t("delete")}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-nurses-message">
                        <FaUserNurse />
                        <p>{t("no_nurses_found")}</p>
                    </div>
                )}
            </div>

            {/* Add Nurse Form */}
            {showAddForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>
                                <FaPlus /> {t("add_nurse")}
                            </h2>
                            <button className="close-button" onClick={() => setShowAddForm(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleAddSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">{t("first_name")}*</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">{t("last_name")}*</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="email">{t("email")}*</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phone">{t("phone")}*</label>
                                    <input
                                        type="text"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="gender">{t("gender")}</label>
                                    <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange}>
                                        <option value="female">{t("female")}</option>
                                        <option value="male">{t("male")}</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="birthDate">{t("birth_date")}</label>
                                    <input
                                        type="date"
                                        id="birthDate"
                                        name="birthDate"
                                        value={formData.birthDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="address">{t("address")}</label>
                                <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="specialization">{t("specialization")}*</label>
                                    <input
                                        type="text"
                                        id="specialization"
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="experience">{t("experience")}</label>
                                    <input
                                        type="text"
                                        id="experience"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="education">{t("education")}</label>
                                <input
                                    type="text"
                                    id="education"
                                    name="education"
                                    value={formData.education}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="startDate">{t("start_date")}*</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="department">{t("department")}*</label>
                                    <select
                                        id="department"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {departments.map((dept) => (
                                            <option key={dept} value={dept}>
                                                {dept}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">{t("status")}</label>
                                <select id="status" name="status" value={formData.status} onChange={handleInputChange}>
                                    <option value="active">{t("active")}</option>
                                    <option value="inactive">{t("inactive")}</option>
                                </select>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="cancel-button" onClick={() => setShowAddForm(false)}>
                                    {t("cancel")}
                                </button>
                                <button type="submit" className="submit-button">
                                    {t("add_nurse")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Nurse Form */}
            {showEditForm && selectedNurse && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>
                                <FaEdit /> {t("edit_nurse")}
                            </h2>
                            <button className="close-button" onClick={() => setShowEditForm(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">{t("first_name")}*</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">{t("last_name")}*</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="email">{t("email")}*</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phone">{t("phone")}*</label>
                                    <input
                                        type="text"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="gender">{t("gender")}</label>
                                    <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange}>
                                        <option value="female">{t("female")}</option>
                                        <option value="male">{t("male")}</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="birthDate">{t("birth_date")}</label>
                                    <input
                                        type="date"
                                        id="birthDate"
                                        name="birthDate"
                                        value={formData.birthDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="address">{t("address")}</label>
                                <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="specialization">{t("specialization")}*</label>
                                    <input
                                        type="text"
                                        id="specialization"
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="experience">{t("experience")}</label>
                                    <input
                                        type="text"
                                        id="experience"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="education">{t("education")}</label>
                                <input
                                    type="text"
                                    id="education"
                                    name="education"
                                    value={formData.education}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="startDate">{t("start_date")}*</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="department">{t("department")}*</label>
                                    <select
                                        id="department"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {departments.map((dept) => (
                                            <option key={dept} value={dept}>
                                                {dept}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">{t("status")}</label>
                                <select id="status" name="status" value={formData.status} onChange={handleInputChange}>
                                    <option value="active">{t("active")}</option>
                                    <option value="inactive">{t("inactive")}</option>
                                </select>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="cancel-button" onClick={() => setShowEditForm(false)}>
                                    {t("cancel")}
                                </button>
                                <button type="submit" className="submit-button">
                                    {t("update_nurse")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Nurse Details */}
            {showViewDetails && selectedNurse && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>
                                <FaUserNurse /> {t("nurse_details")}
                            </h2>
                            <button className="close-button" onClick={() => setShowViewDetails(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="nurse-details">
                            <div className="nurse-profile-header">
                                <div className="nurse-avatar-large">
                                    <img
                                        src={selectedNurse.avatar || "/placeholder.svg"}
                                        alt={`${selectedNurse.firstName} ${selectedNurse.lastName}`}
                                    />
                                </div>
                                <div className="nurse-profile-info">
                                    <h3 className="nurse-full-name">{`${selectedNurse.firstName} ${selectedNurse.lastName}`}</h3>
                                    <p className="nurse-title">{selectedNurse.specialization}</p>
                                    <div className={`status-badge ${selectedNurse.status}`}>
                                        {selectedNurse.status === "active" ? t("active") : t("inactive")}
                                    </div>
                                </div>
                            </div>

                            <div className="nurse-details-grid">
                                <div className="detail-item">
                                    <div className="detail-label">
                                        <FaIdCard /> {t("id")}:
                                    </div>
                                    <div className="detail-value">{selectedNurse.id}</div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">
                                        <FaEnvelope /> {t("email")}:
                                    </div>
                                    <div className="detail-value">{selectedNurse.email}</div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">
                                        <FaPhone /> {t("phone")}:
                                    </div>
                                    <div className="detail-value">{selectedNurse.phone}</div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">
                                        <FaUserMd /> {t("gender")}:
                                    </div>
                                    <div className="detail-value">{t(selectedNurse.gender)}</div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">
                                        <FaCalendarAlt /> {t("birth_date")}:
                                    </div>
                                    <div className="detail-value">{formatDate(selectedNurse.birthDate)}</div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">
                                        <FaMapMarkerAlt /> {t("address")}:
                                    </div>
                                    <div className="detail-value">{selectedNurse.address}</div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">
                                        <FaUserCog /> {t("specialization")}:
                                    </div>
                                    <div className="detail-value">{selectedNurse.specialization}</div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">
                                        <FaUserCog /> {t("experience")}:
                                    </div>
                                    <div className="detail-value">{selectedNurse.experience}</div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">
                                        <FaUserCog /> {t("education")}:
                                    </div>
                                    <div className="detail-value">{selectedNurse.education}</div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">
                                        <FaCalendarAlt /> {t("start_date")}:
                                    </div>
                                    <div className="detail-value">{formatDate(selectedNurse.startDate)}</div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-label">
                                        <FaUserCog /> {t("department")}:
                                    </div>
                                    <div className="detail-value">{selectedNurse.department}</div>
                                </div>
                            </div>

                            <div className="schedule-section">
                                <h4>
                                    <FaCalendarAlt /> {t("work_schedule")}
                                </h4>
                                <div className="schedule-grid">
                                    {selectedNurse.schedule &&
                                        Object.entries(selectedNurse.schedule).map(([day, schedule]) => (
                                            <div key={day} className={`schedule-day ${schedule.working ? "working" : "not-working"}`}>
                                                <div className="day-name">{getDayName(day)}</div>
                                                {schedule.working ? (
                                                    <div className="work-hours">
                                                        <FaClock /> {schedule.startTime} - {schedule.endTime}
                                                    </div>
                                                ) : (
                                                    <div className="day-off">{t("day_off")}</div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>

                            <div className="detail-actions">
                                <button
                                    className="edit-button"
                                    onClick={() => {
                                        setShowViewDetails(false)
                                        handleEditNurse(selectedNurse)
                                    }}
                                >
                                    <FaEdit /> {t("edit")}
                                </button>
                                <button
                                    className="schedule-button"
                                    onClick={() => {
                                        setShowViewDetails(false)
                                        handleScheduleModal(selectedNurse)
                                    }}
                                >
                                    <FaCalendarAlt /> {t("edit_schedule")}
                                </button>
                                <button className="close-details-button" onClick={() => setShowViewDetails(false)}>
                                    <FaCheck /> {t("ok")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Modal */}
            {showScheduleModal && selectedNurse && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>
                                <FaCalendarAlt /> {t("edit_schedule")} - {selectedNurse.firstName} {selectedNurse.lastName}
                            </h2>
                            <button className="close-button" onClick={() => setShowScheduleModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleScheduleSubmit}>
                            <div className="schedule-form">
                                {Object.entries(scheduleData).map(([day, schedule]) => (
                                    <div key={day} className="schedule-day-form">
                                        <div className="day-header">
                                            <div className="day-name">{getDayName(day)}</div>
                                            <div className="day-toggle">
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={schedule.working}
                                                        onChange={(e) => handleScheduleChange(day, "working", e.target.checked)}
                                                    />
                                                    <span className="slider round"></span>
                                                </label>
                                                <span className="toggle-label">{schedule.working ? t("working") : t("day_off")}</span>
                                            </div>
                                        </div>
                                        {schedule.working && (
                                            <div className="day-hours">
                                                <div className="time-input">
                                                    <label>{t("start_time")}</label>
                                                    <input
                                                        type="time"
                                                        value={schedule.startTime}
                                                        onChange={(e) => handleScheduleChange(day, "startTime", e.target.value)}
                                                    />
                                                </div>
                                                <div className="time-input">
                                                    <label>{t("end_time")}</label>
                                                    <input
                                                        type="time"
                                                        value={schedule.endTime}
                                                        onChange={(e) => handleScheduleChange(day, "endTime", e.target.value)}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    className="swap-button"
                                                    onClick={() => handleSwapSchedule(selectedNurse, day)}
                                                >
                                                    <FaExchangeAlt /> {t("swap_with_another_nurse")}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="form-actions">
                                <button type="button" className="cancel-button" onClick={() => setShowScheduleModal(false)}>
                                    {t("cancel")}
                                </button>
                                <button type="submit" className="submit-button">
                                    {t("save_schedule")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Swap Schedule Modal */}
            {showSwapModal && selectedNurse && selectedSchedule && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>
                                <FaExchangeAlt /> {t("swap_schedule")} - {getDayName(selectedSchedule)}
                            </h2>
                            <button className="close-button" onClick={() => setShowSwapModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSwapSubmit}>
                            <div className="swap-form">
                                <div className="current-nurse">
                                    <h3>{t("current_nurse")}</h3>
                                    <div className="nurse-info">
                                        <div className="nurse-avatar">
                                            <img
                                                src={selectedNurse.avatar || "/placeholder.svg"}
                                                alt={`${selectedNurse.firstName} ${selectedNurse.lastName}`}
                                            />
                                        </div>
                                        <div className="nurse-details">
                                            <p className="nurse-name">
                                                {selectedNurse.firstName} {selectedNurse.lastName}
                                            </p>
                                            <p className="nurse-department">{selectedNurse.department}</p>
                                            <div className="schedule-info">
                                                {selectedNurse.schedule[selectedSchedule].working ? (
                                                    <p>
                                                        <FaClock /> {selectedNurse.schedule[selectedSchedule].startTime} -{" "}
                                                        {selectedNurse.schedule[selectedSchedule].endTime}
                                                    </p>
                                                ) : (
                                                    <p>{t("day_off")}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="swap-icon">
                                    <FaExchangeAlt />
                                </div>

                                <div className="other-nurse">
                                    <h3>{t("select_nurse_to_swap")}</h3>
                                    {otherNurses.length > 0 ? (
                                        <div className="nurses-list">
                                            {otherNurses.map((nurse) => (
                                                <div
                                                    key={nurse.id}
                                                    className={`nurse-item ${selectedOtherNurse?.id === nurse.id ? "selected" : ""}`}
                                                    onClick={() => setSelectedOtherNurse(nurse)}
                                                >
                                                    <div className="nurse-avatar">
                                                        <img
                                                            src={nurse.avatar || "/placeholder.svg"}
                                                            alt={`${nurse.firstName} ${nurse.lastName}`}
                                                        />
                                                    </div>
                                                    <div className="nurse-details">
                                                        <p className="nurse-name">
                                                            {nurse.firstName} {nurse.lastName}
                                                        </p>
                                                        <div className="schedule-info">
                                                            {nurse.schedule[selectedSchedule].working ? (
                                                                <p>
                                                                    <FaClock /> {nurse.schedule[selectedSchedule].startTime} -{" "}
                                                                    {nurse.schedule[selectedSchedule].endTime}
                                                                </p>
                                                            ) : (
                                                                <p>{t("day_off")}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {selectedOtherNurse?.id === nurse.id && (
                                                        <div className="selected-mark">
                                                            <FaCheck />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-nurses">
                                            <p>{t("no_available_nurses")}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="cancel-button" onClick={() => setShowSwapModal(false)}>
                                    {t("cancel")}
                                </button>
                                <button type="submit" className="submit-button" disabled={!selectedOtherNurse}>
                                    {t("confirm_swap")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}