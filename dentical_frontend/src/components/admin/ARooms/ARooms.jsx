"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../../contexts/AuthContext"
import { useLanguage } from "../../../contexts/LanguageContext"
import {
    FaSearch,
    FaFilter,
    FaUserInjured,
    FaBed,
    FaMoneyBillWave,
    FaCheckCircle,
    FaExclamationTriangle,
    FaPlus,
    FaEdit,
    FaTrash,
} from "react-icons/fa"

export default function ARooms() {
    const { selectedBranch } = useAuth()
    const { t } = useLanguage()
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("all")
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showAddRoomModal, setShowAddRoomModal] = useState(false)
    const [showEditRoomModal, setShowEditRoomModal] = useState(false)
    const [selectedRoom, setSelectedRoom] = useState(null)
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [rooms, setRooms] = useState([])
    const [patients, setPatients] = useState([])
    const [doctors, setDoctors] = useState([])
    const [nurses, setNurses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [assignData, setAssignData] = useState({
        patientId: "",
        roomId: "",
        admissionDate: new Date().toISOString().split("T")[0],
        expectedDischargeDate: "",
        diagnosis: "",
        doctorId: "",
        nurseId: "",
        notes: "",
    })
    const [paymentData, setPaymentData] = useState({
        amount: "",
        paymentMethod: "cash",
        paymentDate: new Date().toISOString().split("T")[0],
        notes: "",
    })
    const [roomData, setRoomData] = useState({
        roomNumber: "",
        roomType: "standard",
        floor: "1",
        capacity: "2",
        dailyRate: "",
        status: "available",
        description: "",
    })
    const [showStats, setShowStats] = useState(false)
    const [stats, setStats] = useState({
        totalRooms: 0,
        availableRooms: 0,
        occupiedRooms: 0,
        maintenanceRooms: 0,
        totalInpatients: 0,
        averageStayDuration: 0,
        occupancyRate: 0,
        totalRevenue: 0,
        averageDailyRevenue: 0,
    })

    // Fetch rooms and related data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // In a real app, these would be API calls
                // Simulating API calls with setTimeout
                setTimeout(() => {
                    // Mock rooms data
                    const mockRooms = [
                        {
                            id: 1,
                            roomNumber: "101",
                            roomType: "standard",
                            floor: "1",
                            capacity: 2,
                            occupiedBeds: 1,
                            dailyRate: 500000,
                            status: "occupied",
                            description: "Standard room with two beds",
                            patients: [
                                {
                                    id: 101,
                                    name: "Alisher Karimov",
                                    age: 45,
                                    gender: "male",
                                    diagnosis: "Pneumonia",
                                    admissionDate: "2023-05-15",
                                    expectedDischargeDate: "2023-05-22",
                                    doctorId: 3,
                                    doctorName: "Dr. Aziz Yusupov",
                                    nurseId: 5,
                                    nurseName: "Nilufar Rakhimova",
                                    status: "stable",
                                    payments: [
                                        {
                                            id: 1001,
                                            amount: 1500000,
                                            paymentMethod: "cash",
                                            paymentDate: "2023-05-15",
                                            status: "paid",
                                        },
                                    ],
                                    notes: "Patient is responding well to antibiotics. Continue monitoring temperature.",
                                },
                            ],
                        },
                        {
                            id: 2,
                            roomNumber: "102",
                            roomType: "premium",
                            floor: "1",
                            capacity: 1,
                            occupiedBeds: 1,
                            dailyRate: 1000000,
                            status: "occupied",
                            description: "Premium single room with private bathroom",
                            patients: [
                                {
                                    id: 102,
                                    name: "Dilnoza Saidova",
                                    age: 32,
                                    gender: "female",
                                    diagnosis: "Post-surgery recovery",
                                    admissionDate: "2023-05-16",
                                    expectedDischargeDate: "2023-05-23",
                                    doctorId: 4,
                                    doctorName: "Dr. Malika Umarova",
                                    nurseId: 6,
                                    nurseName: "Gulnora Tashmatova",
                                    status: "critical",
                                    payments: [
                                        {
                                            id: 1002,
                                            amount: 3000000,
                                            paymentMethod: "card",
                                            paymentDate: "2023-05-16",
                                            status: "paid",
                                        },
                                    ],
                                    notes: "Patient experiencing post-operative pain. Monitor vital signs closely.",
                                },
                            ],
                        },
                        {
                            id: 3,
                            roomNumber: "103",
                            roomType: "standard",
                            floor: "1",
                            capacity: 2,
                            occupiedBeds: 0,
                            dailyRate: 500000,
                            status: "available",
                            description: "Standard room with two beds",
                            patients: [],
                        },
                        {
                            id: 4,
                            roomNumber: "201",
                            roomType: "intensive",
                            floor: "2",
                            capacity: 1,
                            occupiedBeds: 1,
                            dailyRate: 1500000,
                            status: "occupied",
                            description: "Intensive care unit room",
                            patients: [
                                {
                                    id: 103,
                                    name: "Rustam Khasanov",
                                    age: 58,
                                    gender: "male",
                                    diagnosis: "Cardiac monitoring",
                                    admissionDate: "2023-05-14",
                                    expectedDischargeDate: "2023-05-24",
                                    doctorId: 2,
                                    doctorName: "Dr. Kamil Rakhimov",
                                    nurseId: 7,
                                    nurseName: "Zarina Kamalova",
                                    status: "improving",
                                    payments: [
                                        {
                                            id: 1003,
                                            amount: 5000000,
                                            paymentMethod: "insurance",
                                            paymentDate: "2023-05-14",
                                            status: "paid",
                                        },
                                    ],
                                    notes: "Cardiac function improving. Continue current treatment plan.",
                                },
                            ],
                        },
                        {
                            id: 5,
                            roomNumber: "202",
                            roomType: "premium",
                            floor: "2",
                            capacity: 1,
                            occupiedBeds: 0,
                            dailyRate: 1000000,
                            status: "maintenance",
                            description: "Premium single room with private bathroom",
                            patients: [],
                        },
                    ]

                    // Mock patients data
                    const mockPatients = [
                        {
                            id: 104,
                            name: "Nodira Azimova",
                            age: 27,
                            gender: "female",
                            phone: "+998901234570",
                            address: "Tashkent, Shaykhantaur district",
                        },
                        {
                            id: 105,
                            name: "Jahongir Tursunov",
                            age: 42,
                            gender: "male",
                            phone: "+998901234571",
                            address: "Tashkent, Almazar district",
                        },
                        {
                            id: 106,
                            name: "Sevara Umarova",
                            age: 35,
                            gender: "female",
                            phone: "+998901234572",
                            address: "Tashkent, Yunusabad district",
                        },
                        {
                            id: 107,
                            name: "Bekzod Turaev",
                            age: 29,
                            gender: "male",
                            phone: "+998901234573",
                            address: "Tashkent, Chilanzar district",
                        },
                    ]

                    // Mock doctors data
                    const mockDoctors = [
                        {
                            id: 1,
                            name: "Dr. Sardor Alimov",
                            specialization: "General Practitioner",
                        },
                        {
                            id: 2,
                            name: "Dr. Kamil Rakhimov",
                            specialization: "Cardiologist",
                        },
                        {
                            id: 3,
                            name: "Dr. Aziz Yusupov",
                            specialization: "Pulmonologist",
                        },
                        {
                            id: 4,
                            name: "Dr. Malika Umarova",
                            specialization: "Surgeon",
                        },
                    ]

                    // Mock nurses data
                    const mockNurses = [
                        {
                            id: 5,
                            name: "Nilufar Rakhimova",
                            shift: "morning",
                        },
                        {
                            id: 6,
                            name: "Gulnora Tashmatova",
                            shift: "evening",
                        },
                        {
                            id: 7,
                            name: "Zarina Kamalova",
                            shift: "night",
                        },
                        {
                            id: 8,
                            name: "Dilfuza Karimova",
                            shift: "morning",
                        },
                    ]

                    setRooms(mockRooms)
                    setPatients(mockPatients)
                    setDoctors(mockDoctors)
                    setNurses(mockNurses)

                    // Calculate statistics
                    const totalRooms = mockRooms.length
                    const availableRooms = mockRooms.filter((room) => room.status === "available").length
                    const occupiedRooms = mockRooms.filter((room) => room.status === "occupied").length
                    const maintenanceRooms = mockRooms.filter((room) => room.status === "maintenance").length

                    // Count total inpatients
                    const totalInpatients = mockRooms.reduce((total, room) => total + room.patients.length, 0)

                    // Calculate average stay duration (in days)
                    const today = new Date()
                    let totalDays = 0
                    let patientCount = 0

                    mockRooms.forEach((room) => {
                        room.patients.forEach((patient) => {
                            const admissionDate = new Date(patient.admissionDate)
                            const days = Math.floor((today - admissionDate) / (1000 * 60 * 60 * 24))
                            totalDays += days
                            patientCount++
                        })
                    })

                    const averageStayDuration = patientCount > 0 ? Math.round(totalDays / patientCount) : 0

                    // Calculate occupancy rate
                    const totalCapacity = mockRooms.reduce((total, room) => total + room.capacity, 0)
                    const occupancyRate = totalCapacity > 0 ? Math.round((totalInpatients / totalCapacity) * 100) : 0

                    // Calculate total revenue
                    const totalRevenue = mockRooms.reduce((total, room) => {
                        return (
                            total +
                            room.patients.reduce((patientTotal, patient) => {
                                return (
                                    patientTotal +
                                    patient.payments.reduce((paymentTotal, payment) => {
                                        return paymentTotal + payment.amount
                                    }, 0)
                                )
                            }, 0)
                        )
                    }, 0)

                    // Calculate average daily revenue
                    const averageDailyRevenue = totalRevenue > 0 && totalDays > 0 ? Math.round(totalRevenue / totalDays) : 0

                    setStats({
                        totalRooms,
                        availableRooms,
                        occupiedRooms,
                        maintenanceRooms,
                        totalInpatients,
                        averageStayDuration,
                        occupancyRate,
                        totalRevenue,
                        averageDailyRevenue,
                    })

                    setLoading(false)
                }, 800)
            } catch (err) {
                setError(err.message || "An error occurred")
                setLoading(false)
            }
        }

        fetchData()
    }, [selectedBranch])

    // Filter rooms based on search term and filter status
    const filteredRooms = rooms.filter((room) => {
        const matchesSearch =
            room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.patients.some((patient) => patient.name.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesFilter = filterStatus === "all" || room.status === filterStatus

        return matchesSearch && matchesFilter
    })

    // Handle assign form input changes
    const handleAssignInputChange = (e) => {
        const { name, value } = e.target
        setAssignData({
            ...assignData,
            [name]: value,
        })
    }

    // Handle payment form input changes
    const handlePaymentInputChange = (e) => {
        const { name, value } = e.target
        setPaymentData({
            ...paymentData,
            [name]: value,
        })
    }

    // Handle room form input changes
    const handleRoomInputChange = (e) => {
        const { name, value } = e.target
        setRoomData({
            ...roomData,
            [name]: value,
        })
    }

    // Open assign modal
    const openAssignModal = (room) => {
        setSelectedRoom(room)
        setAssignData({
            ...assignData,
            roomId: room.id,
            admissionDate: new Date().toISOString().split("T")[0],
        })
        setShowAssignModal(true)
    }

    // Open payment modal
    const openPaymentModal = (room, patient) => {
        setSelectedRoom(room)
        setSelectedPatient(patient)
        setPaymentData({
            amount: "",
            paymentMethod: "cash",
            paymentDate: new Date().toISOString().split("T")[0],
            notes: "",
        })
        setShowPaymentModal(true)
    }

    // Open add room modal
    const openAddRoomModal = () => {
        setRoomData({
            roomNumber: "",
            roomType: "standard",
            floor: "1",
            capacity: "2",
            dailyRate: "",
            status: "available",
            description: "",
        })
        setShowAddRoomModal(true)
    }

    // Open edit room modal
    const openEditRoomModal = (room) => {
        setSelectedRoom(room)
        setRoomData({
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            floor: room.floor,
            capacity: room.capacity.toString(),
            dailyRate: room.dailyRate.toString(),
            status: room.status,
            description: room.description,
        })
        setShowEditRoomModal(true)
    }

    // Assign patient to room
    const handleAssignPatient = () => {
        const selectedPatientObj = patients.find((p) => p.id === Number.parseInt(assignData.patientId))
        const selectedDoctorObj = doctors.find((d) => d.id === Number.parseInt(assignData.doctorId))
        const selectedNurseObj = nurses.find((n) => n.id === Number.parseInt(assignData.nurseId))

        const newPatient = {
            id: Number.parseInt(assignData.patientId),
            name: selectedPatientObj.name,
            age: selectedPatientObj.age,
            gender: selectedPatientObj.gender,
            diagnosis: assignData.diagnosis,
            admissionDate: assignData.admissionDate,
            expectedDischargeDate: assignData.expectedDischargeDate,
            doctorId: Number.parseInt(assignData.doctorId),
            doctorName: selectedDoctorObj.name,
            nurseId: Number.parseInt(assignData.nurseId),
            nurseName: selectedNurseObj.name,
            status: "stable",
            payments: [],
            notes: assignData.notes,
        }

        const updatedRooms = rooms.map((room) => {
            if (room.id === selectedRoom.id) {
                const updatedOccupiedBeds = room.occupiedBeds + 1
                const updatedStatus = updatedOccupiedBeds >= room.capacity ? "occupied" : room.status

                return {
                    ...room,
                    occupiedBeds: updatedOccupiedBeds,
                    status: updatedStatus,
                    patients: [...room.patients, newPatient],
                }
            }
            return room
        })

        setRooms(updatedRooms)
        setShowAssignModal(false)
        setAssignData({
            patientId: "",
            roomId: "",
            admissionDate: new Date().toISOString().split("T")[0],
            expectedDischargeDate: "",
            diagnosis: "",
            doctorId: "",
            nurseId: "",
            notes: "",
        })
    }

    // Add payment for patient
    const handleAddPayment = () => {
        const newPayment = {
            id: Math.floor(Math.random() * 10000),
            amount: Number.parseFloat(paymentData.amount),
            paymentMethod: paymentData.paymentMethod,
            paymentDate: paymentData.paymentDate,
            status: "paid",
            notes: paymentData.notes,
        }

        const updatedRooms = rooms.map((room) => {
            if (room.id === selectedRoom.id) {
                return {
                    ...room,
                    patients: room.patients.map((patient) => {
                        if (patient.id === selectedPatient.id) {
                            return {
                                ...patient,
                                payments: [...patient.payments, newPayment],
                            }
                        }
                        return patient
                    }),
                }
            }
            return room
        })

        setRooms(updatedRooms)
        setShowPaymentModal(false)
        setPaymentData({
            amount: "",
            paymentMethod: "cash",
            paymentDate: new Date().toISOString().split("T")[0],
            notes: "",
        })
    }

    // Add new room
    const handleAddRoom = () => {
        const newRoom = {
            id: Math.floor(Math.random() * 10000),
            roomNumber: roomData.roomNumber,
            roomType: roomData.roomType,
            floor: roomData.floor,
            capacity: Number.parseInt(roomData.capacity),
            occupiedBeds: 0,
            dailyRate: Number.parseFloat(roomData.dailyRate),
            status: roomData.status,
            description: roomData.description,
            patients: [],
        }

        setRooms([...rooms, newRoom])
        setShowAddRoomModal(false)
        setRoomData({
            roomNumber: "",
            roomType: "standard",
            floor: "1",
            capacity: "2",
            dailyRate: "",
            status: "available",
            description: "",
        })
    }

    // Edit room
    const handleEditRoom = () => {
        const updatedRooms = rooms.map((room) => {
            if (room.id === selectedRoom.id) {
                return {
                    ...room,
                    roomNumber: roomData.roomNumber,
                    roomType: roomData.roomType,
                    floor: roomData.floor,
                    capacity: Number.parseInt(roomData.capacity),
                    dailyRate: Number.parseFloat(roomData.dailyRate),
                    status: roomData.status,
                    description: roomData.description,
                }
            }
            return room
        })

        setRooms(updatedRooms)
        setShowEditRoomModal(false)
    }

    // Delete room
    const handleDeleteRoom = (roomId) => {
        if (window.confirm(t("confirm_delete_room"))) {
            const updatedRooms = rooms.filter((room) => room.id !== roomId)
            setRooms(updatedRooms)
        }
    }

    // Discharge patient
    const handleDischargePatient = (roomId, patientId) => {
        if (window.confirm(t("confirm_discharge_patient"))) {
            const updatedRooms = rooms.map((room) => {
                if (room.id === roomId) {
                    const updatedPatients = room.patients.filter((patient) => patient.id !== patientId)
                    const updatedOccupiedBeds = room.occupiedBeds - 1
                    const updatedStatus = updatedOccupiedBeds === 0 ? "available" : room.status

                    return {
                        ...room,
                        occupiedBeds: updatedOccupiedBeds,
                        status: updatedStatus,
                        patients: updatedPatients,
                    }
                }
                return room
            })

            setRooms(updatedRooms)
        }
    }

    // Calculate total payments for a patient
    const calculateTotalPayments = (patient) => {
        return patient.payments.reduce((total, payment) => total + payment.amount, 0)
    }

    // Get room type label
    const getRoomTypeLabel = (type) => {
        switch (type) {
            case "standard":
                return t("standard_room")
            case "premium":
                return t("premium_room")
            case "intensive":
                return t("intensive_care")
            default:
                return type
        }
    }

    // Get room status label
    const getRoomStatusLabel = (status) => {
        switch (status) {
            case "available":
                return t("available")
            case "occupied":
                return t("occupied")
            case "maintenance":
                return t("maintenance")
            default:
                return status
        }
    }

    // Get patient status label
    const getPatientStatusLabel = (status) => {
        switch (status) {
            case "stable":
                return t("stable")
            case "critical":
                return t("critical")
            case "improving":
                return t("improving")
            default:
                return status
        }
    }

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("uz-UZ", { style: "currency", currency: "UZS" }).format(amount)
    }

    // Toggle statistics
    const toggleStats = () => {
        setShowStats(!showStats)
    }

    // Loading state
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>{t("loading")}...</p>
            </div>
        )
    }

    // Error state
    if (error) {
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
        <div className="admin-rooms">
            <div className="page-header">
                <h1>
                    <FaBed /> {t("inpatient_rooms")}
                </h1>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={toggleStats}>
                        {showStats ? t("close_stats") : t("statistics")}
                    </button>
                    <button className="btn btn-primary" onClick={openAddRoomModal}>
                        <FaPlus /> {t("add_new_room")}
                    </button>
                    <div className="search-box">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder={t("search_rooms_patients")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-dropdown">
                        <FaFilter />
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="all">{t("all_rooms")}</option>
                            <option value="available">{t("available")}</option>
                            <option value="occupied">{t("occupied")}</option>
                            <option value="maintenance">{t("maintenance")}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistics Panel */}
            {showStats && (
                <div className="stats-panel">
                    <h2>{t("inpatient_rooms_statistics")}</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-title">{t("total_rooms")}</div>
                            <div className="stat-value">{stats.totalRooms}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-title">{t("available_rooms")}</div>
                            <div className="stat-value">{stats.availableRooms}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-title">{t("occupied_rooms")}</div>
                            <div className="stat-value">{stats.occupiedRooms}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-title">{t("maintenance_rooms")}</div>
                            <div className="stat-value">{stats.maintenanceRooms}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-title">{t("total_inpatients")}</div>
                            <div className="stat-value">{stats.totalInpatients}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-title">{t("average_stay_duration")}</div>
                            <div className="stat-value">
                                {stats.averageStayDuration} {t("days")}
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-title">{t("occupancy_rate")}</div>
                            <div className="stat-value">{stats.occupancyRate}%</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-title">{t("total_revenue")}</div>
                            <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-title">{t("average_daily_revenue")}</div>
                            <div className="stat-value">{formatCurrency(stats.averageDailyRevenue)}</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="rooms-grid">
                {filteredRooms.length > 0 ? (
                    filteredRooms.map((room) => (
                        <div key={room.id} className={`room-card ${room.status}`}>
                            <div className="room-header">
                                <h3>
                                    {t("room")} {room.roomNumber}
                                </h3>
                                <div className="room-badges">
                                    <span className={`room-type ${room.roomType}`}>{getRoomTypeLabel(room.roomType)}</span>
                                    <span className={`room-status ${room.status}`}>{getRoomStatusLabel(room.status)}</span>
                                </div>
                            </div>

                            <div className="room-details">
                                <div className="detail-row">
                                    <span className="detail-label">{t("floor")}:</span>
                                    <span>{room.floor}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">{t("capacity")}:</span>
                                    <span>
                                        {room.occupiedBeds}/{room.capacity}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">{t("daily_rate")}:</span>
                                    <span>{formatCurrency(room.dailyRate)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">{t("description")}:</span>
                                    <span>{room.description}</span>
                                </div>
                            </div>

                            <div className="room-actions admin-actions">
                                <button className="btn btn-sm btn-primary" onClick={() => openEditRoomModal(room)}>
                                    <FaEdit /> {t("edit")}
                                </button>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteRoom(room.id)}
                                    disabled={room.patients.length > 0}
                                >
                                    <FaTrash /> {t("delete")}
                                </button>
                            </div>

                            {room.patients.length > 0 ? (
                                <div className="patients-list">
                                    <h4>{t("current_patients")}</h4>
                                    {room.patients.map((patient) => (
                                        <div key={patient.id} className="patient-card">
                                            <div className="patient-header">
                                                <h5>{patient.name}</h5>
                                                <span className={`patient-status ${patient.status}`}>
                                                    {getPatientStatusLabel(patient.status)}
                                                </span>
                                            </div>

                                            <div className="patient-details">
                                                <div className="detail-row">
                                                    <span className="detail-label">{t("age")}:</span>
                                                    <span>{patient.age}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">{t("gender")}:</span>
                                                    <span>{t(patient.gender)}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">{t("diagnosis")}:</span>
                                                    <span>{patient.diagnosis}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">{t("admission_date")}:</span>
                                                    <span>{patient.admissionDate}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">{t("expected_discharge_date")}:</span>
                                                    <span>{patient.expectedDischargeDate}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">{t("doctor")}:</span>
                                                    <span>{patient.doctorName}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">{t("nurse")}:</span>
                                                    <span>{patient.nurseName}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">{t("total_payment")}:</span>
                                                    <span>{formatCurrency(calculateTotalPayments(patient))}</span>
                                                </div>
                                            </div>

                                            <div className="patient-actions">
                                                <button className="btn btn-primary" onClick={() => openPaymentModal(room, patient)}>
                                                    <FaMoneyBillWave /> {t("add_payment")}
                                                </button>
                                                <button className="btn btn-danger" onClick={() => handleDischargePatient(room.id, patient.id)}>
                                                    <FaCheckCircle /> {t("discharge")}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-patients">
                                    <p>{t("no_patients_in_room")}</p>
                                </div>
                            )}

                            {(room.status === "available" || (room.status === "occupied" && room.occupiedBeds < room.capacity)) && (
                                <div className="room-actions">
                                    <button className="btn btn-primary" onClick={() => openAssignModal(room)}>
                                        <FaUserInjured /> {t("assign_patient")}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <FaBed className="no-results-icon" />
                        <h3>{t("no_rooms_found")}</h3>
                        <p>{t("try_different_search")}</p>
                    </div>
                )}
            </div>

            {/* Assign Patient Modal */}
            {showAssignModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>
                                {t("assign_patient_to_room")} {selectedRoom.roomNumber}
                            </h3>
                            <button className="close-btn" onClick={() => setShowAssignModal(false)}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="patientId">{t("patient")}</label>
                                <select
                                    id="patientId"
                                    name="patientId"
                                    value={assignData.patientId}
                                    onChange={handleAssignInputChange}
                                    required
                                >
                                    <option value="">{t("select_patient")}</option>
                                    {patients.map((patient) => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.name} ({patient.age}, {t(patient.gender)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="admissionDate">{t("admission_date")}</label>
                                <input
                                    type="date"
                                    id="admissionDate"
                                    name="admissionDate"
                                    value={assignData.admissionDate}
                                    onChange={handleAssignInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="expectedDischargeDate">{t("expected_discharge_date")}</label>
                                <input
                                    type="date"
                                    id="expectedDischargeDate"
                                    name="expectedDischargeDate"
                                    value={assignData.expectedDischargeDate}
                                    onChange={handleAssignInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="diagnosis">{t("diagnosis")}</label>
                                <input
                                    type="text"
                                    id="diagnosis"
                                    name="diagnosis"
                                    value={assignData.diagnosis}
                                    onChange={handleAssignInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="doctorId">{t("doctor")}</label>
                                <select
                                    id="doctorId"
                                    name="doctorId"
                                    value={assignData.doctorId}
                                    onChange={handleAssignInputChange}
                                    required
                                >
                                    <option value="">{t("select_doctor")}</option>
                                    {doctors.map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.name} ({doctor.specialization})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="nurseId">{t("nurse")}</label>
                                <select
                                    id="nurseId"
                                    name="nurseId"
                                    value={assignData.nurseId}
                                    onChange={handleAssignInputChange}
                                    required
                                >
                                    <option value="">{t("select_nurse")}</option>
                                    {nurses.map((nurse) => (
                                        <option key={nurse.id} value={nurse.id}>
                                            {nurse.name} ({t(nurse.shift + "_shift")})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="notes">{t("notes")}</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={assignData.notes}
                                    onChange={handleAssignInputChange}
                                    rows="3"
                                ></textarea>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                                {t("cancel")}
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleAssignPatient}
                                disabled={
                                    !assignData.patientId ||
                                    !assignData.expectedDischargeDate ||
                                    !assignData.diagnosis ||
                                    !assignData.doctorId ||
                                    !assignData.nurseId
                                }
                            >
                                {t("assign_patient")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Payment Modal */}
            {showPaymentModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>
                                {t("add_payment_for")} {selectedPatient.name}
                            </h3>
                            <button className="close-btn" onClick={() => setShowPaymentModal(false)}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="amount">{t("amount")}</label>
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    value={paymentData.amount}
                                    onChange={handlePaymentInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="paymentMethod">{t("payment_method")}</label>
                                <select
                                    id="paymentMethod"
                                    name="paymentMethod"
                                    value={paymentData.paymentMethod}
                                    onChange={handlePaymentInputChange}
                                >
                                    <option value="cash">{t("cash")}</option>
                                    <option value="card">{t("card")}</option>
                                    <option value="insurance">{t("insurance")}</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="paymentDate">{t("payment_date")}</label>
                                <input
                                    type="date"
                                    id="paymentDate"
                                    name="paymentDate"
                                    value={paymentData.paymentDate}
                                    onChange={handlePaymentInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="notes">{t("notes")}</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={paymentData.notes}
                                    onChange={handlePaymentInputChange}
                                    rows="3"
                                ></textarea>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                                {t("cancel")}
                            </button>
                            <button className="btn btn-primary" onClick={handleAddPayment} disabled={!paymentData.amount}>
                                {t("add_payment")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Room Modal */}
            {showAddRoomModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{t("add_new_room")}</h3>
                            <button className="close-btn" onClick={() => setShowAddRoomModal(false)}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="roomNumber">{t("room_number")}</label>
                                <input
                                    type="text"
                                    id="roomNumber"
                                    name="roomNumber"
                                    value={roomData.roomNumber}
                                    onChange={handleRoomInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="roomType">{t("room_type")}</label>
                                <select id="roomType" name="roomType" value={roomData.roomType} onChange={handleRoomInputChange}>
                                    <option value="standard">{t("standard_room")}</option>
                                    <option value="premium">{t("premium_room")}</option>
                                    <option value="intensive">{t("intensive_care")}</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="floor">{t("floor")}</label>
                                <input
                                    type="text"
                                    id="floor"
                                    name="floor"
                                    value={roomData.floor}
                                    onChange={handleRoomInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="capacity">{t("capacity")}</label>
                                <input
                                    type="number"
                                    id="capacity"
                                    name="capacity"
                                    value={roomData.capacity}
                                    onChange={handleRoomInputChange}
                                    min="1"
                                    max="10"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="dailyRate">{t("daily_rate")}</label>
                                <input
                                    type="number"
                                    id="dailyRate"
                                    name="dailyRate"
                                    value={roomData.dailyRate}
                                    onChange={handleRoomInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">{t("status")}</label>
                                <select id="status" name="status" value={roomData.status} onChange={handleRoomInputChange}>
                                    <option value="available">{t("available")}</option>
                                    <option value="maintenance">{t("maintenance")}</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">{t("description")}</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={roomData.description}
                                    onChange={handleRoomInputChange}
                                    rows="3"
                                ></textarea>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAddRoomModal(false)}>
                                {t("cancel")}
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleAddRoom}
                                disabled={!roomData.roomNumber || !roomData.dailyRate}
                            >
                                {t("add")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Room Modal */}
            {showEditRoomModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{t("edit_room")}</h3>
                            <button className="close-btn" onClick={() => setShowEditRoomModal(false)}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="roomNumber">{t("room_number")}</label>
                                <input
                                    type="text"
                                    id="roomNumber"
                                    name="roomNumber"
                                    value={roomData.roomNumber}
                                    onChange={handleRoomInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="roomType">{t("room_type")}</label>
                                <select id="roomType" name="roomType" value={roomData.roomType} onChange={handleRoomInputChange}>
                                    <option value="standard">{t("standard_room")}</option>
                                    <option value="premium">{t("premium_room")}</option>
                                    <option value="intensive">{t("intensive_care")}</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="floor">{t("floor")}</label>
                                <input
                                    type="text"
                                    id="floor"
                                    name="floor"
                                    value={roomData.floor}
                                    onChange={handleRoomInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="capacity">{t("capacity")}</label>
                                <input
                                    type="number"
                                    id="capacity"
                                    name="capacity"
                                    value={roomData.capacity}
                                    onChange={handleRoomInputChange}
                                    min="1"
                                    max="10"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="dailyRate">{t("daily_rate")}</label>
                                <input
                                    type="number"
                                    id="dailyRate"
                                    name="dailyRate"
                                    value={roomData.dailyRate}
                                    onChange={handleRoomInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">{t("status")}</label>
                                <select id="status" name="status" value={roomData.status} onChange={handleRoomInputChange}>
                                    <option value="available">{t("available")}</option>
                                    <option value="occupied">{t("occupied")}</option>
                                    <option value="maintenance">{t("maintenance")}</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">{t("description")}</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={roomData.description}
                                    onChange={handleRoomInputChange}
                                    rows="3"
                                ></textarea>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowEditRoomModal(false)}>
                                {t("cancel")}
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleEditRoom}
                                disabled={!roomData.roomNumber || !roomData.dailyRate}
                            >
                                {t("save")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
