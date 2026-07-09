import React , { useState, useEffect } from "react"
import {
    FaUserPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaTimes,
    FaCheck,
    FaUserMd,
    FaFilter,
    FaMoneyBillWave,
    FaPlane,
    FaFilePdf,
    FaFileExcel,
} from "react-icons/fa"
import { useAuth } from "../../../contexts/AuthContext"
import { useLanguage } from "../../../contexts/LanguageContext"

export default function StaffDoctors() {
    const { selectedBranch } = useAuth()
    const { t } = useLanguage()

    // Doctor specialties
    const doctorSpecialties = [
        { value: "cardiologist", label: t("cardiologist") },
        { value: "neurologist", label: t("neurologist") },
        { value: "pediatrician", label: t("pediatrician") },
        { value: "dermatologist", label: t("dermatologist") },
        { value: "ophthalmologist", label: t("ophthalmologist") },
        { value: "orthopedist", label: t("orthopedist") },
        { value: "gynecologist", label: t("gynecologist") },
        { value: "urologist", label: t("urologist") },
        { value: "ent_specialist", label: t("ent_specialist") },
        { value: "psychiatrist", label: t("psychiatrist") },
        { value: "dentist", label: t("dentist") },
        { value: "surgeon", label: t("surgeon") },
        { value: "radiologist", label: t("radiologist") },
        { value: "anesthesiologist", label: t("anesthesiologist") },
        { value: "family_physician", label: t("family_physician") },
    ]

    // Mock data for doctors
    const initialDoctorsData = {
        all: [
            {
                id: 1,
                name: "Aziz Karimov",
                specialty: "cardiologist",
                department: "Kardiologiya",
                phone: "+998 90 123 45 67",
                email: "aziz@example.com",
                status: "active",
                branch: "branch1",
                salary: 5000000,
                onVacation: false,
                vacationDates: null,
                experience: 8,
                patients: 120,
                rating: 4.8,
                education: "Toshkent Tibbiyot Akademiyasi",
                certifications: ["Kardiologiya sertifikati", "EKG sertifikati"],
                schedule: "Dushanba-Juma: 09:00-17:00",
            },
            {
                id: 2,
                name: "Jasur Toshmatov",
                specialty: "neurologist",
                department: "Nevrologiya",
                phone: "+998 90 345 67 89",
                email: "jasur@example.com",
                status: "active",
                branch: "branch2",
                salary: 4800000,
                onVacation: true,
                vacationDates: "2023-05-20 - 2023-06-05",
                experience: 6,
                patients: 95,
                rating: 4.5,
                education: "Samarqand Tibbiyot Instituti",
                certifications: ["Nevrologiya sertifikati"],
                schedule: "Seshanba-Shanba: 10:00-18:00",
            },
            {
                id: 3,
                name: "Dilshod Rahimov",
                specialty: "pediatrician",
                department: "Pediatriya",
                phone: "+998 90 234 56 78",
                email: "dilshod@example.com",
                status: "active",
                branch: "branch1",
                salary: 4500000,
                onVacation: false,
                vacationDates: null,
                experience: 10,
                patients: 150,
                rating: 4.9,
                education: "Toshkent Pediatriya Instituti",
                certifications: ["Pediatriya sertifikati", "Bolalar allergologiyasi"],
                schedule: "Dushanba-Juma: 08:00-16:00",
            },
            {
                id: 4,
                name: "Nodira Karimova",
                specialty: "gynecologist",
                department: "Ginekologiya",
                phone: "+998 90 456 78 90",
                email: "nodira@example.com",
                status: "inactive",
                branch: "branch3",
                salary: 4700000,
                onVacation: false,
                vacationDates: null,
                experience: 7,
                patients: 110,
                rating: 4.6,
                education: "Toshkent Tibbiyot Akademiyasi",
                certifications: ["Ginekologiya sertifikati", "Akusherlik sertifikati"],
                schedule: "Dushanba-Juma: 09:00-17:00",
            },
            {
                id: 5,
                name: "Rustam Aliyev",
                specialty: "surgeon",
                department: "Jarrohlik",
                phone: "+998 90 567 89 01",
                email: "rustam@example.com",
                status: "active",
                branch: "branch2",
                salary: 5200000,
                onVacation: false,
                vacationDates: null,
                experience: 12,
                patients: 85,
                rating: 4.7,
                education: "Toshkent Tibbiyot Akademiyasi",
                certifications: ["Jarrohlik sertifikati", "Laparoskopik jarrohlik"],
                schedule: "Dushanba-Juma: 08:00-16:00",
            },
            {
                id: 6,
                name: "Kamola Yusupova",
                specialty: "dermatologist",
                department: "Dermatologiya",
                phone: "+998 90 678 90 12",
                email: "kamola@example.com",
                status: "active",
                branch: "branch3",
                salary: 4300000,
                onVacation: false,
                vacationDates: null,
                experience: 5,
                patients: 130,
                rating: 4.4,
                education: "Samarqand Tibbiyot Instituti",
                certifications: ["Dermatologiya sertifikati", "Kosmetologiya"],
                schedule: "Seshanba-Shanba: 09:00-17:00",
            },
        ],
        branch1: [
            {
                id: 1,
                name: "Aziz Karimov",
                specialty: "cardiologist",
                department: "Kardiologiya",
                phone: "+998 90 123 45 67",
                email: "aziz@example.com",
                status: "active",
                branch: "branch1",
                salary: 5000000,
                onVacation: false,
                vacationDates: null,
                experience: 8,
                patients: 120,
                rating: 4.8,
                education: "Toshkent Tibbiyot Akademiyasi",
                certifications: ["Kardiologiya sertifikati", "EKG sertifikati"],
                schedule: "Dushanba-Juma: 09:00-17:00",
            },
            {
                id: 3,
                name: "Dilshod Rahimov",
                specialty: "pediatrician",
                department: "Pediatriya",
                phone: "+998 90 234 56 78",
                email: "dilshod@example.com",
                status: "active",
                branch: "branch1",
                salary: 4500000,
                onVacation: false,
                vacationDates: null,
                experience: 10,
                patients: 150,
                rating: 4.9,
                education: "Toshkent Pediatriya Instituti",
                certifications: ["Pediatriya sertifikati", "Bolalar allergologiyasi"],
                schedule: "Dushanba-Juma: 08:00-16:00",
            },
        ],
        branch2: [
            {
                id: 2,
                name: "Jasur Toshmatov",
                specialty: "neurologist",
                department: "Nevrologiya",
                phone: "+998 90 345 67 89",
                email: "jasur@example.com",
                status: "active",
                branch: "branch2",
                salary: 4800000,
                onVacation: true,
                vacationDates: "2023-05-20 - 2023-06-05",
                experience: 6,
                patients: 95,
                rating: 4.5,
                education: "Samarqand Tibbiyot Instituti",
                certifications: ["Nevrologiya sertifikati"],
                schedule: "Seshanba-Shanba: 10:00-18:00",
            },
            {
                id: 5,
                name: "Rustam Aliyev",
                specialty: "surgeon",
                department: "Jarrohlik",
                phone: "+998 90 567 89 01",
                email: "rustam@example.com",
                status: "active",
                branch: "branch2",
                salary: 5200000,
                onVacation: false,
                vacationDates: null,
                experience: 12,
                patients: 85,
                rating: 4.7,
                education: "Toshkent Tibbiyot Akademiyasi",
                certifications: ["Jarrohlik sertifikati", "Laparoskopik jarrohlik"],
                schedule: "Dushanba-Juma: 08:00-16:00",
            },
        ],
        branch3: [
            {
                id: 4,
                name: "Nodira Karimova",
                specialty: "gynecologist",
                department: "Ginekologiya",
                phone: "+998 90 456 78 90",
                email: "nodira@example.com",
                status: "inactive",
                branch: "branch3",
                salary: 4700000,
                onVacation: false,
                vacationDates: null,
                experience: 7,
                patients: 110,
                rating: 4.6,
                education: "Toshkent Tibbiyot Akademiyasi",
                certifications: ["Ginekologiya sertifikati", "Akusherlik sertifikati"],
                schedule: "Dushanba-Juma: 09:00-17:00",
            },
            {
                id: 6,
                name: "Kamola Yusupova",
                specialty: "dermatologist",
                department: "Dermatologiya",
                phone: "+998 90 678 90 12",
                email: "kamola@example.com",
                status: "active",
                branch: "branch3",
                salary: 4300000,
                onVacation: false,
                vacationDates: null,
                experience: 5,
                patients: 130,
                rating: 4.4,
                education: "Samarqand Tibbiyot Instituti",
                certifications: ["Dermatologiya sertifikati", "Kosmetologiya"],
                schedule: "Seshanba-Shanba: 09:00-17:00",
            },
        ],
    }

    const [initialDoctors, setInitialDoctors] = useState(
        selectedBranch === "all" ? initialDoctorsData.all : initialDoctorsData[selectedBranch],
    )
    const [doctors, setDoctors] = useState(initialDoctors)
    const [searchTerm, setSearchTerm] = useState("")
    const [showSidebar, setShowSidebar] = useState(false)
    const [showEditSidebar, setShowEditSidebar] = useState(false)
    const [currentDoctor, setCurrentDoctor] = useState(null)
    const [newDoctor, setNewDoctor] = useState({
        name: "",
        specialty: "cardiologist",
        department: "",
        phone: "",
        email: "",
        status: "active",
        branch: selectedBranch === "all" ? "branch1" : selectedBranch,
        salary: 0,
        onVacation: false,
        vacationDates: null,
        experience: 0,
        patients: 0,
        rating: 0,
        education: "",
        certifications: [],
        schedule: "",
    })
    const [filterSpecialty, setFilterSpecialty] = useState("all")
    const [filterStatus, setFilterStatus] = useState("all")
    const [filterBranch, setFilterBranch] = useState(selectedBranch)
    const [filterVacation, setFilterVacation] = useState("all")
    const [showFilters, setShowFilters] = useState(false)
    const [showStats, setShowStats] = useState(true)
    const [showDoctorDetails, setShowDoctorDetails] = useState(false)
    const [selectedDoctor, setSelectedDoctor] = useState(null)
    const [newCertification, setNewCertification] = useState("")

    // Stats calculation
    const [stats, setStats] = useState({
        totalDoctors: 0,
        activeDoctors: 0,
        onVacation: 0,
        totalSalaries: 0,
        bySpecialty: {},
        averageExperience: 0,
        totalPatients: 0,
        averageRating: 0,
    })

    // Calculate stats
    useEffect(() => {
        const calculateStats = () => {
            const totalDoctors = initialDoctors.length
            const activeDoctors = initialDoctors.filter((d) => d.status === "active").length
            const onVacation = initialDoctors.filter((d) => d.onVacation).length
            const totalSalaries = initialDoctors.reduce((sum, d) => sum + d.salary, 0)
            const totalExperience = initialDoctors.reduce((sum, d) => sum + d.experience, 0)
            const totalPatients = initialDoctors.reduce((sum, d) => sum + d.patients, 0)
            const totalRating = initialDoctors.reduce((sum, d) => sum + d.rating, 0)

            // Count by specialty
            const bySpecialty = {}
            initialDoctors.forEach((d) => {
                if (!bySpecialty[d.specialty]) bySpecialty[d.specialty] = 0
                bySpecialty[d.specialty]++
            })

            setStats({
                totalDoctors,
                activeDoctors,
                onVacation,
                totalSalaries,
                bySpecialty,
                averageExperience: totalDoctors ? (totalExperience / totalDoctors).toFixed(1) : 0,
                totalPatients,
                averageRating: totalDoctors ? (totalRating / totalDoctors).toFixed(1) : 0,
            })
        }

        calculateStats()
    }, [initialDoctors])

    // Update doctors when branch changes
    useEffect(() => {
        if (selectedBranch === "all") {
            setInitialDoctors(initialDoctorsData.all)
            setDoctors(initialDoctorsData.all)
        } else {
            setInitialDoctors(initialDoctorsData[selectedBranch])
            setDoctors(initialDoctorsData[selectedBranch])
        }

        setNewDoctor({
            ...newDoctor,
            branch: selectedBranch === "all" ? "branch1" : selectedBranch,
        })

        setFilterBranch(selectedBranch)
    }, [selectedBranch])

    // Filter doctors based on search term, specialty, status, branch and vacation
    useEffect(() => {
        let filteredDoctors = [...initialDoctors]

        // Filter by search term
        if (searchTerm) {
            filteredDoctors = filteredDoctors.filter(
                (doctor) =>
                    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doctor.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doctor.email.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        // Filter by specialty
        if (filterSpecialty !== "all") {
            filteredDoctors = filteredDoctors.filter((doctor) => doctor.specialty === filterSpecialty)
        }

        // Filter by status
        if (filterStatus !== "all") {
            filteredDoctors = filteredDoctors.filter((doctor) => doctor.status === filterStatus)
        }

        // Filter by branch (if viewing all branches)
        if (selectedBranch === "all" && filterBranch !== "all") {
            filteredDoctors = filteredDoctors.filter((doctor) => doctor.branch === filterBranch)
        }

        // Filter by vacation status
        if (filterVacation !== "all") {
            filteredDoctors = filteredDoctors.filter((doctor) =>
                filterVacation === "on_vacation" ? doctor.onVacation : !doctor.onVacation,
            )
        }

        setDoctors(filteredDoctors)
    }, [searchTerm, filterSpecialty, filterStatus, filterBranch, filterVacation, initialDoctors])

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
    }

    // Handle new doctor input change
    const handleNewDoctorChange = (e) => {
        const { name, value, type, checked } = e.target
        setNewDoctor({
            ...newDoctor,
            [name]:
                type === "checkbox"
                    ? checked
                    : name === "salary" || name === "experience" || name === "patients" || name === "rating"
                        ? value === ""
                            ? 0
                            : Number(value)
                        : value,
        })
    }

    // Handle edit doctor input change
    const handleEditDoctorChange = (e) => {
        const { name, value, type, checked } = e.target
        setCurrentDoctor({
            ...currentDoctor,
            [name]:
                type === "checkbox"
                    ? checked
                    : name === "salary" || name === "experience" || name === "patients" || name === "rating"
                        ? Number(value)
                        : value,
        })
    }

    // Toggle filters
    const toggleFilters = () => {
        setShowFilters(!showFilters)
    }

    // Toggle stats
    const toggleStats = () => {
        setShowStats(!showStats)
    }

    // Open add sidebar
    const openAddSidebar = () => {
        setShowSidebar(true)
    }

    // Close add sidebar
    const closeAddSidebar = () => {
        setShowSidebar(false)
        setNewDoctor({
            name: "",
            specialty: "cardiologist",
            department: "",
            phone: "",
            email: "",
            status: "active",
            branch: selectedBranch === "all" ? "branch1" : selectedBranch,
            salary: 0,
            onVacation: false,
            vacationDates: null,
            experience: 0,
            patients: 0,
            rating: 0,
            education: "",
            certifications: [],
            schedule: "",
        })
        setNewCertification("")
    }

    // Open edit sidebar
    const openEditSidebar = (doctor) => {
        setCurrentDoctor(doctor)
        setShowEditSidebar(true)
    }

    // Close edit sidebar
    const closeEditSidebar = () => {
        setShowEditSidebar(false)
        setCurrentDoctor(null)
    }

    // Add new doctor
    const addDoctor = (e) => {
        e.preventDefault()
        const id = Math.max(...initialDoctorsData.all.map((d) => d.id)) + 1
        const newDoctorMember = { ...newDoctor, id }

        // Update all doctors data
        const updatedAllDoctors = [...initialDoctorsData.all, newDoctorMember]
        initialDoctorsData.all = updatedAllDoctors

        // Update branch-specific doctors data
        initialDoctorsData[newDoctorMember.branch] = [...initialDoctorsData[newDoctorMember.branch], newDoctorMember]

        // Update current view
        if (selectedBranch === "all" || selectedBranch === newDoctorMember.branch) {
            setInitialDoctors((prev) => [...prev, newDoctorMember])
        }

        closeAddSidebar()
    }

    // Update doctor
    const updateDoctor = (e) => {
        e.preventDefault()

        // Update in all doctors data
        const updatedAllDoctors = initialDoctorsData.all.map((doctor) =>
            doctor.id === currentDoctor.id ? currentDoctor : doctor,
        )
        initialDoctorsData.all = updatedAllDoctors

        // Update in branch-specific data
        // First remove from old branch if branch changed
        if (currentDoctor.branch !== currentDoctor._prevBranch && currentDoctor._prevBranch) {
            initialDoctorsData[currentDoctor._prevBranch] = initialDoctorsData[currentDoctor._prevBranch].filter(
                (doctor) => doctor.id !== currentDoctor.id,
            )
        }

        // Then add to new branch
        if (initialDoctorsData[currentDoctor.branch]) {
            initialDoctorsData[currentDoctor.branch] = initialDoctorsData[currentDoctor.branch].filter(
                (doctor) => doctor.id !== currentDoctor.id,
            )
            initialDoctorsData[currentDoctor.branch].push(currentDoctor)
        }

        // Update current view
        if (selectedBranch === "all") {
            setInitialDoctors(updatedAllDoctors)
        } else if (selectedBranch === currentDoctor.branch) {
            setInitialDoctors(initialDoctorsData[selectedBranch])
        }

        closeEditSidebar()
    }

    // Delete doctor
    const deleteDoctor = (id) => {
        if (window.confirm(t("confirm_delete_doctor"))) {
            // Find the doctor to get their branch
            const doctorToDelete = initialDoctorsData.all.find((doctor) => doctor.id === id)

            // Remove from all doctors data
            initialDoctorsData.all = initialDoctorsData.all.filter((doctor) => doctor.id !== id)

            // Remove from branch-specific data
            if (doctorToDelete && doctorToDelete.branch) {
                initialDoctorsData[doctorToDelete.branch] = initialDoctorsData[doctorToDelete.branch].filter(
                    (doctor) => doctor.id !== id,
                )
            }

            // Update current view
            setInitialDoctors((prev) => prev.filter((doctor) => doctor.id !== id))
        }
    }

    // Get specialty label
    const getSpecialtyLabel = (specialtyValue) => {
        const specialty = doctorSpecialties.find((spec) => spec.value === specialtyValue)
        return specialty ? specialty.label : specialtyValue
    }

    // View doctor details
    const viewDoctorDetails = (doctor) => {
        setSelectedDoctor(doctor)
        setShowDoctorDetails(true)
    }

    // Close doctor details
    const closeDoctorDetails = () => {
        setShowDoctorDetails(false)
        setSelectedDoctor(null)
    }

    // Add certification to new doctor
    const addCertification = () => {
        if (newCertification.trim()) {
            setNewDoctor({
                ...newDoctor,
                certifications: [...newDoctor.certifications, newCertification.trim()],
            })
            setNewCertification("")
        }
    }

    // Remove certification from new doctor
    const removeCertification = (index) => {
        const updatedCertifications = [...newDoctor.certifications]
        updatedCertifications.splice(index, 1)
        setNewDoctor({
            ...newDoctor,
            certifications: updatedCertifications,
        })
    }

    // Add certification to current doctor
    const addCertificationToCurrentDoctor = () => {
        if (newCertification.trim() && currentDoctor) {
            setCurrentDoctor({
                ...currentDoctor,
                certifications: [...currentDoctor.certifications, newCertification.trim()],
            })
            setNewCertification("")
        }
    }

    // Remove certification from current doctor
    const removeCertificationFromCurrentDoctor = (index) => {
        if (currentDoctor) {
            const updatedCertifications = [...currentDoctor.certifications]
            updatedCertifications.splice(index, 1)
            setCurrentDoctor({
                ...currentDoctor,
                certifications: updatedCertifications,
            })
        }
    }

    // Export to PDF
    const exportToPDF = () => {
        alert(t("export_to_pdf_function"))
    }

    // Export to Excel
    const exportToExcel = () => {
        alert(t("export_to_excel_function"))
    }

    return (
        <div className="doctor-container">
            <div className="doctor-header">
                <h1 className="doctor-title">{t("doctors")}</h1>
                <div className="doctor-actions">
                    <button className="doctor-btn doctor-btn-outline doctor-btn-icon" onClick={toggleStats}>
                        {showStats ? <FaTimes /> : <FaMoneyBillWave />} {showStats ? t("close_stats") : t("statistics")}
                    </button>
                    <button className="doctor-btn doctor-btn-outline doctor-btn-icon" onClick={exportToPDF}>
                        <FaFilePdf /> {t("export_to_pdf")}
                    </button>
                    <button className="doctor-btn doctor-btn-outline doctor-btn-icon" onClick={exportToExcel}>
                        <FaFileExcel /> {t("export_to_excel")}
                    </button>
                    <button className="doctor-btn doctor-btn-primary doctor-btn-icon" onClick={openAddSidebar}>
                        <FaUserPlus /> {t("add_new_doctor")}
                    </button>
                </div>
            </div>

            {showStats && (
                <div className="doctor-stats-container">
                    <div className="doctor-stats-grid">
                        <div className="doctor-stat-card">
                            <div className="doctor-stat-icon-wrapper">
                                <FaUserMd className="doctor-stat-icon" />
                            </div>
                            <div className="doctor-stat-content">
                                <div className="doctor-stat-value">{stats.totalDoctors}</div>
                                <div className="doctor-stat-label">{t("total_doctors")}</div>
                            </div>
                        </div>

                        <div className="doctor-stat-card">
                            <div className="doctor-stat-icon-wrapper">
                                <FaCheck className="doctor-stat-icon" />
                            </div>
                            <div className="doctor-stat-content">
                                <div className="doctor-stat-value">{stats.activeDoctors}</div>
                                <div className="doctor-stat-label">{t("active_doctors")}</div>
                            </div>
                        </div>

                        <div className="doctor-stat-card">
                            <div className="doctor-stat-icon-wrapper">
                                <FaPlane className="doctor-stat-icon" />
                            </div>
                            <div className="doctor-stat-content">
                                <div className="doctor-stat-value">{stats.onVacation}</div>
                                <div className="doctor-stat-label">{t("doctors_on_vacation")}</div>
                            </div>
                        </div>

                        <div className="doctor-stat-card">
                            <div className="doctor-stat-icon-wrapper">
                                <FaMoneyBillWave className="doctor-stat-icon" />
                            </div>
                            <div className="doctor-stat-content">
                                <div className="doctor-stat-value">
                                    {stats.totalSalaries.toLocaleString()} {t("currency")}
                                </div>
                                <div className="doctor-stat-label">{t("total_salary")}</div>
                            </div>
                        </div>
                    </div>

                    <div className="doctor-stats-grid">
                        <div className="doctor-stat-card">
                            <div className="doctor-stat-content">
                                <div className="doctor-stat-value">{stats.averageExperience}</div>
                                <div className="doctor-stat-label">{t("average_experience")}</div>
                            </div>
                        </div>

                        <div className="doctor-stat-card">
                            <div className="doctor-stat-content">
                                <div className="doctor-stat-value">{stats.totalPatients}</div>
                                <div className="doctor-stat-label">{t("total_patients")}</div>
                            </div>
                        </div>

                        <div className="doctor-stat-card">
                            <div className="doctor-stat-content">
                                <div className="doctor-stat-value">{stats.averageRating}</div>
                                <div className="doctor-stat-label">{t("average_rating")}</div>
                            </div>
                        </div>
                    </div>

                    <div className="doctor-specialty-distribution">
                        <h3>{t("specialty_distribution")}</h3>
                        <div className="doctor-specialty-bars">
                            {Object.entries(stats.bySpecialty).map(([specialty, count]) => (
                                <div className="doctor-specialty-bar-item" key={specialty}>
                                    <div className="doctor-specialty-info">
                                        <span className="doctor-specialty-name">{getSpecialtyLabel(specialty)}</span>
                                        <span className="doctor-specialty-count">{count}</span>
                                    </div>
                                    <div className="doctor-specialty-bar-container">
                                        <div
                                            className="doctor-specialty-bar-fill"
                                            style={{ width: `${(count / stats.totalDoctors) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="doctor-filters-container">
                <div className="doctor-search-filter">
                    <div className="doctor-search-input">
                        <FaSearch className="doctor-search-icon" />
                        <input type="text" placeholder={t("search")} value={searchTerm} onChange={handleSearchChange} />
                    </div>
                    <button className={`doctor-filter-toggle-btn ${showFilters ? "active" : ""}`} onClick={toggleFilters}>
                        <FaFilter /> {t("filters")}
                    </button>
                </div>

                {showFilters && (
                    <div className="doctor-advanced-filters">
                        <div className="doctor-filter-group">
                            <label>{t("specialty")}:</label>
                            <select value={filterSpecialty} onChange={(e) => setFilterSpecialty(e.target.value)}>
                                <option value="all">{t("all")}</option>
                                {doctorSpecialties.map((specialty) => (
                                    <option key={specialty.value} value={specialty.value}>
                                        {specialty.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="doctor-filter-group">
                            <label>{t("status")}:</label>
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="all">{t("all")}</option>
                                <option value="active">{t("active")}</option>
                                <option value="inactive">{t("inactive")}</option>
                            </select>
                        </div>

                        {selectedBranch === "all" && (
                            <div className="doctor-filter-group">
                                <label>{t("branch")}:</label>
                                <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
                                    <option value="all">{t("all")}</option>
                                    <option value="branch1">{t("branch1")}</option>
                                    <option value="branch2">{t("branch2")}</option>
                                    <option value="branch3">{t("branch3")}</option>
                                </select>
                            </div>
                        )}

                        <div className="doctor-filter-group">
                            <label>{t("vacation_status")}:</label>
                            <select value={filterVacation} onChange={(e) => setFilterVacation(e.target.value)}>
                                <option value="all">{t("all")}</option>
                                <option value="on_vacation">{t("on_vacation")}</option>
                                <option value="not_on_vacation">{t("at_work")}</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <div className="doctor-dashboard-card">
                <div className="doctor-table-responsive">
                    <table className="doctor-data-table">
                        <thead>
                            <tr>
                                <th>{t("name")}</th>
                                <th>{t("specialty")}</th>
                                <th>{t("department")}</th>
                                <th>{t("phone")}</th>
                                <th>{t("monthly_salary")}</th>
                                <th>{t("experience")}</th>
                                <th>{t("patients_count")}</th>
                                <th>{t("rating")}</th>
                                <th>{t("vacation_status")}</th>
                                <th>{t("status")}</th>
                                <th>{t("actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map((doctor) => (
                                <tr key={doctor.id}>
                                    <td>
                                        <div className="doctor-name-cell" onClick={() => viewDoctorDetails(doctor)}>
                                            {doctor.name}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`doctor-specialty-badge ${doctor.specialty}`}>
                                            {getSpecialtyLabel(doctor.specialty)}
                                        </div>
                                    </td>
                                    <td>{doctor.department}</td>
                                    <td>{doctor.phone}</td>
                                    <td>
                                        {doctor.salary.toLocaleString()} {t("currency")}
                                    </td>
                                    <td>
                                        {doctor.experience} {t("years")}
                                    </td>
                                    <td>{doctor.patients}</td>
                                    <td>
                                        <div className="doctor-rating">
                                            <span className="doctor-rating-value">{doctor.rating}</span>
                                            <span className="doctor-rating-star">★</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`doctor-vacation-badge ${doctor.onVacation ? "on-vacation" : "working"}`}>
                                            {doctor.onVacation ? (
                                                <>
                                                    <FaPlane /> {t("on_vacation")}
                                                </>
                                            ) : (
                                                <>
                                                    <FaCheck /> {t("at_work")}
                                                </>
                                            )}
                                        </div>
                                        {doctor.onVacation && doctor.vacationDates && (
                                            <div className="doctor-vacation-dates">{doctor.vacationDates}</div>
                                        )}
                                    </td>
                                    <td>
                                        <div className={`doctor-status-badge ${doctor.status}`}>
                                            {doctor.status === "active" ? (
                                                <>
                                                    <FaCheck /> {t("active")}
                                                </>
                                            ) : (
                                                <>
                                                    <FaTimes /> {t("inactive")}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="doctor-action-buttons">
                                            <button className="doctor-btn-icon doctor-edit" onClick={() => openEditSidebar(doctor)}>
                                                <FaEdit />
                                            </button>
                                            <button className="doctor-btn-icon doctor-delete" onClick={() => deleteDoctor(doctor.id)}>
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {doctors.length === 0 && (
                                <tr>
                                    <td colSpan="11" className="doctor-no-data">
                                        {t("no_data_found")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Doctor Sidebar */}
            <div className={`doctor-sidebar-overlay ${showSidebar ? "active" : ""}`} onClick={closeAddSidebar}></div>
            <div className={`doctor-sidebar ${showSidebar ? "active" : ""}`}>
                <div className="doctor-sidebar-header">
                    <h2>{t("add_new_doctor")}</h2>
                    <button className="doctor-close-button" onClick={closeAddSidebar}>
                        <FaTimes />
                    </button>
                </div>
                <div className="doctor-sidebar-content">
                    <form onSubmit={addDoctor}>
                        <div className="doctor-form-group">
                            <label>{t("full_name")}</label>
                            <input type="text" name="name" value={newDoctor.name} onChange={handleNewDoctorChange} required />
                        </div>

                        <div className="doctor-form-group">
                            <label>{t("specialty")}</label>
                            <select name="specialty" value={newDoctor.specialty} onChange={handleNewDoctorChange} required>
                                {doctorSpecialties.map((specialty) => (
                                    <option key={specialty.value} value={specialty.value}>
                                        {specialty.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="doctor-form-group">
                            <label>{t("department")}</label>
                            <input
                                type="text"
                                name="department"
                                value={newDoctor.department}
                                onChange={handleNewDoctorChange}
                                required
                            />
                        </div>

                        <div className="doctor-form-row">
                            <div className="doctor-form-group">
                                <label>{t("phone")}</label>
                                <input type="text" name="phone" value={newDoctor.phone} onChange={handleNewDoctorChange} required />
                            </div>

                            <div className="doctor-form-group">
                                <label>{t("email")}</label>
                                <input type="email" name="email" value={newDoctor.email} onChange={handleNewDoctorChange} required />
                            </div>
                        </div>

                        <div className="doctor-form-row">
                            <div className="doctor-form-group">
                                <label>
                                    {t("monthly_salary")} ({t("currency")})
                                </label>
                                <input type="number" name="salary" value={newDoctor.salary} onChange={handleNewDoctorChange} required />
                            </div>

                            <div className="doctor-form-group">
                                <label>
                                    {t("experience")} ({t("years")})
                                </label>
                                <input
                                    type="number"
                                    name="experience"
                                    value={newDoctor.experience}
                                    onChange={handleNewDoctorChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="doctor-form-row">
                            <div className="doctor-form-group">
                                <label>{t("patients_count")}</label>
                                <input
                                    type="number"
                                    name="patients"
                                    value={newDoctor.patients}
                                    onChange={handleNewDoctorChange}
                                    required
                                />
                            </div>

                            <div className="doctor-form-group">
                                <label>{t("rating")} (1-5)</label>
                                <input
                                    type="number"
                                    name="rating"
                                    min="1"
                                    max="5"
                                    step="0.1"
                                    value={newDoctor.rating}
                                    onChange={handleNewDoctorChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="doctor-form-group">
                            <label>{t("education")}</label>
                            <input
                                type="text"
                                name="education"
                                value={newDoctor.education}
                                onChange={handleNewDoctorChange}
                                required
                            />
                        </div>

                        <div className="doctor-form-group">
                            <label>{t("schedule")}</label>
                            <input
                                type="text"
                                name="schedule"
                                value={newDoctor.schedule}
                                onChange={handleNewDoctorChange}
                                placeholder={t("schedule_example")}
                                required
                            />
                        </div>

                        <div className="doctor-form-group">
                            <label>{t("certifications")}</label>
                            <div className="doctor-certification-input">
                                <input
                                    type="text"
                                    value={newCertification}
                                    onChange={(e) => setNewCertification(e.target.value)}
                                    placeholder={t("add_certification")}
                                />
                                <button type="button" className="doctor-btn doctor-btn-sm" onClick={addCertification}>
                                    {t("add")}
                                </button>
                            </div>
                            {newDoctor.certifications.length > 0 && (
                                <div className="doctor-certifications-list">
                                    {newDoctor.certifications.map((cert, index) => (
                                        <div className="doctor-certification-item" key={index}>
                                            <span>{cert}</span>
                                            <button
                                                type="button"
                                                className="doctor-btn-icon doctor-delete-sm"
                                                onClick={() => removeCertification(index)}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="doctor-form-group">
                            <label>{t("status")}</label>
                            <select name="status" value={newDoctor.status} onChange={handleNewDoctorChange}>
                                <option value="active">{t("active")}</option>
                                <option value="inactive">{t("inactive")}</option>
                            </select>
                        </div>

                        <div className="doctor-form-group doctor-checkbox-group">
                            <input
                                type="checkbox"
                                id="onVacation"
                                name="onVacation"
                                checked={newDoctor.onVacation}
                                onChange={handleNewDoctorChange}
                            />
                            <label htmlFor="onVacation">{t("on_vacation")}</label>
                        </div>

                        {newDoctor.onVacation && (
                            <div className="doctor-form-group">
                                <label>{t("vacation_period")}</label>
                                <input
                                    type="text"
                                    name="vacationDates"
                                    value={newDoctor.vacationDates || ""}
                                    onChange={handleNewDoctorChange}
                                    placeholder={t("vacation_period_example")}
                                />
                            </div>
                        )}

                        {selectedBranch === "all" && (
                            <div className="doctor-form-group">
                                <label>{t("branch")}</label>
                                <select name="branch" value={newDoctor.branch} onChange={handleNewDoctorChange}>
                                    <option value="branch1">{t("branch1")}</option>
                                    <option value="branch2">{t("branch2")}</option>
                                    <option value="branch3">{t("branch3")}</option>
                                </select>
                            </div>
                        )}

                        <div className="doctor-form-actions">
                            <button type="submit" className="doctor-btn doctor-btn-primary">
                                {t("add")}
                            </button>
                            <button type="button" className="doctor-btn doctor-btn-secondary" onClick={closeAddSidebar}>
                                {t("cancel")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Edit Doctor Sidebar */}
            <div className={`doctor-sidebar-overlay ${showEditSidebar ? "active" : ""}`} onClick={closeEditSidebar}></div>
            <div className={`doctor-sidebar ${showEditSidebar ? "active" : ""}`}>
                {currentDoctor && (
                    <>
                        <div className="doctor-sidebar-header">
                            <h2>{t("edit_doctor")}</h2>
                            <button className="doctor-close-button" onClick={closeEditSidebar}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="doctor-sidebar-content">
                            <form onSubmit={updateDoctor}>
                                <div className="doctor-form-group">
                                    <label>{t("full_name")}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={currentDoctor.name}
                                        onChange={handleEditDoctorChange}
                                        required
                                    />
                                </div>

                                <div className="doctor-form-group">
                                    <label>{t("specialty")}</label>
                                    <select name="specialty" value={currentDoctor.specialty} onChange={handleEditDoctorChange} required>
                                        {doctorSpecialties.map((specialty) => (
                                            <option key={specialty.value} value={specialty.value}>
                                                {specialty.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="doctor-form-group">
                                    <label>{t("department")}</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={currentDoctor.department}
                                        onChange={handleEditDoctorChange}
                                        required
                                    />
                                </div>

                                <div className="doctor-form-row">
                                    <div className="doctor-form-group">
                                        <label>{t("phone")}</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={currentDoctor.phone}
                                            onChange={handleEditDoctorChange}
                                            required
                                        />
                                    </div>

                                    <div className="doctor-form-group">
                                        <label>{t("email")}</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={currentDoctor.email}
                                            onChange={handleEditDoctorChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="doctor-form-row">
                                    <div className="doctor-form-group">
                                        <label>
                                            {t("monthly_salary")} ({t("currency")})
                                        </label>
                                        <input
                                            type="number"
                                            name="salary"
                                            value={currentDoctor.salary}
                                            onChange={handleEditDoctorChange}
                                            required
                                        />
                                    </div>

                                    <div className="doctor-form-group">
                                        <label>
                                            {t("experience")} ({t("years")})
                                        </label>
                                        <input
                                            type="number"
                                            name="experience"
                                            value={currentDoctor.experience}
                                            onChange={handleEditDoctorChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="doctor-form-row">
                                    <div className="doctor-form-group">
                                        <label>{t("patients_count")}</label>
                                        <input
                                            type="number"
                                            name="patients"
                                            value={currentDoctor.patients}
                                            onChange={handleEditDoctorChange}
                                            required
                                        />
                                    </div>

                                    <div className="doctor-form-group">
                                        <label>{t("rating")} (1-5)</label>
                                        <input
                                            type="number"
                                            name="rating"
                                            min="1"
                                            max="5"
                                            step="0.1"
                                            value={currentDoctor.rating}
                                            onChange={handleEditDoctorChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="doctor-form-group">
                                    <label>{t("education")}</label>
                                    <input
                                        type="text"
                                        name="education"
                                        value={currentDoctor.education}
                                        onChange={handleEditDoctorChange}
                                        required
                                    />
                                </div>

                                <div className="doctor-form-group">
                                    <label>{t("schedule")}</label>
                                    <input
                                        type="text"
                                        name="schedule"
                                        value={currentDoctor.schedule}
                                        onChange={handleEditDoctorChange}
                                        placeholder={t("schedule_example")}
                                        required
                                    />
                                </div>

                                <div className="doctor-form-group">
                                    <label>{t("certifications")}</label>
                                    <div className="doctor-certification-input">
                                        <input
                                            type="text"
                                            value={newCertification}
                                            onChange={(e) => setNewCertification(e.target.value)}
                                            placeholder={t("add_certification")}
                                        />
                                        <button
                                            type="button"
                                            className="doctor-btn doctor-btn-sm"
                                            onClick={addCertificationToCurrentDoctor}
                                        >
                                            {t("add")}
                                        </button>
                                    </div>
                                    {currentDoctor.certifications.length > 0 && (
                                        <div className="doctor-certifications-list">
                                            {currentDoctor.certifications.map((cert, index) => (
                                                <div className="doctor-certification-item" key={index}>
                                                    <span>{cert}</span>
                                                    <button
                                                        type="button"
                                                        className="doctor-btn-icon doctor-delete-sm"
                                                        onClick={() => removeCertificationFromCurrentDoctor(index)}
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="doctor-form-group">
                                    <label>{t("status")}</label>
                                    <select name="status" value={currentDoctor.status} onChange={handleEditDoctorChange}>
                                        <option value="active">{t("active")}</option>
                                        <option value="inactive">{t("inactive")}</option>
                                    </select>
                                </div>

                                <div className="doctor-form-group doctor-checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="editOnVacation"
                                        name="onVacation"
                                        checked={currentDoctor.onVacation}
                                        onChange={handleEditDoctorChange}
                                    />
                                    <label htmlFor="editOnVacation">{t("on_vacation")}</label>
                                </div>

                                {currentDoctor.onVacation && (
                                    <div className="doctor-form-group">
                                        <label>{t("vacation_period")}</label>
                                        <input
                                            type="text"
                                            name="vacationDates"
                                            value={currentDoctor.vacationDates || ""}
                                            onChange={handleEditDoctorChange}
                                            placeholder={t("vacation_period_example")}
                                        />
                                    </div>
                                )}

                                {selectedBranch === "all" && (
                                    <div className="doctor-form-group">
                                        <label>{t("branch")}</label>
                                        <select
                                            name="branch"
                                            value={currentDoctor.branch}
                                            onChange={(e) => {
                                                const newValue = e.target.value
                                                setCurrentDoctor((prev) => ({
                                                    ...prev,
                                                    _prevBranch: prev.branch,
                                                    branch: newValue,
                                                }))
                                            }}
                                        >
                                            <option value="branch1">{t("branch1")}</option>
                                            <option value="branch2">{t("branch2")}</option>
                                            <option value="branch3">{t("branch3")}</option>
                                        </select>
                                    </div>
                                )}

                                <div className="doctor-form-actions">
                                    <button type="submit" className="doctor-btn doctor-btn-primary">
                                        {t("save")}
                                    </button>
                                    <button type="button" className="doctor-btn doctor-btn-secondary" onClick={closeEditSidebar}>
                                        {t("cancel")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </div>

            {/* Doctor Details Modal */}
            <div className={`doctor-modal-overlay ${showDoctorDetails ? "active" : ""}`} onClick={closeDoctorDetails}></div>
            <div className={`doctor-modal ${showDoctorDetails ? "active" : ""}`}>
                {selectedDoctor && (
                    <>
                        <div className="doctor-modal-header">
                            <h2>{selectedDoctor.name}</h2>
                            <button className="doctor-close-button" onClick={closeDoctorDetails}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="doctor-modal-content">
                            <div className="doctor-details-grid">
                                <div className="doctor-details-section">
                                    <h3>{t("personal_info")}</h3>
                                    <div className="doctor-details-item">
                                        <span className="doctor-details-label">{t("specialty")}:</span>
                                        <span className="doctor-details-value">{getSpecialtyLabel(selectedDoctor.specialty)}</span>
                                    </div>
                                    <div className="doctor-details-item">
                                        <span className="doctor-details-label">{t("department")}:</span>
                                        <span className="doctor-details-value">{selectedDoctor.department}</span>
                                    </div>
                                    <div className="doctor-details-item">
                                        <span className="doctor-details-label">{t("phone")}:</span>
                                        <span className="doctor-details-value">{selectedDoctor.phone}</span>
                                    </div>
                                    <div className="doctor-details-item">
                                        <span className="doctor-details-label">{t("email")}:</span>
                                        <span className="doctor-details-value">{selectedDoctor.email}</span>
                                    </div>
                                    <div className="doctor-details-item">
                                        <span className="doctor-details-label">{t("status")}:</span>
                                        <span className={`doctor-details-status ${selectedDoctor.status}`}>
                                            {selectedDoctor.status === "active" ? t("active") : t("inactive")}
                                        </span>
                                    </div>
                                    <div className="doctor-details-item">
                                        <span className="doctor-details-label">{t("vacation_status")}:</span>
                                        <span className={`doctor-details-status ${selectedDoctor.onVacation ? "on-vacation" : "working"}`}>
                                            {selectedDoctor.onVacation ? t("on_vacation") : t("at_work")}
                                        </span>
                                    </div>
                                    {selectedDoctor.onVacation && selectedDoctor.vacationDates && (
                                        <div className="doctor-details-item">
                                            <span className="doctor-details-label">{t("vacation_period")}:</span>
                                            <span className="doctor-details-value">{selectedDoctor.vacationDates}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="doctor-details-section">
                                    <h3>{t("professional_info")}</h3>
                                    <div className="doctor-details-item">
                                        <span className="doctor-details-label">{t("experience")}:</span>
                                        <span className="doctor-details-value">
                                            {selectedDoctor.experience} {t("years")}
                                        </span>
                                    </div>
                                    <div className="doctor-details-item">
                                        <span className="doctor-details-label">{t("patients_count")}:</span>
                                        <span className="doctor-details-value">{selectedDoctor.patients}</span>
                                    </div>
                                    <div className="doctor-details-item">
                                        <span className="doctor-details-label">{t("rating")}:</span>
                                        <span className="doctor-details-value">
                                            {selectedDoctor.rating} <span className="doctor-rating-star">★</span>
                                        </span>
                                    </div>
                                    <div className="doctor-details-item">
                                        <span className="doctor-details-label">{t("monthly_salary")}:</span>
                                        <span className="doctor-details-value">
                                            {selectedDoctor.salary.toLocaleString()} {t("currency")}
                                        </span>
                                    </div>
                                    <div className="doctor-details-item">
                                        <span className="doctor-details-label">{t("education")}:</span>
                                        <span className="doctor-details-value">{selectedDoctor.education}</span>
                                    </div>
                                    <div className="doctor-details-item">
                                        <span className="doctor-details-label">{t("schedule")}:</span>
                                        <span className="doctor-details-value">{selectedDoctor.schedule}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="doctor-details-section">
                                <h3>{t("certifications")}</h3>
                                {selectedDoctor.certifications.length > 0 ? (
                                    <ul className="doctor-certifications-detail-list">
                                        {selectedDoctor.certifications.map((cert, index) => (
                                            <li key={index}>{cert}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="doctor-no-data">{t("no_certifications")}</p>
                                )}
                            </div>

                            <div className="doctor-modal-actions">
                                <button className="doctor-btn doctor-btn-primary" onClick={() => openEditSidebar(selectedDoctor)}>
                                    <FaEdit /> {t("edit")}
                                </button>
                                <button className="doctor-btn doctor-btn-secondary" onClick={closeDoctorDetails}>
                                    {t("close")}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
};