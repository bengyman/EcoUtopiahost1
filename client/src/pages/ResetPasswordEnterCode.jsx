import React, { useState } from 'react';
import { TextInput, Button, Container, Title, Alert } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function ResetPasswordEnterCode() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};

  const handleSubmit = async () => {
    try {
      const response = await axios.post('/user/validate-reset-code', { email, code });
      setError('');
      navigate('/reset-password', { state: { email, code } });
    } catch (error) {
      setError('Invalid reset code');
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
      {error && <Alert color="red">{error}</Alert>}
      <Button fullWidth mt="md" onClick={handleSubmit}>
        Validate Code
      </Button>
    </Container>
  );
}

export default ResetPasswordEnterCode;
