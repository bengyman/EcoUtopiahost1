import { useEffect, useState } from "react";
import { Container, Avatar, Text, Group, Paper, Box } from "@mantine/core";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function FollowingList() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [following, setFollowing] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        console.log("Fetching following for profileId:", profileId);
        const response = await axios.get(`/follow/following/${profileId}`);
        console.log('Following API Response:', response.data);
        setFollowing(response.data);
      } catch (error) {
        console.error("Error fetching following:", error);
        setError("Failed to fetch following");
      }
    };
    fetchFollowing();
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
          <Text align="center" size="xl" weight={700}>Following</Text>
        </Box>
        <Box style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {following.length > 0 ? (
            following.map((follow) => {
              console.log('Following Object:', follow); // Debugging step
              const userId = follow?.Following?.dataValues?.user_id;
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
                    <Avatar src={follow.Following.profile_pic || ''} radius="xl" />
                    <Text>{follow.Following.name}</Text>
                  </Group>
                </Box>
              );
            })
          ) : (
            <Text align="center">No following users found.</Text>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default FollowingList;
