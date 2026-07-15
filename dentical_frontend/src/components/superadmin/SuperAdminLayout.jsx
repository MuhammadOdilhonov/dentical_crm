"use client"

import { useState } from "react"
import { Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import {
    FaChartPie,
    FaHospital,
    FaTags,
    FaFileInvoiceDollar,
    FaBullseye,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaUserShield,
} from "react-icons/fa"
import { MdOutlineHealthAndSafety } from "react-icons/md"
import SADashboard from "./SADashboard"
import SAClinics from "./SAClinics"
import SATariffs from "./SATariffs"
import SASubscriptions from "./SASubscriptions"
import SALeads from "./SALeads"

export default function SuperAdminLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const menuItems = [
        { to: "/superadmin", icon: <FaChartPie />, label: "Dashboard", end: true },
        { to: "/superadmin/clinics", icon: <FaHospital />, label: "Klinikalar" },
        { to: "/superadmin/tariffs", icon: <FaTags />, label: "Tariflar" },
        { to: "/superadmin/subscriptions", icon: <FaFileInvoiceDollar />, label: "Obunalar" },
        { to: "/superadmin/leads", icon: <FaBullseye />, label: "Lidlar" },
    ]

    return (
        <div className={`sa-layout ${sidebarOpen ? "" : "sa-sidebar-closed"}`}>
            {/* Sidebar */}
            <aside className="sa-sidebar">
                <div className="sa-sidebar-header">
                    <MdOutlineHealthAndSafety className="sa-logo-icon" />
                    {sidebarOpen && (
                        <div className="sa-logo-text">
                            <h2>Dentical CRM</h2>
                            <span>SuperAdmin</span>
                        </div>
                    )}
                </div>

                <nav className="sa-nav">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) => `sa-nav-item ${isActive ? "active" : ""}`}
                        >
                            <span className="sa-nav-icon">{item.icon}</span>
                            {sidebarOpen && <span className="sa-nav-label">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <button className="sa-logout" onClick={handleLogout}>
                    <FaSignOutAlt />
                    {sidebarOpen && <span>Chiqish</span>}
                </button>
            </aside>

            {/* Main */}
            <div className="sa-main">
                <header className="sa-header">
                    <button className="sa-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <FaTimes /> : <FaBars />}
                    </button>
                    <div className="sa-header-user">
                        <FaUserShield className="sa-user-icon" />
                        <div className="sa-user-info">
                            <span className="sa-user-name">{user?.email || "SuperAdmin"}</span>
                            <span className="sa-user-role">Bosh administrator</span>
                        </div>
                    </div>
                </header>

                <main className="sa-content">
                    <Routes>
                        <Route path="/" element={<SADashboard />} />
                        <Route path="/clinics" element={<SAClinics />} />
                        <Route path="/tariffs" element={<SATariffs />} />
                        <Route path="/subscriptions" element={<SASubscriptions />} />
                        <Route path="/leads" element={<SALeads />} />
                        <Route path="*" element={<Navigate to="/superadmin" />} />
                    </Routes>
                </main>
            </div>
        </div>
    )
}
