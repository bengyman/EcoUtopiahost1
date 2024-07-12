import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (email, password, recaptchaToken) => {
    try {
      const response = await axios.post('/user/login', { email, password, recaptchaToken });
      const { user, token, resident, staff } = response.data;
      const userData = {
        ...user,
        resident,
        staff,
      };
      setUser(userData);
      setToken(token);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Login successful, token stored:', token);
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (formData) => {
    try {
      const response = await axios.post('/user/register', formData);
      const { user, token, resident, staff } = response.data;
      const userData = {
        ...user,
        resident,
        staff,
      };
      setUser(userData);
      setToken(token);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Registration successful, token stored:', token);
      return user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    console.log('Logout successful, token removed');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
