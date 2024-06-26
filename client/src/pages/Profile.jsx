import React, { useState, useEffect } from 'react';
import { Button, Container, Paper, Text, Title, Group, Avatar, Box, Grid, TextInput } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { IconPhoto } from '@tabler/icons-react';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    profilePic: ''
  });

  useEffect(() => {
    if (user && user.user_id) {
      const fetchProfile = async () => {
        try {
          const response = await axios.get(`/user/${user.user_id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          const { user: userData, resident, staff } = response.data;

          if (userData.role === 'RESIDENT' && resident) {
            setProfileData({
              email: userData.email,
              firstName: resident.name.split(' ')[0] || '',
              lastName: resident.name.split(' ')[1] || '',
              mobileNumber: resident.mobile_num || '',
              profilePic: resident.profile_pic || ''
            });
          } else if (userData.role === 'STAFF' && staff) {
            setProfileData({
              email: userData.email,
              firstName: staff.name.split(' ')[0] || '',
              lastName: staff.name.split(' ')[1] || '',
              mobileNumber: staff.mobilenum || '',
              profilePic: staff.profile_pic || ''
            });
          } else {
            setProfileData({
              email: userData.email,
              firstName: '',
              lastName: '',
              mobileNumber: '',
              profilePic: ''
            });
          }
        } catch (error) {
          console.error('Error fetching profile data:', error);
        }
      };

      fetchProfile();
    }
  }, [user]);

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);
    formData.append('userId', user.user_id);

    try {
      const response = await axios.post('/user/profile-picture', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProfileData((prevData) => ({
        ...prevData,
        profilePic: response.data.fileName,
      }));
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Container size="md" my={40}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Grid align="center">
          <Grid.Col span={4} style={{ textAlign: 'center' }}>
            <label htmlFor="profilePicInput">
              <Avatar
                src={profileData.profilePic ? `${import.meta.env.VITE_FILE_BASE_URL}${profileData.profilePic}` : ''}
                size={270}
                radius={180}
                style={{ cursor: 'pointer', marginBottom: '1rem' }}
              >
                {!profileData.profilePic && <IconPhoto size={50} />}
              </Avatar>
              <input
                id="profilePicInput"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleProfilePicChange}
              />
              <Button variant="contained" component="label">
                Upload Image
                <input hidden accept="image/*" type="file" onChange={handleProfilePicChange} />
              </Button>
            </label>
            <Button variant="outline" fullWidth mt="md" onClick={() => navigate('/orders')}>Order History</Button>
            <Button variant="outline" fullWidth mt="md" onClick={() => navigate('/payment-methods')}>Payment Methods</Button>
          </Grid.Col>
          <Grid.Col span={8}>
            <Box>
              <Title order={3} mb="md">User Profile</Title>
              <TextInput
                label="Email"
                value={profileData.email || ''}
                readOnly
                style={{ marginBottom: '1rem' }}
                variant="filled"
              />
              <TextInput
                label="First Name"
                value={profileData.firstName || ''}
                readOnly
                style={{ marginBottom: '1rem' }}
                variant="filled"
              />
              <TextInput
                label="Last Name"
                value={profileData.lastName || ''}
                readOnly
                style={{ marginBottom: '1rem' }}
                variant="filled"
              />
              <TextInput
                label="Mobile Number"
                value={profileData.mobileNumber || ''}
                readOnly
                variant="filled"
              />
              <Button fullWidth mt="md" onClick={() => navigate(`/edit-profile/${user.user_id}`)}>Edit Profile</Button>
              <Button fullWidth mt="md" color="red" onClick={() => navigate(`/change-password/${user.user_id}`)}>Change Password</Button>
            </Box>
          </Grid.Col>
        </Grid>
        <Box mt="xl" style={{ textAlign: 'center' }}>
          <Text size="xl" weight={500}>Membership Information</Text>
          <Text>Role: {user.role}</Text>
          <Text>Thank you for your active participation in Sustainability Efforts!</Text>
        </Box>
        <Button color="red" fullWidth mt="md" onClick={() => { logout(); navigate('/login'); }}>
          Logout
        </Button>
      </Paper>
    </Container>
  );
}

export default Profile;
