"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "../../contexts/LanguageContext"
import { useAuth } from "../../contexts/AuthContext"
import ApiServicePrices from "../../api/apiServicePrices"
import Pagination from "../pagination/Pagination"
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch,
    FaFilter,
    FaSave,
    FaTimes,
    FaMoneyBillWave,
    FaTooth,
    FaList,
    FaTable,
    FaExclamationTriangle,
    FaTags,
    FaCopy,
    FaEye,
    FaInfoCircle,
    FaCheckCircle,
    FaTimesCircle,
    FaTrashAlt,
    FaHistory,
} from "react-icons/fa"

const ServicePrices = () => {
    const { t } = useLanguage()
    const { user } = useAuth()
    const [services, setServices] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [apiError, setApiError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [viewMode, setViewMode] = useState("grid")

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [showCategoryAddModal, setShowCategoryAddModal] = useState(false)
    const [showCategoryEditModal, setShowCategoryEditModal] = useState(false)
    const [showCategoryDeleteModal, setShowCategoryDeleteModal] = useState(false)
    const [showServiceDetailsModal, setShowServiceDetailsModal] = useState(false)
    const [showSingleDeleteModal, setShowSingleDeleteModal] = useState(false)

    // Service details states
    const [selectedService, setSelectedService] = useState(null)
    const [selectedSingleService, setSelectedSingleService] = useState(null)
    const [serviceDetails, setServiceDetails] = useState([])
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [editingService, setEditingService] = useState(null)

    const [selectedCategoryItem, setSelectedCategoryItem] = useState(null)
    const [createForAllTeeth, setCreateForAllTeeth] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        amount: "",
    })

    const [categoryFormData, setCategoryFormData] = useState({
        name: "",
    })

    const [priceHistory, setPriceHistory] = useState([])
    const [showPriceHistory, setShowPriceHistory] = useState(false)

    useEffect(() => {
        loadData()
    }, [currentPage, itemsPerPage])

    useEffect(() => {
        loadCategories()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            setApiError(null)
            const response = await ApiServicePrices.fetchServicePrices(currentPage + 1, itemsPerPage)

            if (response && Array.isArray(response)) {
                setServices(response)
                setTotalItems(response.length)
                setTotalPages(Math.ceil(response.length / itemsPerPage))
            } else if (response && response.results) {
                setServices(response.results)
                setTotalItems(response.count || 0)
                setTotalPages(Math.ceil((response.count || 0) / itemsPerPage))
            } else {
                setServices([])
                setTotalItems(0)
                setTotalPages(0)
            }

            setLoading(false)
        } catch (err) {
            console.error("Ma'lumotlarni yuklashda xatolik:", err)
            setApiError(err.response?.data?.message || err.message || t("loading_error"))
            setServices([])
            setLoading(false)
        }
    }

    const loadCategories = async () => {
        try {
            const response = await ApiServicePrices.fetchServiceCategories()
            if (response && Array.isArray(response)) {
                setCategories(response)
            } else if (response && response.results) {
                setCategories(response.results)
            } else {
                setCategories([])
            }
        } catch (err) {
            console.error("Kategoriyalarni yuklashda xatolik:", err)
            setCategories([])
        }
    }

    const loadServiceDetails = async (serviceId) => {
        try {
            setLoadingDetails(true)
            setApiError(null)
            const response = await ApiServicePrices.fetchServiceDetailsByName(serviceId)

            if (response && Array.isArray(response)) {
                setServiceDetails(response)
            } else {
                setServiceDetails([])
                setApiError(t("no_details_found"))
            }

            setLoadingDetails(false)
        } catch (err) {
            console.error("Xizmat tafsilotlarini yuklashda xatolik:", err)
            setApiError(err.response?.data?.message || err.message || t("loading_error"))
            setServiceDetails([])
            setLoadingDetails(false)
        }
    }

    const handleServiceCardClick = async (service) => {
        setSelectedService(service)
        setShowServiceDetailsModal(true)
        await loadServiceDetails(service.id)
    }

    const handleEditServiceDetail = (serviceDetail) => {
        setEditingService({
            ...serviceDetail,
            amount: serviceDetail.amount.toString(),
        })
    }

    // Bitta tishning xizmatini yangilash
    const handleSaveServiceDetail = async () => {
        try {
            setApiError(null)
            const updateData = {
                name: editingService.name,
                description: editingService.description,
                amount: Number.parseFloat(editingService.amount),
                category: editingService.category,
            }

            // Bitta tish uchun individual API endpoint ishlatamiz
            await ApiServicePrices.updateSingleService(editingService.id, updateData)

            // Service details ni qayta yuklaymiz
            await loadServiceDetails(selectedService.id)

            // Asosiy services ro'yxatini qayta yuklaymiz
            await loadData()

            setEditingService(null)
        } catch (err) {
            console.error("Bitta tish xizmatini yangilashda xatolik:", err)
            setApiError(err.response?.data?.message || err.message || t("loading_error"))
        }
    }

    const handleCancelEdit = () => {
        setEditingService(null)
    }

    const handleAddService = async () => {
        try {
            setApiError(null)
            const serviceData = {
                name: formData.name,
                description: formData.description,
                amount: Number.parseFloat(formData.amount),
                category: Number.parseInt(formData.category),
            }

            if (createForAllTeeth) {
                await ApiServicePrices.createBulkService(serviceData)
            } else {
                await ApiServicePrices.createService(serviceData)
            }

            await loadData()
            setShowAddModal(false)
            resetForm()
        } catch (err) {
            console.error("Xizmat qo'shishda xatolik:", err)
            setApiError(err.response?.data?.message || err.message || t("loading_error"))
        }
    }

    // Barcha tishlarning xizmatini yangilash (bulk update)
    const handleEditService = async () => {
        try {
            setApiError(null)
            const serviceData = {
                name: formData.name,
                description: formData.description,
                amount: Number.parseFloat(formData.amount),
                category: Number.parseInt(formData.category),
            }

            // Bulk update uchun
            await ApiServicePrices.updateBulkService(selectedService.id, serviceData)
            await loadData()
            setShowEditModal(false)
            resetForm()
        } catch (err) {
            console.error("Xizmatni yangilashda xatolik:", err)
            setApiError(err.response?.data?.message || err.message || t("loading_error"))
        }
    }

    // Barcha tishlarning xizmatini o'chirish (bulk delete)
    const handleDeleteService = async () => {
        try {
            setApiError(null)
            await ApiServicePrices.deleteBulkService(selectedService.id)
            await loadData()
            setShowBulkDeleteModal(false)
            setSelectedService(null)
        } catch (err) {
            console.error("Bulk xizmatni o'chirishda xatolik:", err)
            setApiError(err.response?.data?.message || err.message || t("loading_error"))
        }
    }

    // Bitta tishning xizmatini o'chirish
    const handleDeleteSingleService = async () => {
        try {
            setApiError(null)
            await ApiServicePrices.deleteSingleService(selectedSingleService.id)

            // Service details ni qayta yuklaymiz
            await loadServiceDetails(selectedService.id)

            // Asosiy services ro'yxatini qayta yuklaymiz
            await loadData()

            setShowSingleDeleteModal(false)
            setSelectedSingleService(null)
        } catch (err) {
            console.error("Bitta tish xizmatini o'chirishda xatolik:", err)
            setApiError(err.response?.data?.message || err.message || t("loading_error"))
        }
    }

    // Category management functions
    const handleAddCategory = async () => {
        try {
            setApiError(null)
            await ApiServicePrices.createCategory(categoryFormData)
            await loadCategories()
            setShowCategoryAddModal(false)
            resetCategoryForm()
        } catch (err) {
            console.error("Kategoriya qo'shishda xatolik:", err)
            setApiError(err.response?.data?.message || err.message || t("loading_error"))
        }
    }

    const handleEditCategory = async () => {
        try {
            setApiError(null)
            await ApiServicePrices.updateCategory(selectedCategoryItem.id, categoryFormData)
            await loadCategories()
            setShowCategoryEditModal(false)
            resetCategoryForm()
        } catch (err) {
            console.error("Kategoriyani yangilashda xatolik:", err)
            setApiError(err.response?.data?.message || err.message || t("loading_error"))
        }
    }

    const handleDeleteCategory = async () => {
        try {
            setApiError(null)
            await ApiServicePrices.deleteCategory(selectedCategoryItem.id)
            await loadCategories()
            setShowCategoryDeleteModal(false)
            setSelectedCategoryItem(null)
        } catch (err) {
            console.error("Kategoriyani o'chirishda xatolik:", err)
            setApiError(err.response?.data?.message || err.message || t("loading_error"))
        }
    }

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            category: "",
            amount: "",
        })
        setCreateForAllTeeth(false)
    }

    const resetCategoryForm = () => {
        setCategoryFormData({
            name: "",
        })
    }

    const openEditModal = (service) => {
        setSelectedService(service)
        setFormData({
            name: service.name,
            description: service.description,
            category: service.category_id.toString(),
            amount: service.amount.toString(),
        })
        setShowEditModal(true)
    }

    const openCategoryEditModal = (category) => {
        setSelectedCategoryItem(category)
        setCategoryFormData({
            name: category.name,
        })
        setShowCategoryEditModal(true)
    }

    const handlePageChange = (selectedPage) => {
        setCurrentPage(selectedPage)
    }

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage)
        setCurrentPage(0)
    }

    const filteredServices = services.filter((service) => {
        const matchesSearch =
            service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === "all" || service.category_id === Number.parseInt(selectedCategory)
        return matchesSearch && matchesCategory
    })

    const formatPrice = (price) => {
        return new Intl.NumberFormat("uz-UZ").format(price) + " " + t("currency")
    }

    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId)
        return category ? category.name : t("no_data_found")
    }

    const showPriceHistoryModal = async (service) => {
        try {
            setSelectedService(service)
            const history = await ApiServicePrices.fetchPriceHistory(service.id)
            setPriceHistory(history)
            setShowPriceHistory(true)
        } catch (err) {
            setApiError(err.response?.data?.message || err.message || t("loading_error"))
        }
    }

    const closeApiError = () => {
        setApiError(null)
    }

    if (loading) {
        return (
            <div className="service-prices-loading">
                <div className="loading-spinner"></div>
                <p>{t("loading")}...</p>
            </div>
        )
    }

    return (
        <div className="service-prices">
            {/* API Error Display */}
            {apiError && (
                <div className="api-error-banner">
                    <div className="error-content">
                        <FaTimesCircle className="error-icon" />
                        <span className="error-message">{apiError}</span>
                        <button className="error-close" onClick={closeApiError}>
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}

            <div className="service-prices-header">
                <div className="header-title">
                    <FaMoneyBillWave className="title-icon" />
                    <div className="title-content">
                        <h1>{t("service_prices")}</h1>
                        <span className="service-count">
                            {totalItems} {t("services")}
                        </span>
                    </div>
                </div>

                <div className="header-actions">
                    <button className="btn btn-secondary category-btn" onClick={() => setShowCategoryModal(true)}>
                        <FaTags /> <span>{t("categories")}</span>
                    </button>
                    <button className="btn btn-primary add-service-btn" onClick={() => setShowAddModal(true)}>
                        <FaPlus /> <span>{t("new_service")}</span>
                    </button>
                </div>
            </div>

            <div className="service-prices-controls">
                <div className="search-filter-section">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder={t("search_services")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-box">
                        <FaFilter className="filter-icon" />
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            <option value="all">{t("all_categories")}</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="view-controls">
                    <button className={`view-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>
                        <FaTable />
                        <span className="view-label">{t("grid")}</span>
                    </button>
                    <button className={`view-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
                        <FaList />
                        <span className="view-label">{t("list")}</span>
                    </button>
                </div>
            </div>

            <div className={`services-container ${viewMode}`}>
                {filteredServices.map((service) => (
                    <div key={service.id} className="service-card" onClick={() => handleServiceCardClick(service)}>
                        <div className="service-header">
                            <div className="service-info">
                                <h3 className="service-name">
                                    <FaTooth className="tooth-icon" />
                                    {service.name}
                                </h3>
                                <span className="service-category">{service.category_name}</span>
                            </div>
                            <div className="service-actions" onClick={(e) => e.stopPropagation()}>
                                <button
                                    className="action-btn view-btn"
                                    onClick={() => handleServiceCardClick(service)}
                                    title={t("view_details")}
                                >
                                    <FaEye />
                                </button>
                                <button className="action-btn edit-btn" onClick={() => openEditModal(service)} title={t("edit_all")}>
                                    <FaEdit />
                                </button>
                                <button
                                    className="action-btn history-btn"
                                    onClick={() => showPriceHistoryModal(service)}
                                    title={t("price_history")}
                                >
                                    <FaHistory />
                                </button>
                                <button
                                    className="action-btn delete-btn"
                                    onClick={() => {
                                        setSelectedService(service)
                                        setShowBulkDeleteModal(true)
                                    }}
                                    title={t("delete_all")}
                                >
                                    <FaTrashAlt />
                                </button>
                            </div>
                        </div>

                        <div className="service-body">
                            <p className="service-description">{service.description}</p>

                            <div className="service-details">
                                <div className="detail-item">
                                    <span className="detail-label">{t("price")}:</span>
                                    <span className="detail-value price">{formatPrice(service.amount)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="service-footer">
                            <span className="click-hint">
                                <FaInfoCircle /> {t("click_for_details")}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredServices.length === 0 && !loading && (
                <div className="no-services">
                    <FaExclamationTriangle className="no-services-icon" />
                    <h3>{t("no_services_found")}</h3>
                    <p>{t("search_criteria_no_match")}</p>
                </div>
            )}

            {/* Pagination */}
            <Pagination
                pageCount={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onItemsPerPageChange={handleItemsPerPageChange}
            />

            {/* Service Details Modal */}
            {showServiceDetailsModal && (
                <div className="modal-overlay" onClick={() => setShowServiceDetailsModal(false)}>
                    <div className="modal service-details-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <FaTooth className="modal-icon" />
                                {selectedService?.name} - {t("service_details")}
                            </h2>
                            <button className="modal-close" onClick={() => setShowServiceDetailsModal(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            {loadingDetails ? (
                                <div className="details-loading">
                                    <div className="loading-spinner"></div>
                                    <p>{t("details_loading")}</p>
                                </div>
                            ) : serviceDetails.length > 0 ? (
                                <div className="service-details-table">
                                    <div className="table-header">
                                        <div className="header-cell">{t("tooth_number")}</div>
                                        <div className="header-cell">{t("service_name")}</div>
                                        <div className="header-cell">{t("description")}</div>
                                        <div className="header-cell">{t("price")}</div>
                                        <div className="header-cell">{t("actions")}</div>
                                    </div>

                                    {serviceDetails.map((detail) => (
                                        <div key={detail.id} className="table-row">
                                            <div className="table-cell tooth-number">
                                                <FaTooth className="tooth-icon" />#{detail.teeth_number}
                                            </div>
                                            <div className="table-cell">
                                                {editingService?.id === detail.id ? (
                                                    <input
                                                        type="text"
                                                        value={editingService.name}
                                                        onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                                                        className="edit-input"
                                                    />
                                                ) : (
                                                    detail.name
                                                )}
                                            </div>
                                            <div className="table-cell">
                                                {editingService?.id === detail.id ? (
                                                    <textarea
                                                        value={editingService.description}
                                                        onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                                                        className="edit-textarea"
                                                        rows="2"
                                                    />
                                                ) : (
                                                    detail.description
                                                )}
                                            </div>
                                            <div className="table-cell price">
                                                {editingService?.id === detail.id ? (
                                                    <input
                                                        type="number"
                                                        value={editingService.amount}
                                                        onChange={(e) => setEditingService({ ...editingService, amount: e.target.value })}
                                                        className="edit-input price-input"
                                                    />
                                                ) : (
                                                    formatPrice(detail.amount)
                                                )}
                                            </div>
                                            <div className="table-cell actions">
                                                {editingService?.id === detail.id ? (
                                                    <div className="edit-actions">
                                                        <button className="action-btn save-btn" onClick={handleSaveServiceDetail} title={t("save")}>
                                                            <FaCheckCircle />
                                                        </button>
                                                        <button className="action-btn cancel-btn" onClick={handleCancelEdit} title={t("cancel")}>
                                                            <FaTimesCircle />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="single-actions">
                                                        <button
                                                            className="action-btn edit-btn"
                                                            onClick={() => handleEditServiceDetail(detail)}
                                                            title={t("edit_single")}
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            className="action-btn delete-btn"
                                                            onClick={() => {
                                                                setSelectedSingleService(detail)
                                                                setShowSingleDeleteModal(true)
                                                            }}
                                                            title={t("delete_single")}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-details">
                                    <FaExclamationTriangle className="no-details-icon" />
                                    <h3>{t("no_details_found")}</h3>
                                    <p>{t("no_details_available")}</p>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowServiceDetailsModal(false)}>
                                {t("close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Management Modal */}
            {showCategoryModal && (
                <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
                    <div className="modal category-management-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t("category_management")}</h2>
                            <button className="modal-close" onClick={() => setShowCategoryModal(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="category-actions">
                                <button className="btn btn-primary" onClick={() => setShowCategoryAddModal(true)}>
                                    <FaPlus /> {t("new_category")}
                                </button>
                            </div>

                            <div className="categories-list">
                                {categories.map((category) => (
                                    <div key={category.id} className="category-item">
                                        <div className="category-info">
                                            <h4>{category.name}</h4>
                                        </div>
                                        <div className="category-actions">
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() => openCategoryEditModal(category)}
                                                title={t("edit")}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => {
                                                    setSelectedCategoryItem(category)
                                                    setShowCategoryDeleteModal(true)
                                                }}
                                                title={t("delete")}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowCategoryModal(false)}>
                                {t("close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Service Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal service-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t("add_new_service")}</h2>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>{t("service_name")} *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={t("enter_service_name")}
                                />
                            </div>

                            <div className="form-group">
                                <label>{t("description")}</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder={t("enter_description")}
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t("category")} *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="">{t("select_category")}</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>{t("enter_price")} *</label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={createForAllTeeth}
                                        onChange={(e) => setCreateForAllTeeth(e.target.checked)}
                                    />
                                    <span className="checkmark"></span>
                                    {t("create_for_all_teeth")}
                                    <FaCopy className="bulk-icon" />
                                </label>
                                <p className="checkbox-help">{t("bulk_service_help")}</p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                {t("cancel")}
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleAddService}
                                disabled={!formData.name || !formData.category || !formData.amount}
                            >
                                <FaSave /> {t("save")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Service Modal (Bulk Edit) */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal service-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t("edit_all_teeth_service")}</h2>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="bulk-edit-warning">
                                <FaExclamationTriangle className="warning-icon" />
                                <p>{t("bulk_edit_warning")}</p>
                            </div>

                            <div className="form-group">
                                <label>{t("service_name")} *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={t("enter_service_name")}
                                />
                            </div>

                            <div className="form-group">
                                <label>{t("description")}</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder={t("enter_description")}
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t("category")} *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="">{t("select_category")}</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>{t("enter_price")} *</label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                {t("cancel")}
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleEditService}
                                disabled={!formData.name || !formData.category || !formData.amount}
                            >
                                <FaSave /> {t("update_all_teeth")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Service Modal */}
            {showBulkDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowBulkDeleteModal(false)}>
                    <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t("delete_all_teeth_service")}</h2>
                            <button className="modal-close" onClick={() => setShowBulkDeleteModal(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="delete-warning">
                                <FaExclamationTriangle className="warning-icon" />
                                <p>
                                    <strong>"{selectedService?.name}"</strong> {t("confirm_delete_all_teeth")}
                                </p>
                                <p className="warning-text">{t("bulk_delete_warning")}</p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowBulkDeleteModal(false)}>
                                {t("cancel")}
                            </button>
                            <button className="btn btn-danger" onClick={handleDeleteService}>
                                <FaTrashAlt /> {t("delete_all_teeth")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Single Delete Service Modal */}
            {showSingleDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowSingleDeleteModal(false)}>
                    <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t("delete_single_tooth_service")}</h2>
                            <button className="modal-close" onClick={() => setShowSingleDeleteModal(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="delete-warning">
                                <FaExclamationTriangle className="warning-icon" />
                                <p>
                                    <strong>
                                        #{selectedSingleService?.teeth_number} - {selectedSingleService?.name}
                                    </strong>{" "}
                                    {t("confirm_delete_single_tooth")}
                                </p>
                                <p className="warning-text">{t("single_delete_warning")}</p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowSingleDeleteModal(false)}>
                                {t("cancel")}
                            </button>
                            <button className="btn btn-danger" onClick={handleDeleteSingleService}>
                                <FaTrash /> {t("delete_single_tooth")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Category Modal */}
            {showCategoryAddModal && (
                <div className="modal-overlay" onClick={() => setShowCategoryAddModal(false)}>
                    <div className="modal category-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t("new_category")}</h2>
                            <button className="modal-close" onClick={() => setShowCategoryAddModal(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>{t("category_name")} *</label>
                                <input
                                    type="text"
                                    value={categoryFormData.name}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                    placeholder={t("enter_category_name")}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowCategoryAddModal(false)}>
                                {t("cancel")}
                            </button>
                            <button className="btn btn-primary" onClick={handleAddCategory} disabled={!categoryFormData.name}>
                                <FaSave /> {t("save")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {showCategoryEditModal && (
                <div className="modal-overlay" onClick={() => setShowCategoryEditModal(false)}>
                    <div className="modal category-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t("edit_category")}</h2>
                            <button className="modal-close" onClick={() => setShowCategoryEditModal(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>{t("category_name")} *</label>
                                <input
                                    type="text"
                                    value={categoryFormData.name}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                    placeholder={t("enter_category_name")}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowCategoryEditModal(false)}>
                                {t("cancel")}
                            </button>
                            <button className="btn btn-primary" onClick={handleEditCategory} disabled={!categoryFormData.name}>
                                <FaSave /> {t("save")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Category Modal */}
            {showCategoryDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowCategoryDeleteModal(false)}>
                    <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t("delete_category")}</h2>
                            <button className="modal-close" onClick={() => setShowCategoryDeleteModal(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="delete-warning">
                                <FaExclamationTriangle className="warning-icon" />
                                <p>
                                    <strong>"{selectedCategoryItem?.name}"</strong> {t("confirm_delete_category")}
                                </p>
                                <p className="warning-text">{t("delete_category_warning")}</p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowCategoryDeleteModal(false)}>
                                {t("cancel")}
                            </button>
                            <button className="btn btn-danger" onClick={handleDeleteCategory}>
                                <FaTrash /> {t("delete")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Price History Modal */}
            {showPriceHistory && (
                <div className="modal-overlay" onClick={() => setShowPriceHistory(false)}>
                    <div className="modal history-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <FaHistory className="modal-icon" />
                                {t("price_history")} - {selectedService?.name}
                            </h2>
                            <button className="modal-close" onClick={() => setShowPriceHistory(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="price-history">
                                {priceHistory.length > 0 ? (
                                    priceHistory.map((entry, index) => (
                                        <div key={index} className="history-entry">
                                            <div className="history-date">{new Date(entry.date).toLocaleDateString("uz-UZ")}</div>
                                            <div className="history-price">{formatPrice(entry.price)}</div>
                                            <div className="history-user">{entry.changed_by}</div>
                                            {index === 0 && <span className="current-badge">{t("current")}</span>}
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-history">
                                        <FaExclamationTriangle className="no-history-icon" />
                                        <p>{t("no_price_history")}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowPriceHistory(false)}>
                                {t("close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ServicePrices
