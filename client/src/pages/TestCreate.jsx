import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Button,
  Container,
  Paper,
  Title,
  TextInput,
  FileInput,
  Group,
  Select,
} from "@mantine/core";
import LoaderComponent from "../components/Loader.jsx";

function TestCreate() {

    /*const [courseName, setCourseName] = useState("");
    const [courseDesc, setCourseDesc] = useState("");
    const [courseInstructor, setCourseInstructor] = useState("");
    const [coursePrice, setCoursePrice] = useState("");
    const [courseType, setCourseType] = useState("");
    const [courseDate, setCourseDate] = useState("");
    const [courseStartTime, setCourseStartTime] = useState("");
    const [courseEndTime, setCourseEndTime] = useState("");
    const [courseCapacity, setCourseCapacity] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);*/

    const { user } = useAuth(); // Get user from AuthContext
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [tags, setTags] = useState(""); // State for tags
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        if (!title || !content || !tags) {
          alert("Title, content, and tags are required");
          setLoading(false);
          return;
        }

        const token = sessionStorage.getItem('token');
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("tags", tags);
        if (image) formData.append("image", image);

        try {
            if (!token) throw new Error("No token found");

            const residentId = user?.resident?.resident_id;
            const residentName = user?.resident?.name;

            console.log("resident_id", residentId);
            console.log("residentName:", residentName);

            if (!residentId) throw new Error("No resident ID found");
            if (!residentName) throw new Error("No resident name found");

            formData.append("resident_id", residentId);
            formData.append("residentName", residentName);

            console.log("FormData entries:");
            formData.forEach((value, key) => {
                console.log(key, value);
            });

          await axios.post("http://localhost:3001/posts/create-post", formData, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
          });
          console.log("Post created successfully");
          navigate("/posts");
        } catch (error) {
          console.error("Error creating post:", error.response?.data || error.message);
          alert("Failed to create post: " + (error.response?.data.message || error.message));
        } finally {
          setLoading(false);
        }
      };

    /*const handleSubmit = async (e) => {
        e.preventDefault();
        if (!courseName || !courseDesc || !courseInstructor || !coursePrice || !courseType || !courseDate || !courseStartTime || !courseEndTime || !courseCapacity) {
            alert("Please fill in all fields");
            setLoading(false);
            return;
        }
        const formData = new FormData();
        formData.append("courseName", courseName);
        formData.append("courseDesc", courseDesc);
        formData.append("courseInstructor", courseInstructor);
        formData.append("coursePrice", coursePrice);
        formData.append("courseType", courseType);
        formData.append("courseDate", courseDate);
        formData.append("courseStartTime", courseStartTime);
        formData.append("courseEndTime", courseEndTime);
        formData.append("courseCapacity", courseCapacity);
        if (image) {
            formData.append("image", image);
        }
        console.log("FormData entries:");
        formData.forEach((value, key) => {
            console.log(key, value);
        });
        try {
            await axios.post("http://localhost:3001/courses/createCourse", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        } catch (error) {
            console.error(error);
            setLoading(false);
            alert("An error occurred");
        }
    };
    
    if (loading) {
        return <LoaderComponent />;
    }*/

    if (loading) {
        return <LoaderComponent />;
    }

  return (
    <Container size="md" my={40}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={3} mb="md">
          Create New Post
        </Title>
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            mb="md"
          />
          <TextInput
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            mb="md"
          />
          <Select
            label="Tag"
            value={tags}
            onChange={setTags}
            data={[
              { value: "Advice", label: "Advice" },
              { value: "Discussion", label: "Discussion" },
              { value: "Tips", label: "Tips" },
            ]}
            required
            mb="md"
          />
          <FileInput
            label="Image"
            onChange={setImage} // Update this line to directly set the image
            mb="md"
          />
          <Group position="right" mt="md">
            <Button type="submit">Create Post</Button>
          </Group>
        </form>
      </Paper>
    </Container>
  )
}

export default TestCreate