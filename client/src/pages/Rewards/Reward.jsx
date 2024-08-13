import React, { useState, useEffect } from 'react';
import { Table, Button, Paper, Notification, Container, Group, Title, Switch, Grid, Card, Badge, Text, Image } from '@mantine/core';
import axios from 'axios';
import LoaderComponent from "../../components/Loader.jsx";
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const handleToggleDelete = async (rewardId, isDeleted) => {
    try {
      const endpoint = isDeleted ? `/reward/softdelete/${rewardId}` : `/reward/softrestore/${rewardId}`;
      await axios.put(endpoint);
      setRewards(rewards.map(reward => reward.reward_id === rewardId ? { ...reward, is_deleted: isDeleted } : reward));
      setNotification({ type: 'success', message: 'Reward deletion status updated successfully!' });
    } catch (error) {
      console.error('Error updating reward deletion status:', error.response.data);
      setNotification({ type: 'error', message: 'Error updating reward deletion status.' });
    }
  };

  if (loading) {
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
            onClick={() => navigate('/addreward')}
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
                        <Button color="blue" onClick={() => navigate(`/editreward/${reward.reward_id}`)}>Edit</Button>
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
          <Group position="apart" style={{ marginTop: 20 }}>
            <Title align="center">Catalog of Rewards</Title>
            <Badge size="lg" color="green">
              EcoPoints: {user.resident.ecoPoints}
            </Badge>
          </Group>

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
    </Container>
  );
};

export default Rewards;
