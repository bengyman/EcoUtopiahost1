import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Text } from '@mantine/core';

function PasswordResetSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Container size="xs">
      <Title align="center">Password Reset Successfully</Title>
      <Text align="center">You will be redirected to the login page shortly.</Text>
    </Container>
  );
}

export default PasswordResetSuccess;
