import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Box, Title, Alert, Container, Group, Anchor, Paper } from '@mantine/core';
import { useAuth } from '../context/AuthContext';

function Login() {
  // const { executeRecaptcha } = useGoogleReCaptcha();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (values) => {
    // if (!executeRecaptcha) {
    //   setError('Recaptcha is not ready');
    //   return;
    // }

    try {
      // const recaptchaToken = await executeRecaptcha('login');
      await login(values.email, values.password);
      setError(''); // Clear any previous errors
      navigate('/test'); // Navigate to profile only on successful login
    } catch (err) {
      setError('Failed to login');
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
          <Anchor component="button" type="button" color="dimmed" size="xs">
            Forgot password?
          </Anchor>
          <Anchor component="button" type="button" color="dimmed" size="xs" onClick={() => navigate('/register')}>
            Create an account
          </Anchor>
        </Group>
      </Paper>
    </Container>
  );
}

export default Login;
