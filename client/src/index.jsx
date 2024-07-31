import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/AuthContext.jsx';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

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
import AccountActivation from './pages/AccountActivation.jsx'
import Orders from './pages/Orders';
import EditOrders from './pages/EditOrders';
import OrderDetails from './pages/OrderDetails';
import AdminOrders from './pages/AdminOrders';
import Success from './pages/Success.jsx';

import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'
import '@mantine/core/styles.css';
import { Box, MantineProvider, createTheme, rem } from '@mantine/core'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

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
      <Box padding="xl" style={{ marginTop: '70px' }} />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:courseId" element={<ViewCourse />} />
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/:paramId" element={<Profile />} />
        <Route path="/edit-profile/:id" element={<EditProfile />} />
        <Route path="/change-password/:id" element={<ChangePassword />} />
        <Route path="/reset-password-email" element={<ResetPasswordEnterEmail />} />
        <Route path="/reset-password-code" element={<ResetPasswordEnterCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/password-reset-success" element={<PasswordResetSuccess />} />
        <Route path="/account-management" element={<AccountManagement />} />
        <Route path="/account-activation" element={<AccountActivation />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/editorders/:orderId" element={<EditOrders />} />
        <Route path="/orderdetails/:orderId" element={<OrderDetails />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
        <AuthProvider>
          <Elements stripe={stripePromise}>
            <BrowserRouter>
              <Main />
            </BrowserRouter>
          </Elements>
        </AuthProvider>
      </GoogleReCaptchaProvider>
    </MantineProvider>
  </React.StrictMode>
)