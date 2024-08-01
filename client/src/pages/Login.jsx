import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Title, Alert, Container, Group, Anchor, Paper } from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import withRecaptcha from '../components/withRecaptcha';
import { auth, googleProvider, githubProvider, signInWithPopup } from '../components/Firebase';

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

      const user = await login(values.email, values.password, recaptchaToken);

      if (user.is_deleted) {
        setError('Account is Invalid');
        return;
      }

      setError('');
      console.log('Login successful, redirecting to profile:', user.user_id);

      if (!user.is_activated) {
        navigate('/account-activation');
      } else if (user.role === 'STAFF') {
        navigate('/account-management');
      } else {
        navigate(`/profile/${user.user_id}`);
      }

    } catch (err) {
      setError('Failed to login');
      console.error('Login failed:', err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('Google login successful, redirecting to profile:', user.uid);
      navigate(`/profile/${user.uid}`);
    } catch (err) {
      setError('Google login failed');
      console.error('Google login failed:', err);
    }
  };

  const handleGithubLogin = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      console.log('GitHub login successful, redirecting to profile:', user.uid);
      navigate(`/profile/${user.uid}`);
    } catch (err) {
      setError('GitHub login failed');
      console.error('GitHub login failed:', err);
    }
  };

  return (
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
          <Button onClick={handleGoogleLogin}>Sign in with Google</Button>
        </Group>
        <Group position="center" mt="xl">
          <Button onClick={handleGithubLogin}>Sign in with GitHub</Button>
        </Group>
      </Paper>
    </Container>
  );
}

export default withRecaptcha(Login);
