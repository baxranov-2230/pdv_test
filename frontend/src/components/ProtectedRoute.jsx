import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const auth = useAuth();

    // Guard against auth context being undefined (shouldn't happen if wrapped correctly)
    if (!auth) {
        console.error("ProtectedRoute: useAuth() returned undefined. Component might be outside AuthProvider.");
        return <Navigate to="/login" replace />;
    }

    const { token, user, loading } = auth;

    if (loading) {
        return <div>Loading...</div>; // Or a proper spinner
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Determine user role
    let userRole = user.role;
    if (!userRole) {
        // Fallback for legacy tokens or student logic
        if (user.sub && user.sub.startsWith('student:')) {
            userRole = 'student';
        } else {
            userRole = 'admin'; // Default fallback
        }
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        // Redirect based on role if unauthorized
        if (userRole === 'student') return <Navigate to="/student/dashboard" replace />;
        if (userRole === 'teacher' || userRole === 'admin') return <Navigate to="/admin/students" replace />;
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
