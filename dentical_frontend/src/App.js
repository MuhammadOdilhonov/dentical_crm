import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { LanguageProvider } from "./contexts/LanguageContext"
import Home from "./pages/home/Home"
import Login from "./pages/login/Login"
import SignUp from "./pages/signUp/SignUp"
import RequestAccess from "./pages/requestAccess/RequestAccess"
import Dashboard from "./pages/dashboard/Dashboard"
import NotFound from "./pages/notFount/NotFount"
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute"
import "./styles/styles.scss"
import AppointmentDetailsResult from "./components/appointmentDetailsResult/AppointmentDetailsResult"
import AppointmentDetails from "./components/appointmentDetails/AppointmentDetails"
import AcceptanceCheck from "./components/acceptanceCheck/AcceptanceCheck"
import Target from "./pages/target/Target"

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/target" element={<Target />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/request-access" element={<RequestAccess />} />
            <Route path="/meeting/:meetingId/:patientId" element={<AcceptanceCheck />} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/appointment-details/:id" element={<AppointmentDetails />} />
            <Route path="/appointment-details-result/:id" element={<AppointmentDetailsResult />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  )
}

export default App
