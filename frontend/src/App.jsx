import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentLogin from './pages/StudentLogin';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentResults from './pages/StudentResults';
import StudentLayout from './layouts/StudentLayout';
import TestTaking from './pages/TestTaking';
import ProtectedRoute from './components/ProtectedRoute'; // Import new component
import { AuthProvider } from './auth/AuthProvider';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Removed inline ProtectedRoute definition

function AppRoutes() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/student-login" element={<StudentLogin />} />

        {/* Admin and Teacher Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="results" element={<StudentResults />} />
          <Route path="test/:testId" element={<TestTaking />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
