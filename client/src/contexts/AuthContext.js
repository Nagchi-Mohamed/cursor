import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AuthService from '../services/AuthService';
import axios from 'axios';

// 1. Create the AuthContext
const AuthContext = createContext(null);

// 2. Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  // 3. Define state variables
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start true to handle initial load
  const [error, setError] = useState(null);

  // 4. useEffect for initial load and token changes
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken); // Ensure token state is set
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          const userData = await AuthService.getMe(storedToken); // Fetch user data
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Handle case where token is present but invalid (e.g., expired)
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.error("Failed to load user or token invalid:", err);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          // Optionally set an error state if needed, e.g., setError("Session expired. Please log in again.");
        }
      } else {
        // No token found, ensure clean state
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false); // Finished initial loading attempt
    };

    loadUser();
  }, []); // Run only once on mount

  // 5. Login function
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthService.login({ email, password });
      if (response.token && response.user) {
        const { token: newToken, user: userData } = response;
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true; // Indicate success
      } else {
        throw new Error(response.message || "Login failed: Invalid response from server");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || err.message || "An error occurred during login.";
      setError(errorMessage);
      localStorage.removeItem('token'); // Ensure no stale token
      delete axios.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return false; // Indicate failure
    }
  }, []);

  // 6. Signup function
  const signup = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthService.register(userData);
      setIsLoading(false);
      return { success: true, message: response.message || "Registration successful!" };
    } catch (err) {
      console.error("Signup error:", err);
      const errorMessage = err.response?.data?.message || err.message || "An error occurred during registration.";
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, message: errorMessage };
    }
  }, []);

  // 7. Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Optional: Call backend logout if it does anything stateful
      // await AuthService.logout();
    } catch (err) {
      console.error("Error during backend logout (if implemented):", err);
      // Continue with client-side logout even if backend call fails
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setError(null); // Clear any previous errors on logout
      setIsLoading(false);
    }
  }, []);

  // 8. Memoize the context value to prevent unnecessary re-renders
  const value = React.useMemo(() => ({
    token,
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    setError // Expose setError to allow clearing errors from components
  }), [token, user, isAuthenticated, isLoading, error, login, signup, logout]);

  // 9. Return the Provider with the value
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 10. Create a custom hook for easy context consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 