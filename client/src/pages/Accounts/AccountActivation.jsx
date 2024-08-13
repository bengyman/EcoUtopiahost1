import React, { useState } from 'react';
import { Button, Container, Title, Alert, Center, Box } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

function AccountActivation() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = user?.email || '';

  const handleResendLink = async () => {
    if (!email) {
      setError('Please log in to resend the activation link.');
      setTimeout(() => navigate('/login'), 2000); // Redirect to login page after 2 seconds
      return;
    }

    try {
      await axios.post('/user/activate', { email });
      setMessage('Activation link resent. Please check your email.');
    } catch (error) {
      setError('Failed to resend activation link. Please try again later.');
    }
  };

  return (
    <Container size="xs">
      <Title align="center">Activate Your Account</Title>
      <Center style={{ height: '80vh' }}>
        <Box style={{ width: '100%' }}>
          {error && <Alert color="red" mt="md">{error}</Alert>}
          {message && <Alert color="green" mt="md">{message}</Alert>}
          <Button fullWidth mt="md" onClick={handleResendLink}>
            Resend Activation Link
          </Button>
        </Box>
      </Center>
    </Container>
  );
}

export default AccountActivation;
