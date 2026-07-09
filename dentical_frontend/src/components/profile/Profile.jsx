"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"
import apiProfile from "../../api/apiProfile"
import SuccessModal from "../modal/SuccessModal"
import ConfirmModal from "../modal/ConfirmModal"
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaClinicMedical,
  FaMoneyBillWave,
  FaIdCard,
  FaUserMd,
  FaCalendarAlt,
  FaEdit,
  FaArrowLeft,
  FaExclamationTriangle,
  FaSave,
  FaTimes,
  FaKey,
  FaInfoCircle,
  FaUnlock,
  FaSpinner,
} from "react-icons/fa"

export default function Profile() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user, logout } = useAuth()

  const [profileData, setProfileData] = useState(null)
  const [editedProfile, setEditedProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [usingCachedData, setUsingCachedData] = useState(false)

  // Password reset state
  const [resetStep, setResetStep] = useState(1) // 1: email, 2: verification code, 3: new password
  const [resetEmail, setResetEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [resetToken, setResetToken] = useState("")
  const [newPasswordData, setNewPasswordData] = useState({
    new_password: "",
    confirm_password: "",
  })
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState("")

  // Refs for verification code inputs
  const codeInputRefs = useRef([])
  if (codeInputRefs.current.length !== 6) {
    codeInputRefs.current = Array(6)
      .fill()
      .map((_, i) => codeInputRefs.current[i] || React.createRef())
  }

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [successModalProps, setSuccessModalProps] = useState({
    title: "",
    message: "",
  })
  const [confirmModalProps, setConfirmModalProps] = useState({
    title: "",
    message: "",
    confirmText: "",
    cancelText: "",
    type: "warning",
    onConfirm: () => {},
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)

        // First, get user data from localStorage as a backup
        let localUserData = null
        const storedData = localStorage.getItem("user")

        if (storedData) {
          const parsedData = JSON.parse(storedData)
          localUserData = parsedData
        }

        // Try to fetch from API
        if (localUserData && localUserData.id) {
          try {
            const apiData = await apiProfile.fetchUserProfile(localUserData.id)
            setProfileData(apiData)
            setEditedProfile(apiData)
            setUsingCachedData(false)
          } catch (apiError) {
            console.error("Error fetching from API, using cached data:", apiError)
            // If API fails, use localStorage data
            setProfileData(localUserData)
            setEditedProfile(localUserData)
            setUsingCachedData(true)
          }
        } else {
          // No local data available
          setError(t("profile_data_not_found"))
        }
      } catch (err) {
        console.error("Error loading profile data:", err)
        setError(err.message || t("error_loading_profile"))
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [t])

  // Handle back button click
  const handleBack = () => {
    navigate(-1) // Go back to previous page
  }

  // Handle edit button click
  const handleEdit = () => {
    setIsEditing(true)
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditedProfile(profileData)
    setIsEditing(false)
  }

  // Handle input change in edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedProfile({
      ...editedProfile,
      [name]: value,
    })
  }

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      setSaving(true)

      // Make PATCH request to update user profile using apiProfile
      const updatedUser = await apiProfile.updateUserProfile(profileData.id, editedProfile)

      // Update local storage with new data
      const storedData = localStorage.getItem("authData")
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        parsedData.user = updatedUser
        localStorage.setItem("authData", JSON.stringify(parsedData))
      }

      // Update state
      setProfileData(updatedUser)
      setIsEditing(false)
      setUsingCachedData(false)

      // Show success message
      setSuccessModalProps({
        title: t("success"),
        message: t("profile_updated_successfully"),
      })
      setShowSuccessModal(true)
    } catch (err) {
      console.error("Error updating profile:", err)

      // Show error message
      setConfirmModalProps({
        title: t("error"),
        message: err.response?.data?.message || t("error_updating_profile"),
        confirmText: t("ok"),
        type: "error",
        onConfirm: () => setShowConfirmModal(false),
      })
      setShowConfirmModal(true)
    } finally {
      setSaving(false)
    }
  }

  // Handle forgot password click
  const handleForgotPasswordClick = () => {
    if (usingCachedData) {
      // Show warning that password can't be reset while using cached data
      setConfirmModalProps({
        title: t("service_unavailable"),
        message: t("password_reset_unavailable_offline"),
        confirmText: t("ok"),
        type: "warning",
        onConfirm: () => setShowConfirmModal(false),
      })
      setShowConfirmModal(true)
      return
    }

    // Get email from profile data or localStorage
    const email = profileData?.email || ""
    setResetEmail(email)
    setResetStep(1)
    setResetError("")
    setShowResetModal(true)
  }

  // Handle email input change for password reset
  const handleResetEmailChange = (e) => {
    setResetEmail(e.target.value)
  }

  // Handle verification code input change
  const handleCodeChange = (index, value) => {
    if (value.length > 1) {
      value = value.charAt(0)
    }

    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // Auto-focus next input
    if (value !== "" && index < 5) {
      codeInputRefs.current[index + 1].focus()
    }
  }

  // Handle keydown for verification code inputs
  const handleCodeKeyDown = (index, e) => {
    // If backspace is pressed and current input is empty, focus previous input
    if (e.key === "Backspace" && verificationCode[index] === "" && index > 0) {
      codeInputRefs.current[index - 1].focus()
    }
  }

  // Handle new password input change
  const handleNewPasswordChange = (e) => {
    const { name, value } = e.target
    setNewPasswordData({
      ...newPasswordData,
      [name]: value,
    })
  }

  // Handle submit email for password reset
  const handleSubmitEmail = async () => {
    if (!resetEmail || !resetEmail.includes("@")) {
      setResetError(t("please_enter_valid_email"))
      return
    }

    try {
      setResetLoading(true)
      setResetError("")

      // Request password reset
      await apiProfile.requestPasswordReset(resetEmail)

      // Move to verification code step
      setResetStep(2)

      // Clear verification code
      setVerificationCode(["", "", "", "", "", ""])

      // Focus first input when component updates
      setTimeout(() => {
        if (codeInputRefs.current[0]) {
          codeInputRefs.current[0].focus()
        }
      }, 100)
    } catch (err) {
      console.error("Error requesting password reset:", err)
      setResetError(err.response?.data?.message || t("error_requesting_password_reset"))
    } finally {
      setResetLoading(false)
    }
  }

  // Handle submit verification code
  const handleSubmitCode = async () => {
    const code = verificationCode.join("")

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setResetError(t("please_enter_valid_code"))
      return
    }

    try {
      setResetLoading(true)
      setResetError("")

      // Verify reset code
      const response = await apiProfile.verifyResetCode(resetEmail, code)

      // Save token
      setResetToken(response.token)

      // Move to new password step
      setResetStep(3)

      // Clear new password data
      setNewPasswordData({
        new_password: "",
        confirm_password: "",
      })
    } catch (err) {
      console.error("Error verifying code:", err)
      setResetError(err.response?.data?.message || t("error_verifying_code"))
    } finally {
      setResetLoading(false)
    }
  }

  // Handle submit new password
  const handleSubmitNewPassword = async () => {
    if (!newPasswordData.new_password) {
      setResetError(t("please_enter_new_password"))
      return
    }

    if (newPasswordData.new_password !== newPasswordData.confirm_password) {
      setResetError(t("passwords_do_not_match"))
      return
    }

    try {
      setResetLoading(true)
      setResetError("")

      // Reset password with token
      await apiProfile.resetPassword(resetToken, {
        new_password: newPasswordData.new_password,
        confirm_password: newPasswordData.confirm_password,
      })

      // Close reset modal
      setShowResetModal(false)

      // Clear token
      setResetToken("")

      // Show success message
      setSuccessModalProps({
        title: t("success"),
        message: t("password_reset_successfully"),
      })
      setShowSuccessModal(true)
    } catch (err) {
      console.error("Error resetting password:", err)
      setResetError(err.response?.data?.message || t("error_resetting_password"))
    } finally {
      setResetLoading(false)
    }
  }

  // Close reset modal
  const handleCloseResetModal = () => {
    setShowResetModal(false)
    setResetStep(1)
    setResetEmail("")
    setVerificationCode(["", "", "", "", "", ""])
    setResetToken("")
    setNewPasswordData({
      new_password: "",
      confirm_password: "",
    })
    setResetError("")
  }

  // Format value with fallback for empty values
  const formatValue = (value, fallback = "-") => {
    if (value === null || value === undefined || value === "") {
      return fallback
    }
    return value
  }

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t("loading")}...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <FaExclamationTriangle className="error-icon" />
        <h2>{t("error_occurred")}</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          {t("try_again")}
        </button>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="btn-back" onClick={handleBack}>
          <FaArrowLeft /> {t("back")}
        </button>
        <h1 className="profile-title">{t("my_profile")}</h1>
        <div className="profile-actions">
          {!isEditing && (
            <>
              <button className="btn btn-outline btn-icon" onClick={handleForgotPasswordClick}>
                <FaKey /> {t("forgot_password")}
              </button>
              <button className="btn btn-primary btn-icon" onClick={handleEdit}>
                <FaEdit /> {t("edit_profile")}
              </button>
            </>
          )}
        </div>
      </div>

      {usingCachedData && (
        <div className="cached-data-warning">
          <FaInfoCircle /> {t("using_cached_data")}
          <p>{t("service_error_try_later")}</p>
        </div>
      )}

      {profileData && (
        <div className="profile-content">
          {isEditing ? (
            <div className="profile-edit-form">
              <h2 className="section-title">{t("edit_profile")}</h2>

              {usingCachedData && (
                <div className="edit-warning">
                  <FaInfoCircle /> {t("editing_while_offline")}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">{t("first_name")}</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={editedProfile.first_name || ""}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">{t("last_name")}</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={editedProfile.last_name || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">{t("email")}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editedProfile.email || ""}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone_number">{t("phone")}</label>
                  <input
                    type="text"
                    id="phone_number"
                    name="phone_number"
                    value={editedProfile.phone_number || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit} disabled={saving}>
                  <FaTimes /> {t("cancel")}
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSaveChanges} disabled={saving}>
                  <FaSave /> {t("save_changes")}
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-card">
              <div className="profile-card-header">
                <div className="profile-avatar">
                  <FaUser />
                </div>
                <div className="profile-basic-info">
                  <h2 className="profile-name">
                    {formatValue(
                      `${profileData.first_name} ${profileData.last_name}`.trim(),
                      profileData.email || t("user"),
                    )}
                  </h2>
                  <div className="profile-role">{formatValue(profileData.role_name)}</div>
                  <div className={`profile-status ${profileData.status}`}>
                    {profileData.status === "faol" ? t("active") : t("inactive")}
                  </div>
                </div>
              </div>

              <div className="profile-card-body">
                <div className="info-section">
                  <h3 className="section-title">{t("personal_information")}</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">
                        <FaIdCard /> {t("id")}
                      </div>
                      <div className="info-value">{formatValue(profileData.id)}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">
                        <FaEnvelope /> {t("email")}
                      </div>
                      <div className="info-value">{formatValue(profileData.email)}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">
                        <FaPhone /> {t("phone")}
                      </div>
                      <div className="info-value">{formatValue(profileData.phone_number)}</div>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3 className="section-title">{t("professional_information")}</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">
                        <FaBriefcase /> {t("role")}
                      </div>
                      <div className="info-value">{formatValue(profileData.role_name)}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">
                        <FaUserMd /> {t("specialization")}
                      </div>
                      <div className="info-value">{formatValue(profileData.specialization_name)}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">
                        <FaClinicMedical /> {t("clinic")}
                      </div>
                      <div className="info-value">{formatValue(profileData.clinic_name)}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">
                        <FaClinicMedical /> {t("branch")}
                      </div>
                      <div className="info-value">{formatValue(profileData.branch)}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">
                        <FaMoneyBillWave /> {t("salary")}
                      </div>
                      <div className="info-value">{formatValue(profileData.salary)}</div>
                    </div>
                  </div>
                </div>

                {(profileData.start_holiday || profileData.end_holiday || profileData.reason_holiday) && (
                  <div className="info-section">
                    <h3 className="section-title">{t("holiday_information")}</h3>
                    <div className="info-grid">
                      {profileData.reason_holiday && (
                        <div className="info-item">
                          <div className="info-label">
                            <FaCalendarAlt /> {t("reason_holiday")}
                          </div>
                          <div className="info-value">{formatValue(profileData.reason_holiday)}</div>
                        </div>
                      )}
                      {profileData.start_holiday && (
                        <div className="info-item">
                          <div className="info-label">
                            <FaCalendarAlt /> {t("start_holiday")}
                          </div>
                          <div className="info-value">{new Date(profileData.start_holiday).toLocaleDateString()}</div>
                        </div>
                      )}
                      {profileData.end_holiday && (
                        <div className="info-item">
                          <div className="info-label">
                            <FaCalendarAlt /> {t("end_holiday")}
                          </div>
                          <div className="info-value">{new Date(profileData.end_holiday).toLocaleDateString()}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="modal-overlay">
          <div className="reset-password-modal">
            <div className="modal-header">
              <h2>{t("reset_password")}</h2>
              <button className="close-button" onClick={handleCloseResetModal}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              {resetStep === 1 && (
                <div className="reset-step">
                  <div className="reset-step-icon">
                    <FaEnvelope />
                  </div>
                  <h3>{t("enter_your_email")}</h3>
                  <p>{t("we_will_send_verification_code")}</p>

                  <div className="form-group">
                    <label htmlFor="reset-email">{t("email")}</label>
                    <input
                      type="email"
                      id="reset-email"
                      value={resetEmail}
                      onChange={handleResetEmailChange}
                      placeholder={t("enter_email")}
                      disabled={resetLoading}
                    />
                  </div>
                </div>
              )}

              {resetStep === 2 && (
                <div className="reset-step">
                  <div className="reset-step-icon">
                    <FaKey />
                  </div>
                  <h3>{t("enter_verification_code")}</h3>
                  <p>{t("verification_code_sent_to_email")}</p>

                  <div className="verification-code-inputs">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                        ref={(el) => (codeInputRefs.current[index] = el)}
                        disabled={resetLoading}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    ))}
                  </div>
                </div>
              )}

              {resetStep === 3 && (
                <div className="reset-step">
                  <div className="reset-step-icon">
                    <FaUnlock />
                  </div>
                  <h3>{t("create_new_password")}</h3>
                  <p>{t("enter_new_password")}</p>

                  <div className="form-group">
                    <label htmlFor="new-password">{t("new_password")}</label>
                    <input
                      type="password"
                      id="new-password"
                      name="new_password"
                      value={newPasswordData.new_password}
                      onChange={handleNewPasswordChange}
                      placeholder={t("enter_new_password")}
                      disabled={resetLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirm-new-password">{t("confirm_password")}</label>
                    <input
                      type="password"
                      id="confirm-new-password"
                      name="confirm_password"
                      value={newPasswordData.confirm_password}
                      onChange={handleNewPasswordChange}
                      placeholder={t("confirm_new_password")}
                      disabled={resetLoading}
                    />
                  </div>
                </div>
              )}

              {resetError && (
                <div className="reset-error">
                  <FaExclamationTriangle /> {resetError}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseResetModal} disabled={resetLoading}>
                {t("cancel")}
              </button>

              {resetStep === 1 && (
                <button className="btn btn-primary" onClick={handleSubmitEmail} disabled={resetLoading}>
                  {resetLoading ? (
                    <>
                      <FaSpinner className="spinner" /> {t("sending")}...
                    </>
                  ) : (
                    t("send_code")
                  )}
                </button>
              )}

              {resetStep === 2 && (
                <button
                  className="btn btn-primary"
                  onClick={handleSubmitCode}
                  disabled={resetLoading || verificationCode.join("").length !== 6}
                >
                  {resetLoading ? (
                    <>
                      <FaSpinner className="spinner" /> {t("verifying")}...
                    </>
                  ) : (
                    t("verify_code")
                  )}
                </button>
              )}

              {resetStep === 3 && (
                <button className="btn btn-primary" onClick={handleSubmitNewPassword} disabled={resetLoading}>
                  {resetLoading ? (
                    <>
                      <FaSpinner className="spinner" /> {t("resetting")}...
                    </>
                  ) : (
                    t("reset_password")
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successModalProps.title}
        message={successModalProps.message}
        autoClose={true}
        autoCloseTime={3000}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmModalProps.onConfirm}
        title={confirmModalProps.title}
        message={confirmModalProps.message}
        confirmText={confirmModalProps.confirmText}
        cancelText={confirmModalProps.cancelText}
        type={confirmModalProps.type}
        isLoading={saving}
      />
    </div>
  )
}
