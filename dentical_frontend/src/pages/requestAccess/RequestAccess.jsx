import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaClinicMedical, FaUser, FaEnvelope } from "react-icons/fa"
import { MdOutlineHealthAndSafety } from "react-icons/md"

export default function RequestAccess() {
    const navigate = useNavigate()
    const [clinicInfo, setClinicInfo] = useState({
        clinicName: "",
        fullName: "",
        age: "",
        email: "",
        message: "",
    })
    const [submitted, setSubmitted] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setClinicInfo({
            ...clinicInfo,
            [name]: value,
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("Request access submitted:", clinicInfo)
        setSubmitted(true)
    }

    return (
        <div className="request-access-container">
            <div className="animation-left">
                <div className="circle-container">
                    <div className="circle circle-1"></div>
                    <div className="circle circle-2"></div>
                    <div className="circle circle-3"></div>
                </div>
            </div>

            <div className="request-content">
                {!submitted ? (
                    <div className="request-form-container">
                        <div className="request-header">
                            <MdOutlineHealthAndSafety className="logo-icon" />
                            <h1>Klinika CRM Tizimiga Ruxsat So'rash</h1>
                            <p>Tizimdan foydalanish uchun ma'lumotlaringizni kiriting</p>
                        </div>

                        <form className="request-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <div className="input-icon">
                                    <FaClinicMedical />
                                </div>
                                <input
                                    type="text"
                                    name="clinicName"
                                    placeholder="Klinika nomi"
                                    value={clinicInfo.clinicName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <div className="input-icon">
                                    <FaUser />
                                </div>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="To'liq ismingiz"
                                    value={clinicInfo.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <div className="input-icon">
                                    <span className="age-icon">Y</span>
                                </div>
                                <input
                                    type="number"
                                    name="age"
                                    placeholder="Yoshingiz"
                                    value={clinicInfo.age}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <div className="input-icon">
                                    <FaEnvelope />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Elektron pochta"
                                    value={clinicInfo.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <textarea
                                    name="message"
                                    placeholder="Qo'shimcha ma'lumot (ixtiyoriy)"
                                    value={clinicInfo.message}
                                    onChange={handleChange}
                                    rows={4}
                                ></textarea>
                            </div>

                            <button type="submit" className="submit-button">
                                Yuborish
                            </button>

                            <button type="button" className="back-button" onClick={() => navigate("/login")}>
                                Loginga qaytish
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="success-message">
                        <MdOutlineHealthAndSafety className="logo-icon" />
                        <h2>So'rovingiz qabul qilindi!</h2>
                        <p>
                            Login va parol ma'lumotlari <strong>{clinicInfo.email}</strong> elektron pochtangizga yuboriladi.
                        </p>
                        <button type="button" className="back-to-login" onClick={() => navigate("/login")}>
                            Loginga qaytish
                        </button>
                    </div>
                )}
            </div>

            <div className="animation-right">
                <div className="pulse-container">
                    <div className="pulse pulse-1"></div>
                    <div className="pulse pulse-2"></div>
                    <div className="pulse pulse-3"></div>
                </div>
            </div>
        </div>
    )
};