"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { submitTarget } from "../../api/apiTarget"

const Target = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: "",
        phone_number: "",
        clinic_name: "",
        location: "",
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [success, setSuccess] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = "Ism majburiy maydon"
        }

        if (!formData.phone_number.trim()) {
            newErrors.phone_number = "Telefon raqam majburiy maydon"
        } else if (!/^\+?[0-9\s\-()]{9,}$/.test(formData.phone_number)) {
            newErrors.phone_number = "Telefon raqam formati noto'g'ri"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setLoading(true)
        try {
            await submitTarget(formData)
            setSuccess(true)
        } catch (error) {
            console.error("Target submission error:", error)
            setErrors({ submit: "Xatolik yuz berdi. Qaytadan urinib ko'ring." })
        } finally {
            setLoading(false)
        }
    }

    const socialLinks = {
        telegram: "https://t.me/yourtelegram",
        instagram: "https://instagram.com/yourinstagram",
        adminTelegram: "https://t.me/youradmin",
    }

    if (success) {
        return (
            <div className="target-page">
                <div className="target-background">
                    <div className="floating-shapes">
                        <div className="shape shape-1"></div>
                        <div className="shape shape-2"></div>
                        <div className="shape shape-3"></div>
                        <div className="shape shape-4"></div>
                        <div className="shape shape-5"></div>
                    </div>
                </div>

                <div className="target-container">
                    <div className="target-logo">
                        <img src="/images/dentical_logo.png" alt="Dentical Logo" className="logo-img" />
                        <h2 className="logo-text">Dentical</h2>
                    </div>

                    <div className="success-animation">
                        <div className="success-checkmark">
                            <div className="check-icon">
                                <span className="icon-line line-tip"></span>
                                <span className="icon-line line-long"></span>
                                <div className="icon-circle"></div>
                                <div className="icon-fix"></div>
                            </div>
                        </div>
                        <h2 className="success-title">Ma'lumot yuborildi!</h2>
                        <p className="success-subtitle">Tez orada siz bilan bog'lanamiz</p>

                        <div className="social-follow">
                            <h3>Bizning ijtimoiy tarmoqlarda kuzatib boring:</h3>
                            <div className="social-links">
                                <a
                                    href={socialLinks.telegram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link telegram"
                                >
                                    <div className="social-icon">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z" />
                                        </svg>
                                    </div>
                                    <span>Telegram</span>
                                </a>

                                <a
                                    href={socialLinks.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link instagram"
                                >
                                    <div className="social-icon">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </div>
                                    <span>Instagram</span>
                                </a>

                                <a
                                    href={socialLinks.adminTelegram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link admin-telegram"
                                >
                                    <div className="social-icon">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z" />
                                        </svg>
                                    </div>
                                    <span>Admin Telegram</span>
                                </a>
                            </div>
                        </div>

                        <button className="back-btn" onClick={() => navigate("/")}>
                            Bosh sahifaga qaytish
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="target-page">
            <div className="target-background">
                <div className="floating-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                    <div className="shape shape-4"></div>
                    <div className="shape shape-5"></div>
                    <div className="shape shape-6"></div>
                </div>
            </div>

            <div className="target-container">
                <div className="target-logo">
                    <img src="/images/dentical_logo.png" alt="Dentical Logo" className="logo-img" />
                    <h2 className="logo-text">Dentical</h2>
                </div>

                <div className="target-header">
                    <h1 className="target-title">
                        <span className="title-gradient">Bizga Qo'shiling</span>
                    </h1>
                    <p className="target-subtitle">Zamonaviy tibbiyot sohasida o'z o'rningizni toping</p>
                </div>

                <div className="target-form-wrapper">
                    <form onSubmit={handleSubmit} className="target-form">
                        <div className="form-group">
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`form-input ${errors.name ? "error" : ""}`}
                                    placeholder=" "
                                    required
                                />
                                <label htmlFor="name" className="form-label">
                                    <span className="label-text">To'liq ismingiz</span>
                                    <span className="required-star">*</span>
                                </label>
                                <div className="input-border"></div>
                                <div className="input-icon">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                            </div>
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <input
                                    type="tel"
                                    id="phone_number"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    className={`form-input ${errors.phone_number ? "error" : ""}`}
                                    placeholder=" "
                                    required
                                />
                                <label htmlFor="phone_number" className="form-label">
                                    <span className="label-text">Telefon raqamingiz</span>
                                    <span className="required-star">*</span>
                                </label>
                                <div className="input-border"></div>
                                <div className="input-icon">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                    </svg>
                                </div>
                            </div>
                            {errors.phone_number && <span className="error-message">{errors.phone_number}</span>}
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    id="clinic_name"
                                    name="clinic_name"
                                    value={formData.clinic_name}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder=" "
                                />
                                <label htmlFor="clinic_name" className="form-label">
                                    <span className="label-text">Klinika nomi</span>
                                </label>
                                <div className="input-border"></div>
                                <div className="input-icon">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <select
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="form-input form-select"
                                >
                                    <option value="">Hududni tanlang</option>
                                    <option value="Toshkent">Toshkent</option>
                                    <option value="Toshkent viloyati">Toshkent viloyati</option>
                                    <option value="Samarqand">Samarqand</option>
                                    <option value="Buxoro">Buxoro</option>
                                    <option value="Andijon">Andijon</option>
                                    <option value="Farg'ona">Farg'ona</option>
                                    <option value="Namangan">Namangan</option>
                                    <option value="Qashqadaryo">Qashqadaryo</option>
                                    <option value="Surxondaryo">Surxondaryo</option>
                                    <option value="Jizzax">Jizzax</option>
                                    <option value="Sirdaryo">Sirdaryo</option>
                                    <option value="Navoiy">Navoiy</option>
                                    <option value="Xorazm">Xorazm</option>
                                    <option value="Qoraqalpog'iston">Qoraqalpog'iston</option>
                                </select>
                                <label htmlFor="location" className="form-label select-label">
                                    <span className="label-text">Hudud</span>
                                </label>
                                <div className="input-border"></div>
                                <div className="input-icon">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {errors.submit && <div className="submit-error">{errors.submit}</div>}

                        <button type="submit" className={`submit-btn ${loading ? "loading" : ""}`} disabled={loading}>
                            <span className="btn-text">{loading ? "Yuborilmoqda..." : "Yuborish"}</span>
                            <div className="btn-ripple"></div>
                            <div className="btn-glow"></div>
                            {loading && <div className="btn-spinner"></div>}
                        </button>
                    </form>
                </div>

                <div className="target-footer">
                    <p>Bizning jamoa bilan bog'lanish orqali kelajakni quring</p>
                </div>
            </div>
        </div>
    )
}

export default Target
