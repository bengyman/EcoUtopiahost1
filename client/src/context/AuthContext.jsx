import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');
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
      const { user, token, resident, staff } = response.data;
      const userData = {
        ...user,
        resident,
        staff,
      };
      setUser(userData);
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Login successful, token stored:', token);
      console.log('User role:', user.role);
      if (resident) {
        console.log('Resident ID:', resident.resident_id);
        console.log('Resident Name:', resident.name);
      }
      if (staff) {
        console.log('Staff ID:', staff.staffid);
        console.log('Staff Name:', staff.name);
      }
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
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Registration successful, token stored:', token);
      console.log('User role:', user.role);
      if (resident) {
        console.log('Resident ID:', resident.resident_id);
        console.log('Resident Name:', resident.name);
      }
      if (staff) {
        console.log('Staff ID:', staff.staffid);
        console.log('Staff Name:', staff.name);
      }
      return user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    console.log('Logout successful, token removed');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
