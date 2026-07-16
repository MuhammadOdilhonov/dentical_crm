"use client"

// Dori vositalari va materiallar ombori — stomatologiya klinikasi uchun to'liq aylanma:
// Kirim (xarid) -> Ombor (zaxira nazorati) -> Chiqim (sotuv/hisobdan chiqarish) -> Statistika
import { useState, useEffect, useCallback } from "react"
import {
    FaPills,
    FaExclamationTriangle,
    FaCalendarTimes,
    FaHourglassHalf,
    FaWarehouse,
    FaMoneyBillWave,
    FaTruck,
    FaPercentage,
    FaChartPie,
    FaChartLine,
    FaChartBar,
    FaSearch,
    FaPlus,
    FaTags,
    FaEdit,
    FaTrash,
    FaCashRegister,
    FaSlidersH,
    FaTimes,
    FaSave,
    FaBoxOpen,
    FaArrowRight,
    FaFilter,
    FaBarcode,
    FaTooth,
    FaSpinner,
    FaCheckCircle,
} from "react-icons/fa"
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    PointElement,
    LineElement,
    Filler,
} from "chart.js"
import { Line, Doughnut, Bar } from "react-chartjs-2"
import {
    fetchMedicines,
    fetchMedicineCategories,
    fetchMedicineStatistics,
    fetchMedicineSalesChart,
    fetchMedicineStockChart,
    fetchMedicineExpiryReport,
    fetchMedicineLowStockReport,
    fetchMedicinePurchases,
    fetchMedicineSales,
    searchMedicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    createMedicineCategory,
    updateMedicineCategory,
    deleteMedicineCategory,
    sellMedicine,
    createMedicinePurchase,
    createMedicineAdjustment,
} from "../../api/apiMedicine"
import branchesApi from "../../api/apiBranches"
import usersApi from "../../api/apiUsers"
import apiPatients from "../../api/apiPatients"
import Pagination from "../pagination/Pagination"
import ConfirmModal from "../modal/ConfirmModal"
import SuccessModal from "../modal/SuccessModal"
import { useLanguage } from "../../contexts/LanguageContext"

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    PointElement,
    LineElement,
    Filler,
)

const EMPTY_MEDICINE_FORM = {
    name: "",
    generic_name: "",
    category: "",
    branch: "",
    manufacturer: "",
    dosage_strength: "",
    dosage_unit: "",
    unit_price: "",
    retail_price: "",
    stock_quantity: "",
    minimum_stock: "",
    expiry_date: "",
    barcode: "",
    description: "",
}

const MedicineManagement = () => {
    const { t } = useLanguage()

    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const userRole = user.role || ""
    const isDirector = userRole === "director"
    // Admin faqat dorilarni ko'ra oladi va sotadi (ombor boshqaruvi direktorga tegishli)
    const isAdmin = userRole === "admin"

    // Tablar: statistics | warehouse | purchases | sales
    const [activeTab, setActiveTab] = useState(isAdmin ? "warehouse" : "statistics")

    // Ma'lumotlar
    const [medicines, setMedicines] = useState([])
    const [categories, setCategories] = useState([])
    const [branches, setBranches] = useState([])
    const [doctors, setDoctors] = useState([])
    const [customers, setCustomers] = useState([])
    const [purchases, setPurchases] = useState([])
    const [sales, setSales] = useState([])
    const [statistics, setStatistics] = useState({})
    const [salesChart, setSalesChart] = useState([])
    const [stockChart, setStockChart] = useState({})
    const [expiryReport, setExpiryReport] = useState([])
    const [lowStockReport, setLowStockReport] = useState([])

    // Holatlar
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState("")

    // Ombor filtrlari
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [showFilters, setShowFilters] = useState(false)

    // Pagination — ombor
    const [currentPage, setCurrentPage] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    // Pagination — sotuvlar
    const [salesPage, setSalesPage] = useState(0)
    const [salesTotalItems, setSalesTotalItems] = useState(0)
    const [salesTotalPages, setSalesTotalPages] = useState(0)

    // Pagination — kirim
    const [purchasesPage, setPurchasesPage] = useState(0)
    const [purchasesTotalItems, setPurchasesTotalItems] = useState(0)
    const [purchasesTotalPages, setPurchasesTotalPages] = useState(0)

    // Modallar
    const [modalType, setModalType] = useState(null) // medicine | purchase | sell | adjust | categories
    const [selectedMedicine, setSelectedMedicine] = useState(null)
    const [medicineForm, setMedicineForm] = useState(EMPTY_MEDICINE_FORM)
    const [purchaseForm, setPurchaseForm] = useState({})
    const [sellForm, setSellForm] = useState({})
    const [adjustForm, setAdjustForm] = useState({})
    const [categoryForm, setCategoryForm] = useState({ name: "", description: "" })
    const [editingCategory, setEditingCategory] = useState(null)
    const [customerSearch, setCustomerSearch] = useState("")
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: () => {} })

    const UNIT_CHOICES = [
        { value: "tablet", label: t("tablet") },
        { value: "ml", label: t("milliliter") },
        { value: "mg", label: t("milligram") },
        { value: "g", label: t("gram") },
        { value: "piece", label: t("piece") },
        { value: "bottle", label: t("bottle") },
        { value: "ampoule", label: t("ampoule") },
        { value: "syringe", label: t("syringe") },
    ]

    const ADJUSTMENT_TYPES = [
        { value: "addition", label: t("adj_addition") },
        { value: "subtraction", label: t("adj_subtraction") },
        { value: "damage", label: t("adj_damage") },
        { value: "expiry", label: t("adj_expiry") },
    ]

    // ===== Formatlash =====
    const formatCurrency = (amount) =>
        new Intl.NumberFormat("uz-UZ").format(Number.parseFloat(amount || 0)) + " " + t("currency")

    const formatDate = (dateString) => {
        if (!dateString) return "-"
        return new Date(dateString).toLocaleDateString()
    }

    const daysUntil = (dateString) => {
        if (!dateString) return null
        const diff = new Date(dateString) - new Date()
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    const getStatusBadge = (medicine) => {
        const status = medicine.stock_status || "normal"
        const labels = {
            normal: t("status_normal"),
            low_stock: t("status_low_stock"),
            expired: t("status_expired"),
            expiring_soon: t("status_expiring"),
        }
        return <span className={`med-status-badge ${status}`}>{labels[status] || status}</span>
    }

    // ===== Ma'lumot yuklash =====
    const loadMedicines = useCallback(
        async (page = 1) => {
            try {
                const data = await fetchMedicines({ page, page_size: itemsPerPage })
                if (data && data.results) {
                    setMedicines(data.results)
                    setTotalItems(data.count || 0)
                    setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
                } else {
                    const list = Array.isArray(data) ? data : []
                    setMedicines(list)
                    setTotalItems(list.length)
                    setTotalPages(1)
                }
            } catch (err) {
                console.error("Dorilarni yuklashda xatolik:", err)
                setError(t("loading_error"))
            }
        },
        [itemsPerPage, t],
    )

    const loadCategories = useCallback(async () => {
        try {
            const data = await fetchMedicineCategories()
            setCategories(Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Kategoriyalarni yuklashda xatolik:", err)
        }
    }, [])

    const loadStatistics = useCallback(async () => {
        try {
            const [stats, salesData, stockData, expiryData, lowStockData] = await Promise.all([
                fetchMedicineStatistics(),
                fetchMedicineSalesChart(),
                fetchMedicineStockChart(),
                fetchMedicineExpiryReport(30),
                fetchMedicineLowStockReport(),
            ])
            setStatistics(stats || {})
            setSalesChart(salesData?.sales_chart || [])
            setStockChart(stockData || {})
            setExpiryReport(expiryData?.medicines || [])
            setLowStockReport(lowStockData?.medicines || [])
        } catch (err) {
            console.error("Statistikani yuklashda xatolik:", err)
        }
    }, [])

    const loadPurchases = useCallback(
        async (page = 1) => {
            try {
                const data = await fetchMedicinePurchases({ page, page_size: itemsPerPage })
                if (data && data.results) {
                    setPurchases(data.results)
                    setPurchasesTotalItems(data.count || 0)
                    setPurchasesTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
                } else {
                    const list = Array.isArray(data) ? data : []
                    setPurchases(list)
                    setPurchasesTotalItems(list.length)
                    setPurchasesTotalPages(1)
                }
            } catch (err) {
                console.error("Kirimlarni yuklashda xatolik:", err)
            }
        },
        [itemsPerPage],
    )

    const loadSales = useCallback(
        async (page = 1) => {
            try {
                const data = await fetchMedicineSales({ page, page_size: itemsPerPage })
                if (data && data.results) {
                    setSales(data.results)
                    setSalesTotalItems(data.count || 0)
                    setSalesTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
                } else {
                    const list = Array.isArray(data) ? data : []
                    setSales(list)
                    setSalesTotalItems(list.length)
                    setSalesTotalPages(1)
                }
            } catch (err) {
                console.error("Sotuvlarni yuklashda xatolik:", err)
            }
        },
        [itemsPerPage],
    )

    // Birinchi yuklash
    useEffect(() => {
        const init = async () => {
            setLoading(true)
            setError(null)
            try {
                const branchesData = await branchesApi.fetchBranches()
                setBranches(Array.isArray(branchesData) ? branchesData : [])
                // Admin uchun statistika (ombor tahlili) yuklanmaydi — u faqat ko'radi va sotadi
                const initTasks = [loadMedicines(1), loadCategories()]
                if (!isAdmin) initTasks.push(loadStatistics())
                await Promise.all(initTasks)
            } catch (err) {
                console.error("Boshlang'ich yuklashda xatolik:", err)
                setError(t("loading_error"))
            } finally {
                setLoading(false)
            }
        }
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        loadMedicines(currentPage + 1)
    }, [currentPage, itemsPerPage, loadMedicines])

    useEffect(() => {
        if (activeTab === "sales") loadSales(salesPage + 1)
    }, [activeTab, salesPage, loadSales])

    useEffect(() => {
        if (activeTab === "purchases") loadPurchases(purchasesPage + 1)
    }, [activeTab, purchasesPage, loadPurchases])

    // Barcha ma'lumotlarni yangilash (amaldan keyin)
    const refreshAll = async () => {
        await Promise.all([loadMedicines(currentPage + 1), loadStatistics()])
        if (activeTab === "sales") await loadSales(salesPage + 1)
        if (activeTab === "purchases") await loadPurchases(purchasesPage + 1)
    }

    // ===== Qidiruv va filtrlar =====
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadMedicines(1)
            setCurrentPage(0)
            return
        }
        try {
            const data = await searchMedicines(searchQuery)
            const list = data?.medicines || data?.results || []
            setMedicines(list)
            setTotalItems(list.length)
            setTotalPages(1)
            setCurrentPage(0)
        } catch (err) {
            console.error("Qidirishda xatolik:", err)
        }
    }

    const filteredMedicines = medicines.filter((medicine) => {
        const matchesCategory = !selectedCategory || String(medicine.category) === String(selectedCategory)
        const matchesStatus = statusFilter === "all" || medicine.stock_status === statusFilter
        return matchesCategory && matchesStatus
    })

    // Ogohlantirishdan omborga o'tish (filtr bilan)
    const goToWarehouse = (status) => {
        setStatusFilter(status)
        setActiveTab("warehouse")
        setShowFilters(true)
    }

    // ===== Modal ochish/yopish =====
    const openMedicineModal = (medicine = null) => {
        setSelectedMedicine(medicine)
        setMedicineForm(
            medicine
                ? {
                      ...EMPTY_MEDICINE_FORM,
                      ...medicine,
                      category: medicine.category || "",
                      branch: medicine.branch || "",
                  }
                : EMPTY_MEDICINE_FORM,
        )
        setModalType("medicine")
    }

    const openPurchaseModal = (medicine) => {
        setSelectedMedicine(medicine)
        setPurchaseForm({
            medicine: medicine.id,
            supplier: "",
            quantity: "",
            unit_cost: "",
            purchase_date: new Date().toISOString().split("T")[0],
            expiry_date: medicine.expiry_date || "",
            invoice_number: "",
            notes: "",
        })
        setModalType("purchase")
    }

    const openSellModal = (medicine) => {
        setSelectedMedicine(medicine)
        setSellForm({ medicine: medicine.id, sale_type: "retail" })
        setCustomerSearch("")
        setCustomers([])
        if (medicine.branch) {
            usersApi
                .fetchUsers(1, 1000, { branch: medicine.branch, role: "doctor" })
                .then((data) => setDoctors(Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : []))
                .catch(() => setDoctors([]))
        }
        setModalType("sell")
    }

    const openAdjustModal = (medicine) => {
        setSelectedMedicine(medicine)
        setAdjustForm({ medicine: medicine.id, adjustment_type: "", quantity: "", reason: "", notes: "" })
        setModalType("adjust")
    }

    const closeModal = () => {
        setModalType(null)
        setSelectedMedicine(null)
        setEditingCategory(null)
        setCategoryForm({ name: "", description: "" })
    }

    // ===== CRUD amallar =====
    const handleMedicineSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        try {
            if (selectedMedicine) {
                await updateMedicine(selectedMedicine.id, medicineForm)
                setSuccessMessage(t("medicine_updated"))
            } else {
                await createMedicine(medicineForm)
                setSuccessMessage(t("medicine_added"))
            }
            await refreshAll()
            closeModal()
        } catch (err) {
            console.error("Dorini saqlashda xatolik:", err)
            setError(err.response?.data?.detail || t("loading_error"))
        } finally {
            setSaving(false)
        }
    }

    const handlePurchaseSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        try {
            await createMedicinePurchase({
                ...purchaseForm,
                total_cost: (Number.parseFloat(purchaseForm.quantity) || 0) * (Number.parseFloat(purchaseForm.unit_cost) || 0),
            })
            setSuccessMessage(t("purchase_added"))
            await refreshAll()
            closeModal()
        } catch (err) {
            console.error("Kirimni saqlashda xatolik:", err)
            setError(err.response?.data?.detail || t("loading_error"))
        } finally {
            setSaving(false)
        }
    }

    const handleSellSubmit = async (e) => {
        e.preventDefault()
        if (!sellForm.customer) {
            setError(t("select_patient"))
            return
        }
        setSaving(true)
        setError(null)
        try {
            await sellMedicine(sellForm)
            setSuccessMessage(t("sale_completed"))
            await refreshAll()
            closeModal()
        } catch (err) {
            console.error("Sotishda xatolik:", err)
            setError(err.response?.data?.detail || t("loading_error"))
        } finally {
            setSaving(false)
        }
    }

    const handleAdjustSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        try {
            await createMedicineAdjustment(adjustForm)
            setSuccessMessage(t("stock_adjusted"))
            await refreshAll()
            closeModal()
        } catch (err) {
            console.error("Tuzatishda xatolik:", err)
            setError(err.response?.data?.detail || t("loading_error"))
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteMedicine = (medicine) => {
        setConfirmModal({
            isOpen: true,
            title: t("delete_medicine"),
            message: `"${medicine.name}" — ${t("delete_medicine_confirm")}`,
            onConfirm: async () => {
                try {
                    await deleteMedicine(medicine.id)
                    setSuccessMessage(t("medicine_deleted"))
                    await refreshAll()
                } catch (err) {
                    console.error("O'chirishda xatolik:", err)
                    setError(t("loading_error"))
                } finally {
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                }
            },
        })
    }

    const handleCategorySubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            if (editingCategory) {
                await updateMedicineCategory(editingCategory.id, categoryForm)
            } else {
                await createMedicineCategory(categoryForm)
            }
            await loadCategories()
            setEditingCategory(null)
            setCategoryForm({ name: "", description: "" })
        } catch (err) {
            console.error("Kategoriyani saqlashda xatolik:", err)
            setError(t("loading_error"))
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteCategory = (category) => {
        setConfirmModal({
            isOpen: true,
            title: t("delete_category"),
            message: `"${category.name}" — ${t("confirm_delete_category")}`,
            onConfirm: async () => {
                try {
                    await deleteMedicineCategory(category.id)
                    await loadCategories()
                } catch (err) {
                    console.error("Kategoriyani o'chirishda xatolik:", err)
                    setError(t("loading_error"))
                } finally {
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                }
            },
        })
    }

    const handleCustomerSearch = (term) => {
        setCustomerSearch(term)
        if (term.length >= 2 && selectedMedicine?.branch) {
            apiPatients
                .fetchPatients(1, 1000, term, selectedMedicine.branch)
                .then((data) => setCustomers(data?.results || []))
                .catch(() => setCustomers([]))
        } else {
            setCustomers([])
        }
    }

    // ===== Statistika (dashboard) =====
    const renderStatistics = () => {
        const salesLineData = {
            labels: salesChart.map((item) => item.month),
            datasets: [
                {
                    label: t("monthly_sales"),
                    data: salesChart.map((item) => item.sales),
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                },
            ],
        }

        const stockByCategory = stockChart.stock_by_category || []
        const categoryDoughnutData = {
            labels: stockByCategory.map((item) => item.category__name || t("no_data")),
            datasets: [
                {
                    label: t("stock"),
                    data: stockByCategory.map((item) => item.total_quantity || 0),
                    backgroundColor: [
                        "rgba(54, 162, 235, 0.8)",
                        "rgba(75, 192, 192, 0.8)",
                        "rgba(255, 206, 86, 0.8)",
                        "rgba(255, 99, 132, 0.8)",
                        "rgba(153, 102, 255, 0.8)",
                        "rgba(255, 159, 64, 0.8)",
                    ],
                    borderWidth: 1,
                },
            ],
        }

        const stockByStatus = stockChart.stock_by_status || {}
        const statusBarData = {
            labels: [t("status_normal"), t("status_low_stock"), t("status_expiring"), t("status_expired")],
            datasets: [
                {
                    label: t("medicines"),
                    data: [
                        stockByStatus.normal || 0,
                        stockByStatus.low_stock || 0,
                        stockByStatus.expiring_soon || 0,
                        stockByStatus.expired || 0,
                    ],
                    backgroundColor: [
                        "rgba(75, 192, 192, 0.7)",
                        "rgba(255, 206, 86, 0.7)",
                        "rgba(255, 159, 64, 0.7)",
                        "rgba(255, 99, 132, 0.7)",
                    ],
                    borderWidth: 1,
                },
            ],
        }

        return (
            <div className="med-statistics">
                {/* Asosiy ko'rsatkichlar */}
                <div className="med-stats-grid">
                    <div className="med-stat-card">
                        <div className="med-stat-icon total">
                            <FaPills />
                        </div>
                        <div className="med-stat-info">
                            <span className="med-stat-value">{statistics.total_medicines || 0}</span>
                            <span className="med-stat-label">{t("total_medicines")}</span>
                        </div>
                    </div>
                    <button className="med-stat-card clickable" onClick={() => goToWarehouse("low_stock")}>
                        <div className="med-stat-icon low">
                            <FaExclamationTriangle />
                        </div>
                        <div className="med-stat-info">
                            <span className="med-stat-value">{statistics.low_stock_medicines || 0}</span>
                            <span className="med-stat-label">{t("low_stock_medicines")}</span>
                        </div>
                        <FaArrowRight className="med-stat-arrow" />
                    </button>
                    <button className="med-stat-card clickable" onClick={() => goToWarehouse("expired")}>
                        <div className="med-stat-icon expired">
                            <FaCalendarTimes />
                        </div>
                        <div className="med-stat-info">
                            <span className="med-stat-value">{statistics.expired_medicines || 0}</span>
                            <span className="med-stat-label">{t("expired_medicines")}</span>
                        </div>
                        <FaArrowRight className="med-stat-arrow" />
                    </button>
                    <button className="med-stat-card clickable" onClick={() => goToWarehouse("expiring_soon")}>
                        <div className="med-stat-icon expiring">
                            <FaHourglassHalf />
                        </div>
                        <div className="med-stat-info">
                            <span className="med-stat-value">{statistics.expiring_soon_medicines || 0}</span>
                            <span className="med-stat-label">{t("expiring_soon_medicines")}</span>
                        </div>
                        <FaArrowRight className="med-stat-arrow" />
                    </button>
                </div>

                {/* Moliyaviy ko'rsatkichlar — faqat direktor uchun */}
                {isDirector && (
                    <div className="med-stats-grid finance">
                        <div className="med-stat-card">
                            <div className="med-stat-icon value">
                                <FaWarehouse />
                            </div>
                            <div className="med-stat-info">
                                <span className="med-stat-value">{formatCurrency(statistics.total_stock_value)}</span>
                                <span className="med-stat-label">{t("stock_value")}</span>
                            </div>
                        </div>
                        <div className="med-stat-card">
                            <div className="med-stat-icon sales">
                                <FaMoneyBillWave />
                            </div>
                            <div className="med-stat-info">
                                <span className="med-stat-value">{formatCurrency(statistics.monthly_sales)}</span>
                                <span className="med-stat-label">{t("monthly_sales")}</span>
                            </div>
                        </div>
                        <div className="med-stat-card">
                            <div className="med-stat-icon purchases">
                                <FaTruck />
                            </div>
                            <div className="med-stat-info">
                                <span className="med-stat-value">{formatCurrency(statistics.monthly_purchases)}</span>
                                <span className="med-stat-label">{t("monthly_purchases")}</span>
                            </div>
                        </div>
                        <div className="med-stat-card">
                            <div className="med-stat-icon margin">
                                <FaPercentage />
                            </div>
                            <div className="med-stat-info">
                                <span className="med-stat-value">
                                    {Number.parseFloat(statistics.profit_margin || 0).toFixed(1)}%
                                </span>
                                <span className="med-stat-label">{t("profit_margin")}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grafiklar */}
                <div className="med-charts-row">
                    <div className="med-chart-card wide">
                        <h3>
                            <FaChartLine /> {t("sales_dynamics")}
                        </h3>
                        <div className="med-chart-container">
                            {salesChart.length > 0 ? (
                                <Line
                                    data={salesLineData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: { y: { beginAtZero: true } },
                                    }}
                                />
                            ) : (
                                <div className="med-no-chart">{t("no_data")}</div>
                            )}
                        </div>
                    </div>
                    <div className="med-chart-card">
                        <h3>
                            <FaChartPie /> {t("stock_by_category")}
                        </h3>
                        <div className="med-chart-container">
                            {stockByCategory.length > 0 ? (
                                <Doughnut
                                    data={categoryDoughnutData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { position: "bottom" } },
                                    }}
                                />
                            ) : (
                                <div className="med-no-chart">{t("no_data")}</div>
                            )}
                        </div>
                    </div>
                    <div className="med-chart-card">
                        <h3>
                            <FaChartBar /> {t("stock_by_status")}
                        </h3>
                        <div className="med-chart-container">
                            <Bar
                                data={statusBarData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Ogohlantirishlar */}
                <div className="med-alerts-row">
                    <div className="med-alert-card">
                        <div className="med-alert-header">
                            <h3>
                                <FaHourglassHalf /> {t("expiring_medicines_report")}
                            </h3>
                            {expiryReport.length > 0 && (
                                <button className="med-link-btn" onClick={() => goToWarehouse("expiring_soon")}>
                                    {t("view_all")} <FaArrowRight />
                                </button>
                            )}
                        </div>
                        {expiryReport.length > 0 ? (
                            <div className="med-alert-list">
                                {expiryReport.slice(0, 5).map((medicine) => {
                                    const days = daysUntil(medicine.expiry_date)
                                    return (
                                        <div key={medicine.id} className="med-alert-item expiring">
                                            <span className="med-alert-name">{medicine.name}</span>
                                            <span className="med-alert-meta">
                                                {formatDate(medicine.expiry_date)}
                                                {days !== null && days >= 0 && ` (${days} ${t("days_left")})`}
                                            </span>
                                            <span className="med-alert-qty">
                                                {medicine.stock_quantity} {t("pieces")}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="med-alert-empty">
                                <FaCheckCircle /> {t("no_expiring_medicines")}
                            </div>
                        )}
                    </div>

                    <div className="med-alert-card">
                        <div className="med-alert-header">
                            <h3>
                                <FaExclamationTriangle /> {t("low_stock_medicines_report")}
                            </h3>
                            {lowStockReport.length > 0 && (
                                <button className="med-link-btn" onClick={() => goToWarehouse("low_stock")}>
                                    {t("view_all")} <FaArrowRight />
                                </button>
                            )}
                        </div>
                        {lowStockReport.length > 0 ? (
                            <div className="med-alert-list">
                                {lowStockReport.slice(0, 5).map((medicine) => (
                                    <div key={medicine.id} className="med-alert-item low-stock">
                                        <span className="med-alert-name">{medicine.name}</span>
                                        <span className="med-alert-meta">
                                            {t("stock")}: {medicine.stock_quantity} / {t("minimum_quantity")}: {medicine.minimum_stock}
                                        </span>
                                        <span className="med-alert-status">{t("status_low_stock")}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="med-alert-empty">
                                <FaCheckCircle /> {t("no_low_stock_medicines")}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // ===== Ombor =====
    const renderWarehouse = () => (
        <div className="med-warehouse">
            <div className="med-toolbar">
                <div className="med-search-box">
                    <FaSearch className="med-search-icon" />
                    <input
                        type="text"
                        placeholder={t("medicine_name_or_barcode")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <button className="med-btn med-btn-secondary" onClick={handleSearch}>
                        {t("search")}
                    </button>
                </div>
                <div className="med-toolbar-actions">
                    <button
                        className={`med-btn med-btn-outline ${showFilters ? "active" : ""}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FaFilter /> {t("filters")}
                    </button>
                    {!isAdmin && (
                        <>
                            <button className="med-btn med-btn-outline" onClick={() => setModalType("categories")}>
                                <FaTags /> {t("categories")}
                            </button>
                            <button className="med-btn med-btn-primary" onClick={() => openMedicineModal()}>
                                <FaPlus /> {t("add_medicine")}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {showFilters && (
                <div className="med-filters">
                    <div className="med-filter-group">
                        <label>{t("category")}:</label>
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            <option value="">{t("all_categories")}</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="med-filter-group">
                        <label>{t("status")}:</label>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">{t("all_statuses")}</option>
                            <option value="normal">{t("status_normal")}</option>
                            <option value="low_stock">{t("status_low_stock")}</option>
                            <option value="expiring_soon">{t("status_expiring")}</option>
                            <option value="expired">{t("status_expired")}</option>
                        </select>
                    </div>
                </div>
            )}

            {filteredMedicines.length > 0 ? (
                <div className="med-table-container">
                    <table className="med-table">
                        <thead>
                            <tr>
                                <th>{t("medicine_name")}</th>
                                <th>{t("category")}</th>
                                <th>{t("manufacturer")}</th>
                                <th>{t("stock")}</th>
                                <th>{t("selling_price")}</th>
                                <th>{t("expiry_date")}</th>
                                <th>{t("status")}</th>
                                <th>{t("actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMedicines.map((medicine) => (
                                <tr key={medicine.id} className={`med-row ${medicine.stock_status || ""}`}>
                                    <td>
                                        <div className="med-name-cell">
                                            <span className="med-name">{medicine.name}</span>
                                            {medicine.generic_name && <span className="med-generic">{medicine.generic_name}</span>}
                                            {medicine.barcode && (
                                                <span className="med-barcode">
                                                    <FaBarcode /> {medicine.barcode}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{medicine.category_name || "-"}</td>
                                    <td>{medicine.manufacturer || "-"}</td>
                                    <td>
                                        <span className={`med-qty ${medicine.is_low_stock ? "low" : ""}`}>
                                            {medicine.stock_quantity}
                                        </span>
                                        <span className="med-min"> / {medicine.minimum_stock}</span>
                                    </td>
                                    <td>{formatCurrency(medicine.retail_price)}</td>
                                    <td>{formatDate(medicine.expiry_date)}</td>
                                    <td>{getStatusBadge(medicine)}</td>
                                    <td>
                                        <div className="med-row-actions">
                                            {!isAdmin && (
                                                <button
                                                    className="med-action-btn purchase"
                                                    onClick={() => openPurchaseModal(medicine)}
                                                    title={t("purchase_medicine")}
                                                >
                                                    <FaTruck />
                                                </button>
                                            )}
                                            <button
                                                className="med-action-btn sell"
                                                onClick={() => openSellModal(medicine)}
                                                title={t("sell_medicine")}
                                            >
                                                <FaCashRegister />
                                            </button>
                                            {!isAdmin && (
                                                <>
                                                    <button
                                                        className="med-action-btn adjust"
                                                        onClick={() => openAdjustModal(medicine)}
                                                        title={t("adjust_stock")}
                                                    >
                                                        <FaSlidersH />
                                                    </button>
                                                    <button
                                                        className="med-action-btn edit"
                                                        onClick={() => openMedicineModal(medicine)}
                                                        title={t("edit")}
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="med-action-btn delete"
                                                        onClick={() => handleDeleteMedicine(medicine)}
                                                        title={t("delete")}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="med-empty">
                    <FaBoxOpen className="med-empty-icon" />
                    <h3>{t("no_medicines_found")}</h3>
                    {!isAdmin && (
                        <>
                            <p>{t("add_first_medicine_hint")}</p>
                            <button className="med-btn med-btn-primary" onClick={() => openMedicineModal()}>
                                <FaPlus /> {t("add_medicine")}
                            </button>
                        </>
                    )}
                </div>
            )}

            {totalItems > 0 && (
                <Pagination
                    pageCount={totalPages}
                    currentPage={currentPage}
                    onPageChange={(page) => setCurrentPage(page)}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                    onItemsPerPageChange={(size) => {
                        setItemsPerPage(size)
                        setCurrentPage(0)
                    }}
                />
            )}
        </div>
    )

    // ===== Kirim tarixi =====
    const renderPurchases = () => (
        <div className="med-purchases">
            {purchases.length > 0 ? (
                <div className="med-table-container">
                    <table className="med-table">
                        <thead>
                            <tr>
                                <th>{t("date")}</th>
                                <th>{t("medicine_name")}</th>
                                <th>{t("supplier")}</th>
                                <th>{t("quantity")}</th>
                                <th>{t("unit_cost")}</th>
                                <th>{t("total")}</th>
                                <th>{t("invoice_number")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.map((purchase) => (
                                <tr key={purchase.id}>
                                    <td>{formatDate(purchase.purchase_date)}</td>
                                    <td>{purchase.medicine_name}</td>
                                    <td>{purchase.supplier}</td>
                                    <td>
                                        {purchase.quantity} {t("pieces")}
                                    </td>
                                    <td>{formatCurrency(purchase.unit_cost)}</td>
                                    <td className="med-amount-cell">{formatCurrency(purchase.total_cost)}</td>
                                    <td>{purchase.invoice_number || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="med-empty">
                    <FaTruck className="med-empty-icon" />
                    <h3>{t("no_purchases_found")}</h3>
                    <p>{t("purchases_hint")}</p>
                </div>
            )}

            {purchasesTotalItems > 0 && (
                <Pagination
                    pageCount={purchasesTotalPages}
                    currentPage={purchasesPage}
                    onPageChange={(page) => setPurchasesPage(page)}
                    itemsPerPage={itemsPerPage}
                    totalItems={purchasesTotalItems}
                    onItemsPerPageChange={(size) => {
                        setItemsPerPage(size)
                        setPurchasesPage(0)
                    }}
                />
            )}
        </div>
    )

    // ===== Sotuvlar =====
    const renderSales = () => (
        <div className="med-sales">
            {sales.length > 0 ? (
                <div className="med-table-container">
                    <table className="med-table">
                        <thead>
                            <tr>
                                <th>{t("date")}</th>
                                <th>{t("medicine_name")}</th>
                                <th>{t("patient")}</th>
                                <th>{t("doctor")}</th>
                                <th>{t("quantity")}</th>
                                <th>{t("discount")}</th>
                                <th>{t("final_price")}</th>
                                <th>{t("seller")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map((sale) => (
                                <tr key={sale.id}>
                                    <td>{formatDate(sale.created_at)}</td>
                                    <td>{sale.medicine_name}</td>
                                    <td>{sale.customer_name}</td>
                                    <td>{sale.doctor_name}</td>
                                    <td>
                                        {sale.quantity} {t("pieces")}
                                    </td>
                                    <td>{sale.discount_percent > 0 ? `${sale.discount_percent}%` : "-"}</td>
                                    <td className="med-amount-cell">{formatCurrency(sale.final_price)}</td>
                                    <td>{sale.sold_by_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="med-empty">
                    <FaCashRegister className="med-empty-icon" />
                    <h3>{t("no_sales_found")}</h3>
                    <p>{t("sales_hint")}</p>
                </div>
            )}

            {salesTotalItems > 0 && (
                <Pagination
                    pageCount={salesTotalPages}
                    currentPage={salesPage}
                    onPageChange={(page) => setSalesPage(page)}
                    itemsPerPage={itemsPerPage}
                    totalItems={salesTotalItems}
                    onItemsPerPageChange={(size) => {
                        setItemsPerPage(size)
                        setSalesPage(0)
                    }}
                />
            )}
        </div>
    )

    // ===== Modallar =====
    const renderMedicineModal = () => (
        <div className="med-modal-overlay" onClick={closeModal}>
            <div className="med-modal" onClick={(e) => e.stopPropagation()}>
                <div className="med-modal-header">
                    <h2>
                        <FaPills /> {selectedMedicine ? t("edit_medicine") : t("add_new_medicine")}
                    </h2>
                    <button className="med-modal-close" onClick={closeModal}>
                        <FaTimes />
                    </button>
                </div>
                <form onSubmit={handleMedicineSubmit} className="med-modal-body">
                    <div className="med-form-row">
                        <div className="med-form-group">
                            <label>{t("medicine_name")} *</label>
                            <input
                                type="text"
                                value={medicineForm.name}
                                onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="med-form-group">
                            <label>{t("generic_name")}</label>
                            <input
                                type="text"
                                value={medicineForm.generic_name || ""}
                                onChange={(e) => setMedicineForm({ ...medicineForm, generic_name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="med-form-row">
                        <div className="med-form-group">
                            <label>{t("category")} *</label>
                            <select
                                value={medicineForm.category}
                                onChange={(e) => setMedicineForm({ ...medicineForm, category: e.target.value })}
                                required
                            >
                                <option value="">{t("select_category")}</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="med-form-group">
                            <label>{t("branch")} *</label>
                            <select
                                value={medicineForm.branch}
                                onChange={(e) => setMedicineForm({ ...medicineForm, branch: e.target.value })}
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
                    </div>

                    <div className="med-form-row">
                        <div className="med-form-group">
                            <label>{t("manufacturer")}</label>
                            <input
                                type="text"
                                value={medicineForm.manufacturer || ""}
                                onChange={(e) => setMedicineForm({ ...medicineForm, manufacturer: e.target.value })}
                            />
                        </div>
                        <div className="med-form-group">
                            <label>{t("barcode")}</label>
                            <input
                                type="text"
                                value={medicineForm.barcode || ""}
                                onChange={(e) => setMedicineForm({ ...medicineForm, barcode: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="med-form-row">
                        <div className="med-form-group">
                            <label>{t("dosage_amount")}</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={medicineForm.dosage_strength || ""}
                                onChange={(e) => setMedicineForm({ ...medicineForm, dosage_strength: e.target.value })}
                            />
                        </div>
                        <div className="med-form-group">
                            <label>{t("select_dosage_unit")}</label>
                            <select
                                value={medicineForm.dosage_unit || ""}
                                onChange={(e) => setMedicineForm({ ...medicineForm, dosage_unit: e.target.value })}
                            >
                                <option value="">{t("select_dosage_unit")}</option>
                                {UNIT_CHOICES.map((unit) => (
                                    <option key={unit.value} value={unit.value}>
                                        {unit.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="med-form-row">
                        <div className="med-form-group">
                            <label>{t("cost_price")} *</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={medicineForm.unit_price || ""}
                                onChange={(e) => setMedicineForm({ ...medicineForm, unit_price: e.target.value })}
                                required
                            />
                        </div>
                        <div className="med-form-group">
                            <label>{t("selling_price")} *</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={medicineForm.retail_price || ""}
                                onChange={(e) => setMedicineForm({ ...medicineForm, retail_price: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="med-form-row">
                        <div className="med-form-group">
                            <label>{t("stock_quantity")} *</label>
                            <input
                                type="number"
                                min="0"
                                value={medicineForm.stock_quantity}
                                onChange={(e) => setMedicineForm({ ...medicineForm, stock_quantity: e.target.value })}
                                required
                            />
                        </div>
                        <div className="med-form-group">
                            <label>{t("minimum_quantity")} *</label>
                            <input
                                type="number"
                                min="0"
                                value={medicineForm.minimum_stock}
                                onChange={(e) => setMedicineForm({ ...medicineForm, minimum_stock: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="med-form-group">
                        <label>{t("expiry_date")}</label>
                        <input
                            type="date"
                            value={medicineForm.expiry_date || ""}
                            onChange={(e) => setMedicineForm({ ...medicineForm, expiry_date: e.target.value })}
                        />
                    </div>

                    <div className="med-form-group">
                        <label>{t("description")}</label>
                        <textarea
                            rows="3"
                            value={medicineForm.description || ""}
                            onChange={(e) => setMedicineForm({ ...medicineForm, description: e.target.value })}
                        />
                    </div>

                    <div className="med-modal-footer">
                        <button type="button" className="med-btn med-btn-secondary" onClick={closeModal}>
                            {t("cancel")}
                        </button>
                        <button type="submit" className="med-btn med-btn-primary" disabled={saving}>
                            <FaSave /> {saving ? t("saving") : t("save")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )

    const renderPurchaseModal = () => (
        <div className="med-modal-overlay" onClick={closeModal}>
            <div className="med-modal" onClick={(e) => e.stopPropagation()}>
                <div className="med-modal-header">
                    <h2>
                        <FaTruck /> {t("purchase_medicine")}
                    </h2>
                    <button className="med-modal-close" onClick={closeModal}>
                        <FaTimes />
                    </button>
                </div>
                <form onSubmit={handlePurchaseSubmit} className="med-modal-body">
                    <div className="med-selected-info">
                        <FaPills />
                        <div>
                            <strong>{selectedMedicine?.name}</strong>
                            <span>
                                {t("stock")}: {selectedMedicine?.stock_quantity} {t("pieces")}
                            </span>
                        </div>
                    </div>

                    <div className="med-form-group">
                        <label>{t("supplier")} *</label>
                        <input
                            type="text"
                            value={purchaseForm.supplier || ""}
                            onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })}
                            required
                        />
                    </div>

                    <div className="med-form-row">
                        <div className="med-form-group">
                            <label>{t("quantity")} *</label>
                            <input
                                type="number"
                                min="1"
                                value={purchaseForm.quantity || ""}
                                onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                                required
                            />
                        </div>
                        <div className="med-form-group">
                            <label>{t("unit_cost")} *</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={purchaseForm.unit_cost || ""}
                                onChange={(e) => setPurchaseForm({ ...purchaseForm, unit_cost: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {purchaseForm.quantity > 0 && purchaseForm.unit_cost > 0 && (
                        <div className="med-total-preview">
                            {t("total")}: <strong>{formatCurrency(purchaseForm.quantity * purchaseForm.unit_cost)}</strong>
                        </div>
                    )}

                    <div className="med-form-row">
                        <div className="med-form-group">
                            <label>{t("purchase_date")} *</label>
                            <input
                                type="date"
                                value={purchaseForm.purchase_date || ""}
                                onChange={(e) => setPurchaseForm({ ...purchaseForm, purchase_date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="med-form-group">
                            <label>{t("expiry_date")} *</label>
                            <input
                                type="date"
                                value={purchaseForm.expiry_date || ""}
                                onChange={(e) => setPurchaseForm({ ...purchaseForm, expiry_date: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="med-form-group">
                        <label>{t("invoice_number")}</label>
                        <input
                            type="text"
                            value={purchaseForm.invoice_number || ""}
                            onChange={(e) => setPurchaseForm({ ...purchaseForm, invoice_number: e.target.value })}
                        />
                    </div>

                    <div className="med-form-group">
                        <label>{t("notes")}</label>
                        <textarea
                            rows="2"
                            value={purchaseForm.notes || ""}
                            onChange={(e) => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
                        />
                    </div>

                    <div className="med-modal-footer">
                        <button type="button" className="med-btn med-btn-secondary" onClick={closeModal}>
                            {t("cancel")}
                        </button>
                        <button type="submit" className="med-btn med-btn-primary" disabled={saving}>
                            <FaSave /> {saving ? t("saving") : t("save")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )

    const renderSellModal = () => (
        <div className="med-modal-overlay" onClick={closeModal}>
            <div className="med-modal" onClick={(e) => e.stopPropagation()}>
                <div className="med-modal-header">
                    <h2>
                        <FaCashRegister /> {t("sell_medicine")}
                    </h2>
                    <button className="med-modal-close" onClick={closeModal}>
                        <FaTimes />
                    </button>
                </div>
                <form onSubmit={handleSellSubmit} className="med-modal-body">
                    <div className="med-selected-info">
                        <FaPills />
                        <div>
                            <strong>{selectedMedicine?.name}</strong>
                            <span>
                                {t("available")}: {selectedMedicine?.stock_quantity} {t("pieces")} | {t("price")}:{" "}
                                {formatCurrency(selectedMedicine?.retail_price)}
                            </span>
                        </div>
                    </div>

                    <div className="med-form-group">
                        <label>{t("patient")} *</label>
                        <input
                            type="text"
                            placeholder={t("enter_patient_name_or_passport")}
                            value={customerSearch}
                            onChange={(e) => handleCustomerSearch(e.target.value)}
                        />
                        {customers.length > 0 && (
                            <select
                                value={sellForm.customer || ""}
                                onChange={(e) => setSellForm({ ...sellForm, customer: e.target.value })}
                                required
                            >
                                <option value="">{t("select_patient")}</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.full_name} {customer.passport_id ? `(${customer.passport_id})` : ""}
                                    </option>
                                ))}
                            </select>
                        )}
                        {customerSearch.length >= 2 && customers.length === 0 && (
                            <p className="med-field-hint">{t("patient_not_found")}</p>
                        )}
                    </div>

                    <div className="med-form-group">
                        <label>{t("doctor")} *</label>
                        <select
                            value={sellForm.doctor || ""}
                            onChange={(e) => setSellForm({ ...sellForm, doctor: e.target.value })}
                            required
                        >
                            <option value="">{t("select_doctor")}</option>
                            {doctors.map((doctor) => (
                                <option key={doctor.id} value={doctor.id}>
                                    {doctor.first_name} {doctor.last_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="med-form-row">
                        <div className="med-form-group">
                            <label>{t("quantity")} *</label>
                            <input
                                type="number"
                                min="1"
                                max={selectedMedicine?.stock_quantity}
                                value={sellForm.quantity || ""}
                                onChange={(e) => setSellForm({ ...sellForm, quantity: e.target.value })}
                                required
                            />
                        </div>
                        <div className="med-form-group">
                            <label>{t("discount_percentage")}</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={sellForm.discount_percent || ""}
                                onChange={(e) => setSellForm({ ...sellForm, discount_percent: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="med-form-row">
                        <div className="med-form-group">
                            <label>{t("type")}</label>
                            <select
                                value={sellForm.sale_type || "retail"}
                                onChange={(e) => setSellForm({ ...sellForm, sale_type: e.target.value })}
                            >
                                <option value="retail">{t("retail")}</option>
                                <option value="wholesale">{t("wholesale")}</option>
                            </select>
                        </div>
                        <div className="med-form-group">
                            <label>{t("prescription_number_optional")}</label>
                            <input
                                type="text"
                                value={sellForm.prescription_number || ""}
                                onChange={(e) => setSellForm({ ...sellForm, prescription_number: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="med-form-group">
                        <label>{t("notes")}</label>
                        <textarea
                            rows="2"
                            value={sellForm.notes || ""}
                            onChange={(e) => setSellForm({ ...sellForm, notes: e.target.value })}
                        />
                    </div>

                    <div className="med-modal-footer">
                        <button type="button" className="med-btn med-btn-secondary" onClick={closeModal}>
                            {t("cancel")}
                        </button>
                        <button type="submit" className="med-btn med-btn-primary" disabled={saving}>
                            <FaSave /> {saving ? t("saving") : t("save")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )

    const renderAdjustModal = () => (
        <div className="med-modal-overlay" onClick={closeModal}>
            <div className="med-modal" onClick={(e) => e.stopPropagation()}>
                <div className="med-modal-header">
                    <h2>
                        <FaSlidersH /> {t("adjust_stock")}
                    </h2>
                    <button className="med-modal-close" onClick={closeModal}>
                        <FaTimes />
                    </button>
                </div>
                <form onSubmit={handleAdjustSubmit} className="med-modal-body">
                    <div className="med-selected-info">
                        <FaPills />
                        <div>
                            <strong>{selectedMedicine?.name}</strong>
                            <span>
                                {t("current_quantity")}: {selectedMedicine?.stock_quantity} {t("pieces")}
                            </span>
                        </div>
                    </div>

                    <div className="med-form-group">
                        <label>{t("select_adjustment_type")} *</label>
                        <select
                            value={adjustForm.adjustment_type || ""}
                            onChange={(e) => setAdjustForm({ ...adjustForm, adjustment_type: e.target.value })}
                            required
                        >
                            <option value="">{t("select_adjustment_type")}</option>
                            {ADJUSTMENT_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="med-form-group">
                        <label>{t("quantity")} *</label>
                        <input
                            type="number"
                            min="1"
                            value={adjustForm.quantity || ""}
                            onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                            required
                        />
                    </div>

                    <div className="med-form-group">
                        <label>{t("reason")} *</label>
                        <input
                            type="text"
                            value={adjustForm.reason || ""}
                            onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                            required
                        />
                    </div>

                    <div className="med-form-group">
                        <label>{t("notes")}</label>
                        <textarea
                            rows="2"
                            value={adjustForm.notes || ""}
                            onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                        />
                    </div>

                    <div className="med-modal-footer">
                        <button type="button" className="med-btn med-btn-secondary" onClick={closeModal}>
                            {t("cancel")}
                        </button>
                        <button type="submit" className="med-btn med-btn-primary" disabled={saving}>
                            <FaSave /> {saving ? t("saving") : t("save")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )

    const renderCategoriesModal = () => (
        <div className="med-modal-overlay" onClick={closeModal}>
            <div className="med-modal" onClick={(e) => e.stopPropagation()}>
                <div className="med-modal-header">
                    <h2>
                        <FaTags /> {t("category_management")}
                    </h2>
                    <button className="med-modal-close" onClick={closeModal}>
                        <FaTimes />
                    </button>
                </div>
                <div className="med-modal-body">
                    <form onSubmit={handleCategorySubmit} className="med-category-form">
                        <div className="med-form-row">
                            <div className="med-form-group">
                                <label>{t("category_name")} *</label>
                                <input
                                    type="text"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="med-form-group">
                                <label>{t("description")}</label>
                                <input
                                    type="text"
                                    value={categoryForm.description || ""}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="med-category-form-actions">
                            {editingCategory && (
                                <button
                                    type="button"
                                    className="med-btn med-btn-secondary"
                                    onClick={() => {
                                        setEditingCategory(null)
                                        setCategoryForm({ name: "", description: "" })
                                    }}
                                >
                                    {t("cancel")}
                                </button>
                            )}
                            <button type="submit" className="med-btn med-btn-primary" disabled={saving || !categoryForm.name}>
                                <FaSave /> {editingCategory ? t("save") : t("add_category")}
                            </button>
                        </div>
                    </form>

                    <div className="med-category-list">
                        {categories.map((category) => (
                            <div key={category.id} className="med-category-item">
                                <div className="med-category-info">
                                    <strong>{category.name}</strong>
                                    {category.description && <span>{category.description}</span>}
                                </div>
                                <div className="med-category-actions">
                                    <button
                                        className="med-action-btn edit"
                                        onClick={() => {
                                            setEditingCategory(category)
                                            setCategoryForm({ name: category.name, description: category.description || "" })
                                        }}
                                        title={t("edit")}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="med-action-btn delete"
                                        onClick={() => handleDeleteCategory(category)}
                                        title={t("delete")}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {categories.length === 0 && <p className="med-field-hint">{t("no_data")}</p>}
                    </div>
                </div>
            </div>
        </div>
    )

    if (loading) {
        return (
            <div className="med-loading">
                <FaSpinner className="med-spinner" />
                <p>{t("loading")}</p>
            </div>
        )
    }

    return (
        <div className="medicine-management">
            <div className="med-header">
                <div className="med-header-title">
                    <FaTooth className="med-header-icon" />
                    <div>
                        <h1>{t("medication_management")}</h1>
                        <p className="med-header-subtitle">{t("medicine_module_subtitle")}</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="med-error-banner">
                    <FaExclamationTriangle />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} aria-label={t("close")}>
                        <FaTimes />
                    </button>
                </div>
            )}

            <div className="med-tabs">
                {!isAdmin && (
                    <button
                        className={`med-tab ${activeTab === "statistics" ? "active" : ""}`}
                        onClick={() => setActiveTab("statistics")}
                    >
                        <FaChartPie /> <span>{t("statistics")}</span>
                    </button>
                )}
                <button
                    className={`med-tab ${activeTab === "warehouse" ? "active" : ""}`}
                    onClick={() => setActiveTab("warehouse")}
                >
                    <FaWarehouse /> <span>{t("medicine_warehouse")}</span>
                </button>
                {!isAdmin && (
                    <button
                        className={`med-tab ${activeTab === "purchases" ? "active" : ""}`}
                        onClick={() => setActiveTab("purchases")}
                    >
                        <FaTruck /> <span>{t("purchases_income")}</span>
                    </button>
                )}
                <button className={`med-tab ${activeTab === "sales" ? "active" : ""}`} onClick={() => setActiveTab("sales")}>
                    <FaCashRegister /> <span>{t("sales")}</span>
                </button>
            </div>

            <div className="med-content">
                {activeTab === "statistics" && renderStatistics()}
                {activeTab === "warehouse" && renderWarehouse()}
                {activeTab === "purchases" && renderPurchases()}
                {activeTab === "sales" && renderSales()}
            </div>

            {modalType === "medicine" && renderMedicineModal()}
            {modalType === "purchase" && renderPurchaseModal()}
            {modalType === "sell" && renderSellModal()}
            {modalType === "adjust" && renderAdjustModal()}
            {modalType === "categories" && renderCategoriesModal()}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={t("delete")}
                cancelText={t("cancel")}
                type="danger"
                onConfirm={confirmModal.onConfirm}
                onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
            />

            {successMessage && (
                <SuccessModal
                    isOpen={!!successMessage}
                    title={t("success")}
                    message={successMessage}
                    onClose={() => setSuccessMessage("")}
                />
            )}
        </div>
    )
}

export default MedicineManagement
