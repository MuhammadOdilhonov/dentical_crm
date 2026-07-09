"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { isAuthenticated, loading, user } = useAuth()

    // Agar loading bo'lsa, hech narsa ko'rsatmaymiz
    if (loading) {
        return <div className="loading">Yuklanmoqda...</div>
    }

    // Agar foydalanuvchi tizimga kirmagan bo'lsa, login sahifasiga yo'naltiramiz
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />
    }

    // Agar allowedRoles berilgan bo'lsa va foydalanuvchi roli ruxsat etilmagan bo'lsa
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Foydalanuvchini o'z rolining dashboard sahifasiga yo'naltirish
        const dashboardPath = `/dashboard/${user.role}`
        return <Navigate to={dashboardPath} replace />
    }

    // Agar foydalanuvchi tizimga kirgan bo'lsa va roli ruxsat etilgan bo'lsa, children ni ko'rsatamiz
    return children
}
