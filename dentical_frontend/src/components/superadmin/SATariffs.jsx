"use client"

import { useState, useEffect } from "react"
import apiSuperAdmin from "../../api/apiSuperAdmin"
import {
    FaPlus,
    FaTimes,
    FaTrash,
    FaEdit,
    FaRedo,
    FaExclamationTriangle,
    FaDatabase,
    FaUserTie,
    FaUserCog,
    FaUserMd,
    FaBuilding,
} from "react-icons/fa"

const emptyPlan = {
    name: "",
    description: "",
    price: "",
    storage_limit_gb: "5",
    trial_period_days: "",
    director_limit: "1",
    admin_limit: "1",
    doctor_limit: "5",
    branch_limit: "1",
}

const formatMoney = (value) => new Intl.NumberFormat("uz-UZ").format(Number(value) || 0)

export default function SATariffs() {
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [showModal, setShowModal] = useState(false)
    const [editingPlan, setEditingPlan] = useState(null) // null = yangi
    const [form, setForm] = useState(emptyPlan)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState(null)

    const loadPlans = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await apiSuperAdmin.fetchPlans()
            setPlans(Array.isArray(data) ? data : data.results || [])
        } catch (err) {
            console.error("Tariflarni yuklashda xatolik:", err)
            setError("Tariflarni yuklab bo'lmadi.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPlans()
    }, [])

    const openCreate = () => {
        setEditingPlan(null)
        setForm(emptyPlan)
        setSaveError(null)
        setShowModal(true)
    }

    const openEdit = (plan) => {
        setEditingPlan(plan)
        setForm({
            name: plan.name || "",
            description: plan.description || "",
            price: plan.price ?? "",
            storage_limit_gb: plan.storage_limit_gb ?? "",
            trial_period_days: plan.trial_period_days ?? "",
            director_limit: plan.director_limit ?? "1",
            admin_limit: plan.admin_limit ?? "1",
            doctor_limit: plan.doctor_limit ?? "1",
            branch_limit: plan.branch_limit ?? "1",
        })
        setSaveError(null)
        setShowModal(true)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setSaveError(null)
        try {
            const payload = {
                ...form,
                trial_period_days: form.trial_period_days === "" ? null : form.trial_period_days,
            }
            if (editingPlan) {
                await apiSuperAdmin.updatePlan(editingPlan.id, payload)
            } else {
                await apiSuperAdmin.createPlan(payload)
            }
            setShowModal(false)
            loadPlans()
        } catch (err) {
            const data = err.response?.data
            const msg =
                data && typeof data === "object"
                    ? Object.entries(data).map(([k, v]) => `${k}: ${[].concat(v).join(" ")}`).join("; ")
                    : "Saqlashda xatolik yuz berdi."
            setSaveError(msg)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (plan) => {
        if (!window.confirm(`"${plan.name}" tarifini o'chirmoqchimisiz? Unga bog'langan obunalar ham o'chadi!`)) return
        try {
            await apiSuperAdmin.deletePlan(plan.id)
            loadPlans()
        } catch (err) {
            alert("O'chirishda xatolik: " + (err.response?.data?.error || err.message))
        }
    }

    return (
        <div className="sa-page">
            <div className="sa-page-header">
                <h1>Tariflar</h1>
                <div className="sa-header-actions">
                    <button className="sa-btn sa-btn-outline" onClick={loadPlans}>
                        <FaRedo /> Yangilash
                    </button>
                    <button className="sa-btn sa-btn-primary" onClick={openCreate}>
                        <FaPlus /> Yangi tarif
                    </button>
                </div>
            </div>

            {error && (
                <div className="sa-error-inline">
                    <FaExclamationTriangle /> {error}
                </div>
            )}

            {loading ? (
                <div className="sa-loading">
                    <div className="loading-spinner"></div>
                    <p>Yuklanmoqda...</p>
                </div>
            ) : plans.length === 0 ? (
                <div className="sa-card">
                    <p className="sa-empty">
                        Hozircha tariflar yo'q. Klinikalarga obuna biriktirish uchun avval tarif yarating.
                    </p>
                </div>
            ) : (
                <div className="sa-plans-grid">
                    {plans.map((plan) => (
                        <div className="sa-plan-card" key={plan.id}>
                            <div className="sa-plan-header">
                                <h3>{plan.name}</h3>
                                <div className="sa-plan-price">
                                    {formatMoney(plan.price)} <span>so'm/oy</span>
                                </div>
                            </div>
                            {plan.description && <p className="sa-plan-desc">{plan.description}</p>}
                            <ul className="sa-plan-features">
                                <li><FaDatabase /> Xotira: <strong>{plan.storage_limit_gb} GB</strong></li>
                                <li><FaUserTie /> Direktorlar: <strong>{plan.director_limit}</strong></li>
                                <li><FaUserCog /> Adminlar: <strong>{plan.admin_limit}</strong></li>
                                <li><FaUserMd /> Shifokorlar: <strong>{plan.doctor_limit}</strong></li>
                                <li><FaBuilding /> Filiallar: <strong>{plan.branch_limit}</strong></li>
                                {plan.trial_period_days ? (
                                    <li>🎁 Sinov muddati: <strong>{plan.trial_period_days} kun</strong></li>
                                ) : null}
                            </ul>
                            <div className="sa-plan-actions">
                                <button className="sa-btn sa-btn-outline" onClick={() => openEdit(plan)}>
                                    <FaEdit /> Tahrirlash
                                </button>
                                <button className="sa-icon-btn sa-icon-red" onClick={() => handleDelete(plan)}>
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="sa-modal-overlay" onClick={() => !saving && setShowModal(false)}>
                    <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sa-modal-header">
                            <h2>{editingPlan ? `Tarifni tahrirlash — ${editingPlan.name}` : "Yangi tarif yaratish"}</h2>
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
                                    <label>Tarif nomi *</label>
                                    <input
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Masalan: Standart"
                                    />
                                </div>
                                <div className="sa-form-group">
                                    <label>Narxi (so'm) *</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                                        placeholder="500000"
                                    />
                                </div>
                                <div className="sa-form-group">
                                    <label>Xotira limiti (GB) *</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={form.storage_limit_gb}
                                        onChange={(e) => setForm({ ...form, storage_limit_gb: e.target.value })}
                                    />
                                </div>
                                <div className="sa-form-group">
                                    <label>Sinov muddati (kun)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.trial_period_days}
                                        onChange={(e) => setForm({ ...form, trial_period_days: e.target.value })}
                                        placeholder="Masalan: 14"
                                    />
                                </div>
                                <div className="sa-form-group">
                                    <label>Direktorlar limiti</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.director_limit}
                                        onChange={(e) => setForm({ ...form, director_limit: e.target.value })}
                                    />
                                </div>
                                <div className="sa-form-group">
                                    <label>Adminlar limiti</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.admin_limit}
                                        onChange={(e) => setForm({ ...form, admin_limit: e.target.value })}
                                    />
                                </div>
                                <div className="sa-form-group">
                                    <label>Shifokorlar limiti</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.doctor_limit}
                                        onChange={(e) => setForm({ ...form, doctor_limit: e.target.value })}
                                    />
                                </div>
                                <div className="sa-form-group">
                                    <label>Filiallar limiti</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.branch_limit}
                                        onChange={(e) => setForm({ ...form, branch_limit: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="sa-form-group">
                                <label>Izoh</label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Tarif haqida qo'shimcha ma'lumot..."
                                />
                            </div>
                            <div className="sa-form-actions">
                                <button type="button" className="sa-btn sa-btn-outline" onClick={() => setShowModal(false)} disabled={saving}>
                                    Bekor qilish
                                </button>
                                <button type="submit" className="sa-btn sa-btn-primary" disabled={saving}>
                                    {saving ? "Saqlanmoqda..." : editingPlan ? "Saqlash" : "Yaratish"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
