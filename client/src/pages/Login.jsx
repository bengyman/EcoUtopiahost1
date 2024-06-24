import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Box, Title, Alert, Container, Group, Anchor, Paper } from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

function Login() {
  const { executeRecaptcha } = useGoogleReCaptcha();
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
    try {
      const recaptchaToken = await executeRecaptcha('login');
      const user = await login(values.email, values.password, recaptchaToken);
      setError(''); // Clear any previous errors
      console.log('Login successful, redirecting to profile:', user.user_id);
      navigate(`/profile/${user.user_id}`); // Navigate to profile with user ID
    } catch (err) {
      setError('Failed to login');
      console.error('Login failed:', err);
  };
    
    useEffect(() => {
      document.title = 'Login - EcoUtopia';
    }, []);

  return (
    <Container size={420} my={40}>
      <Title align="center" style={{ color: '#003F2D', fontWeight: 700 }}>
        Sign In
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
          <Anchor component="button" type="button" c="blue" size="xs">
            Forgot password?
          </Anchor>
          <Anchor component="button" type="button" c="blue" size="xs" onClick={() => navigate('/register')}>
            Create an account
          </Anchor>
        </Group>
      </Paper>
    </Container>
  );
}

export default Login;