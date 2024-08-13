import { useEffect, useState } from "react";
import { Container, List, Avatar, Text } from "@mantine/core";
import axios from "axios";
import { useParams } from "react-router-dom";

function FollowingList() {
  const { profileId } = useParams();
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const response = await axios.get(`/follow/following/${profileId}`);
        setFollowing(response.data);
      } catch (error) {
        console.error("Error fetching following:", error);
      }
    };
    fetchFollowing();
  }, [profileId]);

  return (
    <Container size="sm">
      <List>
        {following.map(({ Following }) => (
          <List.Item key={Following.user_id}>
            <Avatar src={Following.Resident ? Following.Resident.profile_pic : Following.Instructor.profile_pic} />
            <Text>{Following.Resident ? Following.Resident.name : Following.Instructor.name}</Text>
          </List.Item>
        ))}
      </List>
    </Container>
  );
}

export default FollowingList;
