import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Set the base URL for Axios using environment variable
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

  // Retrieve the token and user from localStorage if they exist
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  const login = async (email, password, recaptchaToken) => {
    try {
      const response = await axios.post('/user/login', { email, password, recaptchaToken });
      const { user, token } = response.data;
      setUser(user);
      localStorage.setItem('token', token); // Store the token in localStorage
      localStorage.setItem('user', JSON.stringify(user)); // Store the user in localStorage
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Set the token in Axios headers
      console.log('Login successful, token stored:', token);
      return user; // Return the user object
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (formData) => {
    try {
      const response = await axios.post('/user/register', formData);
      const { user, token } = response.data;
      setUser(user);
      localStorage.setItem('token', token); // Store the token in localStorage
      localStorage.setItem('user', JSON.stringify(user)); // Store the user in localStorage
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Set the token in Axios headers
      console.log('Registration successful, token stored:', token);
      return user; // Return the user object
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token'); // Remove the token from localStorage
    localStorage.removeItem('user'); // Remove the user from localStorage
    delete axios.defaults.headers.common['Authorization']; // Remove the token from Axios headers
    console.log('Logout successful, token removed');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
