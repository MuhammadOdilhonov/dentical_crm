"use client"

import { useState, useEffect } from "react"
import apiSuperAdmin from "../../api/apiSuperAdmin"
import {
    FaPlus,
    FaTimes,
    FaTrash,
    FaBell,
    FaEye,
    FaRedo,
    FaCopy,
    FaCheckCircle,
    FaExclamationTriangle,
    FaEnvelope,
} from "react-icons/fa"

const emptyForm = {
    clinic_name: "",
    phone_number: "",
    license_number: "",
    email: "",
    director_first_name: "",
    director_last_name: "",
    director_phone: "",
    plan_id: "",
    paid_amount: "",
    logo: null,
}

export default function SAClinics() {
    const [clinics, setClinics] = useState([])
    const [count, setCount] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Yaratish modali
    const [showCreate, setShowCreate] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [plans, setPlans] = useState([])
    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState(null)
    const [createdResult, setCreatedResult] = useState(null) // muvaffaqiyatli natija (parol bilan)

    // Xabar yuborish modali
    const [notifyClinic, setNotifyClinic] = useState(null)
    const [notifyForm, setNotifyForm] = useState({ title: "", message: "" })
    const [notifying, setNotifying] = useState(false)

    // Detal modali
    const [detail, setDetail] = useState(null)
    const [detailLoading, setDetailLoading] = useState(false)

    const pageSize = 10
    const totalPages = Math.max(1, Math.ceil(count / pageSize))

    const loadClinics = async (targetPage = page) => {
        try {
            setLoading(true)
            setError(null)
            const data = await apiSuperAdmin.fetchClinics(targetPage)
            setClinics(data.results || [])
            setCount(data.count || 0)
        } catch (err) {
            console.error("Klinikalarni yuklashda xatolik:", err)
            setError("Klinikalarni yuklab bo'lmadi.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadClinics(page)
    }, [page])

    const openCreate = async () => {
        setForm(emptyForm)
        setCreateError(null)
        setCreatedResult(null)
        setShowCreate(true)
        try {
            const planList = await apiSuperAdmin.fetchPlanSelectList()
            setPlans(planList || [])
        } catch {
            setPlans([])
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        setCreating(true)
        setCreateError(null)
        try {
            const payload = { ...form }
            if (!payload.plan_id) delete payload.plan_id
            if (!payload.paid_amount) delete payload.paid_amount
            const result = await apiSuperAdmin.createClinic(payload)
            setCreatedResult(result)
            loadClinics(1)
            setPage(1)
        } catch (err) {
            const data = err.response?.data
            const msg =
                data && typeof data === "object"
                    ? Object.values(data).flat().join(" ")
                    : "Klinika yaratishda xatolik yuz berdi."
            setCreateError(msg)
        } finally {
            setCreating(false)
        }
    }

    const handleDelete = async (clinic) => {
        if (!window.confirm(`"${clinic.clinic_name}" klinikasini butunlay o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi!`)) {
            return
        }
        try {
            await apiSuperAdmin.deleteClinic(clinic.id)
            loadClinics(page)
        } catch (err) {
            alert("O'chirishda xatolik: " + (err.response?.data?.error || err.message))
        }
    }

    const handleNotify = async (e) => {
        e.preventDefault()
        setNotifying(true)
        try {
            await apiSuperAdmin.notifyClinic(notifyClinic.id, notifyForm)
            alert("Xabar yuborildi (tizim ichida + emailga).")
            setNotifyClinic(null)
            setNotifyForm({ title: "", message: "" })
        } catch (err) {
            alert("Xabar yuborishda xatolik: " + (err.response?.data?.error || err.message))
        } finally {
            setNotifying(false)
        }
    }

    const openDetail = async (clinic) => {
        setDetailLoading(true)
        setDetail({ id: clinic.id, loading: true })
        try {
            const [info, financial] = await Promise.all([
                apiSuperAdmin.fetchClinicDetail(clinic.id),
                apiSuperAdmin.fetchClinicFinancial(clinic.id).catch(() => null),
            ])
            setDetail({ id: clinic.id, info, financial })
        } catch (err) {
            setDetail({ id: clinic.id, error: "Ma'lumotlarni yuklab bo'lmadi." })
        } finally {
            setDetailLoading(false)
        }
    }

    const copyCredentials = () => {
        if (!createdResult) return
        const text = `Login: ${createdResult.credentials.login}\nParol: ${createdResult.credentials.password}`
        navigator.clipboard.writeText(text)
        alert("Login va parol nusxalandi!")
    }

    return (
        <div className="sa-page">
            <div className="sa-page-header">
                <h1>Klinikalar ({count})</h1>
                <div className="sa-header-actions">
                    <button className="sa-btn sa-btn-outline" onClick={() => loadClinics(page)}>
                        <FaRedo /> Yangilash
                    </button>
                    <button className="sa-btn sa-btn-primary" onClick={openCreate}>
                        <FaPlus /> Yangi klinika
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
                ) : clinics.length === 0 ? (
                    <p className="sa-empty">Hozircha klinikalar yo'q. "Yangi klinika" tugmasi orqali qo'shing.</p>
                ) : (
                    <div className="sa-table-wrap">
                        <table className="sa-table">
                            <thead>
                                <tr>
                                    <th>Klinika</th>
                                    <th>Direktor</th>
                                    <th>Filiallar</th>
                                    <th>Xodimlar</th>
                                    <th>Tarif</th>
                                    <th>Obuna muddati</th>
                                    <th>Holat</th>
                                    <th>Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clinics.map((clinic) => (
                                    <tr key={clinic.id}>
                                        <td><strong>{clinic.clinic_name}</strong></td>
                                        <td>{clinic.director}</td>
                                        <td>{clinic.branches}</td>
                                        <td>{clinic.employees}</td>
                                        <td>{clinic.subscription_plan}</td>
                                        <td className="sa-small">{clinic.subscription_period}</td>
                                        <td>
                                            <span className={`sa-badge ${clinic.status === "Faol" ? "sa-badge-green" : "sa-badge-red"}`}>
                                                {clinic.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="sa-actions">
                                                <button title="Ko'rish" className="sa-icon-btn" onClick={() => openDetail(clinic)}>
                                                    <FaEye />
                                                </button>
                                                <button
                                                    title="Xabar yuborish"
                                                    className="sa-icon-btn sa-icon-blue"
                                                    onClick={() => setNotifyClinic(clinic)}
                                                >
                                                    <FaBell />
                                                </button>
                                                <button
                                                    title="O'chirish"
                                                    className="sa-icon-btn sa-icon-red"
                                                    onClick={() => handleDelete(clinic)}
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="sa-pagination">
                        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>&larr; Oldingi</button>
                        <span>{page} / {totalPages}</span>
                        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Keyingi &rarr;</button>
                    </div>
                )}
            </div>

            {/* ===== Yaratish modali ===== */}
            {showCreate && (
                <div className="sa-modal-overlay" onClick={() => !creating && setShowCreate(false)}>
                    <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sa-modal-header">
                            <h2>{createdResult ? "Klinika yaratildi!" : "Yangi klinika yaratish"}</h2>
                            <button className="sa-icon-btn" onClick={() => setShowCreate(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        {createdResult ? (
                            <div className="sa-modal-body">
                                <div className="sa-success-box">
                                    <FaCheckCircle className="sa-success-icon" />
                                    <h3>"{createdResult.clinic.name}" muvaffaqiyatli yaratildi</h3>
                                    <p>
                                        {createdResult.email_sent ? (
                                            <>
                                                <FaEnvelope /> Login ma'lumotlari <strong>{createdResult.clinic.email}</strong> manziliga
                                                yuborildi.
                                            </>
                                        ) : (
                                            <span className="sa-warning-text">
                                                <FaExclamationTriangle /> Email yuborilmadi: {createdResult.email_error}. Quyidagi
                                                ma'lumotlarni qo'lda yetkazing!
                                            </span>
                                        )}
                                    </p>
                                    <div className="sa-credentials">
                                        <p><strong>Login:</strong> <code>{createdResult.credentials.login}</code></p>
                                        <p><strong>Parol:</strong> <code>{createdResult.credentials.password}</code></p>
                                        {createdResult.subscription && (
                                            <p>
                                                <strong>Tarif:</strong> {createdResult.subscription.plan} (
                                                {createdResult.subscription.start_date} — {createdResult.subscription.end_date})
                                            </p>
                                        )}
                                    </div>
                                    <div className="sa-form-actions">
                                        <button className="sa-btn sa-btn-outline" onClick={copyCredentials}>
                                            <FaCopy /> Nusxalash
                                        </button>
                                        <button className="sa-btn sa-btn-primary" onClick={() => setShowCreate(false)}>
                                            Yopish
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form className="sa-modal-body" onSubmit={handleCreate}>
                                {createError && (
                                    <div className="sa-error-inline">
                                        <FaExclamationTriangle /> {createError}
                                    </div>
                                )}

                                <h4 className="sa-form-section">Klinika ma'lumotlari</h4>
                                <div className="sa-form-grid">
                                    <div className="sa-form-group">
                                        <label>Klinika nomi *</label>
                                        <input
                                            required
                                            value={form.clinic_name}
                                            onChange={(e) => setForm({ ...form, clinic_name: e.target.value })}
                                            placeholder="Masalan: Smile Dental"
                                        />
                                    </div>
                                    <div className="sa-form-group">
                                        <label>Telefon raqami *</label>
                                        <input
                                            required
                                            value={form.phone_number}
                                            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                                            placeholder="+998901234567"
                                        />
                                    </div>
                                    <div className="sa-form-group">
                                        <label>Litsenziya raqami *</label>
                                        <input
                                            required
                                            value={form.license_number}
                                            onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                                            placeholder="LIC-12345"
                                        />
                                    </div>
                                    <div className="sa-form-group">
                                        <label>Email (login shu manzilga yuboriladi) *</label>
                                        <input
                                            required
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder="klinika@gmail.com"
                                        />
                                    </div>
                                    <div className="sa-form-group">
                                        <label>Klinika logosi (ixtiyoriy)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setForm({ ...form, logo: e.target.files?.[0] || null })}
                                        />
                                    </div>
                                </div>

                                <h4 className="sa-form-section">Direktor ma'lumotlari</h4>
                                <div className="sa-form-grid">
                                    <div className="sa-form-group">
                                        <label>Ismi</label>
                                        <input
                                            value={form.director_first_name}
                                            onChange={(e) => setForm({ ...form, director_first_name: e.target.value })}
                                            placeholder="Aziz"
                                        />
                                    </div>
                                    <div className="sa-form-group">
                                        <label>Familiyasi</label>
                                        <input
                                            value={form.director_last_name}
                                            onChange={(e) => setForm({ ...form, director_last_name: e.target.value })}
                                            placeholder="Azizov"
                                        />
                                    </div>
                                    <div className="sa-form-group">
                                        <label>Telefon raqami</label>
                                        <input
                                            value={form.director_phone}
                                            onChange={(e) => setForm({ ...form, director_phone: e.target.value })}
                                            placeholder="+998901234567"
                                        />
                                    </div>
                                </div>

                                <h4 className="sa-form-section">Tarif (ixtiyoriy)</h4>
                                <div className="sa-form-grid">
                                    <div className="sa-form-group">
                                        <label>Tarif rejasi</label>
                                        <select
                                            value={form.plan_id}
                                            onChange={(e) => setForm({ ...form, plan_id: e.target.value })}
                                        >
                                            <option value="">— Tanlanmagan (keyin biriktirish mumkin) —</option>
                                            {plans.map((plan) => (
                                                <option key={plan.id} value={plan.id}>
                                                    {plan.name} — {new Intl.NumberFormat("uz-UZ").format(plan.price)} so'm
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {form.plan_id && (
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
                                    )}
                                </div>

                                <div className="sa-form-actions">
                                    <button type="button" className="sa-btn sa-btn-outline" onClick={() => setShowCreate(false)} disabled={creating}>
                                        Bekor qilish
                                    </button>
                                    <button type="submit" className="sa-btn sa-btn-primary" disabled={creating}>
                                        {creating ? "Yaratilmoqda..." : "Yaratish va emailga yuborish"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ===== Xabar yuborish modali ===== */}
            {notifyClinic && (
                <div className="sa-modal-overlay" onClick={() => !notifying && setNotifyClinic(null)}>
                    <div className="sa-modal sa-modal-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="sa-modal-header">
                            <h2>Xabar yuborish — {notifyClinic.clinic_name}</h2>
                            <button className="sa-icon-btn" onClick={() => setNotifyClinic(null)}>
                                <FaTimes />
                            </button>
                        </div>
                        <form className="sa-modal-body" onSubmit={handleNotify}>
                            <div className="sa-form-group">
                                <label>Sarlavha *</label>
                                <input
                                    required
                                    value={notifyForm.title}
                                    onChange={(e) => setNotifyForm({ ...notifyForm, title: e.target.value })}
                                    placeholder="Masalan: To'lov eslatmasi"
                                />
                            </div>
                            <div className="sa-form-group">
                                <label>Xabar matni *</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={notifyForm.message}
                                    onChange={(e) => setNotifyForm({ ...notifyForm, message: e.target.value })}
                                    placeholder="Xabar matnini kiriting..."
                                />
                            </div>
                            <div className="sa-form-actions">
                                <button type="button" className="sa-btn sa-btn-outline" onClick={() => setNotifyClinic(null)} disabled={notifying}>
                                    Bekor qilish
                                </button>
                                <button type="submit" className="sa-btn sa-btn-primary" disabled={notifying}>
                                    {notifying ? "Yuborilmoqda..." : "Yuborish"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== Detal modali ===== */}
            {detail && (
                <div className="sa-modal-overlay" onClick={() => setDetail(null)}>
                    <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sa-modal-header">
                            <h2>Klinika ma'lumotlari</h2>
                            <button className="sa-icon-btn" onClick={() => setDetail(null)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="sa-modal-body">
                            {detailLoading ? (
                                <div className="sa-loading">
                                    <div className="loading-spinner"></div>
                                </div>
                            ) : detail.error ? (
                                <p className="sa-error-inline"><FaExclamationTriangle /> {detail.error}</p>
                            ) : detail.info ? (
                                <>
                                    <div className="sa-detail-grid">
                                        <div><strong>Nomi:</strong> {detail.info.clinic_name}</div>
                                        <div><strong>Direktor:</strong> {detail.info.director}</div>
                                        <div><strong>Telefon:</strong> {detail.info.phone}</div>
                                        <div><strong>Email:</strong> {detail.info.email}</div>
                                        <div>
                                            <strong>Holat:</strong>{" "}
                                            <span className={`sa-badge ${detail.info.status ? "sa-badge-green" : "sa-badge-red"}`}>
                                                {detail.info.status ? "Faol" : "Nofaol"}
                                            </span>
                                        </div>
                                        <div>
                                            <strong>Xotira:</strong> {detail.info.storage?.used} GB / {detail.info.storage?.allocated} GB
                                        </div>
                                    </div>
                                    {detail.financial && (
                                        <>
                                            <h4 className="sa-form-section">Moliyaviy ma'lumotlar</h4>
                                            <div className="sa-detail-grid">
                                                <div><strong>Tarif narxi:</strong> {new Intl.NumberFormat("uz-UZ").format(detail.financial.subscription_price)} so'm</div>
                                                <div><strong>Chegirmadan keyin:</strong> {new Intl.NumberFormat("uz-UZ").format(detail.financial.discount_amount)} so'm</div>
                                                <div><strong>Sof foyda:</strong> {new Intl.NumberFormat("uz-UZ").format(detail.financial.net_profit)} so'm</div>
                                                <div><strong>Ishlatilgan joy:</strong> {detail.financial.estimated_storage_used_gb} GB</div>
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
