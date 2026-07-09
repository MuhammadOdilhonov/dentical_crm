"use client"

import { createContext, useContext, useState, useEffect } from "react"
import ApiLogin from "../api/apiLogin"
import ApiBranches from "../api/apiBranches"

// Create auth context
const AuthContext = createContext()

// Auth provider component
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedBranch, setSelectedBranch] = useState(localStorage.getItem("selectedBranch") || "all")
    const [branchesData, setBranchesData] = useState([])
    const [token, setToken] = useState(null)
    const [loginInProgress, setLoginInProgress] = useState(false) // Login jarayoni holati

    // Fetch branches when component mounts
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const branches = await ApiBranches.fetchBranches()
                setBranchesData(branches)
            } catch (error) {
                console.error("Error fetching branches in AuthContext:", error)
            }
        }

        fetchBranches()
    }, [])

    useEffect(() => {
        // Set loading to true at the beginning
        setLoading(true)

        // Check if user is logged in from localStorage
        const storedUser = localStorage.getItem("user")
        const storedToken = localStorage.getItem("token")

        if (storedUser && storedToken) {
            try {
                const parsedUser = JSON.parse(storedUser)
                setUser(parsedUser)
                setToken(storedToken)
            } catch (error) {
                console.error("Error parsing user data:", error)
                localStorage.removeItem("user") // Remove invalid data
                localStorage.removeItem("token") // Remove token
                setUser(null)
                setToken(null)
            }
        } else {
            setUser(null)
            setToken(null)
        }

        // Check if branch is stored in localStorage
        const storedBranch = localStorage.getItem("selectedBranch")
        if (storedBranch) {
            setSelectedBranch(storedBranch)
        }

        // Set loading to false after everything is done
        setLoading(false)
    }, []) // Faqat bir marta ishga tushirish

    // Login function
    const login = async (userData) => {
        // Agar login jarayoni allaqachon ketayotgan bo'lsa, qayta chaqirmaslik
        if (loginInProgress) {
            console.log("Login already in progress, ignoring duplicate call")
            return
        }

        try {
            setLoginInProgress(true) // Login jarayoni boshlandi
            console.log("AuthContext login started")

            // Login jarayoni
            const response = await ApiLogin.loginUser(userData)

            if (response && response.user && response.token) {
                setUser(response.user)
                setToken(response.token)
                console.log("AuthContext login successful")
                return response.user
            } else {
                throw new Error("Login response is missing user or token data")
            }
        } catch (error) {
            console.error("Login error in AuthContext:", error)
            return Promise.reject(error)
        } finally {
            setLoginInProgress(false) // Login jarayoni tugadi
        }
    }

    // Logout function
    const logout = () => {
        try {
            ApiLogin.logoutUser()
            setUser(null)
            setToken(null)
        } catch (error) {
            console.error("Logout error:", error)
            // Even if API fails, clear local data
            setUser(null)
            setToken(null)
        }
    }

    // Check user role
    const hasRole = (role) => {
        if (!user) return false

        // Agar role string bo'lsa
        if (typeof role === "string") {
            return user.role === role
        }

        // Agar role array bo'lsa (bir nechta rollarni tekshirish uchun)
        if (Array.isArray(role)) {
            return role.includes(user.role)
        }

        return false
    }

    // Change branch
    const changeBranch = (branchId) => {
        setSelectedBranch(branchId)
        localStorage.setItem("selectedBranch", branchId)
        // You might want to refresh data or perform other actions when branch changes
    }

    // Get current branch name
    const getCurrentBranchName = () => {
        if (selectedBranch === "all-filial") {
            return "Barcha filiallar"
        }

        const branch = branchesData.find((b) => b.id.toString() === selectedBranch)
        return branch ? branch.name : "Filial tanlanmagan"
    }

    // Check if user is authenticated
    const isAuthenticated = () => {
        return !!user && !!token
    }

    // Context value
    const value = {
        user,
        token,
        loading,
        login,
        logout,
        hasRole,
        selectedBranch,
        changeBranch,
        isAuthenticated,
        branchesData,
        getCurrentBranchName,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
    return useContext(AuthContext)
}
