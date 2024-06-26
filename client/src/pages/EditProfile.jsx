import { useState, useEffect } from 'react';
import { Button, Container, Paper, Title, Avatar, Box, Grid, TextInput } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { IconPhoto } from '@tabler/icons-react';

function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // Get user id from URL parameters
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    profilePic: ''
  });

  useEffect(() => {
    if (id) {
      const fetchProfile = async () => {
        try {
          const response = await axios.get(`/user/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          const { user: userData, resident } = response.data;
          setProfileData({
            email: userData.email,
            firstName: resident.name.split(' ')[0],
            lastName: resident.name.split(' ')[1],
            mobileNumber: resident.mobile_num,
            profilePic: resident.profile_pic || ''
          });
        } catch (error) {
          console.error('Error fetching profile data:', error);
        }
      };

      fetchProfile();
    }
  }, [id]);

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);
    formData.append('userId', id);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await axios.put(`/user/${id}`, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        mobileNumber: profileData.mobileNumber,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate(`/profile/${id}`);
    } catch (error) {
      console.error('Error saving profile data:', error);
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
          </Grid.Col>
          <Grid.Col span={8}>
            <Box>
              <Title order={3}>Edit Profile</Title>
              <TextInput
                label="Email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                style={{ marginBottom: '1rem' }}
                variant="filled"
              />
              <TextInput
                label="First Name"
                name="firstName"
                value={profileData.firstName}
                onChange={handleInputChange}
                style={{ marginBottom: '1rem' }}
                variant="filled"
              />
              <TextInput
                label="Last Name"
                name="lastName"
                value={profileData.lastName}
                onChange={handleInputChange}
                style={{ marginBottom: '1rem' }}
                variant="filled"
              />
              <TextInput
                label="Mobile Number"
                name="mobileNumber"
                value={profileData.mobileNumber}
                onChange={handleInputChange}
                variant="filled"
              />
              <Button fullWidth mt="md" onClick={handleSave}>Save Changes</Button>
            </Box>
          </Grid.Col>
        </Grid>
      </Paper>
    </Container>
  );
}

export default EditProfile;
