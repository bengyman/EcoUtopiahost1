import React, { useState } from 'react';
import { TextInput, PasswordInput, Button, Container, Paper, Group, Title, Box, Alert, NumberInput } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import withRecaptcha from '../../components/withRecaptcha';
import { googleProvider, githubProvider } from '../../components/Firebase';
import { FaGoogle, FaGithub } from 'react-icons/fa';

function Registration() {
  const navigate = useNavigate();
  const { register, loginWithOAuth } = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      contactNumber: ''
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First Name is required'),
      lastName: Yup.string().required('Last Name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[a-z]/, 'Password must contain at least one lowercase character')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase character')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required'),
      contactNumber: Yup.string()
        .matches(/^\+?\d{1,3}?\d{7,14}$/, "Please enter a valid contact number with an optional country code")
        .required('Contact Number is required')
    }),
    onSubmit: async (values) => {
      try {
        const recaptchaToken = await executeRecaptcha('register');
        await register({ ...values, recaptchaToken });
        navigate('/login');
      } catch (error) {
        setError('Registration failed');
        console.error('Registration failed:', error);
      }
    }
  });

  const handleOAuthLogin = async (provider) => {
    try {
      const newUser = await loginWithOAuth(provider);
      navigate(`/profile/${newUser.user_id}`);
    } catch (err) {
      setError(`${provider.providerId} login failed`);
      console.error(`${provider.providerId} login failed:`, err);
    }
  };

  return (
    <Container size="xs" my={40}>
      <Title align="center" style={{ color: '#003F2D', fontWeight: 700 }}>
        Welcome to EcoUtopia
      </Title>
      <Box my="md" align="center" style={{ color: 'red', fontWeight: 700 }}>
        Password Criteria:
        <ul>
          <li>Minimum 8 Alphanumeric Characters</li>
          <li>Minimum 1 Lowercase Character</li>
          <li>Minimum 1 Uppercase Character</li>
          <li>Minimum 1 Number</li>
        </ul>
      </Box>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={formik.handleSubmit}>
          <TextInput
            label="First Name"
            name="firstName"
            required
            value={formik.values.firstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.firstName && formik.errors.firstName}
          />
          <TextInput
            label="Last Name"
            name="lastName"
            required
            value={formik.values.lastName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.lastName && formik.errors.lastName}
          />
          <TextInput
            label="Email"
            name="email"
            required
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && formik.errors.email}
          />
          <PasswordInput
            label="Password"
            name="password"
            required
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && formik.errors.password}
          />
          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            required
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirmPassword && formik.errors.confirmPassword}
          />
          <TextInput
            label="Contact Number"
            name="contactNumber"
            required
            value={formik.values.contactNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.contactNumber && formik.errors.contactNumber}
          />
          {error && <Alert title="Error" color="red" mt="md">{error}</Alert>}
          <Group position="center" mt="md">
            <Button type="submit" fullWidth mt="md">
              Register
            </Button>
          </Group>
        </form>
        <Group position="center" mt="md" spacing="md" grow>
          <Button onClick={() => handleOAuthLogin(googleProvider)} color="green" fullWidth>
            <FaGoogle style={{ marginRight: 8 }} />
            Sign In
          </Button>
          <Button onClick={() => handleOAuthLogin(githubProvider)} color="dark" fullWidth>
            <FaGithub style={{ marginRight: 8 }} />
            Sign In
          </Button>
        </Group>
        <Group position="center" mt="md">
          <Button variant="subtle" onClick={() => navigate('/login')}>
            Already have an account? Sign In
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}

export default withRecaptcha(Registration);
