import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Avatar,
  Box,
  Button,
  Grid,
  Text,
} from "@mantine/core";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";
import { IconPhoto } from "@tabler/icons-react";
import LoaderComponent from "../../components/Loader.jsx";

function PublicProfile() {
  const { user } = useAuth();
  const { paramId } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: "",
    backgroundImage: "",
    profilePic: "",
    followers: [],
    following: [],
    isFollowing: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileResponse = await axios.get(`/user/public-profile/${paramId}`);
        const followersResponse = await axios.get(`/follow/followers/${paramId}`);
        const followingResponse = await axios.get(`/follow/following/${paramId}`);

        console.log('Followers Response:', followersResponse.data);

        if (!profileResponse.data.name) {
          throw new Error("User not found");
        }

        setProfileData({
          ...profileResponse.data,
          followers: followersResponse.data,
          following: followingResponse.data,
        });

        if (user) {
          const followStatusResponse = await axios.get(`/follow/isFollowing/${paramId}`, {
            params: { user_id: user.user_id },
          });
          setProfileData((prevData) => ({
            ...prevData,
            isFollowing: followStatusResponse.data.isFollowing,
          }));
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching public profile:", error);
        setError("404 ERROR User not found");
        setLoading(false);
      }
    };
    fetchProfile();
  }, [paramId, user]);

  const handleFollow = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
  
    try {
      if (profileData.isFollowing) {
        // Unfollow
        await axios.delete(`/follow/unfollow/${paramId}`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
          data: { user_id: user.user_id },
        });
  
        // Re-fetch followers to update the count correctly
        const updatedFollowersResponse = await axios.get(`/follow/followers/${paramId}`);
        setProfileData((prevData) => ({
          ...prevData,
          isFollowing: false,
          followers: updatedFollowersResponse.data,
        }));
  
      } else {
        // Follow
        await axios.post(`/follow/follow/${paramId}`, { user_id: user.user_id }, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        });
  
        // Re-fetch followers to update the count correctly
        const updatedFollowersResponse = await axios.get(`/follow/followers/${paramId}`);
        setProfileData((prevData) => ({
          ...prevData,
          isFollowing: true,
          followers: updatedFollowersResponse.data,
        }));
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      console.error("Error details:", error.response ? error.response.data : error.message);
    }
  };
    

  if (loading) {
    return <LoaderComponent />;
  }

  if (error) {
    return (
      <Container size="lg" my={40} style={{ textAlign: "center", marginTop: "20px" }}>
        <div>
          <h1 style={{ fontSize: "150px", marginBottom: "20px", color: "#dc3545" }}>
            404
          </h1>
          <h1 style={{ fontSize: "2rem", marginBottom: "20px", color: "#495057" }}>
            Not Found
          </h1>
          <p style={{ fontSize: "1.2em", marginBottom: "20px", color: "#495057" }}>
            The user you are looking for might be in another place.
          </p>
          <p>
            Return to <span onClick={() => navigate("/")} style={{ color: "#007bff", cursor: "pointer" }}>Homepage</span>.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container size="lg" my={40}>
      <Paper withBorder shadow="md" p={30} radius="md" style={{ padding: "40px" }}>
        <Box
          style={{
            backgroundImage: `url(${
              profileData.backgroundImage
                ? profileData.backgroundImage
                : "https://ecoutopia-bucket.s3.ap-southeast-1.amazonaws.com/eco-placeholder-image-cropped.jpg"
            })`,
            height: "50vh",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "8px",
            position: "relative",
            marginBottom: "20px",
          }}
        >
          {user && user.user_id !== parseInt(paramId) && (
            <Button
              style={{
                fontSize: "1.2rem",
                height: "60px",
                width: "200px",
                position: "absolute",
                bottom: "-80px",  // Positioned just below the background image
                right: "20px",  // Positioned to the bottom right corner
                zIndex: 2,  // Ensure the button is above other elements
              }}
              variant={profileData.isFollowing ? "outline" : "filled"}
              color={profileData.isFollowing ? "gray" : "blue"}
              onClick={handleFollow}
            >
              {profileData.isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}
        </Box>
        <Box mt="-150px" ml="20px" style={{ position: "relative" }}>
          <Avatar
            src={
              profileData.profilePic
                ? profileData.profilePic
                : "https://ecoutopia-bucket.s3.ap-southeast-1.amazonaws.com/eco-Pfpimage.jpg"
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
        <Box mt="xl" ml="20px">
          <h2 style={{ marginBottom: "40px" }}>{profileData.name}</h2>
        </Box>
        <Grid align="center" justify="space-between" mt="md">
          <Grid.Col span={5} style={{ padding: "0 15px" }}>
            <Button
              fullWidth
              variant="outline"
              onClick={() => navigate(`/followers/${paramId}`)}
              style={{ fontSize: "1.2rem", height: "60px" }}
            >
              {profileData.followers.length} Followers
            </Button>
          </Grid.Col>
          <Grid.Col span={5} style={{ padding: "0 15px" }}>
            <Button
              fullWidth
              variant="outline"
              onClick={() => navigate(`/following/${paramId}`)}
              style={{ fontSize: "1.2rem", height: "60px" }}
            >
              {profileData.following.length} Following
            </Button>
          </Grid.Col>
        </Grid>
      </Paper>
    </Container>
  );
}

export default PublicProfile;
