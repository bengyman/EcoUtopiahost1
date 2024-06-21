import React, { useState, useEffect } from 'react';
import { Button, Container, Paper, Text, Title, TextInput, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/api/users/${user.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setProfileData(response.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  return (
    <Container size="sm" padding="md">
      <Paper padding="md" shadow="sm">
        <Title order={2}>User Profile</Title>
        <Text>{profileData.email}</Text>
        <Text>First Name: {profileData.firstName}</Text>
        <Text>Last Name: {profileData.lastName}</Text>
        <Text>Mobile Number: {profileData.mobileNumber}</Text>
        <Group position="apart" mt="md">
          <Button variant="outline" onClick={() => navigate('/edit-profile')}>Edit Profile</Button>
          <Button color="red" onClick={() => logout()}>Logout</Button>
        </Group>
      </Paper>
    </Container>
  );
}

export default Profile;
