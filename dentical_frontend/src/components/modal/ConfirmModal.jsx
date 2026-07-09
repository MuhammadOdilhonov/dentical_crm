"use client"
import { FaTimes, FaExclamationTriangle, FaCheck, FaTrash } from "react-icons/fa"

const ConfirmModal = ({
    isOpen = true, // Default true qilish
    onClose,
    onConfirm,
    onCancel, // onCancel prop qo'shish
    title,
    message,
    confirmText,
    cancelText,
    type = "warning",
    isLoading = false,
}) => {
    if (!isOpen) return null

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            if (onClose) onClose()
            if (onCancel) onCancel()
        }
    }

    const handleConfirm = () => {
        console.log("Confirm action triggered")
        if (typeof onConfirm === "function") {
            onConfirm()
        }
    }

    const handleCancel = () => {
        if (onClose) onClose()
        if (onCancel) onCancel()
    }

    return (
        <div className="confirm-modal-overlay" onClick={handleOverlayClick}>
            <div className="confirm-modal">
                <div className={`confirm-modal-header ${type}`}>
                    <div className="confirm-modal-icon">
                        {type === "warning" && <FaExclamationTriangle />}
                        {type === "success" && <FaCheck />}
                        {type === "danger" && <FaTrash />}
                    </div>
                    <h3>{title}</h3>
                    <button className="confirm-modal-close" onClick={handleCancel}>
                        <FaTimes />
                    </button>
                </div>
                <div className="confirm-modal-body">
                    <p>{message}</p>
                </div>
                <div className="confirm-modal-footer">
                    <button className="confirm-modal-btn confirm-modal-cancel" onClick={handleCancel}>
                        {cancelText}
                    </button>
                    <button className={`confirm-modal-btn confirm-modal-${type}`} onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? `${confirmText}...` : confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal
