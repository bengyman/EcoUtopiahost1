import React, { useState } from 'react';
import { TextInput, Button, Container, Title, Alert } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

function ResetPasswordEnterCode() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = () => {
    // Validate the code here
    // For simplicity, we assume code validation is done here
    if (code === '123456') {
      navigate('/reset-password');
    } else {
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
