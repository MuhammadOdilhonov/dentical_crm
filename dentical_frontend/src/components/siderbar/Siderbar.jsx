"use client"

import { useState, useEffect } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { BaseUrlImg } from "../../api/apiService"
import ApiLogo from "../../api/apiLogo"
import {
  FaChartLine,
  FaUsers,
  FaDoorOpen,
  FaCalendarAlt,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCog,
  FaChartBar,
  FaBell,
  FaAngleDown,
  FaAngleRight,
  FaLanguage,
  FaTasks,
  FaTools,
  FaLock,
  FaQuestionCircle,
  FaMoneyBillWave,
  FaPills, // Added medicine icon
} from "react-icons/fa"

// Under Construction Modal Component
const UnderConstructionModal = ({ isOpen, onClose, featureName }) => {
  if (!isOpen) return null

  return (
    <div className="under-construction-overlay" onClick={onClose}>
      <div className="under-construction-modal" onClick={(e) => e.stopPropagation()}>
        <div className="under-construction-header">
          <FaTools className="construction-icon" />
          <h3>{featureName} - Tamirlanmoqda</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="under-construction-body">
          <div className="construction-animation">
            <img src="/images/OroCRM_customization.gif" alt="Under Construction" />
          </div>
          <p>Bu bo'lim hozircha ishlar olib borilmoqda. Tez orada ishga tushadi.</p>
          <p className="estimated-time">
            Taxminiy muddat: <span>Tez orada...</span>
          </p>
        </div>
        <div className="under-construction-footer">
          <button className="ok-button" onClick={onClose}>
            Tushundim
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar(isOpen) {
  const { user, logout, hasRole } = useAuth()
  const { t, language, languages, changeLanguage } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState({})
  const [dataClinicLogo, setDataClinicLogo] = useState({})
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [showPartnershipInfo, setShowPartnershipInfo] = useState(false)
  const [showConstructionModal, setShowConstructionModal] = useState(false)
  const [currentFeature, setCurrentFeature] = useState("")

  // List of features under construction (can be expanded)
  const underConstructionFeatures = []

  // Close sidebar on route change in mobile view
  useEffect(() => {
    if (isMobileOpen) {
      setIsMobileOpen(false)
    }
    loadLogo()
  }, [location.pathname])

  const loadLogo = async () => {
    try {
      const data = await ApiLogo.fetchLogo()
      console.log("Logo ma'lumotlari:", data)
      setDataClinicLogo(data)
    } catch (err) {
      console.error("Logo yuklab bo'lmadi:", err)
    }
  }

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileOpen && !event.target.closest(".sidebar") && !event.target.closest(".mobile-toggle")) {
        setIsMobileOpen(false)
      }
      if (showLanguageSelector && !event.target.closest(".language-selector")) {
        setShowLanguageSelector(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMobileOpen, showLanguageSelector])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const toggleSubmenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }))
  }

  const toggleLanguageSelector = () => {
    setShowLanguageSelector(!showLanguageSelector)
  }

  // Check if a menu item should be active
  const isMenuActive = (path) => {
    return location.pathname.startsWith(path)
  }

  // Check if a feature is under construction
  const isUnderConstruction = (featureId) => {
    return underConstructionFeatures.includes(featureId)
  }

  // Handle click on under construction item
  const handleConstructionClick = (e, featureName) => {
    e.preventDefault()
    setCurrentFeature(featureName)
    setShowConstructionModal(true)
  }

  // Custom NavLink component that handles under construction features
  const MenuLink = ({ to, featureId, children, end = false }) => {
    const isConstruction = isUnderConstruction(featureId)

    if (isConstruction) {
      return (
        <a
          href="#"
          className="nav-link under-construction"
          onClick={(e) => handleConstructionClick(e, children.props.children)}
        >
          {children}
          <div className="construction-badge">
            <FaLock />
          </div>
        </a>
      )
    }

    return (
      <NavLink to={to} className={({ isActive }) => (isActive ? "active" : "")} end={end}>
        {children}
      </NavLink>
    )
  }

  return (
    <>
      <button className="mobile-toggle" onClick={toggleMobileSidebar} aria-label="Toggle menu">
        {isMobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      <aside className={`sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div
            className="logo"
            onMouseEnter={() => setShowPartnershipInfo(true)}
            onMouseLeave={() => setShowPartnershipInfo(false)}
          >
            <div className="partnership-logos">
              <div className="company-logo our-company">
                <img className="logo-icon" src="/images/dentical_logo.png" alt="clinic-logo" />
              </div>
              <div className="partnership-animation">
                {/* Bu joyga GIF qo'yiladi */}
                <div className="handshake-placeholder">
                  <img style={{ marginLeft: "10px" }} src="/images/contract-icon.gif" alt="clinic-logo" />
                </div>
              </div>
              <div className="company-logo partner-company">
                <img
                  className="logo-icon"
                  src={BaseUrlImg + dataClinicLogo.logo || "/placeholder.svg"}
                  alt="your-logo"
                />
              </div>
            </div>

            {/* Hamkorlik haqida ma'lumot (hover bo'lganda ko'rinadi) */}
            {showPartnershipInfo && (
              <div className="partnership-info">
                <p className="partnership-title">Clinic Crm va {dataClinicLogo.name}</p>
                <p className="partnership-description">Rasmiy hamkorlik shartnomasi asosida biz bilan ish yuritmoqda</p>
                <p className="partnership-year">
                  {dataClinicLogo.subscription_start_date}-{dataClinicLogo.subscription_end_date}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="user-info">
          <div className="user-avatar">{user?.name?.charAt(0) || "U"}</div>
          <div className="user-details">
            <h3>{user?.name || "User"}</h3>
            <div className={`user-role ${user?.role || "user"}`}>{t(user?.role || "user")}</div>
          </div>
        </div>

        <div className="language-selector">
          <button className="language-button" onClick={toggleLanguageSelector}>
            <FaLanguage />
            <span>{languages[language]}</span>
            {showLanguageSelector ? <FaAngleDown /> : <FaAngleRight />}
          </button>

          {showLanguageSelector && (
            <div className="language-dropdown">
              {Object.keys(languages).map((langCode) => (
                <button
                  key={langCode}
                  className={`language-option ${language === langCode ? "active" : ""}`}
                  onClick={() => {
                    changeLanguage(langCode)
                    setShowLanguageSelector(false)
                  }}
                >
                  {languages[langCode]}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">{t("main_menu")}</div>
            <ul>
              {/* Director Menu Items */}
              {hasRole("director") && (
                <>
                  <li>
                    <NavLink to="/dashboard/director" className={({ isActive }) => (isActive ? "active" : "")} end>
                      <FaChartLine /> <span>{t("dashboard")}</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/dashboard/director/staff" className={({ isActive }) => (isActive ? "active" : "")}>
                      <FaUsers /> <span>{t("staff")}</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/dashboard/director/tasks" className={({ isActive }) => (isActive ? "active" : "")}>
                      <FaTasks /> <span>{t("tasks")}</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/dashboard/director/cabinets" className={({ isActive }) => (isActive ? "active" : "")}>
                      <FaDoorOpen /> <span>{t("cabinets")}</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/dashboard/director/patients" className={({ isActive }) => (isActive ? "active" : "")}>
                      <FaUsers /> <span>{t("patients")}</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="/dashboard/director/appointments"
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      <FaCalendarAlt /> <span>{t("appointments")}</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/dashboard/director/medicine" className={({ isActive }) => (isActive ? "active" : "")}>
                      <FaPills /> <span>{t("medicine_management")}</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/dashboard/director/reports" className={({ isActive }) => (isActive ? "active" : "")}>
                      <FaChartBar /> <span>{t("reports")}</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/dashboard/director/service-prices"
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      <FaMoneyBillWave /> <span>{t("service_prices")}</span>
                    </NavLink>
                  </li>
                </>
              )}

              {/* Admin Menu Items */}
              {hasRole("admin") && (
                <>
                  <li>
                    <NavLink to="/dashboard/admin" className={({ isActive }) => (isActive ? "active" : "")} end>
                      <FaChartLine /> <span>{t("dashboard")}</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/dashboard/admin/schedule" className={({ isActive }) => (isActive ? "active" : "")}>
                      <FaCalendarAlt /> <span>{t("schedule")}</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/dashboard/admin/tasks" className={({ isActive }) => (isActive ? "active" : "")}>
                      <FaTasks /> <span>{t("tasks")}</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/dashboard/admin/patients" className={({ isActive }) => (isActive ? "active" : "")}>
                      <FaUsers /> <span>{t("patients")}</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/dashboard/admin/cabinets" className={({ isActive }) => (isActive ? "active" : "")}>
                      <FaDoorOpen /> <span>{t("cabinets")}</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/dashboard/admin/medicine" className={({ isActive }) => (isActive ? "active" : "")}>
                      <FaPills /> <span>{t("medicine_management")}</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="/dashboard/admin/service-prices"
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      <FaMoneyBillWave /> <span>{t("service_prices")}</span>
                    </NavLink>
                  </li>
                </>
              )}

              {/* Doctor Menu Items */}
              {hasRole("doctor") && (
                <>
                  <li>
                    <NavLink to="/dashboard/doctor" className={({ isActive }) => (isActive ? "active" : "")} end>
                      <FaChartLine /> <span>{t("dashboard")}</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/dashboard/doctor/tasks" className={({ isActive }) => (isActive ? "active" : "")}>
                      <FaTasks /> <span>{t("tasks")}</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/dashboard/doctor/schedule" className={({ isActive }) => (isActive ? "active" : "")}>
                      <FaCalendarAlt /> <span>{t("schedule")}</span>
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Common Menu Items */}
          <div className="nav-section">
            <div className="nav-section-title">{t("account")}</div>
            <ul>
              <li>
                <NavLink to="/dashboard/notifications" className={({ isActive }) => (isActive ? "active" : "")}>
                  <FaBell /> <span>{t("notifications")}</span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/dashboard/profile" className={({ isActive }) => (isActive ? "active" : "")}>
                  <FaUserCog /> <span>{t("profile")}</span>
                </NavLink>
              </li>
              {hasRole("director") && (
                <li>
                  <NavLink to="/dashboard/director/settings" className={({ isActive }) => (isActive ? "active" : "")}>
                    <FaCog /> <span>{t("settings")}</span>
                  </NavLink>
                </li>
              )}

              <li>
                <button className="logout-button" onClick={handleLogout}>
                  <FaSignOutAlt /> <span>{t("logout")}</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">{t("help")}</div>
            <ul>
              <li>
                <NavLink to="/dashboard/help" className={({ isActive }) => (isActive ? "active" : "")}>
                  <FaQuestionCircle /> <span>{t("help_center")}</span>
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <p>© {new Date().getFullYear()} Klinika CRM</p>
          <p className="version">v2.0.1</p>
        </div>
      </aside>

      {/* Under Construction Modal */}
      <UnderConstructionModal
        isOpen={showConstructionModal}
        onClose={() => setShowConstructionModal(false)}
        featureName={currentFeature}
      />

      {isMobileOpen && <div className="sidebar-backdrop" onClick={() => setIsMobileOpen(false)}></div>}
    </>
  )
}
