import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check expiry
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser(decoded);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    localStorage.setItem('token', token);
                }
            } catch (error) {
                logout();
            }
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            setUser(null);
        }
        setLoading(false); // Set loading to false after initialization
    }, [token]);

    const login = async (username, password) => {
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await axios.post('http://localhost:8000/api/v1/auth/login', formData);
            const newToken = response.data.access_token;

            // Set state immediately to avoid race condition with ProtectedRoute
            localStorage.setItem('token', newToken);
            const decoded = jwtDecode(newToken);
            setUser(decoded);
            setToken(newToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            return true;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const studentLogin = async (imageFile) => {
        try {
            const formData = new FormData();
            formData.append('file', imageFile);

            const response = await axios.post('http://localhost:8000/api/v1/auth/student/identify', formData);
            // This endpoint (student/identify) isn't used in my recent StudentLogin.jsx...
            // StudentLogin.jsx calls /api/v1/students/verify manually!
            // I should verify if StudentLogin uses this provider function or not.
            // Looking at StudentLogin.jsx: 
            // const { login } = useAuth(); 
            // ...calls axios.post('http://localhost:8000/api/v1/students/verify', ...)
            // ...then localStorage.setItem('token', access_token);
            // ...then navigate('/student/dashboard');

            // So StudentLogin.jsx COMPLETELY BYPASSES AuthProvider's state updates!
            // It sets localStorage but DOES NOT call setToken or setUser.
            // AuthProvider's useEffect picks up localStorage change? NO! 
            // Storage event only fires for other tabs, or if we use a hook that listens to it.
            // But AuthProvider initializes state from localStorage on MOUNT.
            // It does NOT listed to localStorage changes.

            // This explains why it fails first time (context state is empty), 
            // then works second time (maybe page reload or something triggers mount?).

            // FIX: StudentLogin.jsx should call a method in AuthProvider to update state.
            // I will create a `setAuthData` or `handleLoginSuccess` method in AuthProvider.

            return true;
        } catch (error) {
            console.error("Face login failed", error);
            throw error;
        }
    };

    // New helper to be used by StudentLogin.jsx
    const setAuthData = (newToken) => {
        localStorage.setItem('token', newToken);
        const decoded = jwtDecode(newToken);
        setUser(decoded);
        setToken(newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    };

    const logout = () => {
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, studentLogin, logout, loading, setAuthData }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
