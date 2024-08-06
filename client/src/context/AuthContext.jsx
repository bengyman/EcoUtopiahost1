import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { auth, googleProvider, githubProvider, signInWithPopup } from '../components/Firebase';

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
      const { user, token, resident, staff, instructor } = response.data;
      const userData = {
        ...user,
        resident,
        staff,
        instructor,
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
      if (instructor) {
        console.log('Instructor ID:', instructor.instructor_id);
        console.log('Instructor Name:', instructor.name);
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
      const { user, token, resident, staff, instructor } = response.data;
      const userData = {
        ...user,
        resident,
        staff,
        instructor,
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
      if (instructor) {
        console.log('Instructor ID:', instructor.instructor_id);
        console.log('Instructor Name:', instructor.name);
      }
      return user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const loginWithOAuth = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const response = await axios.post('/user/oauth-login', {
        email: user.email,
        firstName: user.displayName.split(' ')[0],
        lastName: user.displayName.split(' ')[1] || 'User',
      });

      const { user: newUser, token, resident, staff, instructor } = response.data;
      const userData = {
        ...newUser,
        resident,
        staff,
        instructor,
      };
      setUser(userData);
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return newUser;
    } catch (error) {
      console.error('OAuth login failed:', error);
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
    <AuthContext.Provider value={{ user, login, register, loginWithOAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
