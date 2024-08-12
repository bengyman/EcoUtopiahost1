import { useState, useEffect, useRef } from "react";
import {
  Button,
  Container,
  Text,
  Title,
  Avatar,
  Box,
  Grid,
  TextInput,
  Card,
} from "@mantine/core";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";
import { IconPhoto } from "@tabler/icons-react";
import LoaderComponent from "../../components/Loader.jsx";

function Profile() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { paramId } = useParams();

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    profilePic: "",
    backgroundImage: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const profilePicInputRef = useRef(null);
  const backgroundImageInputRef = useRef(null);

  useEffect(() => {
    let timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user || !paramId) {
          console.log("User or paramId is not defined", { user, paramId });
          return;
        }

        let response;
        if (user.user_id === parseInt(paramId)) {
          response = await axios.get(`/user/${user.user_id}`, {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          });
        } else if (user.role === "STAFF") {
          response = await axios.get(`/user/${paramId}`, {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          });
        } else {
          throw new Error("Access denied.");
        }

        const { user: userData, resident, staff, instructor } = response.data;

        if (userData.role === "RESIDENT" && resident) {
          setProfileData({
            email: userData.email,
            firstName: resident.name.split(" ")[0] || "",
            lastName: resident.name.split(" ")[1] || "",
            mobileNumber: resident.mobile_num || "",
            profilePic: resident.profile_pic || "",
            backgroundImage: resident.background_pic || "",
            role: "RESIDENT",
          });
        } else if (userData.role === "STAFF" && staff) {
          setProfileData({
            email: userData.email,
            firstName: staff.name.split(" ")[0] || "",
            lastName: staff.name.split(" ")[1] || "",
            mobileNumber: staff.mobilenum || "",
            profilePic: staff.profile_pic || "",
            backgroundImage: staff.background_pic || "",
            role: "STAFF",
          });
        } else if (userData.role === "INSTRUCTOR" && instructor) {
          setProfileData({
            email: userData.email,
            firstName: instructor.name.split(" ")[0] || "",
            lastName: instructor.name.split(" ")[1] || "",
            mobileNumber: instructor.mobilenum || "",
            profilePic: instructor.profile_pic || "",
            backgroundImage: instructor.background_pic || "",
            role: "INSTRUCTOR",
          });
        } else {
          setProfileData({
            email: userData.email,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            mobileNumber: userData.mobileNumber || "",
            profilePic: userData.profile_pic || "",
            backgroundImage: userData.background_pic || "",
            role: userData.role || "",
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setLoading(false);
      }
    };

    if (user && paramId) {
      fetchProfile();
    }
  }, [paramId, user]);

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);
    formData.append("userId", paramId);

    try {
      await axios.post("/user/profile-picture", formData, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      window.location.reload(); // Reload the page after the upload
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const handleBackgroundImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("backgroundImage", file);
    formData.append("userId", paramId);

    try {
      await axios.post("/user/background-image", formData, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      window.location.reload(); // Reload the page after the upload
    } catch (error) {
      console.error("Error uploading background image:", error);
    }
  };

  if (!paramId || loading) {
    return <LoaderComponent />;
  }

  return (
    <Container size="md" my={40}>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          <Box style={{ position: "relative", width: "100%", height: "50vh" }}>
            {profileData.backgroundImage ? (
              <img
                src={profileData.backgroundImage}
                alt="Background"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 0,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "lightgray",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <IconPhoto width="100%" height="100%" color="gray" />
              </Box>
            )}
            <Box
              style={{
                position: "absolute",
                bottom: "-8rem",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1,
              }}
            >
              {profileData.profilePic ? (
                <img
                  src={profileData.profilePic}
                  alt="Profile"
                  style={{
                    width: "250px", // Adjust as needed
                    height: "250px", // Ensure it matches width for a perfect circle
                    borderRadius: "50%",
                    objectFit: "cover",
                    cursor: "pointer",
                    border: "3px solid white",
                    marginRight: "38rem",
                  }}
                />
              ) : (
                <Avatar
                  size="120px" // Adjust as needed
                  radius="50%"
                  style={{ cursor: "pointer", marginBottom: "1rem", border: "3px solid white" }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "lightgray",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <IconPhoto size="50%" color="gray" />
                  </Box>
                </Avatar>
              )}
            </Box>
          </Box>
        </Card.Section>
        <Grid align="center" mt="md">
          <Grid.Col span={4} style={{ textAlign: "center" }}>
            <label htmlFor="profilePicInput">
              <input
                id="profilePicInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleProfilePicChange}
                ref={profilePicInputRef}
              />
              <Button
                color="blue"
                variant="filled"
                onClick={() => profilePicInputRef.current.click()}
                fullWidth
                mt="md"
              >
                Upload Profile Image
              </Button>
            </label>
            <label htmlFor="backgroundImageInput">
              <Button
                color="gray"
                variant="filled"
                onClick={() => backgroundImageInputRef.current.click()}
                fullWidth
                mt="md"
              >
                Upload Background Image
              </Button>
              <input
                id="backgroundImageInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleBackgroundImageChange}
                ref={backgroundImageInputRef}
              />
            </label>
            <Button
              variant="outline"
              fullWidth
              mt="md"
              onClick={() => navigate("/orders")}
            >
              Order History
            </Button>
            <Button
              variant="outline"
              fullWidth
              mt="md"
              onClick={() => navigate(`/${paramId}/reward`)}
            >
              Redeemed Rewards
            </Button>
          </Grid.Col>
          <Grid.Col span={8}>
            <Box>
              <Title order={3} mb="md">
                User Profile
              </Title>
              <TextInput
                label="Email"
                value={profileData.email || ""}
                readOnly
                style={{ marginBottom: "1rem" }}
                variant="filled"
              />
              <TextInput
                label="First Name"
                value={profileData.firstName || ""}
                readOnly
                style={{ marginBottom: "1rem" }}
                variant="filled"
              />
              <TextInput
                label="Last Name"
                value={profileData.lastName || ""}
                readOnly
                style={{ marginBottom: "1rem" }}
                variant="filled"
              />
              <TextInput
                label="Mobile Number"
                value={profileData.mobileNumber || ""}
                readOnly
                variant="filled"
              />
              <Button
                fullWidth
                mt="md"
                onClick={() => navigate(`/edit-profile/${paramId}`)}
              >
                Edit Profile
              </Button>
              <Button
                fullWidth
                mt="md"
                color="red"
                onClick={() => navigate(`/change-password/${paramId}`)}
              >
                Change Password
              </Button>
            </Box>
          </Grid.Col>
        </Grid>

        <Box mt="xl" style={{ textAlign: "center" }}>
          <Text size="xl" weight={500}>
            Membership Information
          </Text>
          <Text>Role: {profileData.role}</Text>
          <Text>
            Thank you for your active participation in Sustainability Efforts!
          </Text>
        </Box>
        <Button
          color="red"
          fullWidth
          mt="md"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Logout
        </Button>
      </Card>
    </Container>
  );
}

export default Profile;
