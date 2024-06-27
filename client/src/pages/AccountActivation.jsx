import React, { useState } from 'react';
import { TextInput, Button, Container, Title, Alert, Center, Box } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function AccountActivation() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = user?.email || '';
  const user_id = user?.user_id;

  const handleSubmit = async () => {
    try {
      await axios.post('/user/activate-account', { email, code });
      setError('');
      setMessage('Account activated successfully');
      setTimeout(() => navigate('/login'), 2000); // Redirect to login after 2 seconds
    } catch (error) {
      setError('Invalid or expired activation code');
    }
  };

  const handleResendCode = async () => {
    try {
      await axios.post('/user/activate', { email });
      setMessage('Activation code resent. Please check your email.');
    } catch (error) {
      setError('Failed to resend activation code');
    }
  };

  return (
    <Container size="xs">
      <Title align="center">Activate Your Account</Title>
      <Center style={{ height: '80vh' }}>
        <Box style={{ width: '100%' }}>
          <TextInput
            label="Activation Code"
            placeholder="Enter the code sent to your email"
            value={code}
            onChange={(event) => setCode(event.currentTarget.value)}
            required
            mt="md"
          />
          {error && <Alert color="red" mt="md">{error}</Alert>}
          {message && <Alert color="green" mt="md">{message}</Alert>}
          <Button fullWidth mt="md" onClick={handleSubmit}>
            Activate Account
          </Button>
          <Button fullWidth mt="md" onClick={handleResendCode} variant="outline">
            Resend Activation Code
          </Button>
        </Box>
      </Center>
    </Container>
  );
}

export default AccountActivation;
