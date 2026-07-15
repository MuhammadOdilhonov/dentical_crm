"use client"

import { useState, useEffect } from "react"
import apiSuperAdmin from "../../api/apiSuperAdmin"
import {
    FaPlus,
    FaTimes,
    FaTrash,
    FaRedo,
    FaExclamationTriangle,
} from "react-icons/fa"

const today = () => new Date().toISOString().slice(0, 10)
const plusDays = (days) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString().slice(0, 10)
}

const emptyForm = {
    clinic: "",
    plan: "",
    start_date: today(),
    end_date: plusDays(30),
    paid_amount: "",
    discount: "",
    description_discount: "",
    status: "active",
}

const formatMoney = (value) => new Intl.NumberFormat("uz-UZ").format(Number(value) || 0)

export default function SASubscriptions() {
    const [subs, setSubs] = useState([])
    const [count, setCount] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [clinicOptions, setClinicOptions] = useState([])
    const [planOptions, setPlanOptions] = useState([])
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState(null)

    const pageSize = 10
    const totalPages = Math.max(1, Math.ceil(count / pageSize))

    const loadSubs = async (targetPage = page) => {
        try {
            setLoading(true)
            setError(null)
            const data = await apiSuperAdmin.fetchSubscriptions(targetPage)
            setSubs(data.results || [])
            setCount(data.count || 0)
        } catch (err) {
            console.error("Obunalarni yuklashda xatolik:", err)
            setError("Obunalarni yuklab bo'lmadi.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSubs(page)
    }, [page])

    const openCreate = async () => {
        setForm(emptyForm)
        setSaveError(null)
        setShowModal(true)
        try {
            const [clinics, plans] = await Promise.all([
                apiSuperAdmin.fetchClinicSelectList(),
                apiSuperAdmin.fetchPlanSelectList(),
            ])
            setClinicOptions(clinics || [])
            setPlanOptions(plans || [])
        } catch {
            setClinicOptions([])
            setPlanOptions([])
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setSaveError(null)
        try {
            const payload = { ...form }
            if (!payload.paid_amount) payload.paid_amount = 0
            if (!payload.discount) delete payload.discount
            if (!payload.description_discount) delete payload.description_discount
            await apiSuperAdmin.createSubscription(payload)
            setShowModal(false)
            loadSubs(1)
            setPage(1)
        } catch (err) {
            const data = err.response?.data
            const msg =
                data && typeof data === "object"
                    ? Object.values(data).flat().join(" ")
                    : "Obuna yaratishda xatolik yuz berdi."
            setSaveError(msg)
        } finally {
            setSaving(false)
        }
    }

    const handleExpire = async (sub) => {
        if (!window.confirm(`"${sub.clinic_name}" obunasini tugatish (expired)ga o'tkazmoqchimisiz?`)) return
        try {
            await apiSuperAdmin.updateSubscription(sub.id, { status: "expired" })
            loadSubs(page)
        } catch (err) {
            alert("Xatolik: " + (err.response?.data?.error || err.message))
        }
    }

    const handleDelete = async (sub) => {
        if (!window.confirm(`"${sub.clinic_name}" obunasini o'chirmoqchimisiz?`)) return
        try {
            await apiSuperAdmin.deleteSubscription(sub.id)
            loadSubs(page)
        } catch (err) {
            alert("O'chirishda xatolik: " + (err.response?.data?.error || err.message))
        }
    }

    return (
        <div className="sa-page">
            <div className="sa-page-header">
                <h1>Obunalar ({count})</h1>
                <div className="sa-header-actions">
                    <button className="sa-btn sa-btn-outline" onClick={() => loadSubs(page)}>
                        <FaRedo /> Yangilash
                    </button>
                    <button className="sa-btn sa-btn-primary" onClick={openCreate}>
                        <FaPlus /> Tarif biriktirish
                    </button>
                </div>
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
                ) : subs.length === 0 ? (
                    <p className="sa-empty">Hozircha obunalar yo'q. "Tarif biriktirish" tugmasi orqali qo'shing.</p>
                ) : (
                    <div className="sa-table-wrap">
                        <table className="sa-table">
                            <thead>
                                <tr>
                                    <th>Klinika</th>
                                    <th>Tarif</th>
                                    <th>Narxi</th>
                                    <th>To'langan</th>
                                    <th>Chegirma</th>
                                    <th>Boshlanish</th>
                                    <th>Tugash</th>
                                    <th>Holat</th>
                                    <th>Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subs.map((sub) => (
                                    <tr key={sub.id}>
                                        <td><strong>{sub.clinic_name}</strong></td>
                                        <td>{sub.plan_name}</td>
                                        <td>{formatMoney(sub.price)} so'm</td>
                                        <td>{formatMoney(sub.paid_amount)} so'm</td>
                                        <td>{sub.discount || "—"}</td>
                                        <td>{sub.start_date}</td>
                                        <td>{sub.end_date}</td>
                                        <td>
                                            <span className={`sa-badge ${sub.status === "active" ? "sa-badge-green" : "sa-badge-red"}`}>
                                                {sub.status === "active" ? "Faol" : "Tugagan"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="sa-actions">
                                                {sub.status === "active" && (
                                                    <button
                                                        title="Tugatish"
                                                        className="sa-icon-btn sa-icon-blue"
                                                        onClick={() => handleExpire(sub)}
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                )}
                                                <button
                                                    title="O'chirish"
                                                    className="sa-icon-btn sa-icon-red"
                                                    onClick={() => handleDelete(sub)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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

            {/* Modal */}
            {showModal && (
                <div className="sa-modal-overlay" onClick={() => !saving && setShowModal(false)}>
                    <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sa-modal-header">
                            <h2>Klinikaga tarif biriktirish</h2>
                            <button className="sa-icon-btn" onClick={() => setShowModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <form className="sa-modal-body" onSubmit={handleSave}>
                            {saveError && (
                                <div className="sa-error-inline">
                                    <FaExclamationTriangle /> {saveError}
                                </div>
                            )}
                            <div className="sa-form-grid">
                                <div className="sa-form-group">
                                    <label>Klinika *</label>
                                    <select
                                        required
                                        value={form.clinic}
                                        onChange={(e) => setForm({ ...form, clinic: e.target.value })}
                                    >
                                        <option value="">— Tanlang —</option>
                                        {clinicOptions.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="sa-form-group">
                                    <label>Tarif *</label>
                                    <select
                                        required
                                        value={form.plan}
                                        onChange={(e) => setForm({ ...form, plan: e.target.value })}
                                    >
                                        <option value="">— Tanlang —</option>
                                        {planOptions.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} — {formatMoney(p.price)} so'm
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="sa-form-group">
                                    <label>Boshlanish sanasi *</label>
                                    <input
                                        required
                                        type="date"
                                        value={form.start_date}
                                        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                    />
                                </div>
                                <div className="sa-form-group">
                                    <label>Tugash sanasi *</label>
                                    <input
                                        required
                                        type="date"
                                        value={form.end_date}
                                        onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                    />
                                </div>
                                <div className="sa-form-group">
                                    <label>To'langan summa (so'm)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.paid_amount}
                                        onChange={(e) => setForm({ ...form, paid_amount: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="sa-form-group">
                                    <label>Chegirma (masalan: 10%)</label>
                                    <input
                                        value={form.discount}
                                        onChange={(e) => setForm({ ...form, discount: e.target.value })}
                                        placeholder="10%"
                                    />
                                </div>
                            </div>
                            <div className="sa-form-group">
                                <label>Chegirma izohi</label>
                                <textarea
                                    rows={2}
                                    value={form.description_discount}
                                    onChange={(e) => setForm({ ...form, description_discount: e.target.value })}
                                    placeholder="Masalan: yillik to'lov uchun chegirma"
                                />
                            </div>
                            <div className="sa-form-actions">
                                <button type="button" className="sa-btn sa-btn-outline" onClick={() => setShowModal(false)} disabled={saving}>
                                    Bekor qilish
                                </button>
                                <button type="submit" className="sa-btn sa-btn-primary" disabled={saving}>
                                    {saving ? "Saqlanmoqda..." : "Biriktirish"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
