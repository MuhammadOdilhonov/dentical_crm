"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"
import {
    FaBell,
    FaGlobe,
    FaBriefcase,
    FaCheck,
    FaCheckDouble,
    FaFilter,
    FaSearch,
    FaBuilding,
    FaSpinner,
    FaTimes,
    FaCalendarAlt,
    FaUser,
    FaEllipsisH,
} from "react-icons/fa"
import Pagination from "../pagination/Pagination"
import {
    getNotifications,
    getClinicNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    markClinicNotificationAsRead,
    markAllClinicNotificationsAsRead,
    getUnreadNotificationsCount,
    getUnreadClinicNotificationsCount,
} from "../../api/apiNotifications"

export default function Notifications() {
    const { selectedBranch } = useAuth()
    const { t } = useLanguage()
    const [activeTab, setActiveTab] = useState("site") // "site" or "work"
    const [searchTerm, setSearchTerm] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [filterRead, setFilterRead] = useState("all") // "all", "read", "unread"
    const [filterBranch, setFilterBranch] = useState(selectedBranch)

    // State for API data
    const [siteNotifications, setSiteNotifications] = useState([])
    const [workNotifications, setWorkNotifications] = useState([])
    const [filteredNotifications, setFilteredNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Unread counts
    const [siteUnreadCount, setSiteUnreadCount] = useState(0)
    const [workUnreadCount, setWorkUnreadCount] = useState(0)

    // Pagination
    const [currentPage, setCurrentPage] = useState(0) // 0-based for the Pagination component
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [totalItems, setTotalItems] = useState(0)

    // Modal
    const [showModal, setShowModal] = useState(false)
    const [selectedNotification, setSelectedNotification] = useState(null)

    // Fetch unread counts
    const fetchUnreadCounts = async () => {
        try {
            const [siteData, workData] = await Promise.all([
                getUnreadNotificationsCount(),
                getUnreadClinicNotificationsCount(),
            ])
            setSiteUnreadCount(siteData.unread_count)
            setWorkUnreadCount(workData.unread_count)
        } catch (err) {
            console.error("Error fetching unread counts:", err)
        }
    }

    // Fetch notifications based on active tab
    const fetchNotifications = async (page = 0) => {
        setLoading(true)
        setError(null)
        try {
            if (activeTab === "site") {
                const data = await getNotifications(page + 1, itemsPerPage) // API uses 1-based pagination
                setSiteNotifications(data.results)
                setTotalItems(data.count)
            } else {
                const data = await getClinicNotifications(page + 1, itemsPerPage) // API uses 1-based pagination
                setWorkNotifications(data.results)
                setTotalItems(data.count)
            }
        } catch (err) {
            console.error("Error fetching notifications:", err)
            setError(t("errorFetchingNotifications"))
        } finally {
            setLoading(false)
        }
    }

    // Initial fetch
    useEffect(() => {
        fetchNotifications(0)
        fetchUnreadCounts()
        setCurrentPage(0)
    }, [activeTab])

    // Update filtered notifications when data changes
    useEffect(() => {
        let notifications = activeTab === "site" ? siteNotifications : workNotifications

        // Filter by search term
        if (searchTerm) {
            notifications = notifications.filter(
                (notification) =>
                    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    notification.message.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        // Filter by read status
        if (filterRead !== "all") {
            const isRead = filterRead === "read"
            notifications = notifications.filter((notification) => notification.is_read === isRead)
        }

        // Filter by branch (for work notifications)
        if (activeTab === "work" && selectedBranch === "all" && filterBranch !== "all") {
            notifications = notifications.filter((notification) => notification.branch === Number.parseInt(filterBranch))
        }

        setFilteredNotifications(notifications)
    }, [activeTab, searchTerm, filterRead, filterBranch, siteNotifications, workNotifications, selectedBranch])

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now - date)
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            // Today - show time
            return `${t("today")}, ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
        } else if (diffDays === 1) {
            // Yesterday
            return t("yesterday")
        } else if (diffDays < 7) {
            // Within a week
            return `${diffDays} ${t("daysAgo")}`
        } else {
            // More than a week
            return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getFullYear()}`
        }
    }

    // Format full date and time
    const formatFullDateTime = (dateString) => {
        const date = new Date(dateString)
        return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}.${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date
                .getMinutes()
                .toString()
                .padStart(2, "0")}`
    }

    // Truncate text
    const truncateText = (text, maxLength = 100) => {
        if (!text) return ""
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength) + "..."
    }

    // Mark notification as read
    const markAsRead = async (id) => {
        try {
            if (activeTab === "site") {
                await markNotificationAsRead(id)
                // Update local state
                setSiteNotifications(
                    siteNotifications.map((notification) =>
                        notification.id === id ? { ...notification, is_read: true } : notification,
                    ),
                )
                // Update unread count
                setSiteUnreadCount(Math.max(0, siteUnreadCount - 1))
            } else {
                await markClinicNotificationAsRead(id)
                // Update local state
                setWorkNotifications(
                    workNotifications.map((notification) =>
                        notification.id === id ? { ...notification, is_read: true } : notification,
                    ),
                )
                // Update unread count
                setWorkUnreadCount(Math.max(0, workUnreadCount - 1))
            }
        } catch (err) {
            console.error("Error marking notification as read:", err)
            setError(t("errorMarkingAsRead"))
        }
    }

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            if (activeTab === "site") {
                await markAllNotificationsAsRead()
                // Update local state
                setSiteNotifications(
                    siteNotifications.map((notification) => ({
                        ...notification,
                        is_read: true,
                    })),
                )
                // Update unread count
                setSiteUnreadCount(0)
            } else {
                await markAllClinicNotificationsAsRead()
                // Update local state
                setWorkNotifications(
                    workNotifications.map((notification) => ({
                        ...notification,
                        is_read: true,
                    })),
                )
                // Update unread count
                setWorkUnreadCount(0)
            }
        } catch (err) {
            console.error("Error marking all notifications as read:", err)
            setError(t("errorMarkingAllAsRead"))
        }
    }

    // Toggle filters
    const toggleFilters = () => {
        setShowFilters(!showFilters)
    }

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page)
        fetchNotifications(page)
    }

    // Handle items per page change
    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage)
        setCurrentPage(0) // Reset to first page
        fetchNotifications(0)
    }

    // Open notification detail modal
    const openNotificationModal = (notification) => {
        setSelectedNotification(notification)
        setShowModal(true)

        // Mark as read if not already read
        if (!notification.is_read) {
            markAsRead(notification.id)
        }
    }

    // Close notification detail modal
    const closeNotificationModal = () => {
        setShowModal(false)
        setSelectedNotification(null)
    }

    return (
        <div className="notifications-page">
            <div className="page-header">
                <h1 className="page-title">{t("notifications")}</h1>
                <div className="header-actions">
                    <button className="btn btn-primary btn-icon" onClick={markAllAsRead}>
                        <FaCheckDouble /> {t("markAllAsRead")}
                    </button>
                </div>
            </div>

            <div className="notifications-tabs">
                <button className={`tab-button ${activeTab === "site" ? "active" : ""}`} onClick={() => setActiveTab("site")}>
                    <FaGlobe /> {t("siteNews")}
                    {siteUnreadCount > 0 && <span className="badge">{siteUnreadCount}</span>}
                </button>
                <button className={`tab-button ${activeTab === "work" ? "active" : ""}`} onClick={() => setActiveTab("work")}>
                    <FaBriefcase /> {t("workNotifications")}
                    {workUnreadCount > 0 && <span className="badge">{workUnreadCount}</span>}
                </button>
            </div>

            <div className="filters-container">
                <div className="search-filter">
                    <div className="search-input">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder={t("search")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className={`filter-toggle-btn ${showFilters ? "active" : ""}`} onClick={toggleFilters}>
                        <FaFilter /> {t("filters")}
                    </button>
                </div>

                {showFilters && (
                    <div className="advanced-filters">
                        <div className="filter-group">
                            <label>{t("status")}:</label>
                            <select value={filterRead} onChange={(e) => setFilterRead(e.target.value)}>
                                <option value="all">{t("all")}</option>
                                <option value="read">{t("read")}</option>
                                <option value="unread">{t("unread")}</option>
                            </select>
                        </div>

                        {activeTab === "work" && selectedBranch === "all" && (
                            <div className="filter-group">
                                <label>{t("branch")}:</label>
                                <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
                                    <option value="all">{t("all")}</option>
                                    <option value="1">{t("branch1")}</option>
                                    <option value="2">{t("branch2")}</option>
                                    <option value="3">{t("branch3")}</option>
                                </select>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {loading ? (
                <div className="loading-container">
                    <FaSpinner className="spinner" />
                    <p>{t("loading")}</p>
                </div>
            ) : error ? (
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button className="btn btn-primary" onClick={() => fetchNotifications(currentPage)}>
                        {t("tryAgain")}
                    </button>
                </div>
            ) : (
                <>
                    <div className="notifications-list">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.is_read ? "unread" : ""}`}
                                    onClick={() => openNotificationModal(notification)}
                                >
                                    <div className="notification-icon">
                                        {activeTab === "site" ? <FaGlobe className="icon" /> : <FaBriefcase className="icon" />}
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-header">
                                            <h3 className="notification-title">{notification.title}</h3>
                                            <div className="notification-date">{formatDate(notification.created_at)}</div>
                                        </div>
                                        <div className="notification-message">
                                            {truncateText(notification.message)}
                                            {notification.message.length > 100 && (
                                                <span className="read-more">
                                                    <FaEllipsisH />
                                                </span>
                                            )}
                                        </div>
                                        {activeTab === "work" && (
                                            <div className="notification-branch">
                                                <FaBuilding />{" "}
                                                {notification.branch === 1
                                                    ? t("branch1")
                                                    : notification.branch === 2
                                                        ? t("branch2")
                                                        : notification.branch === 3
                                                            ? t("branch3")
                                                            : ""}
                                            </div>
                                        )}
                                        <div className="notification-actions">
                                            {!notification.is_read ? (
                                                <button
                                                    className="action-btn mark-read"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        markAsRead(notification.id)
                                                    }}
                                                >
                                                    <FaCheck /> {t("markAsRead")}
                                                </button>
                                            ) : (
                                                <div className="read-status">
                                                    <FaCheckDouble /> {t("read")}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-notifications">
                                <FaBell className="empty-icon" />
                                <p>{t("noNotifications")}</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalItems > 0 && (
                        <Pagination
                            pageCount={Math.ceil(totalItems / itemsPerPage)}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                            itemsPerPage={itemsPerPage}
                            totalItems={totalItems}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    )}
                </>
            )}

            {/* Notification Detail Modal */}
            {showModal && selectedNotification && (
                <div className="notification-modal-overlay" onClick={closeNotificationModal}>
                    <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{selectedNotification.title}</h2>
                            <button className="close-btn" onClick={closeNotificationModal}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="notification-detail-info">
                                <div className="detail-item">
                                    <FaCalendarAlt className="detail-icon" />
                                    <span>{formatFullDateTime(selectedNotification.created_at)}</span>
                                </div>
                                {activeTab === "work" && selectedNotification.branch && (
                                    <div className="detail-item">
                                        <FaBuilding className="detail-icon" />
                                        <span>
                                            {selectedNotification.branch === 1
                                                ? t("branch1")
                                                : selectedNotification.branch === 2
                                                    ? t("branch2")
                                                    : selectedNotification.branch === 3
                                                        ? t("branch3")
                                                        : ""}
                                        </span>
                                    </div>
                                )}
                                {selectedNotification.clinic && (
                                    <div className="detail-item">
                                        <FaUser className="detail-icon" />
                                        <span>
                                            {t("clinic")}: {selectedNotification.clinic}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="notification-detail-message">
                                {selectedNotification.message.split("\n").map((line, index) => (
                                    <p key={index}>{line}</p>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeNotificationModal}>
                                {t("close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
