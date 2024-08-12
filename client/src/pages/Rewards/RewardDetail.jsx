import React, { useState, useEffect } from 'react';
import { Container, Title, Button, Image, Text, Group, Modal, Notification, Badge } from '@mantine/core';
import { ArrowLeft } from 'tabler-icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LoaderComponent from '../../components/Loader';

const RewardDetail = () => {
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const { user, setUser } = useAuth(); // Destructure setUser to update user state
  const navigate = useNavigate();
  const { rewardId } = useParams();

  useEffect(() => {
    fetchRewardDetails();
  }, []);

  const fetchRewardDetails = async () => {
    try {
      const response = await axios.get(`/reward/${rewardId}`);
      setReward(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reward details:', error);
      setLoading(false);
    }
  };

  const updateEcoPoints = async () => {
    try {
      const updatedEcoPoints = user.resident.ecoPoints - reward.reward_points;
      const updatedUser = { ...user, resident: { ...user.resident, ecoPoints: updatedEcoPoints } };
      
      setUser(updatedUser); // Update the user state with the new ecoPoints
      sessionStorage.setItem('user', JSON.stringify(updatedUser)); // Update the session storage
  
    } catch (error) {
      console.error('Error updating EcoPoints:', error);
    }
  };
  

  const handleClaimReward = async () => {
    if (user.resident.ecoPoints < reward.reward_points) {
      setNotification({ type: 'error', message: 'Insufficient EcoPoints to claim this reward.' });
      setShowClaimModal(false);
      return;
    }
  
    try {
      const response = await axios.post(`/redeemreward/redeem`, { rewardId: reward.reward_id });
      const { redeemReward } = response.data;
      setNotification({ type: 'success', message: `Reward claimed successfully! Voucher Code: ${redeemReward.voucher_code}` });
      setShowClaimModal(false);
  
      // Update EcoPoints locally and in the AuthContext
      await updateEcoPoints();
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to claim reward.' });
    }
  };
  

  if (loading) {
    return <LoaderComponent />;
  }

  return (
    <Container size="md" style={{ position: 'relative' }}>
      <Group position="apart" style={{ marginTop: 20 }}>
        <Button color="gray" onClick={() => navigate(-1)} leftIcon={<ArrowLeft />}>
          Back
        </Button>
        <Badge size="lg" color="green">
          EcoPoints: {user.resident.ecoPoints}
        </Badge>
      </Group>

      {reward && (
        <>
          <Title align="center" style={{ marginTop: 20 }}>{reward.reward_name}</Title>

          <Image
            src={reward.reward_image}
            alt={reward.reward_name}
            height={300}
            style={{ objectFit: 'contain', marginTop: 20 }}
          />

          <Text size="lg" align="center" style={{ marginTop: 20 }}>{reward.reward_description}</Text>
          <Text size="sm" align="center" color="dimmed" style={{ marginTop: 10 }}>
            Expiry Date: {new Date(reward.reward_expiry_date).toLocaleDateString()}
          </Text>

          <Button
            color="green"
            fullWidth
            size="lg"
            style={{ marginTop: 40 }}
            onClick={() => setShowClaimModal(true)}
          >
            Claim Reward
          </Button>

          <Modal
            opened={showClaimModal}
            onClose={() => setShowClaimModal(false)}
            title="Confirm Reward Claim"
          >
            <Text>Are you sure you want to claim this reward?</Text>
            <Group position="right" mt="md">
              <Button color="red" onClick={() => setShowClaimModal(false)}>Cancel</Button>
              <Button color="green" onClick={handleClaimReward}>Confirm</Button>
            </Group>
          </Modal>

          {notification && (
            <Notification
              color={notification.type}
              onClose={() => setNotification(null)}
            >
              {notification.message}
            </Notification>
          )}
        </>
      )}
    </Container>
  );
};

export default RewardDetail;
