import React, { useEffect, useState } from 'react';
import { Container, Title, Alert, Center, Box } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ActivateAccountLink() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  useEffect(() => {
    const activateAccount = async () => {
      try {
        const response = await axios.post(`/user/activate-account-link?token=${token}`);
        setMessage(response.data.message);
        setTimeout(() => navigate('/'), 2000); // Redirect to Homepage after 2 seconds
      } catch (error) {
        setError('Activation link is invalid or has expired.');
      }
    };

    if (token) {
      activateAccount();
    } else {
      setError('Invalid activation link.');
    }
  }, [token, navigate]);

  return (
    <Container size="xs">
      <Title align="center">Activating Your Account</Title>
      <Center style={{ height: '80vh' }}>
        <Box style={{ width: '100%' }}>
          {error && <Alert color="red" mt="md">{error}</Alert>}
          {message && <Alert color="green" mt="md">{message}</Alert>}
        </Box>
      </Center>
    </Container>
  );
}

export default ActivateAccountLink;
