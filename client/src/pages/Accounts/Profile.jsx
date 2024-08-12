import { useState, useEffect, useRef } from "react";
import {
  Button,
  Container,
  Paper,
  Text,
  Title,
  Avatar,
  Box,
  Grid,
  TextInput,
  Card,
  Image,
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
  const fileInputRef = useRef(null);

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
            backgroundImage: resident.background_pic || "", // Make sure it's background_pic
            role: "RESIDENT",
          });
        } else if (userData.role === "STAFF" && staff) {
          setProfileData({
            email: userData.email,
            firstName: staff.name.split(" ")[0] || "",
            lastName: staff.name.split(" ")[1] || "",
            mobileNumber: staff.mobilenum || "",
            profilePic: staff.profile_pic || "",
            backgroundImage: staff.background_pic || "", // Make sure it's background_pic
            role: "STAFF",
          });
        } else if (userData.role === "INSTRUCTOR" && instructor) {
          setProfileData({
            email: userData.email,
            firstName: instructor.name.split(" ")[0] || "",
            lastName: instructor.name.split(" ")[1] || "",
            mobileNumber: instructor.mobilenum || "",
            profilePic: instructor.profile_pic || "",
            backgroundImage: instructor.background_pic || "", // Make sure it's background_pic
            role: "INSTRUCTOR",
          });
        } else {
          setProfileData({
            email: userData.email,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            mobileNumber: userData.mobileNumber || "",
            profilePic: userData.profile_pic || "",
            backgroundImage: userData.background_pic || "", // Make sure it's background_pic
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
      const response = await axios.post("/user/profile-picture", formData, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      setProfileData((prevData) => ({
        ...prevData,
        profilePic: response.data.fileUrl,
      }));
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
      const response = await axios.post("/user/background-image", formData, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      setProfileData((prevData) => ({
        ...prevData,
        backgroundImage: response.data.fileUrl,
      }));
    } catch (error) {
      console.error("Error uploading background image:", error);
    }
  };

  console.log("Background Image URL:", profileData.backgroundImage); // Log the URL to debug

  if (!paramId || loading) {
    return <LoaderComponent />;
  }

  return (
    <Container size="md" my={40}>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          {profileData.backgroundImage ? (
            <Image
              src={profileData.backgroundImage}
              alt="Background"
              height={350}
              style={{ objectFit: "cover", width: "100%" }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "350px",
                backgroundColor: "lightgray",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <IconPhoto width="100%" height="350px" color="gray" />
            </Box>
          )}
        </Card.Section>

        <Grid align="center" mt="md">
          <Grid.Col span={4} style={{ textAlign: "center" }}>
            <label htmlFor="profilePicInput">
              <Avatar
                src={profileData.profilePic || ""}
                size={270}
                radius={180}
                style={{ cursor: "pointer", marginBottom: "1rem" }}
              >
                {!profileData.profilePic && (
                  <Box
                    sx={{
                      width: "100px",
                      height: "100px",
                      backgroundColor: "lightgray",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <IconPhoto size={50} color="gray" />
                  </Box>
                )}
              </Avatar>
              <input
                id="profilePicInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleProfilePicChange}
                ref={fileInputRef}
              />
              <Button
                color="blue"
                variant="filled"
                onClick={() => fileInputRef.current.click()} // Trigger click on file input
              >
                Upload Profile Image
              </Button>
            </label>
            <Button
              color="gray"
              variant="filled"
              onClick={() =>
                document.getElementById("backgroundImageInput").click()
              }
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
            />
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
