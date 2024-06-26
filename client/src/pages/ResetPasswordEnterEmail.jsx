import React, { useState } from 'react';
import { TextInput, Button, Container, Title, Alert } from '@mantine/core';
import axios from 'axios';

function ResetPasswordEnterEmail() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    try {
      await axios.post('/user/password-reset', { email });
      setSuccess('Reset code sent to your email');
      setError('');
    } catch (error) {
      setError('Failed to send reset code');
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
        Send Reset Code
      </Button>
    </Container>
  );
}

export default ResetPasswordEnterEmail;
