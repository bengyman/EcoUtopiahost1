import { useState, useEffect } from "react";
import {
  Button,
  Container,
  Paper,
  Title,
  TextInput,
  FileInput,
  Group,
  Select,
  Text,
  Stack,
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
      const instructorId = user?.instructor?.instructorid; // Get instructor ID if available
      const instructorName = user?.instructor?.name; // Get instructor's name

      if (!residentId && !instructorId) throw new Error("No resident or instructor ID found");

      if (residentId) {
        formData.append("resident_id", residentId);
        formData.append("residentName", residentName); // Include resident's name
      } else if (instructorId) {
        formData.append("instructor_id", instructorId);
        formData.append("name", instructorName); // Include instructor's name
      }

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

  // Determine tag options based on user role
  const tagOptions = [
    { value: "Advice", label: "Advice" },
    { value: "Discussion", label: "Discussion" },
    { value: "Tips", label: "Tips" },
    { value: "Question", label: "Question" },
  ];

  // Only instructors can use the "Announcement" tag
  if (user?.instructor) {
    tagOptions.push({ value: "Announcement", label: "Announcement" });
  }

  return (
    <Container size="md" my={40}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={3} mb="md">
          Create New Post
        </Title>
        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <div>
              <TextInput
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
                mb="xs"
                error={titleError ? "Required" : null}
                styles={(theme) => ({
                  input: {
                    borderColor: titleError ? theme.colors.red[7] : undefined,
                    color: titleError ? theme.colors.dark[9] : undefined,
                  },
                })}
              />
              <Text size="sm" color="dimmed" align="right">
                {50 - title.length} characters remaining
              </Text>
            </div>
            <div>
              <TextInput
                label="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={300}
                mb="xs"
                error={contentError ? "Required" : null}
                styles={(theme) => ({
                  input: {
                    borderColor: contentError ? theme.colors.red[7] : undefined,
                    color: contentError ? theme.colors.dark[9] : undefined,
                  },
                })}
              />
              <Text size="sm" color="dimmed" align="right">
                {300 - content.length} characters remaining
              </Text>
            </div>
            <Select
              label="Tag"
              value={tags}
              onChange={setTags}
              data={tagOptions} // Use the determined tag options
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
          </Stack>
          <Group position="right" mt="md">
            <Button type="submit">Create Post</Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}

export default CreatePost;
