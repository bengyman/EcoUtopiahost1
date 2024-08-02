import { useState, useEffect } from "react";
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
} from "@mantine/core";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { IconPhoto } from "@tabler/icons-react";
import LoaderComponent from "../components/Loader.jsx";

function Profile() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { paramId } = useParams(); // Get paramId from route parameters

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    profilePic: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer = setTimeout(() => {
      setLoading(false);
    }, 300); // Display loader for at least 0.3 seconds

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
          // Fetch the personal profile data
          response = await axios.get(`/user/${user.user_id}`, {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          });
        } else if (user.role === "STAFF") {
          // Fetch the profile data of the user with the given paramId
          response = await axios.get(`/user/${paramId}`, {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          });
        } else {
          throw new Error("Access denied.");
        }

        const { user: userData, resident, staff, instructor } = response.data;
        console.log(userData);
        console.log(userData.role);

        if (userData.role === "RESIDENT" && resident) {
          setProfileData({
            email: userData.email,
            firstName: resident.name.split(" ")[0] || "",
            lastName: resident.name.split(" ")[1] || "",
            mobileNumber: resident.mobile_num || "",
            profilePic: resident.profile_pic || "",
            role: "RESIDENT",
          });
        } else if (userData.role === "STAFF" && staff) {
          setProfileData({
            email: userData.email,
            firstName: staff.name.split(" ")[0] || "",
            lastName: staff.name.split(" ")[1] || "",
            mobileNumber: staff.mobilenum || "",
            profilePic: staff.profile_pic || "",
            role: "STAFF",
          });
        } else if (userData.role === "INSTRUCTOR" && instructor) {
          setProfileData({
            email: userData.email,
            firstName: instructor.name.split(" ")[0] || "",
            lastName: instructor.name.split(" ")[1] || "",
            mobileNumber: instructor.mobilenum || "",
            profilePic: instructor.profile_pic || "",
            role: "INSTRUCTOR",
          });
        } else {
          setProfileData({
            email: userData.email,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            mobileNumber: userData.mobileNumber || "",
            profilePic: userData.profile_pic || "",
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
        profilePic: response.data.fileName,
      }));
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  if (!paramId || loading) {
    return <LoaderComponent />;
  }

  return (
    <Container size="md" my={40}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Grid align="center">
          <Grid.Col span={4} style={{ textAlign: "center" }}>
            <label htmlFor="profilePicInput">
              <Avatar
                src={
                  profileData.profilePic
                    ? `${import.meta.env.VITE_FILE_BASE_URL}${
                        profileData.profilePic
                      }`
                    : ""
                }
                size={270}
                radius={180}
                style={{ cursor: "pointer", marginBottom: "1rem" }}
              >
                {!profileData.profilePic && <IconPhoto size={50} />}
              </Avatar>
              <input
                id="profilePicInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleProfilePicChange}
              />
              <Button variant="contained" component="label">
                Upload Image
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleProfilePicChange}
                />
              </Button>
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
              onClick={() => navigate("/payment-methods")}
            >
              Payment Methods
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
      </Paper>
    </Container>
  );
}

export default Profile;
