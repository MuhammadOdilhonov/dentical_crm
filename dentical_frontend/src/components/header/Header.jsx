"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { FaSearch, FaUserCircle, FaSignOutAlt, FaCog } from "react-icons/fa"

export default function Header() {
    const { user, logout } = useAuth()
    const { t } = useLanguage()
    const navigate = useNavigate()
    const [showDropdown, setShowDropdown] = useState(false)

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown)
    }

    return (
        <header className="dashboard-header">
            <div className="search-bar">
                <FaSearch className="search-icon" />
                <input type="text" placeholder={t("search")} />
            </div>

            <div className="header-actions">
                <div className="user-dropdown-container">
                    <button className="user-dropdown-button" onClick={toggleDropdown}>
                        <span className="user-name">{user?.name || t("guest")}</span>
                        <div className="user-avatar">{user?.name ? user.name.charAt(0) : "G"}</div>
                    </button>

                    {showDropdown && (
                        <div className="user-dropdown">
                            <div className="dropdown-user-info">
                                <div className="dropdown-avatar">{user?.name ? user.name.charAt(0) : "G"}</div>
                                <div>
                                    <h4>{user?.name || t("guest")}</h4>
                                    <p className="dropdown-role">{user?.role ? t(user.role) : t("guest")}</p>
                                </div>
                            </div>

                            <div className="dropdown-menu">
                                <button onClick={() => navigate("/dashboard/profile")}>
                                    <FaUserCircle /> {t("profile")}
                                </button>
                                <button onClick={() => navigate("/dashboard/settings")}>
                                    <FaCog /> {t("settings")}
                                </button>
                                <button onClick={handleLogout}>
                                    <FaSignOutAlt /> {t("logout")}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
