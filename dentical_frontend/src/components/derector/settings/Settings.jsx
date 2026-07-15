"use client"

import { useState, useEffect } from "react"
import {
    FaSave,
    FaGlobe,
    FaBuilding,
    FaPlus,
    FaEdit,
    FaTrash,
    FaCheck,
    FaTimes,
    FaSpinner,
    FaHospital,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaIdCard,
    FaUsers,
    FaUserTie,
    FaUserMd,
    FaCalendarAlt,
    FaArrowUp,
    FaPlay,
    FaVideo,
    FaBook,
    FaClock,
    FaEye,
    FaArrowRight,
} from "react-icons/fa"
import { useAuth } from "../../../contexts/AuthContext"
import { useLanguage } from "../../../contexts/LanguageContext"
import UserGuide from "../../guide/UserGuide"
import apiSettings from "../../../api/apiSettings"
import apiTarif from "../../../api/apiTarif"

export default function Settings() {
    const { selectedBranch } = useAuth()
    const { language, t } = useLanguage()

    const [activeTab, setActiveTab] = useState("general")

    // Boshqa sahifadan "Filial yaratish" tugmasi bilan kelganda filiallar tabini ochish
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get("tab") === "branches") {
            setActiveTab("branches")
            setIsAddingBranch(true)
        }
    }, [])
    const [isLoading, setIsLoading] = useState(false)
    const [saveLoading, setSaveLoading] = useState(false)
    const [message, setMessage] = useState({ type: "", text: "" })

    // Video guide state
    const [selectedVideo, setSelectedVideo] = useState(null)
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

    // Butun ekranli qo'llanma ochiq/yopiqligi
    const [showGuide, setShowGuide] = useState(false)

    // General settings
    const [clinicData, setClinicData] = useState({
        id: null,
        name: "",
        phone_number: "",
        license_number: "",
        is_active: true,
    })

    // Branch settings
    const [branches, setBranches] = useState([])
    const [editingBranch, setEditingBranch] = useState(null)
    const [isAddingBranch, setIsAddingBranch] = useState(false)
    const [newBranch, setNewBranch] = useState({
        name: "",
        address: "",
        phone_number: "",
        floors: 1,
    })

    // Tariff settings
    const [tariffData, setTariffData] = useState({
        tariff: null,
        usage: null,
        limits: null,
        subscription: null,
    })

    // Video tutorials data
    const videoTutorials = [
        {
            id: 1,
            title: "Dentical.uz CRM — Director Login va Dashboard Ko‘rinishi | Klinikani Real Vaqtda Boshqarish",
            description: "Tizimga birinchi marta kirish, asosiy sozlamalarni o'rnatish va interfeys bilan tanishish",
            duration: "3:47",
            views: "1.2K",
            embedUrl: "https://www.youtube.com/embed/w2AsL3VvgFE",
            thumbnail: "https://img.youtube.com/vi/w2AsL3VvgFE/maxresdefault.jpg",
            category: "Boshlang'ich",
        },
        {
            id: 2,
            title: "Dentical.uz CRM Director — Klinika, Filiallar va Tarif Rejalarini Oson Boshqarish",
            description: "Klinika va filiallarni boshqarish, tarif rejalarini sozlash va klinika ma'lumotlarini yangilash",
            duration: "2:51",
            views: "1.2K",
            embedUrl: "https://www.youtube.com/embed/Oe08KLXkccw",
            thumbnail: "https://img.youtube.com/vi/Oe08KLXkccw/maxresdefault.jpg",
            category: "Boshlang'ich",
        },
        {
            id: 3,
            title: "Dentical.uz CRM Director — Xodimlarni Boshqarishning Eng Qulay Yo‘li",
            description: "Xodimlarni qo'shish, tahrirlash va ularning rollarini boshqarish",
            duration: "5:16",
            views: "1.2K",
            embedUrl: "https://www.youtube.com/embed/Eg_D7Y6JOvo",
            thumbnail: "https://img.youtube.com/vi/Eg_D7Y6JOvo/maxresdefault.jpg",
            category: "Xodimlar",
        },
        {
            id: 4,
            title: "Dentical CRM | Direktor Uchun Vazifalar va Nazorat Paneli",
            description: "Direktorlar uchun vazifalar, nazorat paneli va asosiy funksiyalar bilan tanishish",
            duration: "4:00",
            views: "1.2K",
            embedUrl: "https://www.youtube.com/embed/OeTHfLhPZWg",
            thumbnail: "https://img.youtube.com/vi/OeTHfLhPZWg/maxresdefault.jpg",
            category: "Vzifalar",
        },
        {
            id: 5,
            title: "Dentical.uz CRM platformasining direktor kabineti orqali klinikani samarali boshqaring!",
            description: "Dentical CRM platformasining direktor kabineti orqali klinikani samarali boshqarish, vazifalar va hisobotlar bilan tanishish",
            duration: "3:27",
            views: "1.2K",
            embedUrl: "https://www.youtube.com/embed/zfKZURARfNU",
            thumbnail: "https://img.youtube.com/vi/zfKZURARfNU/maxresdefault.jpg",
            category: "Kabinet",
        },
        {
            id: 6,
            title: "Dentical.uz CRM — Bemorlar Bazasidan 3D Tashxisgacha | Stomatologiya Klinikasi Uchun Yangi Davr",
            description: "Bemorlar bazasidan 3D tashxisgacha bo'lgan jarayonni o'rganing",
            duration: "5:51",
            views: "1.2K",
            embedUrl: "https://www.youtube.com/embed/zFER9AAaKaY",
            thumbnail: "https://img.youtube.com/vi/zFER9AAaKaY/maxresdefault.jpg",
            category: "Bemorlar",
        },
        {
            id: 7,
            title: "Dentical.uz CRM Director — Qabul Jarayonini Yangi Bosqichga Olib Chiqarish",
            description: "Qabul jarayonini qanday qilib samarali boshqarish va optimallashtirish",
            duration: "8:08",
            views: "1.2K",
            embedUrl: "https://www.youtube.com/embed/qzSIRLcyCQc",
            thumbnail: "https://img.youtube.com/vi/qzSIRLcyCQc/maxresdefault.jpg",
            category: "",
        },

        {
            id: 8,
            title: "Dentical.uz CRM Director — Hisobotlar Bilan Klinikani To‘liq Nazorat Qiling",
            description: "Hisobotlar orqali klinikani to‘liq nazorat qilish va tahlil qilish",
            duration: "4:27",
            views: "1.2K",
            embedUrl: "https://www.youtube.com/embed/XHZEYU9ZzTc",
            thumbnail: "https://img.youtube.com/vi/XHZEYU9ZzTc/maxresdefault.jpg",
            category: "",
        },
        {
            id: 9,
            title: "Dentical.uz CRM Director — Xizmatlar Narxlarini Oson Boshqarish va Ko‘rsatish",
            description: "Xizmatlar narxlarini boshqarish va ko‘rsatish jarayonini osonlashtirish",
            duration: "5:56",
            views: "1.2K",
            embedUrl: "https://www.youtube.com/embed/eDe7yw8-IWY",
            thumbnail: "https://img.youtube.com/vi/eDe7yw8-IWY/maxresdefault.jpg",
            category: "",
        },
    ];


    // Fetch clinic data
    useEffect(() => {
        const fetchClinicData = async () => {
            setIsLoading(true)
            try {
                const data = await apiSettings.fetchClinicSettings()
                setClinicData(data)
            } catch (error) {
                console.error("Klinika ma'lumotlarini olishda xatolik:", error)
                setMessage({ type: "error", text: "Klinika ma'lumotlarini olishda xatolik yuz berdi" })
            } finally {
                setIsLoading(false)
            }
        }

        fetchClinicData()
    }, [])

    // Fetch branches
    useEffect(() => {
        const fetchBranches = async () => {
            setIsLoading(true)
            try {
                const data = await apiSettings.fetchBranches()
                setBranches(data)
            } catch (error) {
                console.error("Filiallarni olishda xatolik:", error)
                setMessage({ type: "error", text: "Filiallarni olishda xatolik yuz berdi" })
            } finally {
                setIsLoading(false)
            }
        }

        if (activeTab === "branches") {
            fetchBranches()
        }
    }, [activeTab])

    // Fetch tariff data
    useEffect(() => {
        const fetchTariffData = async () => {
            setIsLoading(true)
            try {
                const data = await apiTarif.fetchTariffStats()
                setTariffData(data)
            } catch (error) {
                console.error("Tarif ma'lumotlarini olishda xatolik:", error)
                setMessage({ type: "error", text: "Tarif ma'lumotlarini olishda xatolik yuz berdi" })
            } finally {
                setIsLoading(false)
            }
        }

        if (activeTab === "tariff") {
            fetchTariffData()
        }
    }, [activeTab])

    // Handle clinic data change
    const handleClinicDataChange = (e) => {
        const { name, value, type, checked } = e.target
        setClinicData({
            ...clinicData,
            [name]: type === "checkbox" ? checked : value,
        })
    }

    // Handle save clinic settings
    const handleSaveClinicSettings = async () => {
        if (!clinicData.id) {
            setMessage({ type: "error", text: "Klinika ID si topilmadi" })
            return
        }

        setSaveLoading(true)
        try {
            await apiSettings.updateClinicSettings(clinicData.id, clinicData)
            setMessage({ type: "success", text: "Klinika ma'lumotlari muvaffaqiyatli saqlandi" })

            // Clear message after 3 seconds
            setTimeout(() => {
                setMessage({ type: "", text: "" })
            }, 3000)
        } catch (error) {
            console.error("Klinika ma'lumotlarini saqlashda xatolik:", error)
            setMessage({ type: "error", text: "Klinika ma'lumotlarini saqlashda xatolik yuz berdi" })
        } finally {
            setSaveLoading(false)
        }
    }

    // Handle branch data change
    const handleBranchDataChange = (e) => {
        const { name, value } = e.target

        if (editingBranch !== null) {
            // Update existing branch
            const updatedBranches = branches.map((branch) => {
                if (branch.id === editingBranch) {
                    return { ...branch, [name]: value }
                }
                return branch
            })
            setBranches(updatedBranches)
        } else if (isAddingBranch) {
            // Update new branch
            setNewBranch({
                ...newBranch,
                [name]: value,
            })
        }
    }

    // Start editing branch
    const handleEditBranch = (branchId) => {
        setEditingBranch(branchId)
        setIsAddingBranch(false)
    }

    // Cancel editing branch
    const handleCancelEdit = () => {
        setEditingBranch(null)
        setIsAddingBranch(false)

        // Reset new branch form
        setNewBranch({
            name: "",
            address: "",
            phone_number: "",
            floors: 1,
        })

        // Refresh branches to get original data
        if (activeTab === "branches") {
            apiSettings
                .fetchBranches()
                .then((data) => {
                    setBranches(data)
                })
                .catch((error) => {
                    console.error("Filiallarni qayta olishda xatolik:", error)
                })
        }
    }

    // Save branch changes
    const handleSaveBranch = async (branchId) => {
        setSaveLoading(true)
        try {
            const branchToUpdate = branches.find((branch) => branch.id === branchId)
            await apiSettings.updateBranch(branchId, branchToUpdate)

            setMessage({ type: "success", text: "Filial ma'lumotlari muvaffaqiyatli saqlandi" })
            setEditingBranch(null)

            // Clear message after 3 seconds
            setTimeout(() => {
                setMessage({ type: "", text: "" })
            }, 3000)
        } catch (error) {
            console.error("Filial ma'lumotlarini saqlashda xatolik:", error)
            setMessage({ type: "error", text: "Filial ma'lumotlarini saqlashda xatolik yuz berdi" })
        } finally {
            setSaveLoading(false)
        }
    }

    // Delete branch
    const handleDeleteBranch = async (branchId) => {
        if (!window.confirm(t("confirmDelete"))) {
            return
        }

        setSaveLoading(true)
        try {
            await apiSettings.deleteBranch(branchId)

            // Remove from state
            const updatedBranches = branches.filter((branch) => branch.id !== branchId)
            setBranches(updatedBranches)

            setMessage({ type: "success", text: "Filial muvaffaqiyatli o'chirildi" })

            // Clear message after 3 seconds
            setTimeout(() => {
                setMessage({ type: "", text: "" })
            }, 3000)
        } catch (error) {
            console.error("Filialni o'chirishda xatolik:", error)
            setMessage({ type: "error", text: "Filialni o'chirishda xatolik yuz berdi" })
        } finally {
            setSaveLoading(false)
        }
    }

    // Start adding new branch
    const handleAddBranch = () => {
        setIsAddingBranch(true)
        setEditingBranch(null)
    }

    // Save new branch
    const handleSaveNewBranch = async () => {
        // Validate required fields
        if (!newBranch.name || !newBranch.address || !newBranch.phone_number) {
            setMessage({ type: "error", text: "Iltimos, barcha majburiy maydonlarni to'ldiring" })
            return
        }

        setSaveLoading(true)
        try {
            const createdBranch = await apiSettings.createBranch(newBranch)

            // Add to state
            setBranches([...branches, createdBranch])

            // Reset form
            setNewBranch({
                name: "",
                address: "",
                phone_number: "",
                floors: 1,
            })

            setIsAddingBranch(false)
            setMessage({ type: "success", text: "Yangi filial muvaffaqiyatli yaratildi" })

            // Clear message after 3 seconds
            setTimeout(() => {
                setMessage({ type: "", text: "" })
            }, 3000)
        } catch (error) {
            console.error("Yangi filial yaratishda xatolik:", error)
            setMessage({ type: "error", text: "Yangi filial yaratishda xatolik yuz berdi" })
        } finally {
            setSaveLoading(false)
        }
    }

    // Handle video selection
    const handleVideoSelect = (video) => {
        setSelectedVideo(video)
        setIsVideoModalOpen(true)
    }

    // Close video modal
    const closeVideoModal = () => {
        setIsVideoModalOpen(false)
        setSelectedVideo(null)
    }

    return (
        <div className="director-settings">
            <div className="page-header">
                <h1 className="page-title">{t("settings")}</h1>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    {message.type === "success" ? <FaCheck className="alert-icon" /> : <FaTimes className="alert-icon" />}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="settings-container">
                <div className="settings-sidebar">
                    <button
                        className={`settings-tab ${activeTab === "general" ? "active" : ""}`}
                        onClick={() => setActiveTab("general")}
                    >
                        <FaGlobe /> {t("generalSettings")}
                    </button>
                    <button
                        className={`settings-tab ${activeTab === "branches" ? "active" : ""}`}
                        onClick={() => setActiveTab("branches")}
                    >
                        <FaBuilding /> {t("branchSettings")}
                    </button>
                    <button
                        className={`settings-tab ${activeTab === "tariff" ? "active" : ""}`}
                        onClick={() => setActiveTab("tariff")}
                    >
                        <FaIdCard /> Tarifingiz bo'ycha
                    </button>
                    <button
                        className={`settings-tab ${activeTab === "video-guide" ? "active" : ""}`}
                        onClick={() => setActiveTab("video-guide")}
                    >
                        <FaVideo /> Video qo'llanma
                    </button>
                    <button
                        className={`settings-tab ${activeTab === "guide" ? "active" : ""}`}
                        onClick={() => setActiveTab("guide")}
                    >
                        <FaBook /> Qo'llanma
                    </button>
                </div>

                <div className="settings-content">
                    {isLoading ? (
                        <div className="loading-container">
                            <div className="loading-spinner">
                                <FaSpinner className="spinner-icon" />
                                <span>Ma'lumotlar yuklanmoqda...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* General Settings */}
                            {activeTab === "general" && (
                                <div className="settings-panel">
                                    <div className="panel-header">
                                        <h2>{t("generalSettings")}</h2>
                                        <button
                                            className={`btn btn-primary ${saveLoading ? "btn-loading" : ""}`}
                                            onClick={handleSaveClinicSettings}
                                            disabled={saveLoading}
                                        >
                                            {saveLoading ? (
                                                <>
                                                    <FaSpinner className="spinner-icon" />
                                                    <span>Saqlanmoqda...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaSave />
                                                    <span>{t("save")}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="settings-card">
                                        <div className="card-header">
                                            <FaHospital className="card-icon" />
                                            <h3>Klinika ma'lumotlari</h3>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="clinic-name">{t("clinicName")}</label>
                                            <div className="input-with-icon">
                                                <FaHospital className="input-icon" />
                                                <input
                                                    id="clinic-name"
                                                    type="text"
                                                    name="name"
                                                    value={clinicData.name}
                                                    onChange={handleClinicDataChange}
                                                    placeholder="Klinika nomini kiriting"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="clinic-phone">{t("phone")}</label>
                                                <div className="input-with-icon">
                                                    <FaPhone className="input-icon" />
                                                    <input
                                                        id="clinic-phone"
                                                        type="text"
                                                        name="phone_number"
                                                        value={clinicData.phone_number}
                                                        onChange={handleClinicDataChange}
                                                        placeholder="+998 XX XXX XX XX"
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="clinic-license">{t("licenseNumber")}</label>
                                                <div className="input-with-icon">
                                                    <FaIdCard className="input-icon" />
                                                    <input
                                                        id="clinic-license"
                                                        type="text"
                                                        name="license_number"
                                                        value={clinicData.license_number}
                                                        onChange={handleClinicDataChange}
                                                        placeholder="Litsenziya raqamini kiriting"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-group checkbox-group">
                                            <input
                                                type="checkbox"
                                                id="is_active"
                                                name="is_active"
                                                checked={clinicData.is_active}
                                                onChange={handleClinicDataChange}
                                            />
                                            <label htmlFor="is_active">{t("isActive")}</label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Branch Settings */}
                            {activeTab === "branches" && (
                                <div className="settings-panel">
                                    <div className="panel-header">
                                        <h2>{t("branchSettings")}</h2>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleAddBranch}
                                            disabled={isAddingBranch || editingBranch !== null || saveLoading}
                                        >
                                            <FaPlus />
                                            <span>{t("addBranch")}</span>
                                        </button>
                                    </div>

                                    {/* New Branch Form */}
                                    {isAddingBranch && (
                                        <div className="branch-card new-branch">
                                            <div className="card-header">
                                                <FaPlus className="card-icon" />
                                                <h3>{t("newBranch")}</h3>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="new-branch-name">{t("branchName")} *</label>
                                                <div className="input-with-icon">
                                                    <FaBuilding className="input-icon" />
                                                    <input
                                                        id="new-branch-name"
                                                        type="text"
                                                        name="name"
                                                        value={newBranch.name}
                                                        onChange={handleBranchDataChange}
                                                        placeholder="Filial nomini kiriting"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="new-branch-address">{t("address")} *</label>
                                                <div className="input-with-icon">
                                                    <FaMapMarkerAlt className="input-icon" />
                                                    <input
                                                        id="new-branch-address"
                                                        type="text"
                                                        name="address"
                                                        value={newBranch.address}
                                                        onChange={handleBranchDataChange}
                                                        placeholder="Filial manzilini kiriting"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="new-branch-phone">{t("phone")} *</label>
                                                <div className="input-with-icon">
                                                    <FaPhone className="input-icon" />
                                                    <input
                                                        id="new-branch-phone"
                                                        type="text"
                                                        name="phone_number"
                                                        value={newBranch.phone_number}
                                                        onChange={handleBranchDataChange}
                                                        placeholder="+998 XX XXX XX XX"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="new-branch-floors">{t("floors_count")} *</label>
                                                <div className="input-with-icon">
                                                    <FaBuilding className="input-icon" />
                                                    <input
                                                        id="new-branch-floors"
                                                        type="number"
                                                        min="1"
                                                        max="50"
                                                        name="floors"
                                                        value={newBranch.floors}
                                                        onChange={handleBranchDataChange}
                                                        placeholder="1"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-actions">
                                                <button
                                                    className={`btn btn-success ${saveLoading ? "btn-loading" : ""}`}
                                                    onClick={handleSaveNewBranch}
                                                    disabled={saveLoading}
                                                >
                                                    {saveLoading ? (
                                                        <>
                                                            <FaSpinner className="spinner-icon" />
                                                            <span>Saqlanmoqda...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaSave />
                                                            <span>Saqlash</span>
                                                        </>
                                                    )}
                                                </button>
                                                <button className="btn btn-danger" onClick={handleCancelEdit}>
                                                    <FaTimes />
                                                    <span>Bekor qilish</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="branch-grid">
                                        {branches.length === 0 ? (
                                            <div className="no-data">
                                                <FaBuilding className="no-data-icon" />
                                                <p>{t("noBranchesFound")}</p>
                                                <button className="btn btn-primary" onClick={handleAddBranch}>
                                                    <FaPlus />
                                                    <span>{t("addBranch")}</span>
                                                </button>
                                            </div>
                                        ) : (
                                            branches.map((branch) => (
                                                <div className={`branch-card ${editingBranch === branch.id ? "editing" : ""}`} key={branch.id}>
                                                    <div className="card-header">
                                                        <FaBuilding className="card-icon" />
                                                        <h3>{branch.name}</h3>
                                                    </div>

                                                    <div className="branch-content">
                                                        <div className="form-group">
                                                            <label>{t("branchName")}</label>
                                                            {editingBranch === branch.id ? (
                                                                <div className="input-with-icon">
                                                                    <FaBuilding className="input-icon" />
                                                                    <input
                                                                        type="text"
                                                                        name="name"
                                                                        value={branch.name}
                                                                        onChange={handleBranchDataChange}
                                                                        placeholder="Filial nomini kiriting"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="info-field">
                                                                    <FaBuilding className="field-icon" />
                                                                    <p>{branch.name}</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="form-group">
                                                            <label>{t("address")}</label>
                                                            {editingBranch === branch.id ? (
                                                                <div className="input-with-icon">
                                                                    <FaMapMarkerAlt className="input-icon" />
                                                                    <input
                                                                        type="text"
                                                                        name="address"
                                                                        value={branch.address}
                                                                        onChange={handleBranchDataChange}
                                                                        placeholder="Filial manzilini kiriting"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="info-field">
                                                                    <FaMapMarkerAlt className="field-icon" />
                                                                    <p>{branch.address}</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="form-group">
                                                            <label>{t("phone")}</label>
                                                            {editingBranch === branch.id ? (
                                                                <div className="input-with-icon">
                                                                    <FaPhone className="input-icon" />
                                                                    <input
                                                                        type="text"
                                                                        name="phone_number"
                                                                        value={branch.phone_number}
                                                                        onChange={handleBranchDataChange}
                                                                        placeholder="+998 XX XXX XX XX"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="info-field">
                                                                    <FaPhone className="field-icon" />
                                                                    <p>{branch.phone_number}</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="form-group">
                                                            <label>{t("floors_count")}</label>
                                                            {editingBranch === branch.id ? (
                                                                <div className="input-with-icon">
                                                                    <FaBuilding className="input-icon" />
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        max="50"
                                                                        name="floors"
                                                                        value={branch.floors || 1}
                                                                        onChange={handleBranchDataChange}
                                                                        placeholder="1"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="info-field">
                                                                    <FaBuilding className="field-icon" />
                                                                    <p>{branch.floors || 1}</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="form-group">
                                                            <label>{t("clinic")}</label>
                                                            <div className="info-field">
                                                                <FaHospital className="field-icon" />
                                                                <p>{branch.clinic}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="branch-actions">
                                                        {editingBranch === branch.id ? (
                                                            <>
                                                                <button
                                                                    className={`btn btn-success ${saveLoading ? "btn-loading" : ""}`}
                                                                    onClick={() => handleSaveBranch(branch.id)}
                                                                    disabled={saveLoading}
                                                                >
                                                                    {saveLoading ? (
                                                                        <>
                                                                            <FaSpinner className="spinner-icon" />
                                                                            <span>Saqlanmoqda...</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <FaSave />
                                                                            <span>Saqlash</span>
                                                                        </>
                                                                    )}
                                                                </button>
                                                                <button className="btn btn-danger" onClick={handleCancelEdit}>
                                                                    <FaTimes />
                                                                    <span>Bekor qilish</span>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    className="btn btn-primary"
                                                                    onClick={() => handleEditBranch(branch.id)}
                                                                    disabled={editingBranch !== null || isAddingBranch || saveLoading}
                                                                >
                                                                    <FaEdit />
                                                                    <span>Tahrirlash</span>
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger"
                                                                    onClick={() => handleDeleteBranch(branch.id)}
                                                                    disabled={editingBranch !== null || isAddingBranch || saveLoading}
                                                                >
                                                                    <FaTrash />
                                                                    <span>O'chirish</span>
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tariff Settings */}
                            {activeTab === "tariff" && (
                                <div className="settings-panel">
                                    <div className="panel-header">
                                        <h2>Tarifingiz bo'ycha</h2>
                                    </div>

                                    {tariffData.tariff && (
                                        <>
                                            {/* Tariff Information */}
                                            <div className="tariff-card main-tariff">
                                                <div className="card-header">
                                                    <FaIdCard className="card-icon" />
                                                    <h3>Joriy tarif</h3>
                                                    <span className={`tariff-badge ${tariffData.tariff.name}`}>
                                                        {tariffData.tariff.name.toUpperCase()}
                                                    </span>
                                                </div>

                                                <div className="tariff-content">
                                                    <div className="tariff-info">
                                                        <div className="info-item">
                                                            <span className="label">Tarif nomi:</span>
                                                            <span className="value">{tariffData.tariff.name}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <span className="label">Tavsif:</span>
                                                            <span className="value">{tariffData.tariff.description}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <span className="label">Narx:</span>
                                                            <span className="value price">${tariffData.tariff.price}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <span className="label">Xotira limiti:</span>
                                                            <span className="value">{tariffData.tariff.storage_limit_gb} GB</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Subscription Information */}
                                            {tariffData.subscription && (
                                                <div className="tariff-card subscription-card">
                                                    <div className="card-header">
                                                        <FaCalendarAlt className="card-icon" />
                                                        <h3>Obuna ma'lumotlari</h3>
                                                        <span className={`status-badge ${tariffData.subscription.status}`}>
                                                            {tariffData.subscription.status === "active" ? "Faol" : "Nofaol"}
                                                        </span>
                                                    </div>

                                                    <div className="subscription-content">
                                                        <div className="date-range">
                                                            <div className="date-item">
                                                                <FaCalendarAlt className="date-icon" />
                                                                <div>
                                                                    <span className="date-label">Boshlanish sanasi</span>
                                                                    <span className="date-value">
                                                                        {new Date(tariffData.subscription.start_date).toLocaleDateString("uz-UZ")}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="date-item">
                                                                <FaCalendarAlt className="date-icon" />
                                                                <div>
                                                                    <span className="date-label">Tugash sanasi</span>
                                                                    <span className="date-value">
                                                                        {new Date(tariffData.subscription.end_date).toLocaleDateString("uz-UZ")}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="payment-info">
                                                            <div className="payment-item">
                                                                <span className="label">To'langan summa:</span>
                                                                <span className="value price">${tariffData.subscription.paid_amount}</span>
                                                            </div>
                                                            {tariffData.subscription.discount && (
                                                                <div className="payment-item">
                                                                    <span className="label">Chegirma:</span>
                                                                    <span className="value discount">{tariffData.subscription.discount}%</span>
                                                                </div>
                                                            )}
                                                            {tariffData.subscription.description_discount && (
                                                                <div className="payment-item">
                                                                    <span className="label">Chegirma tavsifi:</span>
                                                                    <span className="value">{tariffData.subscription.description_discount}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Usage and Limits */}
                                            <div className="limits-grid">
                                                <div className="limit-card">
                                                    <div className="card-header">
                                                        <FaUsers className="card-icon" />
                                                        <h3>Direktorlar</h3>
                                                    </div>
                                                    <div className="limit-content">
                                                        <div className="usage-bar">
                                                            <div
                                                                className="usage-fill"
                                                                style={{
                                                                    width: `${(tariffData.usage.directors / tariffData.tariff.director_limit) * 100}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <div className="usage-text">
                                                            <span>
                                                                {tariffData.usage.directors} / {tariffData.tariff.director_limit}
                                                            </span>
                                                            <span className="remaining">Qolgan: {tariffData.limits.directors_left}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="limit-card">
                                                    <div className="card-header">
                                                        <FaUserTie className="card-icon" />
                                                        <h3>Adminlar</h3>
                                                    </div>
                                                    <div className="limit-content">
                                                        <div className="usage-bar">
                                                            <div
                                                                className="usage-fill"
                                                                style={{
                                                                    width: `${(tariffData.usage.admins / tariffData.tariff.admin_limit) * 100}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <div className="usage-text">
                                                            <span>
                                                                {tariffData.usage.admins} / {tariffData.tariff.admin_limit}
                                                            </span>
                                                            <span className="remaining">Qolgan: {tariffData.limits.admins_left}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="limit-card">
                                                    <div className="card-header">
                                                        <FaUserMd className="card-icon" />
                                                        <h3>Shifokorlar</h3>
                                                    </div>
                                                    <div className="limit-content">
                                                        <div className="usage-bar">
                                                            <div
                                                                className="usage-fill"
                                                                style={{
                                                                    width: `${(tariffData.usage.doctors / tariffData.tariff.doctor_limit) * 100}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <div className="usage-text">
                                                            <span>
                                                                {tariffData.usage.doctors} / {tariffData.tariff.doctor_limit}
                                                            </span>
                                                            <span className="remaining">Qolgan: {tariffData.limits.doctors_left}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="limit-card">
                                                    <div className="card-header">
                                                        <FaBuilding className="card-icon" />
                                                        <h3>Filiallar</h3>
                                                    </div>
                                                    <div className="limit-content">
                                                        <div className="usage-bar">
                                                            <div
                                                                className="usage-fill"
                                                                style={{
                                                                    width: `${(tariffData.usage.branches / tariffData.tariff.branch_limit) * 100}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <div className="usage-text">
                                                            <span>
                                                                {tariffData.usage.branches} / {tariffData.tariff.branch_limit}
                                                            </span>
                                                            <span className="remaining">Qolgan: {tariffData.limits.branches_left}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Upgrade Section */}
                                            <div className="upgrade-section">
                                                <div className="upgrade-card">
                                                    <div className="upgrade-content">
                                                        <h3>Tarifni yangilash</h3>
                                                        <p>Klinikangiz rivojlanishi bilan birga tarifingizni ham yangilang</p>
                                                        <button className="btn btn-primary upgrade-btn">
                                                            <FaArrowUp />
                                                            <span>Tarifni yangilash</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Interaktiv Qo'llanma — karta bosilganda butun ekranda ochiladi */}
                            {activeTab === "guide" && (
                                <div className="settings-panel">
                                    <button className="gd-launch" onClick={() => setShowGuide(true)}>
                                        <span className="gd-launch-icon">
                                            <FaBook />
                                        </span>
                                        <span className="gd-launch-text">
                                            <h3>Qo'llanma — tizimdan foydalanish yo'riqnomasi</h3>
                                            <p>
                                                Har bir bo'lim nimaga kerakligi, ular bir-biriga qanday bog'langani va
                                                qadma-qadam qanday ishlatilishi to'liq tushuntirilgan. Ochish uchun bosing.
                                            </p>
                                        </span>
                                        <span className="gd-launch-arrow">
                                            <FaArrowRight />
                                        </span>
                                    </button>
                                </div>
                            )}

                            {/* Butun ekranli qo'llanma */}
                            {showGuide && <UserGuide role="director" onClose={() => setShowGuide(false)} />}

                            {/* Video Guide */}
                            {activeTab === "video-guide" && (
                                <div className="settings-panel">
                                    <div className="panel-header">
                                        <h2>Video qo'llanma</h2>
                                        <p className="panel-description">Dentical CRM tizimi bilan ishlash bo'yicha video darslar</p>
                                    </div>

                                    <div className="video-guide-container">
                                        <div className="video-grid">
                                            {videoTutorials.map((video) => (
                                                <div key={video.id} className="video-card">
                                                    <div className="video-thumbnail" onClick={() => handleVideoSelect(video)}>
                                                        <img src={video.thumbnail || "/placeholder.svg"} alt={video.title} />
                                                        <div className="video-overlay">
                                                            <FaPlay className="play-icon" />
                                                        </div>
                                                        <div className="video-duration">
                                                            <FaClock className="duration-icon" />
                                                            <span>{video.duration}</span>
                                                        </div>
                                                    </div>

                                                    <div className="video-content">
                                                        <div className="video-category">
                                                            <span className="category-badge">{video.category}</span>
                                                        </div>

                                                        <h3 className="video-title">{video.title}</h3>
                                                        <p className="video-description">{video.description}</p>

                                                        <div className="video-stats">
                                                            <div className="stat-item">
                                                                <FaEye className="stat-icon" />
                                                                <span>{video.views} ko'rishlar</span>
                                                            </div>
                                                            <div className="stat-item">
                                                                <FaClock className="stat-icon" />
                                                                <span>{video.duration}</span>
                                                            </div>
                                                        </div>

                                                        <button
                                                            className="btn btn-primary video-watch-btn"
                                                            onClick={() => handleVideoSelect(video)}
                                                        >
                                                            <FaPlay />
                                                            <span>Ko'rish</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Video Modal */}
            {isVideoModalOpen && selectedVideo && (
                <div className="video-modal-overlay" onClick={closeVideoModal}>
                    <div className="video-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="video-modal-header">
                            <h3>{selectedVideo.title}</h3>
                            <button className="close-btn" onClick={closeVideoModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="video-modal-content">
                            <div className="video-wrapper">
                                <iframe
                                    src={selectedVideo.embedUrl}
                                    embedUrl={selectedVideo.embedUrl}
                                    title={selectedVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>

                            <div className="video-info">
                                <div className="video-meta">
                                    <span className="category-badge">{selectedVideo.category}</span>
                                    <div className="video-stats">
                                        <span>
                                            <FaEye /> {selectedVideo.views}
                                        </span>
                                        <span>
                                            <FaClock /> {selectedVideo.duration}
                                        </span>
                                    </div>
                                </div>
                                <p className="video-description">{selectedVideo.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
