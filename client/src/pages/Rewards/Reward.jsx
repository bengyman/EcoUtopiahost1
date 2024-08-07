import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, TextInput, Textarea, NumberInput, Image, Notification, Container, Group, Title, Paper, Switch } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const { user } = useAuth();

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

  const fetchRewards = async () => {
    try {
      const response = await axios.get('/reward');
      setRewards(response.data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const handleCreateReward = async () => {
    try {
      const response = await axios.post('/reward', form.values);
      setRewards([...rewards, response.data]);
      setIsCreating(false);
      setNotification({ type: 'success', message: 'Reward created successfully!' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Error creating reward.' });
    }
  };

  const handleUpdateReward = async () => {
    try {
      const response = await axios.put(`/reward/${selectedReward.reward_id}`, form.values);
      setRewards(rewards.map(reward => reward.reward_id === selectedReward.reward_id ? response.data : reward));
      setIsEditing(false);
      setNotification({ type: 'success', message: 'Reward updated successfully!' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Error updating reward.' });
    }
  };

  const handleToggleDelete = async (rewardId, isDeleted) => {
    try {
      const endpoint = isDeleted ? `/reward/softdelete/${rewardId}` : `/reward/softrestore/${rewardId}`;
      await axios.put(endpoint, { is_deleted: isDeleted });
      setRewards(rewards.map(reward => reward.reward_id === rewardId ? { ...reward, is_deleted: isDeleted } : reward));
      setNotification({ type: 'success', message: 'Reward deletion status updated successfully!' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Error updating reward deletion status.' });
    }
  };

  const openCreateModal = () => {
    form.reset();
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
    setIsEditing(true);
  };

  const closeModal = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedReward(null);
  };

  if (!user) {
    return null; // or a loading indicator
  }

  return (
    <Container size="xl" style={{ position: 'relative' }}>
      <Title align="center" style={{ marginTop: 20 }}>Rewards Management</Title>
      {user.role === 'STAFF' && (
        <Button 
          color="green"
          style={{ position: 'absolute', top: 20, right: 20 }} 
          onClick={openCreateModal}
        >
          Create Reward
        </Button>
      )}
      {notification && (
        <Notification
          color={notification.type}
          onClose={() => setNotification(null)}
        >
          {notification.message}
        </Notification>
      )}
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {user.role === 'STAFF' && (
          <Table highlightOnHover withBorder="true">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Points</th>
                <th>Expiry Date</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((reward, index) => (
                <tr key={reward.reward_id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
                  <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{reward.reward_name}</td>
                  <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{reward.reward_description}</td>
                  <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{reward.reward_points}</td>
                  <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{new Date(reward.reward_expiry_date).toLocaleDateString()}</td>
                  <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}><Image src={reward.reward_image} alt={reward.reward_name} width={50} /></td>
                  <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>
                    <Group align="center">
                      <Button color="blue" onClick={() => openEditModal(reward)}>Edit</Button>
                      <Switch
                        checked={reward.is_deleted}
                        onChange={() => handleToggleDelete(reward.reward_id, !reward.is_deleted)}
                      />
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {user.role === 'resident' && (
          <div>
            <h3>Catalog of Rewards</h3>
            <Table highlightOnHover withBorder="true">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Points</th>
                  <th>Expiry Date</th>
                  <th>Image</th>
                </tr>
              </thead>
              <tbody>
                {rewards.map((reward, index) => (
                  <tr key={reward.reward_id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
                    <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{reward.reward_name}</td>
                    <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{reward.reward_description}</td>
                    <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{reward.reward_points}</td>
                    <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{new Date(reward.reward_expiry_date).toLocaleDateString()}</td>
                    <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}><Image src={reward.reward_image} alt={reward.reward_name} width={50} /></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Paper>

      {/* Create Reward Modal */}
      <Modal opened={isCreating} onClose={closeModal} title="Create Reward">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleCreateReward();
        }}>
          <TextInput label="Reward Name" {...form.getInputProps('reward_name')} />
          <Textarea label="Reward Description" {...form.getInputProps('reward_description')} />
          <NumberInput label="Reward Points" {...form.getInputProps('reward_points')} />
          <DatePicker label="Expiry Date" {...form.getInputProps('reward_expiry_date')} />
          <TextInput label="Reward Image URL" {...form.getInputProps('reward_image')} />
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
          <DatePicker label="Expiry Date" {...form.getInputProps('reward_expiry_date')} />
          <TextInput label="Reward Image URL" {...form.getInputProps('reward_image')} />
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
