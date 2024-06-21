import React, { useState } from 'react';
import { Button, Container, Paper, TextInput, Title, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: ''
  });

  const handleChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put(`/api/users/${user.id}`, profileData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <Container size="sm" padding="md">
      <Paper padding="md" shadow="sm">
        <Title order={2}>Edit Profile</Title>
        <TextInput
          label="Email"
          value={profileData.email}
          onChange={(event) => handleChange('email', event.currentTarget.value)}
        />
        <TextInput
          label="First Name"
          value={profileData.firstName}
          onChange={(event) => handleChange('firstName', event.currentTarget.value)}
        />
        <TextInput
          label="Last Name"
          value={profileData.lastName}
          onChange={(event) => handleChange('lastName', event.currentTarget.value)}
        />
        <TextInput
          label="Mobile Number"
          value={profileData.mobileNumber}
          onChange={(event) => handleChange('mobileNumber', event.currentTarget.value)}
        />
        <Group position="right" mt="md">
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </Group>
      </Paper>
    </Container>
  );
}

export default EditProfile;
