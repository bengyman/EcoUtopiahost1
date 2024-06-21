import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Set the base URL for Axios using environment variable
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

  const login = async (email, password, recaptchaToken) => {
    try {
      const response = await axios.post('/user/login', { email, password, recaptchaToken });
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (formData, recaptchaToken) => {
    try {
      const response = await axios.post('/user/register', { ...formData, recaptchaToken });
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
