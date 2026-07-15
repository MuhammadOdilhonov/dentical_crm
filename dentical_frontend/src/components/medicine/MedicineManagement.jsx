"use client"

import { useState, useEffect } from "react"
import {
    fetchMedicines,
    fetchMedicineCategories,
    fetchMedicineStatistics,
    fetchMedicineSalesChart,
    fetchMedicineStockChart,
    fetchMedicineExpiryReport,
    fetchMedicineLowStockReport,
    searchMedicines,
    searchMedicineByBarcode,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    createMedicineCategory,
    sellMedicine,
    createMedicinePurchase,
    createMedicineAdjustment,
    fetchMedicineSales,
} from "../../api/apiMedicine"
import branchesApi from "../../api/apiBranches"
import client from "../../api/apiService"
import usersApi from "../../api/apiUsers"
import apiPatients from "../../api/apiPatients"
import Pagination from "../pagination/Pagination"

import { useLanguage } from "../../contexts/LanguageContext"

const MedicineManagement = () => {
    const { t, language } = useLanguage()
    const [activeTab, setActiveTab] = useState("dashboard")
    const [medicines, setMedicines] = useState([])
    const [categories, setCategories] = useState([])
    const [branches, setBranches] = useState([])
    const [doctors, setDoctors] = useState([])
    const [customers, setCustomers] = useState([])
    const [sales, setSales] = useState([])
    const [customerSearch, setCustomerSearch] = useState("")
    const [statistics, setStatistics] = useState({})
    const [salesChart, setSalesChart] = useState([])
    const [stockChart, setStockChart] = useState({})
    const [expiryReport, setExpiryReport] = useState([])
    const [lowStockReport, setLowStockReport] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [modalType, setModalType] = useState("")
    const [selectedMedicine, setSelectedMedicine] = useState(null)
    const [formData, setFormData] = useState({})

    const [currentPage, setCurrentPage] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const [salesCurrentPage, setSalesCurrentPage] = useState(0)
    const [salesTotalItems, setSalesTotalItems] = useState(0)
    const [salesTotalPages, setSalesTotalPages] = useState(0)

    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [categoryFormData, setCategoryFormData] = useState({ name: "", description: "" })

    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const userRole = user.role || ""
    const isAdmin = userRole === "admin"
    const isDirector = userRole === "director"

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

    useEffect(() => {
        loadInitialData()
    }, [])

    useEffect(() => {
        loadMedicines({ page: currentPage + 1, page_size: itemsPerPage })
    }, [currentPage, itemsPerPage])

    useEffect(() => {
        if (activeTab === "sales") {
            loadSales({ page: salesCurrentPage + 1, page_size: itemsPerPage })
        }
    }, [salesCurrentPage, itemsPerPage, activeTab])

    const loadInitialData = async () => {
        setLoading(true)
        try {
            await Promise.all([
                loadMedicines({ page: 1, page_size: itemsPerPage }),
                loadCategories(),
                loadBranches(),
                loadStatistics(),
                loadCharts(),
                loadReports(),
                language,
            ])
        } catch (error) {
            console.error("Error loading initial data:", error)
        } finally {
            setLoading(false)
        }
    }

    const loadMedicines = async (params = {}) => {
        try {
            const data = await fetchMedicines(params)
            if (data && data.results) {
                setMedicines(Array.isArray(data.results) ? data.results : [])
                setTotalItems(data.count || 0)
                setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
            } else {
                setMedicines(Array.isArray(data) ? data : [])
                setTotalItems(data?.length || 0)
                setTotalPages(1)
            }
        } catch (error) {
            console.error("Error loading medicines:", error)
            setMedicines([])
            setTotalItems(0)
            setTotalPages(0)
        }
    }

    const loadCategories = async () => {
        try {
            const data = await fetchMedicineCategories()
            if (data && data.results) {
                setCategories(Array.isArray(data.results) ? data.results : [])
            } else {
                setCategories(Array.isArray(data) ? data : [])
            }
        } catch (error) {
            console.error("Error loading categories:", error)
            setCategories([])
        }
    }

    const loadBranches = async () => {
        try {
            const data = await branchesApi.fetchBranches()
            setBranches(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Error loading branches:", error)
            setBranches([])
        }
    }

    const loadStatistics = async () => {
        if (isAdmin) return
        try {
            const data = await fetchMedicineStatistics()
            setStatistics(data)
        } catch (error) {
            console.error("Error loading statistics:", error)
        }
    }

    const loadCharts = async () => {
        if (isAdmin) return
        try {
            const [salesData, stockData] = await Promise.all([fetchMedicineSalesChart(), fetchMedicineStockChart()])
            setSalesChart(salesData.sales_chart || [])
            setStockChart(stockData)
        } catch (error) {
            console.error("Error loading charts:", error)
        }
    }

    const loadReports = async () => {
        try {
            const [expiryData, lowStockData] = await Promise.all([
                fetchMedicineExpiryReport(30),
                fetchMedicineLowStockReport(),
            ])
            setExpiryReport(expiryData.medicines || [])
            setLowStockReport(lowStockData.medicines || [])
        } catch (error) {
            console.error("Error loading reports:", error)
        }
    }

    const loadSales = async (params = {}) => {
        try {
            const data = await fetchMedicineSales(params)
            if (data && data.results) {
                setSales(Array.isArray(data.results) ? data.results : [])
                setSalesTotalItems(data.count || 0)
                setSalesTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
            } else {
                setSales(Array.isArray(data) ? data : [])
                setSalesTotalItems(data?.length || 0)
                setSalesTotalPages(1)
            }
        } catch (error) {
            console.error("Error loading sales:", error)
            setSales([])
            setSalesTotalItems(0)
            setSalesTotalPages(0)
        }
    }

    const loadDoctorsByBranch = async (branchId) => {
        try {
            const data = await usersApi.fetchUsers(1, 1000, { branch: branchId, role: "doctor" })
            setDoctors(Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Error loading doctors:", error)
            setDoctors([])
        }
    }

    const searchCustomersByBranch = async (searchTerm, branchId) => {
        try {
            const data = await apiPatients.fetchPatients(1, 1000, searchTerm, branchId)
            console.log("Search results:", data.results[0].full_name);

            setCustomers(data.results)
        } catch (error) {
            console.error("Error searching customers:", error)
            setCustomers([])
        }
    }

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadMedicines({ page: 1, page_size: itemsPerPage })
            return
        }

        try {
            setLoading(true)
            const data = await searchMedicines(searchQuery)
            if (data && data.results) {
                setMedicines(Array.isArray(data.results) ? data.results : [])
                setTotalItems(data.count || 0)
                setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
            } else {
                setMedicines(Array.isArray(data?.medicines) ? data.medicines : [])
                setTotalItems(data?.medicines?.length || 0)
                setTotalPages(1)
            }
            setCurrentPage(0)
        } catch (error) {
            console.error("Error searching medicines:", error)
            setMedicines([])
        } finally {
            setLoading(false)
        }
    }

    const handleBarcodeSearch = async (barcode) => {
        try {
            const data = await searchMedicineByBarcode(barcode)
            setMedicines([data])
        } catch (error) {
            console.error("Error searching by barcode:", error)
        }
    }

    const handleCategoryFilter = async (categoryId) => {
        setSelectedCategory(categoryId)
        const params = {
            page: 1,
            page_size: itemsPerPage,
            ...(categoryId && { category_id: categoryId }),
        }
        setCurrentPage(0)
        await loadMedicines(params)
    }

    const openModal = (type, medicine = null) => {
        setModalType(type)
        setSelectedMedicine(medicine)
        setFormData(medicine || {})
        setShowModal(true)

        if (type === "sell-medicine" && medicine?.branch) {
            loadDoctorsByBranch(medicine.branch)
        }
    }

    const closeModal = () => {
        setShowModal(false)
        setModalType("")
        setSelectedMedicine(null)
        setFormData({})
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)

            switch (modalType) {
                case "add-medicine":
                    await createMedicine({ ...formData, branch: formData.branch })
                    break
                case "edit-medicine":
                    await updateMedicine(selectedMedicine.id, formData)
                    break
                case "add-category":
                    await createMedicineCategory(formData)
                    await loadCategories()
                    break
                case "sell-medicine":
                    await sellMedicine({
                        ...formData,
                        customer: formData.customer,
                        doctor: formData.doctor,
                        medicine: selectedMedicine?.id,
                    })
                    break
                case "purchase-medicine":
                    await createMedicinePurchase(formData)
                    break
                case "adjust-stock":
                    await createMedicineAdjustment(formData)
                    break
                default:
                    break
            }

            await loadMedicines({ page: currentPage + 1, page_size: itemsPerPage })
            closeModal()
        } catch (error) {
            console.error("Error submitting form:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm(t("delete_confirmation"))) {
            try {
                await deleteMedicine(id)
                await loadMedicines({ page: currentPage + 1, page_size: itemsPerPage })
            } catch (error) {
                console.error("Error deleting medicine:", error)
            }
        }
    }

    const getStockStatusClass = (medicine) => {
        if (medicine.is_expired) return "expired"
        if (medicine.is_expiring_soon) return "expiring-soon"
        if (medicine.is_low_stock) return "low-stock"
        return "normal"
    }

    const renderDashboard = () => (
        <div className="medicine-dashboard">
            {!isAdmin && (
                <div className="statistics-grid">
                    <div className="stat-card total">
                        <div className="stat-icon">💊</div>
                        <div className="stat-content">
                            <h3>{statistics.total_medicines || 0}</h3>
                            <p>{t("total_medicines")}</p>
                        </div>
                    </div>
                    <div className="stat-card low-stock">
                        <div className="stat-icon">⚠️</div>
                        <div className="stat-content">
                            <h3>{statistics.low_stock_medicines || 0}</h3>
                            <p>{t("low_stock_medicines")}</p>
                        </div>
                    </div>
                    <div className="stat-card expired">
                        <div className="stat-icon">❌</div>
                        <div className="stat-content">
                            <h3>{statistics.expired_medicines || 0}</h3>
                            <p>{t("expired_medicines")}</p>
                        </div>
                    </div>
                    <div className="stat-card expiring">
                        <div className="stat-icon">⏰</div>
                        <div className="stat-content">
                            <h3>{statistics.expiring_soon_medicines || 0}</h3>
                            <p>{t("expiring_soon_medicines")}</p>
                        </div>
                    </div>
                    {isDirector && (
                        <>
                            <div className="stat-card value">
                                <div className="stat-icon">💰</div>
                                <div className="stat-content">
                                    <h3>{Number.parseFloat(statistics.total_stock_value || 0).toLocaleString()} {t("currency")}</h3>
                                    <p>{t("stock_value")}</p>
                                </div>
                            </div>
                            <div className="stat-card sales">
                                <div className="stat-icon">📈</div>
                                <div className="stat-content">
                                    <h3>{Number.parseFloat(statistics.monthly_sales || 0).toLocaleString()} {t("currency")}</h3>
                                    <p>{t("monthly_sales")}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className="reports-section">
                <div className="report-card">
                    <h3>{t("expiring_medicines_report")}</h3>
                    <div className="report-list">
                        {expiryReport.slice(0, 5).map((medicine) => (
                            <div key={medicine.id} className="report-item expiring">
                                <span className="medicine-name">{medicine.name}</span>
                                <span className="expiry-date">{new Date(medicine.expiry_date).toLocaleDateString()}</span>
                                <span className="stock-quantity">{medicine.stock_quantity} {t("pieces")}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="report-card">
                    <h3>{t("low_stock_medicines_report")}</h3>
                    <div className="report-list">
                        {lowStockReport.slice(0, 5).map((medicine) => (
                            <div key={medicine.id} className="report-item low-stock">
                                <span className="medicine-name">{medicine.name}</span>
                                <span className="stock-info">
                                    {medicine.stock_quantity}/{medicine.minimum_stock}
                                </span>
                                <span className="stock-status">{t("low")}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )

    const renderMedicines = () => (
        <div className="medicines-section">
            <div className="medicines-header">
                <div className="search-controls">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder={t("medicine_name_or_barcode")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <button onClick={handleSearch} className="search-btn">
                            🔍
                        </button>
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryFilter(e.target.value)}
                        className="category-filter"
                    >
                        <option value="">{t("all_categories")}</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="action-buttons">
                    <button onClick={() => openModal("add-medicine")} className="btn-primary">
                        ➕ {t("add_medicine")}
                    </button>
                    <button onClick={() => setShowCategoryModal(true)} className="btn-secondary">
                        📁 {t("add_category")}
                    </button>
                </div>
            </div>

            <div className="categories-section">
                <h3>📂 {t("categories")} ({categories.length})</h3>
                <div className="categories-list">
                    {categories.map((category) => (
                        <div key={category.id} className="category-item">
                            <span className="category-name">{category.name}</span>
                            <span className="category-description">{category.description}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="medicines-grid">
                {medicines.map((medicine) => (
                    <div key={medicine.id} className={`medicine-card ${getStockStatusClass(medicine)}`}>
                        <div className="medicine-header">
                            <h4>{medicine.name}</h4>
                            <span className="medicine-code">{medicine.medicine_code}</span>
                        </div>
                        <div className="medicine-info">
                            <p>
                                <strong>{t("category")}:</strong> {medicine.category_name}
                            </p>
                            <p>
                                <strong>{t("manufacturer")}:</strong> {medicine.manufacturer}
                            </p>
                            <p>
                                <strong>{t("dosage")}:</strong> {medicine.dosage_strength} {medicine.dosage_unit}
                            </p>
                            <p>
                                <strong>{t("stock")}:</strong> {medicine.stock_quantity} {t("pieces")}
                            </p>
                            <p>
                                <strong>{t("price")}:</strong> {Number.parseFloat(medicine.retail_price).toLocaleString()} {t("currency")}
                            </p>
                            <p>
                                <strong>{t("expiry_date")}:</strong> {new Date(medicine.expiry_date).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="medicine-actions">
                            <button onClick={() => openModal("sell-medicine", medicine)} className="btn-success">
                                💰 {t("sell")}
                            </button>
                            <button onClick={() => openModal("edit-medicine", medicine)} className="btn-warning">
                                ✏️ {t("edit")}
                            </button>
                            <button onClick={() => openModal("adjust-stock", medicine)} className="btn-info">
                                📊 {t("adjust")}
                            </button>
                            <button onClick={() => handleDelete(medicine.id)} className="btn-danger">
                                🗑️ {t("delete")}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {totalItems > 0 && (
                <div className="pagination-wrapper">
                    <Pagination
                        pageCount={totalPages}
                        currentPage={currentPage}
                        onPageChange={(page) => setCurrentPage(page - 1)}
                        itemsPerPage={itemsPerPage}
                        totalItems={totalItems}
                        onItemsPerPageChange={(size) => setItemsPerPage(size)}
                    />
                </div>
            )}
        </div>
    )

    const renderSales = () => (
        <div className="sales-section">
            <div className="sales-header">
                <h2>💰 {t("sold_medicines")}</h2>
            </div>

            <div className="sales-grid">
                {sales.map((sale) => (
                    <div key={sale.id} className="sale-card">
                        <div className="sale-header">
                            <h4>{sale.medicine_name}</h4>
                            <span className="sale-date">{new Date(sale.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="sale-info">
                            <p>
                                <strong>{t("patient")}:</strong> {sale.customer_name}
                            </p>
                            <p>
                                <strong>{t("doctor")}:</strong> {sale.doctor_name}
                            </p>
                            <p>
                                <strong>{t("quantity")}:</strong> {sale.quantity} {t("pieces")}
                            </p>
                            <p>
                                <strong>{t("unit_price")}:</strong> {Number.parseFloat(sale.unit_price).toLocaleString()} {t("currency")}
                            </p>
                            <p>
                                <strong>{t("total")}:</strong> {Number.parseFloat(sale.total_price).toLocaleString()} {t("currency")}
                            </p>
                            {sale.discount_amount > 0 && (
                                <p>
                                    <strong>{t("discount")}:</strong> {Number.parseFloat(sale.discount_amount).toLocaleString()} {t("currency")} (
                                    {sale.discount_percent}%)
                                </p>
                            )}
                            <p>
                                <strong>{t("final_price")}:</strong> {Number.parseFloat(sale.final_price).toLocaleString()} {t("currency")}
                            </p>
                            <p>
                                <strong>{t("type")}:</strong> {sale.sale_type === "retail" ? t("retail") : t("wholesale")}
                            </p>
                            {sale.prescription_number && (
                                <p>
                                    <strong>{t("prescription")}:</strong> {sale.prescription_number}
                                </p>
                            )}
                            {sale.notes && (
                                <p>
                                    <strong>{t("notes")}:</strong> {sale.notes}
                                </p>
                            )}
                            <p>
                                <strong>{t("seller")}:</strong> {sale.sold_by_name}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {salesTotalItems > 0 && (
                <div className="pagination-wrapper">
                    <Pagination
                        pageCount={salesTotalPages}
                        currentPage={salesCurrentPage}
                        onPageChange={(page) => setSalesCurrentPage(page - 1)}
                        itemsPerPage={itemsPerPage}
                        totalItems={salesTotalItems}
                        onItemsPerPageChange={(size) => setItemsPerPage(size)}
                    />
                </div>
            )}
        </div>
    )

    const renderModal = () => {
        if (!showModal) return null

        const modalTitles = {
            "add-medicine": t("add_new_medicine"),
            "edit-medicine": t("edit_medicine"),
            "add-category": t("add_new_category"),
            "sell-medicine": t("sell_medicine"),
            "purchase-medicine": t("purchase_medicine"),
            "adjust-stock": t("adjust_stock"),
        }

        return (
            <div className="modal-overlay" onClick={closeModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>{modalTitles[modalType]}</h3>
                        <button onClick={closeModal} className="close-btn">
                            ✕
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="modal-form">
                        {modalType === "add-medicine" || modalType === "edit-medicine" ? (
                            <>
                                <input
                                    type="text"
                                    placeholder={t("medicine_name")}
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder={t("generic_name")}
                                    value={formData.generic_name || ""}
                                    onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                                />
                                <select
                                    value={formData.category || ""}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="">{t("select_category")}</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={formData.branch || ""}
                                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                    required
                                >
                                    <option value="">{t("select_branch")}</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder={t("manufacturer")}
                                    value={formData.manufacturer || ""}
                                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                                />
                                <div className="form-row">
                                    <input
                                        type="number"
                                        placeholder={t("dosage_amount")}
                                        value={formData.dosage_strength || ""}
                                        onChange={(e) => setFormData({ ...formData, dosage_strength: e.target.value })}
                                    />
                                    <select
                                        value={formData.dosage_unit || ""}
                                        onChange={(e) => setFormData({ ...formData, dosage_unit: e.target.value })}
                                        required
                                    >
                                        <option value="">{t("select_dosage_unit")}</option>
                                        {UNIT_CHOICES.map((unit) => (
                                            <option key={unit.value} value={unit.value}>
                                                {unit.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <input
                                        type="number"
                                        placeholder={t("cost_price")}
                                        value={formData.unit_price || ""}
                                        onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder={t("selling_price")}
                                        value={formData.retail_price || ""}
                                        onChange={(e) => setFormData({ ...formData, retail_price: e.target.value })}
                                    />
                                </div>
                                <div className="form-row">
                                    <input
                                        type="number"
                                        placeholder={t("stock_quantity")}
                                        value={formData.stock_quantity || ""}
                                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder={t("minimum_quantity")}
                                        value={formData.minimum_stock || ""}
                                        onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                                    />
                                </div>
                                <input
                                    type="date"
                                    placeholder={t("expiry_date")}
                                    value={formData.expiry_date || ""}
                                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder={t("barcode")}
                                    value={formData.barcode || ""}
                                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                />
                                <textarea
                                    placeholder={t("description")}
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </>
                        ) : modalType === "add-category" ? (
                            <>
                                <input
                                    type="text"
                                    placeholder={t("category_name")}
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <textarea
                                    placeholder={t("description")}
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </>
                        ) : modalType === "sell-medicine" ? (
                            <>
                                <div className="medicine-info-display">
                                    <h4>{selectedMedicine?.name}</h4>
                                    <p>{t("available")}: {selectedMedicine?.stock_quantity} {t("pieces")}</p>
                                    <p>{t("price")}: {Number.parseFloat(selectedMedicine?.retail_price || 0).toLocaleString()} {t("currency")}</p>
                                </div>

                                <div className="customer-selection">
                                    <label>{t("patient")}:</label>
                                    <input
                                        type="text"
                                        placeholder={t("enter_patient_name_or_passport")}
                                        value={customerSearch}
                                        onChange={(e) => handleCustomerSearch(e.target.value)}
                                        className="customer-search-input"
                                    />
                                    {customers.length > 0 && (
                                        <div className="customer-dropdown">
                                            <select
                                                value={formData.customer || ""}
                                                onChange={(e) => handleCustomerSelect(e.target.value)}
                                                required
                                                className="customer-select"
                                            >
                                                <option value="">{t("select_patient")}</option>
                                                {customers.map((customer) => (
                                                    <option key={customer.id} value={customer.id}>
                                                        {customer.full_name}{customer.passport_id}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {customerSearch && customers.length === 0 && (
                                        <div className="no-customers-found">{t("patient_not_found")}</div>
                                    )}
                                </div>

                                <div className="doctor-selection">
                                    <label>{t("doctor")}:</label>
                                    <select
                                        value={formData.doctor || ""}
                                        onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                                        required
                                    >
                                        <option value="">{t("select_doctor")}</option>
                                        {doctors.map((doctor) => (
                                            <option key={doctor.id} value={doctor.id}>
                                                {doctor.first_name} {doctor.last_name} - {doctor.specialization || t("doctor")}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <input
                                    type="number"
                                    placeholder={t("quantity")}
                                    value={formData.quantity || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, quantity: e.target.value, medicine: selectedMedicine?.id })
                                    }
                                    max={selectedMedicine?.stock_quantity}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder={t("discount_percentage")}
                                    value={formData.discount_percent || ""}
                                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                                />
                                <select
                                    value={formData.sale_type || "retail"}
                                    onChange={(e) => setFormData({ ...formData, sale_type: e.target.value })}
                                >
                                    <option value="retail">{t("retail")}</option>
                                    <option value="wholesale">{t("wholesale")}</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder={t("prescription_number_optional")}
                                    value={formData.prescription_number || ""}
                                    onChange={(e) => setFormData({ ...formData, prescription_number: e.target.value })}
                                />
                                <textarea
                                    placeholder={t("notes")}
                                    value={formData.notes || ""}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </>
                        ) : modalType === "adjust-stock" ? (
                            <>
                                <div className="medicine-info-display">
                                    <h4>{selectedMedicine?.name}</h4>
                                    <p>{t("current_quantity")}: {selectedMedicine?.stock_quantity} {t("pieces")}</p>
                                </div>
                                <select
                                    value={formData.adjustment_type || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, adjustment_type: e.target.value, medicine: selectedMedicine?.id })
                                    }
                                    required
                                >
                                    <option value="">{t("select_adjustment_type")}</option>
                                    <option value="addition">{t("add")}</option>
                                    <option value="subtraction">{t("subtract")}</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder={t("quantity")}
                                    value={formData.quantity || ""}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder={t("reason")}
                                    value={formData.reason || ""}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    required
                                />
                                <textarea
                                    placeholder={t("notes")}
                                    value={formData.notes || ""}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </>
                        ) : null}
                        <div className="modal-actions">
                            <button type="button" onClick={closeModal} className="btn-secondary">
                                {t("cancel")}
                            </button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? t("saving") : t("save")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    const renderCategoryModal = () => {
        if (!showCategoryModal) return null

        return (
            <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
                <div className="modal-content category-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>📁 {t("add_new_category")}</h3>
                        <button onClick={() => setShowCategoryModal(false)} className="close-btn">
                            ✕
                        </button>
                    </div>

                    <div className="categories-display">
                        <h4>{t("existing_categories")}:</h4>
                        <div className="existing-categories">
                            {categories.map((category) => (
                                <div key={category.id} className="category-chip">
                                    <span>{category.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleCategorySubmit} className="modal-form">
                        <input
                            type="text"
                            placeholder={t("category_name")}
                            value={categoryFormData.name}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder={t("description")}
                            value={categoryFormData.description}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                        />
                        <div className="modal-actions">
                            <button type="button" onClick={() => setShowCategoryModal(false)} className="btn-secondary">
                                {t("cancel")}
                            </button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? t("saving") : t("save")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    const handleCategorySubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            await createMedicineCategory(categoryFormData)
            await loadCategories()
            setShowCategoryModal(false)
        } catch (error) {
            console.error("Error submitting category form:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCustomerSearch = (searchTerm) => {
        setCustomerSearch(searchTerm)
        if (searchTerm.length >= 2 && selectedMedicine?.branch) {
            searchCustomersByBranch(searchTerm, selectedMedicine.branch)
        } else if (searchTerm.length < 2) {
            setCustomers([])
        }
    }

    const handleCustomerSelect = async (customerId) => {
        setFormData({ ...formData, customer: customerId })

        // Fetch and display customer debt statistics
        if (customerId) {
            const debtStats = await fetchCustomerDebtStats(customerId)
            if (debtStats) {
                console.log("[v0] Customer debt stats:", debtStats)
                // You can display this in a modal or info section
            }
        }
    }

    const fetchCustomerDebtStats = async (customerId) => {
        try {
            // Backend clientdan foydalanamiz (to'g'ri BaseUrl + token)
            const response = await client.get(`/customer/${customerId}/debt-stats/`)
            return response.data
        } catch (error) {
            console.error("Error fetching customer debt stats:", error)
            return null
        }
    }

    return (
        <div className="medicine-management">
            <div className="medicine-header">
                <h1>💊 {t("medication_management")}</h1>
                <div className="user-role-badge">{userRole === "director" ? `👑 ${t("director")}` : `👨‍💼 ${t("admin")}`}</div>
            </div>

            <div className="medicine-tabs">
                <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
                    📊 {t("control_panel")}
                </button>
                <button className={activeTab === "medicines" ? "active" : ""} onClick={() => setActiveTab("medicines")}>
                    💊 {t("medicines")}
                </button>
                <button className={activeTab === "sales" ? "active" : ""} onClick={() => setActiveTab("sales")}>
                    💰 {t("sales")}
                </button>
            </div>

            <div className="medicine-content">
                {loading && <div className="loading-spinner">{t("loading")}</div>}
                {activeTab === "dashboard" && renderDashboard()}
                {activeTab === "medicines" && renderMedicines()}
                {activeTab === "sales" && renderSales()}
            </div>

            {renderModal()}
            {renderCategoryModal()}
        </div>
    )
}

export default MedicineManagement