"use client"

import { useEffect } from "react"
import { FaTimes, FaCheck } from "react-icons/fa"

const SuccessModal = ({ isOpen, onClose, title, message, autoClose = true, autoCloseTime = 3000 }) => {
    useEffect(() => {
        let timer
        if (isOpen && autoClose) {
            timer = setTimeout(() => {
                onClose()
            }, autoCloseTime)
        }

        return () => {
            if (timer) clearTimeout(timer)
        }
    }, [isOpen, onClose, autoClose, autoCloseTime])

    if (!isOpen) return null

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div className="success-modal-overlay" onClick={handleOverlayClick}>
            <div className="success-modal">
                <div className="success-modal-header">
                    <div className="success-modal-icon">
                        <FaCheck />
                    </div>
                    <h3>{title}</h3>
                    <button className="success-modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="success-modal-body">
                    <p>{message}</p>
                </div>
                <div className="success-modal-footer">
                    <button className="success-modal-btn" onClick={onClose}>
                        OK
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SuccessModal
