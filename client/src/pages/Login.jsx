import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Title, Alert, Container, Group, Anchor, Paper } from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import withRecaptcha from '../components/withRecaptcha';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [error, setError] = useState('');

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (values) => {
    try {
      if (!executeRecaptcha) {
        setError('ReCaptcha not ready');
        return;
      }

      const recaptchaToken = await executeRecaptcha('login');
      if (!recaptchaToken) {
        setError('ReCaptcha failed');
        return;
      }

      // Attempt to log in
      const user = await login(values.email, values.password, recaptchaToken);

      // Check if the account is soft-deleted
      if (user.is_deleted) {
        setError('Account is Invalid');
        return;
      }

      setError(''); // Clear any previous errors
      console.log('Login successful, redirecting to profile:', user.user_id);

      // Redirect based on user activation status and role
      if (!user.is_activated) {
        navigate('/account-activation'); // Navigate to Account Activation page if user is not activated
      } else if (user.role === 'STAFF') {
        navigate('/account-management'); // Navigate to Account Management page for staff
      } else {
        navigate(`/profile/${user.user_id}`); // Navigate to profile with user ID for other users
      }

    } catch (err) {
      setError('Failed to login');
      console.error('Login failed:', err);
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    try {
      const res = await fetch('/api/users/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
      });
      const data = await res.json();
      if (data.user) {
        console.log('Google login successful, redirecting to profile:', data.user.user_id);
        navigate(`/profile/${data.user.user_id}`);
      } else {
        setError('Google login failed');
      }
    } catch (err) {
      setError('Google login failed');
      console.error('Google login failed:', err);
    }
  };

  const handleGoogleLoginError = () => {
    setError('Google login failed');
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Container size={420} my={40}>
        <Title align="center" style={{ color: '#003F2D', fontWeight: 700 }}>
          Welcome to EcoUtopia
        </Title>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Email"
              placeholder="you@example.com"
              required
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              {...form.getInputProps('password')}
              mt="md"
            />
            {error && <Alert title="Error" color="red" mt="md">{error}</Alert>}
            <Button type="submit" fullWidth mt="xl" size="md">
              Sign In
            </Button>
          </form>
          <Group position="apart" mt="md">
            <Anchor component="button" type="button" color="dimmed" size="xs" onClick={() => navigate('/reset-password-email')}>
              Forgot password?
            </Anchor>
            <Anchor component="button" type="button" color="dimmed" size="xs" onClick={() => navigate('/register')}>
              Create an account
            </Anchor>
          </Group>
          <Group position="center" mt="xl">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
          </Group>
        </Paper>
      </Container>
    </GoogleOAuthProvider>
  );
}

export default withRecaptcha(Login);
