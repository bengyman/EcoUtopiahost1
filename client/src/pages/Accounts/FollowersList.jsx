import { useEffect, useState } from "react";
import { Container, List, Avatar, Text } from "@mantine/core";
import axios from "axios";
import { useParams } from "react-router-dom";

function FollowersList() {
  const { profileId } = useParams();
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const response = await axios.get(`/follow/followers/${profileId}`);
        setFollowers(response.data);
      } catch (error) {
        console.error("Error fetching followers:", error);
      }
    };
    fetchFollowers();
  }, [profileId]);

  return (
    <Container size="sm">
      <List>
        {followers.map(({ Follower }) => (
          <List.Item key={Follower.user_id}>
            <Avatar src={Follower.Resident ? Follower.Resident.profile_pic : Follower.Instructor.profile_pic} />
            <Text>{Follower.Resident ? Follower.Resident.name : Follower.Instructor.name}</Text>
          </List.Item>
        ))}
      </List>
    </Container>
  );
}

export default FollowersList;
