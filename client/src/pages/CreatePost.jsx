import { useState } from "react";
import {
  Button,
  Container,
  Paper,
  Title,
  TextInput,
  FileInput,
  Group,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import LoaderComponent from "../components/Loader.jsx";

function CreatePost() {
  const { user, token } = useAuth(); // Get token from AuthContext
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!title || !content) {
      alert("Title and content are required");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      if (!token) throw new Error("No token found");

      await axios.post("/posts/createPost", formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/posts");
    } catch (error) {
      console.error("Error creating post:", error.response?.data || error.message);
      alert("Failed to create post: " + (error.response?.data.message || error.message));
    } finally {
      setLoading(false);
    }
  };

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
          <FileInput
            label="Image"
            onChange={(e) => setImage(e.target.files[0])}
            mb="md"
          />
          <Group position="right" mt="md">
            <Button type="submit">Create Post</Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}

export default CreatePost;
