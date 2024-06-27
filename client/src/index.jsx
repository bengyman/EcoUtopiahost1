import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/AuthContext.jsx';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// Pages and components
import App from './pages/App.jsx';
import TestPage from './pages/TestPage.jsx';
import Courses from './pages/Courses.jsx';
import ViewCourse from './pages/ViewCourse.jsx';
import Navbar from './components/Navbar.jsx';
import Registration from './pages/Registration.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import EditProfile from './pages/EditProfile.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import ResetPasswordEnterEmail from './pages/ResetPasswordEnterEmail.jsx';
import ResetPasswordEnterCode from './pages/ResetPasswordEnterCode.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import PasswordResetSuccess from './pages/ResetPasswordSuccess.jsx';
import AccountManagement from './pages/AccountManagement.jsx';

import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'
import '@mantine/core/styles.css';
import { Box, MantineProvider, createTheme, rem } from '@mantine/core'


const theme = createTheme({
  //primaryColor: 'violet'
  colors: {
    /* Add your custom colors here */
    deepBlue: [
      '#eef3ff',
      '#dce4f5',
      '#b9c7e2',
      '#94a8d0',
      '#748dc1',
      '#5f7cb8',
      '#5474b4',
      '#44639f',
      '#39588f',
      '#2d4b81',
    ],
  },

  shadows: {
    md: '1px 1px 3px rgba(0, 0, 0, .25)',
    xl: '5px 5px 3px rgba(0, 0, 0, .25)',
  },

  headings: {
    fontFamily: 'Roboto, sans-serif',
    sizes: {
      h1: { fontSize: rem(36) },
    },
  },
})

function Main() {
  return (
    <>
      <Navbar />
      <Box padding="xl" style={{marginTop: '70px'}} />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:courseId" element={<ViewCourse />} />
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/edit-profile/:id" element={<EditProfile />} />
        <Route path="/change-password/:id" element={<ChangePassword />} />
        <Route path="/reset-password-email" element={<ResetPasswordEnterEmail />} />
        <Route path="/reset-password-code" element={<ResetPasswordEnterCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/password-reset-success" element={<PasswordResetSuccess />} />
        <Route path="/account-management" element={<AccountManagement/>} />
      </Routes>
    </>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
        <AuthProvider>
          <BrowserRouter>
            <Main />
          </BrowserRouter>
        </AuthProvider>
    </MantineProvider>
  </React.StrictMode>
)