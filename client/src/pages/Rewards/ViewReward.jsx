import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, Text, Title, Image, Badge, Group } from '@mantine/core';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import LoaderComponent from '../../components/Loader';

const ViewReward = () => {
  const { user } = useAuth();
  const [redeemedRewards, setRedeemedRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRedeemedRewards();
  }, []);

  const fetchRedeemedRewards = async () => {
    try {
      const response = await axios.get(`/redeemreward/${user.resident.resident_id}`);
      const filteredRewards = response.data.filter(reward => !reward.reward_used); // Filter out used rewards
      setRedeemedRewards(filteredRewards);
    } catch (error) {
      console.error('Error fetching redeemed rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoaderComponent />;
  }

  if (redeemedRewards.length === 0) {
    return (
      <Container size="xl" style={{ textAlign: 'center', marginTop: 50 }}>
        <Title align="center" style={{ marginTop: 20, marginBottom: 50 }}>My Redeemed Rewards</Title>
        <Text size="xl" weight={500}>You have not redeemed any rewards yet.</Text>
        <Text size="md" color="dimmed" style={{ marginTop: 10 }}>
          Start exploring rewards and redeem your first one!
        </Text>
      </Container>
    );
  }

  return (
    <Container size="xl" style={{ position: 'relative' }}>
      <Title align="center" style={{ marginTop: 20 }}>My Redeemed Rewards</Title>
      <Grid gutter="md" mt={30}>
        {redeemedRewards.map((redeemReward) => (
          <Grid.Col key={redeemReward.redeem_id} span={6}> {/* 2 cards per row */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section>
                <Image
                  src={redeemReward.Reward.reward_image}
                  alt={redeemReward.Reward.reward_name}
                  height={160}
                  style={{ objectFit: 'contain' }}
                />
              </Card.Section>

              <Group position="apart" style={{ marginBottom: 5, marginTop: 5 }}>
                <Text weight={500}>{redeemReward.Reward.reward_name}</Text>
                <Badge color="blue" variant="light">
                  {redeemReward.Reward.reward_points} Points
                </Badge>
              </Group>

              <Text size="sm" style={{ lineHeight: 1.5 }}>
                {redeemReward.Reward.reward_description}
              </Text>

              <Text size="sm" style={{ lineHeight: 1.5, marginTop: 10 }}>
                Voucher Code: <strong>{redeemReward.voucher_code}</strong>
              </Text>

              <Text size="xs" color="dimmed" style={{ marginTop: 10 }}>
                Redeemed On: {new Date(redeemReward.redeemed_at).toLocaleDateString()}
              </Text>

              <Text size="xs" color="dimmed" style={{ marginTop: 10 }}>
                Expiry Date: {new Date(redeemReward.Reward.reward_expiry_date).toLocaleDateString()}
              </Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
};

export default ViewReward;
