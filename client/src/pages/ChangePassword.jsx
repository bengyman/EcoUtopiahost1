import React, { useState } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Container, Paper, Title, Box, Alert } from '@mantine/core';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function ChangePassword() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const form = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validate: {
      newPassword: (value) => (value.length < 8 ? 'Password must be at least 8 characters long' : null),
      confirmPassword: (value, values) => value !== values.newPassword ? 'Passwords do not match' : null
    }
  });

  const handleSubmit = async (values) => {
    try {
      await axios.put(`/user/change-password/${id}`, values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Password changed successfully');
      setError('');
      form.reset();
      setTimeout(() => navigate(`/profile/${id}`), 2000); // Navigate to the profile page with user_id
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
      setSuccess('');
    }
  };

  return (
    <Container size="xs" my={40}>
      <Title align="center" style={{ color: '#003F2D', fontWeight: 700 }}>
        Change Password
      </Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <PasswordInput
            label="Current Password"
            placeholder="Enter current password"
            required
            {...form.getInputProps('currentPassword')}
            mt="md"
          />
          <PasswordInput
            label="New Password"
            placeholder="Enter new password"
            required
            {...form.getInputProps('newPassword')}
            mt="md"
          />
          <PasswordInput
            label="Confirm New Password"
            placeholder="Confirm new password"
            required
            {...form.getInputProps('confirmPassword')}
            mt="md"
          />
          {error && <Alert title="Error" color="red" mt="md">{error}</Alert>}
          {success && <Alert title="Success" color="green" mt="md">{success}</Alert>}
          <Button type="submit" fullWidth mt="xl">
            Change Password
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default ChangePassword;
