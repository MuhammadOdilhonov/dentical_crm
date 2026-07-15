"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import apiSuperAdmin from "../../api/apiSuperAdmin"
import {
    FaHospital,
    FaUsers,
    FaUserMd,
    FaMoneyBillWave,
    FaExclamationTriangle,
    FaBullseye,
    FaRedo,
    FaCheckCircle,
} from "react-icons/fa"
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
} from "recharts"

const PIE_COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"]

const formatMoney = (value) =>
    new Intl.NumberFormat("uz-UZ").format(Number(value) || 0) + " so'm"

export default function SADashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const loadData = async () => {
        try {
            setLoading(true)
            setError(null)
            const result = await apiSuperAdmin.fetchDashboard()
            setData(result)
        } catch (err) {
            console.error("Dashboard yuklashda xatolik:", err)
            setError("Ma'lumotlarni yuklab bo'lmadi. Qayta urinib ko'ring.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    if (loading) {
        return (
            <div className="sa-loading">
                <div className="loading-spinner"></div>
                <p>Yuklanmoqda...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="sa-error">
                <FaExclamationTriangle />
                <p>{error}</p>
                <button className="sa-btn sa-btn-primary" onClick={loadData}>
                    <FaRedo /> Qayta urinish
                </button>
            </div>
        )
    }

    const statCards = [
        {
            icon: <FaHospital />,
            color: "blue",
            value: data.clinics.total,
            label: "Jami klinikalar",
            sub: `${data.clinics.active} faol / ${data.clinics.inactive} nofaol`,
        },
        {
            icon: <FaUsers />,
            color: "green",
            value: data.users.total,
            label: "Jami foydalanuvchilar",
            sub: `${data.users.directors} direktor, ${data.users.admins} admin`,
        },
        {
            icon: <FaUserMd />,
            color: "purple",
            value: data.users.doctors,
            label: "Shifokorlar",
            sub: `${data.patients_total} bemor tizimda`,
        },
        {
            icon: <FaMoneyBillWave />,
            color: "orange",
            value: formatMoney(data.revenue.total),
            label: "Jami tushum",
            sub: `Bu oy: ${formatMoney(data.revenue.this_month)}`,
        },
    ]

    return (
        <div className="sa-page">
            <div className="sa-page-header">
                <h1>Dashboard</h1>
                <button className="sa-btn sa-btn-outline" onClick={loadData}>
                    <FaRedo /> Yangilash
                </button>
            </div>

            {/* Stat cards */}
            <div className="sa-stats-grid">
                {statCards.map((card, i) => (
                    <div className={`sa-stat-card sa-stat-${card.color}`} key={i}>
                        <div className="sa-stat-icon">{card.icon}</div>
                        <div className="sa-stat-body">
                            <span className="sa-stat-value">{card.value}</span>
                            <span className="sa-stat-label">{card.label}</span>
                            <span className="sa-stat-sub">{card.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="sa-charts-grid">
                <div className="sa-card">
                    <h3>Oylik tushum dinamikasi</h3>
                    {data.charts.revenue_by_month.length === 0 ? (
                        <p className="sa-empty">Hozircha ma'lumot yo'q</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={data.charts.revenue_by_month}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip formatter={(v) => formatMoney(v)} />
                                <Bar dataKey="total" name="Tushum" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="sa-card">
                    <h3>Yangi klinikalar (oylar bo'yicha)</h3>
                    {data.charts.clinics_by_month.length === 0 ? (
                        <p className="sa-empty">Hozircha ma'lumot yo'q</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={data.charts.clinics_by_month}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" fontSize={12} />
                                <YAxis fontSize={12} allowDecimals={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" name="Klinikalar" stroke="#22c55e" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="sa-card">
                    <h3>Tariflar taqsimoti</h3>
                    {data.charts.plan_distribution.length === 0 ? (
                        <p className="sa-empty">Faol obunalar yo'q</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={data.charts.plan_distribution}
                                    dataKey="count"
                                    nameKey="plan"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label
                                >
                                    {data.charts.plan_distribution.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="sa-card">
                    <h3>
                        <FaBullseye style={{ color: "#f59e0b" }} /> Lidlar holati
                    </h3>
                    <div className="sa-leads-summary">
                        <div className="sa-lead-item">
                            <span className="sa-lead-value">{data.leads.total}</span>
                            <span className="sa-lead-label">Jami lidlar</span>
                        </div>
                        <div className="sa-lead-item">
                            <span className="sa-lead-value" style={{ color: "#0ea5e9" }}>{data.leads.yangi}</span>
                            <span className="sa-lead-label">Yangi</span>
                        </div>
                        <div className="sa-lead-item">
                            <span className="sa-lead-value" style={{ color: "#22c55e" }}>{data.leads.mijozga_aylandi}</span>
                            <span className="sa-lead-label">Mijozga aylandi</span>
                        </div>
                    </div>
                    <Link to="/superadmin/leads" className="sa-btn sa-btn-outline sa-btn-block">
                        Barcha lidlarni ko'rish
                    </Link>
                </div>
            </div>

            {/* Expiring soon + latest clinics */}
            <div className="sa-two-col">
                <div className="sa-card">
                    <h3>
                        <FaExclamationTriangle style={{ color: "#ef4444" }} /> Muddati tugayotgan obunalar (30 kun)
                    </h3>
                    {data.expiring_soon.length === 0 ? (
                        <p className="sa-empty">
                            <FaCheckCircle style={{ color: "#22c55e" }} /> Yaqin 30 kunda tugaydigan obuna yo'q
                        </p>
                    ) : (
                        <table className="sa-table">
                            <thead>
                                <tr>
                                    <th>Klinika</th>
                                    <th>Tarif</th>
                                    <th>Tugash sanasi</th>
                                    <th>Qoldi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.expiring_soon.map((item) => (
                                    <tr key={item.clinic_id}>
                                        <td>{item.clinic_name}</td>
                                        <td>{item.plan}</td>
                                        <td>{item.end_date}</td>
                                        <td>
                                            <span className={`sa-badge ${item.days_left <= 7 ? "sa-badge-red" : "sa-badge-yellow"}`}>
                                                {item.days_left} kun
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="sa-card">
                    <h3>Oxirgi qo'shilgan klinikalar</h3>
                    {data.latest_clinics.length === 0 ? (
                        <p className="sa-empty">Hozircha klinikalar yo'q</p>
                    ) : (
                        <table className="sa-table">
                            <thead>
                                <tr>
                                    <th>Nomi</th>
                                    <th>Email</th>
                                    <th>Sana</th>
                                    <th>Holat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.latest_clinics.map((clinic) => (
                                    <tr key={clinic.id}>
                                        <td>{clinic.name}</td>
                                        <td>{clinic.email}</td>
                                        <td>{clinic.created_at}</td>
                                        <td>
                                            <span className={`sa-badge ${clinic.is_active ? "sa-badge-green" : "sa-badge-red"}`}>
                                                {clinic.is_active ? "Faol" : "Nofaol"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
