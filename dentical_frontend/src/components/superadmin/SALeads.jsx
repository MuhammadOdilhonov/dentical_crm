"use client"

import { useState, useEffect, useCallback } from "react"
import apiSuperAdmin from "../../api/apiSuperAdmin"
import { FaRedo, FaTrash, FaSearch, FaExclamationTriangle, FaBullseye } from "react-icons/fa"

const STATUS_OPTIONS = [
    { value: "yangi", label: "Yangi", color: "#0ea5e9" },
    { value: "kutilmoqda", label: "Kutilmoqda", color: "#f59e0b" },
    { value: "aloqada", label: "Aloqada", color: "#8b5cf6" },
    { value: "mijozga_aylandi", label: "Mijozga aylandi", color: "#22c55e" },
    { value: "rad_etildi", label: "Rad etildi", color: "#ef4444" },
    { value: "telefon_kotarmadi", label: "Telefon ko'tarmadi", color: "#64748b" },
    { value: "keyinroq_qilish", label: "Keyinroq qilish", color: "#f97316" },
    { value: "maslahatlashadi", label: "Maslahatlashadi", color: "#14b8a6" },
    { value: "raqam_xato", label: "Raqam xato", color: "#78716c" },
]

export default function SALeads() {
    const [leads, setLeads] = useState([])
    const [stats, setStats] = useState(null)
    const [count, setCount] = useState(0)
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState("")
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const pageSize = 10
    const totalPages = Math.max(1, Math.ceil(count / pageSize))

    const loadLeads = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const [data, statsData] = await Promise.all([
                apiSuperAdmin.fetchTargets({ page, status: statusFilter, search }),
                apiSuperAdmin.fetchTargetStats().catch(() => null),
            ])
            setLeads(data.results || [])
            setCount(data.count || 0)
            if (statsData) setStats(statsData)
        } catch (err) {
            console.error("Lidlarni yuklashda xatolik:", err)
            setError("Lidlarni yuklab bo'lmadi.")
        } finally {
            setLoading(false)
        }
    }, [page, statusFilter, search])

    useEffect(() => {
        loadLeads()
    }, [loadLeads])

    const handleStatusChange = async (lead, newStatus) => {
        try {
            await apiSuperAdmin.updateTarget(lead.id, { status: newStatus })
            loadLeads()
        } catch (err) {
            alert("Statusni o'zgartirishda xatolik: " + (err.response?.data?.error || err.message))
        }
    }

    const handleDelete = async (lead) => {
        if (!window.confirm(`"${lead.name}" lidini o'chirmoqchimisiz?`)) return
        try {
            await apiSuperAdmin.deleteTarget(lead.id)
            loadLeads()
        } catch (err) {
            alert("O'chirishda xatolik: " + (err.response?.data?.error || err.message))
        }
    }

    const getStatusMeta = (value) => STATUS_OPTIONS.find((s) => s.value === value) || { label: value, color: "#64748b" }

    return (
        <div className="sa-page">
            <div className="sa-page-header">
                <h1><FaBullseye style={{ color: "#f59e0b" }} /> Lidlar ({count})</h1>
                <button className="sa-btn sa-btn-outline" onClick={loadLeads}>
                    <FaRedo /> Yangilash
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="sa-leads-stats">
                    <div className="sa-lead-stat"><span>{stats.total}</span> Jami</div>
                    <div className="sa-lead-stat" style={{ borderColor: "#0ea5e9" }}><span>{stats.yangi ?? 0}</span> Yangi</div>
                    <div className="sa-lead-stat" style={{ borderColor: "#8b5cf6" }}><span>{stats.aloqada}</span> Aloqada</div>
                    <div className="sa-lead-stat" style={{ borderColor: "#22c55e" }}><span>{stats.mijozga_aylandi}</span> Mijoz bo'ldi</div>
                    <div className="sa-lead-stat" style={{ borderColor: "#ef4444" }}><span>{stats.rad_etildi}</span> Rad etildi</div>
                    <div className="sa-lead-stat" style={{ borderColor: "#64748b" }}><span>{stats.telefon_kotarmadi}</span> Ko'tarmadi</div>
                </div>
            )}

            {/* Filters */}
            <div className="sa-filters">
                <div className="sa-search">
                    <FaSearch />
                    <input
                        placeholder="Ism, telefon yoki klinika bo'yicha qidirish..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                    />
                </div>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
                    <option value="">Barcha statuslar</option>
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="sa-error-inline">
                    <FaExclamationTriangle /> {error}
                </div>
            )}

            <div className="sa-card">
                {loading ? (
                    <div className="sa-loading">
                        <div className="loading-spinner"></div>
                        <p>Yuklanmoqda...</p>
                    </div>
                ) : leads.length === 0 ? (
                    <p className="sa-empty">Lidlar topilmadi.</p>
                ) : (
                    <div className="sa-table-wrap">
                        <table className="sa-table">
                            <thead>
                                <tr>
                                    <th>Ism</th>
                                    <th>Telefon</th>
                                    <th>Klinika</th>
                                    <th>Manzil</th>
                                    <th>Izoh</th>
                                    <th>Status</th>
                                    <th>Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead) => {
                                    const meta = getStatusMeta(lead.status)
                                    return (
                                        <tr key={lead.id}>
                                            <td><strong>{lead.name}</strong></td>
                                            <td><a href={`tel:${lead.phone_number}`}>{lead.phone_number}</a></td>
                                            <td>{lead.clinic_name}</td>
                                            <td>{lead.location}</td>
                                            <td className="sa-small">{lead.comment || "—"}</td>
                                            <td>
                                                <select
                                                    className="sa-status-select"
                                                    style={{ borderColor: meta.color, color: meta.color }}
                                                    value={lead.status}
                                                    onChange={(e) => handleStatusChange(lead, e.target.value)}
                                                >
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <option key={s.value} value={s.value}>{s.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <button className="sa-icon-btn sa-icon-red" onClick={() => handleDelete(lead)}>
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="sa-pagination">
                        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>&larr; Oldingi</button>
                        <span>{page} / {totalPages}</span>
                        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Keyingi &rarr;</button>
                    </div>
                )}
            </div>
        </div>
    )
}
