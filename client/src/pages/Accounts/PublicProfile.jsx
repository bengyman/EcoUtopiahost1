import { useState } from "react";
import {
  Container,
  Paper,
  Text,
  Title,
  Avatar,
  Box,
  Button,
  Grid,
  Group,
} from "@mantine/core";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";
import { IconPhoto } from "@tabler/icons-react";
import LoaderComponent from "../../components/Loader.jsx";

function PublicProfile() {
  const { user } = useAuth();
  const { profileId } = useParams(); // Get profileId from route parameters

  const [profileData, setProfileData] = useState({
    backgroundImage: "",
    profilePic: "",
    followers: 0,
    following: 0,
    isFollowing: false,
  });
  const [loading, setLoading] = useState(true);

  useState(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/user/public-profile/${profileId}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });

        setProfileData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching public profile:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  const handleFollow = async () => {
    try {
      await axios.post(`/user/follow/${profileId}`, {}, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });

      setProfileData((prevData) => ({
        ...prevData,
        isFollowing: !prevData.isFollowing,
        followers: prevData.isFollowing ? prevData.followers - 1 : prevData.followers + 1,
      }));
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    }
  };

  if (loading) {
    return <LoaderComponent />;
  }

  return (
    <Container size="lg" my={40}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Box
          style={{
            backgroundImage: `url(${import.meta.env.VITE_FILE_BASE_URL}${profileData.backgroundImage || ""})`,
            height: "200px",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "8px",
          }}
        />
        <Box mt="-90px" ml="20px" style={{ position: "relative" }}>
          <Avatar
            src={
              profileData.profilePic
                ? `${import.meta.env.VITE_FILE_BASE_URL}${profileData.profilePic}`
                : ""
            }
            size={180}
            radius={180}
            style={{
              border: "5px solid white",
            }}
          >
            {!profileData.profilePic && <IconPhoto size={50} />}
          </Avatar>
        </Box>
        <Grid align="center" justify="space-between" mt="md">
          <Grid.Col span={4}>
            <Text align="center" size="xl" weight={700}>
              {profileData.followers} Followers
            </Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Text align="center" size="xl" weight={700}>
              {profileData.following} Following
            </Text>
          </Grid.Col>
          <Grid.Col span={4}>
            {user && user.user_id !== parseInt(profileId) && (
              <Button
                fullWidth
                variant={profileData.isFollowing ? "outline" : "filled"}
                color={profileData.isFollowing ? "gray" : "blue"}
                onClick={handleFollow}
              >
                {profileData.isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </Grid.Col>
        </Grid>
      </Paper>
    </Container>
  );
}

export default PublicProfile;
