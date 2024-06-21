import React, { useState } from 'react';
import { TextInput, PasswordInput, Button, Container, Paper, Group, Title, Box, Alert } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

function Registration() {
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!executeRecaptcha) {
      setError('Recaptcha is not ready');
      return;
    }

    try {
      const recaptchaToken = await executeRecaptcha('register');
      const response = await axios.post('/user/register', { ...formData, recaptchaToken });
      navigate('/profile');
    } catch (error) {
      setError('Registration failed');
      console.error('Registration failed:', error);
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
        <form onSubmit={handleSubmit}>
          <TextInput
            label="First Name"
            required
            value={formData.firstName}
            onChange={(event) => setFormData({ ...formData, firstName: event.target.value })}
          />
          <TextInput
            label="Last Name"
            required
            value={formData.lastName}
            onChange={(event) => setFormData({ ...formData, lastName: event.target.value })}
          />
          <TextInput
            label="Email"
            required
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
          />
          <PasswordInput
            label="Password"
            required
            value={formData.password}
            onChange={(event) => setFormData({ ...formData, password: event.target.value })}
          />
          <PasswordInput
            label="Confirm Password"
            required
            value={formData.confirmPassword}
            onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })}
          />
          <TextInput
            label="Contact Number"
            required
            value={formData.contactNumber}
            onChange={(event) => setFormData({ ...formData, contactNumber: event.target.value })}
          />
          {error && <Alert title="Error" color="red" mt="md">{error}</Alert>}
          <Group position="center" mt="md">
            <Button type="submit" fullWidth mt="md">
              Register
            </Button>
          </Group>
        </form>
        <Group position="center" mt="md">
          <Button variant="subtle" onClick={() => navigate('/login')}>
            Already have an account? Sign In
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}

export default Registration;
