import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, TextInput, Textarea, NumberInput, Image, Notification, Container, Group, Title, Paper, Switch, Grid, Card, Badge, Text } from '@mantine/core';
import { DateInput } from '@mantine/dates'; 
import { Check, X } from 'tabler-icons-react';
import { useForm } from '@mantine/form';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs'; 
import LoaderComponent from "../../components/Loader.jsx";

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      reward_name: '',
      reward_description: '',
      reward_points: 0,
      reward_expiry_date: new Date(),
      reward_image: ''
    },
    validate: {
      reward_name: (value) => value.length > 0 ? null : 'Reward name is required',
      reward_points: (value) => value > 0 ? null : 'Reward points must be greater than 0',
      reward_expiry_date: (value) => value ? null : 'Expiry date is required',
    }
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  useEffect(() => {
    let timer = setTimeout(() => {
      setLoading(false);
    }, 300); // Display loader for at least 0.3 seconds

    return () => clearTimeout(timer);
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await axios.get('/reward');
      setRewards(response.data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.currentTarget.files[0];
    setFile(selectedFile);
    setFilePreview(URL.createObjectURL(selectedFile));
  };

  const handleCreateReward = async () => {
    const formData = new FormData();
    formData.append('reward_name', form.values.reward_name);
    formData.append('reward_description', form.values.reward_description);
    formData.append('reward_points', form.values.reward_points);
    formData.append('reward_expiry_date', dayjs(form.values.reward_expiry_date).format('YYYY-MM-DD'));
    if (file) {
      formData.append('reward_image', file);
    }

    try {
      const response = await axios.post('/reward', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setRewards([...rewards, response.data]);
      setIsCreating(false);
      setNotification({ type: 'success', message: 'Reward created successfully!' });
      setFile(null);
      setFilePreview(null);
    } catch (error) {
      console.error('Error creating reward:', error.response.data);
      setNotification({ type: 'error', message: 'Error creating reward.' });
    }
  };

  const handleUpdateReward = async () => {
    const formData = new FormData();
    formData.append('reward_name', form.values.reward_name);
    formData.append('reward_description', form.values.reward_description);
    formData.append('reward_points', form.values.reward_points);
    formData.append('reward_expiry_date', dayjs(form.values.reward_expiry_date).format('YYYY-MM-DD'));
    if (file) {
      formData.append('reward_image', file);
    }

    try {
      const response = await axios.put(`/reward/${selectedReward.reward_id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setRewards(rewards.map(reward => reward.reward_id === selectedReward.reward_id ? response.data : reward));
      setIsEditing(false);
      setNotification({ type: 'success', message: 'Reward updated successfully!' });
      setFile(null);
      setFilePreview(null);
    } catch (error) {
      console.error('Error updating reward:', error.response.data);
      setNotification({ type: 'error', message: 'Error updating reward.' });
    }
  };

  const handleToggleDelete = async (rewardId, isDeleted) => {
    try {
      const endpoint = isDeleted ? `/reward/softdelete/${rewardId}` : `/reward/softrestore/${rewardId}`;
      const response = await axios.put(endpoint);
      setRewards(rewards.map(reward => reward.reward_id === rewardId ? { ...reward, is_deleted: isDeleted } : reward));
      setNotification({ type: 'success', message: 'Reward deletion status updated successfully!' });
    } catch (error) {
      console.error('Error updating reward deletion status:', error.response.data);
      setNotification({ type: 'error', message: 'Error updating reward deletion status.' });
    }
  };

  const openCreateModal = () => {
    form.reset();
    setFile(null);
    setFilePreview(null);
    setIsCreating(true);
  };

  const openEditModal = (reward) => {
    setSelectedReward(reward);
    form.setValues({
      reward_name: reward.reward_name,
      reward_description: reward.reward_description,
      reward_points: reward.reward_points,
      reward_expiry_date: new Date(reward.reward_expiry_date),
      reward_image: reward.reward_image
    });
    setFilePreview(reward.reward_image);
    setIsEditing(true);
  };

  const closeModal = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedReward(null);
  };

  if (!user || loading) {
    return <LoaderComponent />;
  }

  return (
    <Container size="xl" style={{ position: 'relative' }}>

      {user.role === 'STAFF' && (
        <>
          <Title align="center" style={{ marginTop: 20 }}>Reward Management</Title>
          <Button 
            color="green"
            style={{ position: 'absolute', top: 20, right: 20 }} 
            onClick={openCreateModal}
          >
            Create Reward
          </Button>

          {notification && (
            <Notification
              color={notification.type}
              onClose={() => setNotification(null)}
            >
              {notification.message}
            </Notification>
          )}

          <Paper withBorder shadow="md" p={30} mt={30} radius="md">
            <Table highlightOnHover>
              <thead>
                <tr>
                  <th>RewardID</th>
                  <th>Image</th>
                  <th>Reward</th>
                  <th>Description</th>
                  <th>Points</th>
                  <th>Expiry Date</th>
                  <th>Deleted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rewards.map((reward, index) => (
                  <tr key={reward.reward_id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
                    <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{reward.reward_id}</td>
                    <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>
                      <Image 
                        src={reward.reward_image} 
                        alt={reward.reward_name} 
                        style={{ width: '50px', height: '50px', objectFit: 'contain' }} 
                      />
                    </td>
                    <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{reward.reward_name}</td>
                    <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{reward.reward_description}</td>
                    <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{reward.reward_points}</td>
                    <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{new Date(reward.reward_expiry_date).toLocaleDateString()}</td>
                    <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>
                      <Group position="center" align="center">
                        <Switch
                          checked={reward.is_deleted}
                          onChange={() => handleToggleDelete(reward.reward_id, !reward.is_deleted)}
                        />
                        {reward.is_deleted ? (
                          <Check color="green" size={16} />
                        ) : (
                          <X color="red" size={16} />
                        )}
                      </Group>
                    </td>
                    <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>
                      <Group position="center" align="center">
                        <Button color="blue" onClick={() => openEditModal(reward)}>Edit</Button>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Paper>
        </>
      )}

      {user.role === 'RESIDENT' && (
        <>
          <Title align="center" style={{ marginTop: 20 }}>Catalog of Rewards</Title>
          <Grid gutter="md" mt={30}>
            {rewards.map((reward) => (
              <Grid.Col key={reward.reward_id} span={4}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section>
                    <Image
                      src={reward.reward_image}
                      alt={reward.reward_name}
                      height={160}
                      style={{ objectFit: 'contain' }}
                    />
                  </Card.Section>

                  <Group position="apart" style={{ marginBottom: 5, marginTop: 5 }}>
                    <Text weight={500}>{reward.reward_name}</Text>
                    <Badge color="blue" variant="light">
                      {reward.reward_points} Points
                    </Badge>
                  </Group>

                  <Text size="sm" style={{ lineHeight: 1.5 }}>
                    {reward.reward_description}
                  </Text>

                  <Text size="xs" color="dimmed" style={{ marginTop: 10 }}>
                    Expiry Date: {new Date(reward.reward_expiry_date).toLocaleDateString()}
                  </Text>

                  <Button
                    fullWidth
                    style={{ marginTop: 10 }}
                    onClick={() => navigate(`/reward/${reward.reward_id}`)}
                  >
                    View Details
                  </Button>
                </Card>
              </Grid.Col>
            ))}
        </Grid>
        </>
      )}

      {/* Create Reward Modal */}
      <Modal opened={isCreating} onClose={closeModal} title="Create Reward">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleCreateReward();
        }}>
          <TextInput label="Reward Name" {...form.getInputProps('reward_name')} />
          <Textarea label="Reward Description" {...form.getInputProps('reward_description')} />
          <NumberInput label="Reward Points" {...form.getInputProps('reward_points')} />
          <DateInput label="Expiry Date" {...form.getInputProps('reward_expiry_date')} />
          <TextInput label="Reward Image" type="file" onChange={handleFileChange} />
          {filePreview && <Image src={filePreview} alt="Selected file" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />}
          <Group position="right" mt="md">
            <Button onClick={closeModal}>Cancel</Button>
            <Button type="submit">Create Reward</Button>
          </Group>
        </form>
      </Modal>

      {/* Edit Reward Modal */}
      <Modal opened={isEditing} onClose={closeModal} title="Edit Reward">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleUpdateReward();
        }}>
          <TextInput label="Reward Name" {...form.getInputProps('reward_name')} />
          <Textarea label="Reward Description" {...form.getInputProps('reward_description')} />
          <NumberInput label="Reward Points" {...form.getInputProps('reward_points')} />
          <DateInput label="Expiry Date" {...form.getInputProps('reward_expiry_date')} />
          <TextInput label="Reward Image" type="file" onChange={handleFileChange} />
          {filePreview && <Image src={filePreview} alt="Selected file" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />}
          <Group position="right" mt="md">
            <Button onClick={closeModal}>Cancel</Button>
            <Button type="submit">Update Reward</Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
};

export default Rewards;
