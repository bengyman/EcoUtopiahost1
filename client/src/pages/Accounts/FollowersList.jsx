import { useEffect, useState } from "react";
import { Container, Avatar, Text, Group, Paper, Box } from "@mantine/core";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function FollowersList() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        console.log("Fetching followers for profileId:", profileId);
        const response = await axios.get(`/follow/followers/${profileId}`);
        console.log('Followers API Response:', response.data);
        setFollowers(response.data);
      } catch (error) {
        console.error("Error fetching followers:", error);
        setError("Failed to fetch followers");
      }
    };
    fetchFollowers();
  }, [profileId]);

  const handleProfileClick = (userId) => {
    console.log('Navigating to profile of user with ID:', userId);
    if (userId) {
      navigate(`/publicprofile/${userId}`);
    } else {
      console.error('User ID is undefined or invalid');
    }
  };

  return (
    <Container size="sm" my={40}>
      {error && <Text color="red" align="center">{error}</Text>}
      <Paper withBorder shadow="md" p={20} radius="md" style={{ padding: "20px", backgroundColor: "#f9f9f9" }}>
        <Box mb={20}>
          <Text align="center" size="xl" weight={700}>Followers</Text>
        </Box>
        <Box style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {followers.length > 0 ? (
            followers.map((follower) => {
              console.log('Follower Object:', follower); // Debugging step
              const userId = follower?.Follower?.dataValues?.user_id;
              return userId && (
                <Box
                  key={userId}
                  p={10}
                  mb={10}
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                  }}
                  onClick={() => handleProfileClick(userId)}
                >
                  <Group>
                    <Avatar src={follower.Follower.profile_pic || ''} radius="xl" />
                    <Text>{follower.Follower.name}</Text>
                  </Group>
                </Box>
              );
            })
          ) : (
            <Text align="center">No followers found.</Text>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default FollowersList;
