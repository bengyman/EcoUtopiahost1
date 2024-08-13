import React, { useState } from 'react';
import { TextInput, Button, Container, Title, Alert } from '@mantine/core';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ResetPasswordEnterEmail() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await axios.post('/user/password-reset', { email });
      setSuccess('Password reset link sent to your email');
      setError('');
    } catch (error) {
      setError('Failed to send reset link');
      setSuccess('');
    }
  };

  return (
    <Container size="xs">
      <Title align="center">Reset Password</Title>
      <TextInput
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChange={(event) => setEmail(event.currentTarget.value)}
        required
      />
      {error && <Alert color="red">{error}</Alert>}
      {success && <Alert color="green">{success}</Alert>}
      <Button fullWidth mt="md" onClick={handleSubmit}>
        Send Reset Link
      </Button>
    </Container>
  );
}

export default ResetPasswordEnterEmail;
