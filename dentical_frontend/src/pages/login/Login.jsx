"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"
import {
    FaLock,
    FaUser,
    FaClinicMedical,
    FaEnvelope,
    FaKey,
    FaArrowLeft,
    FaTimes,
    FaExclamationCircle,
} from "react-icons/fa"
import { MdOutlineHealthAndSafety } from "react-icons/md"
import apiProfile from "../../api/apiProfile"

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const { t, language, changeLanguage } = useLanguage()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [showRequestAccess, setShowRequestAccess] = useState(false)
    const [clinicInfo, setClinicInfo] = useState({
        clinicName: "",
        fullName: "",
        age: "",
        email: "",
    })
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loginAttempted, setLoginAttempted] = useState(false) // Login urinishi holati

    // Password reset states
    const [showResetModal, setShowResetModal] = useState(false)
    const [resetStep, setResetStep] = useState(1) // 1: email, 2: verification code, 3: new password
    const [resetEmail, setResetEmail] = useState("")
    const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
    const [resetToken, setResetToken] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [resetError, setResetError] = useState("")
    const [resetLoading, setResetLoading] = useState(false)
    const [resetSuccess, setResetSuccess] = useState(false)

    // Refs for verification code inputs
    const codeInputRefs = useRef([])

    // Initialize refs for the 6 input fields
    useEffect(() => {
        codeInputRefs.current = codeInputRefs.current.slice(0, 6)
    }, [])

    const handleLogin = async (e) => {
        e.preventDefault()

        // Agar login jarayoni ketayotgan bo'lsa yoki allaqachon urinilgan bo'lsa, qayta chaqirmaslik
        if (loading || loginAttempted) {
            console.log("Login already in progress or attempted, ignoring duplicate submit")
            return
        }

        setError("")
        setLoading(true)
        setLoginAttempted(true) // Login urinishi boshlandi

        try {
            if (email && password) {
                console.log("Login form submitted with:", email)

                // AuthContext orqali login qilish
                const userData = {
                    email,
                    password,
                }

                await login(userData)
                navigate("/dashboard")
            } else {
                setError(t("emailPasswordRequired"))
            }
        } catch (error) {
            console.error("Login error in component:", error)
            setError(error.response?.data?.message || t("loginFailed"))
        } finally {
            setLoading(false)
            // Login tugagandan so'ng, qisqa vaqtdan keyin loginAttempted ni false qilish
            setTimeout(() => {
                setLoginAttempted(false)
            }, 1000)
        }
    }

    const handleRequestAccess = (e) => {
        e.preventDefault()
        setShowRequestAccess(true)
    }

    const handleClinicInfoSubmit = (e) => {
        e.preventDefault()
        console.log("Clinic info submitted:", clinicInfo)
        setSubmitted(true)
    }

    const navigateToSignUp = () => {
        navigate("/signup")
    }

    const handleLanguageChange = (lang) => {
        changeLanguage(lang)
    }

    // Password reset handlers
    const openResetModal = (e) => {
        e.preventDefault()
        setResetEmail(email) // Pre-fill with login email if available
        setResetStep(1)
        setResetError("")
        setResetSuccess(false)
        setShowResetModal(true)
    }

    const closeResetModal = () => {
        setShowResetModal(false)
        // Reset all states
        setResetStep(1)
        setVerificationCode(["", "", "", "", "", ""])
        setNewPassword("")
        setConfirmPassword("")
        setResetError("")
        setResetToken("")
        setResetLoading(false)
    }

    const handleRequestReset = async (e) => {
        e.preventDefault()
        if (!resetEmail) {
            setResetError(t("emailRequired"))
            return
        }

        setResetLoading(true)
        setResetError("")

        try {
            await apiProfile.requestPasswordReset(resetEmail)
            setResetStep(2) // Move to verification code step
        } catch (error) {
            setResetError(error.response?.data?.message || t("resetRequestFailed"))
        } finally {
            setResetLoading(false)
        }
    }

    const handleCodeChange = (index, value) => {
        // Update the verification code array
        const newCode = [...verificationCode]
        newCode[index] = value

        setVerificationCode(newCode)

        // Auto-focus to next input if value is entered
        if (value && index < 5) {
            codeInputRefs.current[index + 1].focus()
        }
    }

    const handleKeyDown = (index, e) => {
        // Handle backspace to go to previous input
        if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
            codeInputRefs.current[index - 1].focus()
        }
    }

    const handleVerifyCode = async (e) => {
        e.preventDefault()
        const code = verificationCode.join("")

        if (code.length !== 6) {
            setResetError(t("invalidCodeLength"))
            return
        }

        setResetLoading(true)
        setResetError("")

        try {
            const response = await apiProfile.verifyResetCode(resetEmail, code)

            // Make sure we're getting a token from the response
            if (!response.token) {
                throw new Error("No token received from server")
            }

            // Store the token securely
            setResetToken(response.token)
            console.log("Token received:", response.token) // For debugging

            // Move to new password step
            setResetStep(3)
        } catch (error) {
            console.error("Code verification error:", error)
            setResetError(error.response?.data?.message || error.response?.data?.detail || t("codeVerificationFailed"))
        } finally {
            setResetLoading(false)
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()

        if (!newPassword || !confirmPassword) {
            setResetError(t("passwordsRequired"))
            return
        }

        if (newPassword !== confirmPassword) {
            setResetError(t("passwordsDoNotMatch"))
            return
        }

        if (!resetToken) {
            setResetError(t("tokenMissing") || "Authentication token is missing. Please try again.")
            return
        }

        setResetLoading(true)
        setResetError("")

        try {
            await apiProfile.resetPassword(resetToken, {
                new_password: newPassword,
                confirm_password: confirmPassword,
            })

            setResetSuccess(true)
            // Clear the token after successful use to ensure it's only used once
            setResetToken("")

            // Store the email in case the user wants to login right after
            const loginEmail = resetEmail

            // Clear all reset data
            setResetEmail("")
            setNewPassword("")
            setConfirmPassword("")
            setVerificationCode(["", "", "", "", "", ""])

            // Pre-fill the login form with the email
            setEmail(loginEmail)

            // Automatically close the modal after showing success message for 2 seconds
            setTimeout(() => {
                setShowResetModal(false)
                setResetSuccess(false)
            }, 2000)
        } catch (error) {
            console.error("Password reset error:", error)
            setResetError(error.response?.data?.message || error.response?.data?.detail || t("passwordResetFailed"))
        } finally {
            setResetLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="animation-left">
                <div className="circle-container">
                    <div className="circle circle-1"></div>
                    <div className="circle circle-2"></div>
                    <div className="circle circle-3"></div>
                </div>
            </div>

            <div className="login-content">
                {!showRequestAccess ? (
                    !submitted ? (
                        <div className="login-form-container">
                            <div className="login-header">
                                <MdOutlineHealthAndSafety className="logo-icon" />
                                <h1>Klinika CRM</h1>
                                <p>{t("loginInstructions")}</p>
                            </div>

                            <div className="language-selector">
                                <button
                                    className={`lang-btn ${language === "uz" ? "active" : ""}`}
                                    onClick={() => handleLanguageChange("uz")}
                                >
                                    UZ
                                </button>
                                <button
                                    className={`lang-btn ${language === "ru" ? "active" : ""}`}
                                    onClick={() => handleLanguageChange("ru")}
                                >
                                    RU
                                </button>
                                <button
                                    className={`lang-btn ${language === "en" ? "active" : ""}`}
                                    onClick={() => handleLanguageChange("en")}
                                >
                                    EN
                                </button>
                                <button
                                    className={`lang-btn ${language === "kz" ? "active" : ""}`}
                                    onClick={() => handleLanguageChange("kz")}
                                >
                                    KZ
                                </button>
                                <button
                                    className={`lang-btn ${language === "zh" ? "active" : ""}`}
                                    onClick={() => handleLanguageChange("zh")}
                                >
                                    ZH
                                </button>
                            </div>

                            <form className="login-form" onSubmit={handleLogin}>
                                {error && <div className="error-message">{error}</div>}

                                <div className="form-group">
                                    <div className="input-icon">
                                        <FaUser />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={t("email")}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <div className="input-icon">
                                        <FaLock />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder={t("password")}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-options">
                                    <label className="remember-me">
                                        <input type="checkbox" disabled={loading} />
                                        <span>{t("remember_me")}</span>
                                    </label>
                                    <a href="#" className="forgot-password" onClick={openResetModal}>
                                        {t("forgot_password")}
                                    </a>
                                </div>

                                <button type="submit" className="login-button" disabled={loading || loginAttempted}>
                                    {loading ? t("loggingIn") : t("login")}
                                </button>


                                {/* <div className="divider">
                                    <span>{t("or")}</span>
                                </div> */}

                                {/* <button
                                    type="button"
                                    className="request-access-button"
                                    onClick={handleRequestAccess}
                                    disabled={loading}
                                >
                                    {t("request_access")}
                                </button> */}

                                {/* <div className="signup-link">
                                    <p>
                                        {t("noAccount")}{" "}
                                        <button type="button" onClick={navigateToSignUp} disabled={loading}>
                                            {t("signUp")}
                                        </button>
                                    </p>
                                </div> */}
                            </form>
                        </div>
                    ) : (
                        <div className="success-message">
                            <MdOutlineHealthAndSafety className="logo-icon" />
                            <h2>{t("requestReceived")}</h2>
                            <p>
                                {t("credentialsSentTo")} <strong>{clinicInfo.email}</strong>
                            </p>
                            <button
                                type="button"
                                className="back-to-login"
                                onClick={() => {
                                    setShowRequestAccess(false)
                                    setSubmitted(false)
                                }}
                            >
                                {t("backToLogin")}
                            </button>
                        </div>
                    )
                ) : (
                    <div className="request-form-container">
                        <div className="login-header">
                            <FaClinicMedical className="logo-icon" />
                            <h1>{t("requestAccess")}</h1>
                            <p>{t("enterClinicInfo")}</p>
                        </div>

                        <form className="request-form" onSubmit={handleClinicInfoSubmit}>
                            <div className="form-group">
                                <div className="input-icon">
                                    <FaClinicMedical />
                                </div>
                                <input
                                    type="text"
                                    placeholder={t("clinicName")}
                                    value={clinicInfo.clinicName}
                                    onChange={(e) => setClinicInfo({ ...clinicInfo, clinicName: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <div className="input-icon">
                                    <FaUser />
                                </div>
                                <input
                                    type="text"
                                    placeholder={t("fullName")}
                                    value={clinicInfo.fullName}
                                    onChange={(e) => setClinicInfo({ ...clinicInfo, fullName: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <div className="input-icon">
                                    <span className="age-icon">Y</span>
                                </div>
                                <input
                                    type="number"
                                    placeholder={t("age")}
                                    value={clinicInfo.age}
                                    onChange={(e) => setClinicInfo({ ...clinicInfo, age: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <div className="input-icon">
                                    <FaEnvelope />
                                </div>
                                <input
                                    type="email"
                                    placeholder={t("email")}
                                    value={clinicInfo.email}
                                    onChange={(e) => setClinicInfo({ ...clinicInfo, email: e.target.value })}
                                    required
                                />
                            </div>

                            <button type="submit" className="submit-button">
                                {t("submit")}
                            </button>

                            <button type="button" className="back-button" onClick={() => setShowRequestAccess(false)}>
                                {t("back")}
                            </button>
                        </form>
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

            {/* Password Reset Modal */}
            {showResetModal && (
                <div className="modal-overlay">
                    <div className="reset-password-modal">
                        <div className="modal-header">
                            <h2>
                                {resetStep === 1 && t("forgotPassword")}
                                {resetStep === 2 && t("verifyCode")}
                                {resetStep === 3 && t("resetPassword")}
                                {resetSuccess && t("passwordResetSuccess")}
                            </h2>
                            <button className="close-button" onClick={closeResetModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Step 1: Email Entry */}
                            {resetStep === 1 && (
                                <div className="reset-step">
                                    <div className="reset-step-icon">
                                        <FaEnvelope />
                                    </div>
                                    <h3>{t("enterYourEmail")}</h3>
                                    <p>{t("resetCodeWillBeSent")}</p>

                                    <form onSubmit={handleRequestReset}>
                                        <div className="form-group">
                                            <label htmlFor="resetEmail">{t("email")}</label>
                                            <input
                                                id="resetEmail"
                                                type="email"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                placeholder={t("enterEmail")}
                                                required
                                                disabled={resetLoading}
                                            />
                                        </div>

                                        {resetError && (
                                            <div className="reset-error">
                                                <FaExclamationCircle />
                                                {resetError}
                                            </div>
                                        )}

                                        <div className="form-actions">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={closeResetModal}
                                                disabled={resetLoading}
                                            >
                                                {t("cancel")}
                                            </button>
                                            <button type="submit" className="btn btn-primary" disabled={resetLoading}>
                                                {resetLoading ? (
                                                    <>
                                                        <span className="spinner">⟳</span> {t("sending")}
                                                    </>
                                                ) : (
                                                    t("sendCode")
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Step 2: Verification Code */}
                            {resetStep === 2 && (
                                <div className="reset-step">
                                    <div className="reset-step-icon">
                                        <FaKey />
                                    </div>
                                    <h3>{t("enterVerificationCode")}</h3>
                                    <p>
                                        {t("codeSentTo")} <strong>{resetEmail}</strong>
                                    </p>

                                    <form onSubmit={handleVerifyCode}>
                                        <div className="verification-code-inputs">
                                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                                <input
                                                    key={index}
                                                    type="text"
                                                    maxLength={1}
                                                    value={verificationCode[index]}
                                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                                    ref={(el) => (codeInputRefs.current[index] = el)}
                                                    disabled={resetLoading}
                                                    autoFocus={index === 0}
                                                />
                                            ))}
                                        </div>

                                        {resetError && (
                                            <div className="reset-error">
                                                <FaExclamationCircle />
                                                {resetError}
                                            </div>
                                        )}

                                        <div className="form-actions">
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-icon"
                                                onClick={() => setResetStep(1)}
                                                disabled={resetLoading}
                                            >
                                                <FaArrowLeft /> {t("back")}
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={resetLoading || verificationCode.join("").length !== 6}
                                            >
                                                {resetLoading ? (
                                                    <>
                                                        <span className="spinner">⟳</span> {t("verifying")}
                                                    </>
                                                ) : (
                                                    t("verify")
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Step 3: New Password */}
                            {resetStep === 3 && (
                                <div className="reset-step">
                                    <div className="reset-step-icon">
                                        <FaLock />
                                    </div>
                                    <h3>{t("createNewPassword")}</h3>
                                    <p>{t("enterNewPassword")}</p>

                                    <form onSubmit={handleResetPassword}>
                                        <div className="form-group">
                                            <label htmlFor="newPassword">{t("newPassword")}</label>
                                            <input
                                                id="newPassword"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder={t("enterNewPassword")}
                                                required
                                                disabled={resetLoading}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="confirmPassword">{t("confirmPassword")}</label>
                                            <input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder={t("confirmNewPassword")}
                                                required
                                                disabled={resetLoading}
                                            />
                                        </div>

                                        {resetError && (
                                            <div className="reset-error">
                                                <FaExclamationCircle />
                                                {resetError}
                                            </div>
                                        )}

                                        <div className="form-actions">
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-icon"
                                                onClick={() => setResetStep(2)}
                                                disabled={resetLoading}
                                            >
                                                <FaArrowLeft /> {t("back")}
                                            </button>
                                            <button type="submit" className="btn btn-primary" disabled={resetLoading}>
                                                {resetLoading ? (
                                                    <>
                                                        <span className="spinner">⟳</span> {t("resetting")}
                                                    </>
                                                ) : (
                                                    t("resetPassword")
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Success Message */}
                            {resetSuccess && (
                                <div className="reset-step">
                                    <div className="reset-step-icon success-icon">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                    </div>
                                    <h3>{t("passwordResetSuccessful")}</h3>
                                    <p>{t("passwordResetSuccessMessage")}</p>

                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={closeResetModal}
                                        style={{ marginTop: "20px" }}
                                    >
                                        {t("backToLogin")}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
