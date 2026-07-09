import React , { useState, useEffect } from "react"
import { useAuth } from "../../../contexts/AuthContext"
import { useLanguage } from "../../../contexts/LanguageContext"
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch,
    FaFilter,
    FaUserInjured,
    FaBed,
    FaMoneyBillWave,
    FaCheckCircle,
} from "react-icons/fa"

export default function Rooms() {
    const { user, selectedBranch } = useAuth()
    const { t, language } = useLanguage()
    const [activeTab, setActiveTab] = useState("current")
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showStatsModal, setShowStatsModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("all")
    const [selectedRoom, setSelectedRoom] = useState(null)
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [selectedNurse, setSelectedNurse] = useState(null)
    const [formData, setFormData] = useState({
        roomNumber: "",
        roomType: "standard",
        floor: "1",
        capacity: "1",
        dailyRate: "",
        status: "available",
        description: "",
    })
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

    // Mock data for rooms
    const [rooms, setRooms] = useState([
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
                    status: "active",
                    payments: [
                        {
                            id: 1001,
                            amount: 1500000,
                            paymentMethod: "cash",
                            paymentDate: "2023-05-15",
                            status: "paid",
                        },
                    ],
                    notes: "Patient needs regular monitoring",
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
                    status: "active",
                    payments: [
                        {
                            id: 1002,
                            amount: 3000000,
                            paymentMethod: "card",
                            paymentDate: "2023-05-16",
                            status: "paid",
                        },
                    ],
                    notes: "Patient recovering well",
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
                    status: "critical",
                    payments: [
                        {
                            id: 1003,
                            amount: 5000000,
                            paymentMethod: "insurance",
                            paymentDate: "2023-05-14",
                            status: "paid",
                        },
                    ],
                    notes: "Patient requires 24/7 monitoring",
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
    ])

    // Mock data for patients
    const [patients, setPatients] = useState([
        {
            id: 101,
            name: "Alisher Karimov",
            age: 45,
            gender: "male",
            phone: "+998901234567",
            address: "Tashkent, Chilanzar district",
        },
        {
            id: 102,
            name: "Dilnoza Saidova",
            age: 32,
            gender: "female",
            phone: "+998901234568",
            address: "Tashkent, Yunusabad district",
        },
        {
            id: 103,
            name: "Rustam Khasanov",
            age: 58,
            gender: "male",
            phone: "+998901234569",
            address: "Tashkent, Mirzo Ulugbek district",
        },
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
    ])

    // Mock data for doctors
    const [doctors, setDoctors] = useState([
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
    ])

    // Mock data for nurses
    const [nurses, setNurses] = useState([
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
    ])

    // Mock data for room history
    const [roomHistory, setRoomHistory] = useState([
        {
            id: 1,
            roomId: 1,
            patientId: 106,
            patientName: "Bekzod Turaev",
            admissionDate: "2023-04-10",
            dischargeDate: "2023-04-17",
            doctorId: 1,
            doctorName: "Dr. Sardor Alimov",
            diagnosis: "Influenza",
            totalPayment: 3500000,
        },
        {
            id: 2,
            roomId: 2,
            patientId: 107,
            patientName: "Sabina Kamalova",
            admissionDate: "2023-04-15",
            dischargeDate: "2023-04-20",
            doctorId: 4,
            doctorName: "Dr. Malika Umarova",
            diagnosis: "Appendectomy recovery",
            totalPayment: 5000000,
        },
        {
            id: 3,
            roomId: 4,
            patientId: 108,
            patientName: "Timur Azizov",
            admissionDate: "2023-04-05",
            dischargeDate: "2023-04-12",
            doctorId: 2,
            doctorName: "Dr. Kamil Rakhimov",
            diagnosis: "Heart attack",
            totalPayment: 10500000,
        },
    ])

    // Statistics data
    const [stats, setStats] = useState({
        totalRooms: rooms.length,
        availableRooms: rooms.filter((room) => room.status === "available").length,
        occupiedRooms: rooms.filter((room) => room.status === "occupied").length,
        maintenanceRooms: rooms.filter((room) => room.status === "maintenance").length,
        totalPatients: rooms.reduce((acc, room) => acc + room.patients.length, 0),
        averageStayDuration: 7, // days
        occupancyRate: (rooms.filter((room) => room.status === "occupied").length / rooms.length) * 100,
        totalRevenue: 15000000, // sum
        averageDailyRevenue: 2000000, // sum
    })

    // Filter rooms based on search term and filter status
    const filteredRooms = rooms.filter((room) => {
        const matchesSearch =
            room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.patients.some((patient) => patient.name.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesFilter = filterStatus === "all" || room.status === filterStatus

        return matchesSearch && matchesFilter
    })

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })
    }

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

    // Add new room
    const handleAddRoom = () => {
        const newRoom = {
            id: rooms.length + 1,
            roomNumber: formData.roomNumber,
            roomType: formData.roomType,
            floor: formData.floor,
            capacity: Number.parseInt(formData.capacity),
            occupiedBeds: 0,
            dailyRate: Number.parseFloat(formData.dailyRate),
            status: formData.status,
            description: formData.description,
            patients: [],
        }

        setRooms([...rooms, newRoom])
        setShowAddModal(false)
        setFormData({
            roomNumber: "",
            roomType: "standard",
            floor: "1",
            capacity: "1",
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
                    roomNumber: formData.roomNumber,
                    roomType: formData.roomType,
                    floor: formData.floor,
                    capacity: Number.parseInt(formData.capacity),
                    dailyRate: Number.parseFloat(formData.dailyRate),
                    status: formData.status,
                    description: formData.description,
                }
            }
            return room
        })

        setRooms(updatedRooms)
        setShowEditModal(false)
    }

    // Delete room
    const handleDeleteRoom = (roomId) => {
        if (window.confirm(t("confirm_delete_room"))) {
            const updatedRooms = rooms.filter((room) => room.id !== roomId)
            setRooms(updatedRooms)
        }
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
            status: "active",
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

    // Discharge patient
    const handleDischargePatient = (roomId, patientId) => {
        if (window.confirm(t("confirm_discharge_patient"))) {
            // Find the room and patient
            const room = rooms.find((r) => r.id === roomId)
            const patient = room.patients.find((p) => p.id === patientId)

            // Add to history
            const historyEntry = {
                id: roomHistory.length + 1,
                roomId: roomId,
                patientId: patientId,
                patientName: patient.name,
                admissionDate: patient.admissionDate,
                dischargeDate: new Date().toISOString().split("T")[0],
                doctorId: patient.doctorId,
                doctorName: patient.doctorName,
                diagnosis: patient.diagnosis,
                totalPayment: patient.payments.reduce((total, payment) => total + payment.amount, 0),
            }

            setRoomHistory([...roomHistory, historyEntry])

            // Update rooms
            const updatedRooms = rooms.map((r) => {
                if (r.id === roomId) {
                    const updatedPatients = r.patients.filter((p) => p.id !== patientId)
                    const updatedOccupiedBeds = r.occupiedBeds - 1
                    const updatedStatus = updatedOccupiedBeds === 0 ? "available" : r.status

                    return {
                        ...r,
                        occupiedBeds: updatedOccupiedBeds,
                        status: updatedStatus,
                        patients: updatedPatients,
                    }
                }
                return r
            })

            setRooms(updatedRooms)
        }
    }

    // Open edit modal and set form data
    const openEditModal = (room) => {
        setSelectedRoom(room)
        setFormData({
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            floor: room.floor,
            capacity: room.capacity.toString(),
            dailyRate: room.dailyRate.toString(),
            status: room.status,
            description: room.description,
        })
        setShowEditModal(true)
    }

    // Open assign modal
    const openAssignModal = (room) => {
        setSelectedRoom(room)
        setAssignData({
            ...assignData,
            roomId: room.id,
        })
        setShowAssignModal(true)
    }

    // Open payment modal
    const openPaymentModal = (room, patient) => {
        setSelectedRoom(room)
        setSelectedPatient(patient)
        setShowPaymentModal(true)
    }

    // Calculate total payments for a patient
    const calculateTotalPayments = (patient) => {
        return patient.payments.reduce((total, payment) => total + payment.amount, 0)
    }

    // Calculate remaining days for a patient
    const calculateRemainingDays = (patient) => {
        const today = new Date()
        const dischargeDate = new Date(patient.expectedDischargeDate)
        const diffTime = dischargeDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays > 0 ? diffDays : 0
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
            case "active":
                return t("active")
            case "critical":
                return t("critical")
            case "recovering":
                return t("recovering")
            default:
                return status
        }
    }

    // Get payment method label
    const getPaymentMethodLabel = (method) => {
        switch (method) {
            case "cash":
                return t("cash")
            case "card":
                return t("card")
            case "insurance":
                return t("insurance")
            default:
                return method
        }
    }

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("uz-UZ", { style: "currency", currency: "UZS" }).format(amount)
    }

    // Update statistics
    useEffect(() => {
        const totalPatients = rooms.reduce((acc, room) => acc + room.patients.length, 0)
        const occupiedRooms = rooms.filter((room) => room.status === "occupied").length

        setStats({
            totalRooms: rooms.length,
            availableRooms: rooms.filter((room) => room.status === "available").length,
            occupiedRooms: occupiedRooms,
            maintenanceRooms: rooms.filter((room) => room.status === "maintenance").length,
            totalPatients: totalPatients,
            averageStayDuration: 7, // days
            occupancyRate: (occupiedRooms / rooms.length) * 100,
            totalRevenue: rooms.reduce((acc, room) => {
                return (
                    acc +
                    room.patients.reduce((patientAcc, patient) => {
                        return patientAcc + patient.payments.reduce((paymentAcc, payment) => paymentAcc + payment.amount, 0)
                    }, 0)
                )
            }, 0),
            averageDailyRevenue: 2000000, // sum
        })
    }, [rooms])

    return (
        <div className="director-rooms">
            <div className="page-header">
                <h1>
                    <FaBed /> {t("inpatient_rooms")}
                </h1>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <FaPlus /> {t("add_new_room")}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowStatsModal(true)}>
                        {t("statistics")}
                    </button>
                </div>
            </div>

            <div className="tabs">
                <button className={`tab ${activeTab === "current" ? "active" : ""}`} onClick={() => setActiveTab("current")}>
                    {t("current_rooms")}
                </button>
                <button className={`tab ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>
                    {t("room_history")}
                </button>
            </div>

            {activeTab === "current" && (
                <>
                    <div className="filters">
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
                                <option value="available">{t("available_rooms")}</option>
                                <option value="occupied">{t("occupied_rooms")}</option>
                                <option value="maintenance">{t("maintenance_rooms")}</option>
                            </select>
                        </div>
                    </div>

                    <div className="rooms-grid">
                        {filteredRooms.map((room) => (
                            <div key={room.id} className={`room-card ${room.status}`}>
                                <div className="room-header">
                                    <h3>
                                        {t("room")} {room.roomNumber}
                                    </h3>
                                    <div className="room-actions">
                                        <button className="btn-icon" onClick={() => openEditModal(room)} title={t("edit")}>
                                            <FaEdit />
                                        </button>
                                        <button className="btn-icon" onClick={() => handleDeleteRoom(room.id)} title={t("delete")}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                                <div className="room-details">
                                    <p>
                                        <strong>{t("type")}:</strong> {getRoomTypeLabel(room.roomType)}
                                    </p>
                                    <p>
                                        <strong>{t("floor")}:</strong> {room.floor}
                                    </p>
                                    <p>
                                        <strong>{t("capacity")}:</strong> {room.occupiedBeds}/{room.capacity}
                                    </p>
                                    <p>
                                        <strong>{t("daily_rate")}:</strong> {formatCurrency(room.dailyRate)}
                                    </p>
                                    <p>
                                        <strong>{t("status")}:</strong>{" "}
                                        <span className={`status ${room.status}`}>{getRoomStatusLabel(room.status)}</span>
                                    </p>
                                    <p>
                                        <strong>{t("description")}:</strong> {room.description}
                                    </p>
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
                                                    <p>
                                                        <strong>{t("age")}:</strong> {patient.age}
                                                    </p>
                                                    <p>
                                                        <strong>{t("gender")}:</strong> {t(patient.gender)}
                                                    </p>
                                                    <p>
                                                        <strong>{t("diagnosis")}:</strong> {patient.diagnosis}
                                                    </p>
                                                    <p>
                                                        <strong>{t("admission_date")}:</strong> {patient.admissionDate}
                                                    </p>
                                                    <p>
                                                        <strong>{t("expected_discharge")}:</strong> {patient.expectedDischargeDate}
                                                    </p>
                                                    <p>
                                                        <strong>{t("remaining_days")}:</strong> {calculateRemainingDays(patient)}
                                                    </p>
                                                    <p>
                                                        <strong>{t("doctor")}:</strong> {patient.doctorName}
                                                    </p>
                                                    <p>
                                                        <strong>{t("nurse")}:</strong> {patient.nurseName}
                                                    </p>
                                                    <p>
                                                        <strong>{t("total_payment")}:</strong> {formatCurrency(calculateTotalPayments(patient))}
                                                    </p>
                                                    {patient.notes && (
                                                        <p>
                                                            <strong>{t("notes")}:</strong> {patient.notes}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="patient-actions">
                                                    <button className="btn btn-sm" onClick={() => openPaymentModal(room, patient)}>
                                                        <FaMoneyBillWave /> {t("add_payment")}
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDischargePatient(room.id, patient.id)}
                                                    >
                                                        <FaCheckCircle /> {t("discharge")}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-patients">
                                        <p>{t("no_patients_in_room")}</p>
                                        {room.status === "available" && (
                                            <button className="btn btn-primary" onClick={() => openAssignModal(room)}>
                                                <FaUserInjured /> {t("assign_patient")}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {room.status === "occupied" && room.occupiedBeds < room.capacity && (
                                    <div className="room-footer">
                                        <button className="btn btn-primary" onClick={() => openAssignModal(room)}>
                                            <FaUserInjured /> {t("assign_patient")}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {activeTab === "history" && (
                <div className="room-history">
                    <h3>{t("room_occupancy_history")}</h3>
                    {roomHistory.length > 0 ? (
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>{t("room_number")}</th>
                                    <th>{t("patient_name")}</th>
                                    <th>{t("admission_date")}</th>
                                    <th>{t("discharge_date")}</th>
                                    <th>{t("duration")}</th>
                                    <th>{t("doctor")}</th>
                                    <th>{t("diagnosis")}</th>
                                    <th>{t("total_payment")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roomHistory.map((history) => {
                                    const room = rooms.find((r) => r.id === history.roomId)
                                    const admissionDate = new Date(history.admissionDate)
                                    const dischargeDate = new Date(history.dischargeDate)
                                    const durationDays = Math.ceil((dischargeDate - admissionDate) / (1000 * 60 * 60 * 24))

                                    return (
                                        <tr key={history.id}>
                                            <td>{room ? room.roomNumber : history.roomId}</td>
                                            <td>{history.patientName}</td>
                                            <td>{history.admissionDate}</td>
                                            <td>{history.dischargeDate}</td>
                                            <td>
                                                {durationDays} {t("days")}
                                            </td>
                                            <td>{history.doctorName}</td>
                                            <td>{history.diagnosis}</td>
                                            <td>{formatCurrency(history.totalPayment)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-history">
                            <p>{t("no_room_history")}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Room Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{t("add_new_room")}</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
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
                                    value={formData.roomNumber}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="roomType">{t("room_type")}</label>
                                <select id="roomType" name="roomType" value={formData.roomType} onChange={handleInputChange}>
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
                                    value={formData.floor}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="capacity">{t("capacity")}</label>
                                <input
                                    type="number"
                                    id="capacity"
                                    name="capacity"
                                    min="1"
                                    max="6"
                                    value={formData.capacity}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="dailyRate">{t("daily_rate")}</label>
                                <input
                                    type="number"
                                    id="dailyRate"
                                    name="dailyRate"
                                    value={formData.dailyRate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="status">{t("status")}</label>
                                <select id="status" name="status" value={formData.status} onChange={handleInputChange}>
                                    <option value="available">{t("available")}</option>
                                    <option value="maintenance">{t("maintenance")}</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">{t("description")}</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                {t("cancel")}
                            </button>
                            <button className="btn btn-primary" onClick={handleAddRoom}>
                                {t("add_room")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Room Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{t("edit_room")}</h3>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>
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
                                    value={formData.roomNumber}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="roomType">{t("room_type")}</label>
                                <select id="roomType" name="roomType" value={formData.roomType} onChange={handleInputChange}>
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
                                    value={formData.floor}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="capacity">{t("capacity")}</label>
                                <input
                                    type="number"
                                    id="capacity"
                                    name="capacity"
                                    min="1"
                                    max="6"
                                    value={formData.capacity}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="dailyRate">{t("daily_rate")}</label>
                                <input
                                    type="number"
                                    id="dailyRate"
                                    name="dailyRate"
                                    value={formData.dailyRate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="status">{t("status")}</label>
                                <select id="status" name="status" value={formData.status} onChange={handleInputChange}>
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
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                {t("cancel")}
                            </button>
                            <button className="btn btn-primary" onClick={handleEditRoom}>
                                {t("save_changes")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                            {nurse.name} ({t(nurse.shift)}_shift)
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
                            <button className="btn btn-primary" onClick={handleAssignPatient}>
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
                            <button className="btn btn-primary" onClick={handleAddPayment}>
                                {t("add_payment")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Statistics Modal */}
            {showStatsModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{t("inpatient_rooms_statistics")}</h3>
                            <button className="close-btn" onClick={() => setShowStatsModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <h4>{t("total_rooms")}</h4>
                                    <p className="stat-value">{stats.totalRooms}</p>
                                </div>
                                <div className="stat-card">
                                    <h4>{t("available_rooms")}</h4>
                                    <p className="stat-value">{stats.availableRooms}</p>
                                </div>
                                <div className="stat-card">
                                    <h4>{t("occupied_rooms")}</h4>
                                    <p className="stat-value">{stats.occupiedRooms}</p>
                                </div>
                                <div className="stat-card">
                                    <h4>{t("maintenance_rooms")}</h4>
                                    <p className="stat-value">{stats.maintenanceRooms}</p>
                                </div>
                                <div className="stat-card">
                                    <h4>{t("total_inpatients")}</h4>
                                    <p className="stat-value">{stats.totalPatients}</p>
                                </div>
                                <div className="stat-card">
                                    <h4>{t("average_stay_duration")}</h4>
                                    <p className="stat-value">
                                        {stats.averageStayDuration} {t("days")}
                                    </p>
                                </div>
                                <div className="stat-card">
                                    <h4>{t("occupancy_rate")}</h4>
                                    <p className="stat-value">{stats.occupancyRate.toFixed(1)}%</p>
                                </div>
                                <div className="stat-card">
                                    <h4>{t("total_revenue")}</h4>
                                    <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
                                </div>
                                <div className="stat-card">
                                    <h4>{t("average_daily_revenue")}</h4>
                                    <p className="stat-value">{formatCurrency(stats.averageDailyRevenue)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setShowStatsModal(false)}>
                                {t("close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
};