import { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";
import LoaderComponent from "../../components/Loader.jsx";

function CreatePost() {
  const { user } = useAuth(); // Get user from AuthContext
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState(""); // State for tags
  const [loading, setLoading] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [contentError, setContentError] = useState(false);
  const [tagsError, setTagsError] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const isTitleEmpty = !title;
    const isContentEmpty = !content;
    const isTagsEmpty = !tags;

    setTitleError(isTitleEmpty);
    setContentError(isContentEmpty);
    setTagsError(isTagsEmpty);

    if (isTitleEmpty || isContentEmpty || isTagsEmpty) {
      setLoading(false);
      return;
    }

    const token = sessionStorage.getItem('token');
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);
    formData.append("tags", tags);

    try {
      if (!token) throw new Error("No token found");

      const residentId = user?.resident?.resident_id;
      const residentName = user?.resident?.name;

      console.log("Resident ID:", residentId);
      console.log("Resident Name:", residentName);

      if (!residentId) throw new Error("No resident ID found");
      if (!residentName) throw new Error("No resident name found");

      formData.append("resident_id", residentId);
      formData.append("residentName", residentName);

      console.log("FormData entries:");
      formData.forEach((value, key) => {
        console.log(key, value);
      });

      await axios.post("/posts/create-post", formData, {
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
            mb="md"
            error={titleError ? "Required" : null}
            styles={(theme) => ({
              input: {
                borderColor: titleError ? theme.colors.red[7] : undefined,
                color: titleError ? theme.colors.dark[9] : undefined,
              },
            })}
          />
          <TextInput
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            mb="md"
            error={contentError ? "Required" : null}
            styles={(theme) => ({
              input: {
                borderColor: contentError ? theme.colors.red[7] : undefined,
                color: contentError ? theme.colors.dark[9] : undefined,
              },
            })}
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
            mb="md"
            error={tagsError ? "Required" : null}
            styles={(theme) => ({
              input: {
                borderColor: tagsError ? theme.colors.red[7] : undefined,
                color: tagsError ? theme.colors.dark[9] : undefined,
              },
            })}
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
  );
}

export default CreatePost;
