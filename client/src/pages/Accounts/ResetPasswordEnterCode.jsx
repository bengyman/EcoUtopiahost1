import React, { useState } from 'react';
import { TextInput, Button, Container, Title, Alert } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function ResetPasswordEnterCode() {
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};

  const handleSubmit = async () => {
    try {
      const response = await axios.post('/user/validate-reset-code', { email, code, token });
      setError('');
      navigate('/reset-password', { state: { email, code, token } });
    } catch (error) {
      setError('Invalid reset code or token');
    }
  };

  return (
    <Container size="xs">
      <Title align="center">Enter Reset Code</Title>
      <TextInput
        label="Reset Code"
        placeholder="Enter the code sent to your email"
        value={code}
        onChange={(event) => setCode(event.currentTarget.value)}
        required
      />
      <TextInput
        label="Reset Token"
        placeholder="Enter the token sent to your email"
        value={token}
        onChange={(event) => setToken(event.currentTarget.value)}
        required
      />
      {error && <Alert color="red">{error}</Alert>}
      <Button fullWidth mt="md" onClick={handleSubmit}>
        Validate Code and Token
      </Button>
    </Container>
  );
}

export default ResetPasswordEnterCode;
