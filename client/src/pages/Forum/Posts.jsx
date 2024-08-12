import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons'; // Import the heart icon
import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoaderComponent from "../../components/Loader";
import Navbar from "../../components/Navbar";
import {
  Anchor,
  Card,
  Button,
  Text,
  Group,
  Image,
  Stack,
  Container,
  Modal,
  TextInput,
} from "@mantine/core";

// Define tags and colors
const tagOptions = [
  { value: "Advice", label: "Advice" },
  { value: "Discussion", label: "Discussion" },
  { value: "Tips", label: "Tips" },
  { value: "Question", label: "Question" },
  { value: "Announcement", label: "Announcement" },
];

const tagColors = {
  Advice: 'lightblue',
  Discussion: 'lightgreen',
  Tips: 'lightcoral',
  Question: '',
  Announcement: 'lightpink',
};

const Posts = () => {
  const { user } = useAuth(); // Get user from AuthContext
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState(""); // State for selected tag
  const [showIframe, setShowIframe] = useState(false); // State for iframe visibility
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get("/posts/posts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const sortedPosts = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPosts(sortedPosts.map(post => ({
        ...post,
        likedByUser: post.likedByUser || false // Ensure likedByUser is part of the post object
      })));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to fetch posts");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    document.title = "Posts - EcoUtopia";
  }, []);

  const handleReport = async (postId) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        `/posts/${postId}/report`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error("Error reporting post:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(`/posts/${selectedPostId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      fetchPosts();
      setIsModalOpen(false); // Close the modal after deletion
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleLike = async (postId, likedByUser) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = likedByUser
        ? await axios.post(`/posts/${postId}/unlike`, {}, { headers: { Authorization: `Bearer ${token}` } })
        : await axios.post(`/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });

      if (response.status === 200) {
        // Update the post's like count and status
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.post_id === postId
              ? { ...post, likesCount: response.data.likes, likedByUser: !likedByUser }
              : post
          )
        );
      } else {
        console.log(response.data); // Handle error responses
      }
    } catch (error) {
      console.error("Error liking/unliking post:", error);
    }
  };

  if (loading) return <LoaderComponent />;
  if (error) return <Text align="center">Error: {error}</Text>;

  const isImage = (url) => /\.(jpg|jpeg|png|gif)$/i.test(url);
  const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);

  const filteredPosts = posts.filter(
    (post) =>
      (post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase())) &&
      (selectedTag ? post.tags?.includes(selectedTag) : true)
  );

  return (
    <>
      <Navbar />
      <Text align="center" size="xl" weight={700} mt={20}>
        Posts
      </Text>
      <Anchor component={Link} to="/createPost" style={{ marginLeft: 20 }}>
        <Button variant="light">Create Post</Button>
      </Anchor>
      <Container>
        <TextInput
          placeholder="Search by title or content"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ margin: "20px 0" }}
        />
        <Group spacing="xs" mb="md">
          {tagOptions.map((tag) => (
            <Button
              key={tag.value}
              variant={selectedTag === tag.value ? 'filled' : 'outline'}
              color={tagColors[tag.value]}
              style={{ borderRadius: '20px' }}
              onClick={() => setSelectedTag(selectedTag === tag.value ? "" : tag.value)}
            >
              {tag.label}
            </Button>
          ))}
        </Group>
        <Stack className="posts-container" spacing="md">
          {filteredPosts.length === 0 ? (
            <Text align="center">No posts found</Text>
          ) : (
            filteredPosts.map((post) => (
              <Card
                key={post.post_id}
                shadow="sm"
                mb={20}
                onClick={() => navigate(`/posts/${post.post_id}`)}
                style={{ cursor: "pointer", position: "relative" }}
              >
                <Group position="right" style={{ position: "absolute", top: 10, right: 10 }}>
                  {post.resident_id === user?.resident?.resident_id && (
                    <>
                      <Button
                        variant="outline"
                        color="red"
                        style={{ border: "none" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPostId(post.post_id);
                          setIsModalOpen(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                      <Link to={`/edit/${post.post_id}`}>
                        <Button
                          variant="outline"
                          style={{ border: "none" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FontAwesomeIcon icon={faPencil} />
                        </Button>
                      </Link>
                    </>
                  )}
                </Group>
                <Group position="right" style={{ marginTop: 30 }}>
                  <Text size="sm" color="dimmed">
                    {post.residentName ? post.residentName : "Anonymous"}
                  </Text>
                  <Text size="sm">
                    {new Date(post.createdAt).toLocaleString()}
                  </Text>
                </Group>
                <Text weight={500} size="lg" mt="md">
                  {post.title}
                </Text>
                <Text size="sm" color="dimmed">
                  {post.tags ? post.tags : "No Tags"}
                </Text>
                {post.imageUrl && (
                  <>
                    {isImage(post.imageUrl) && (
                      <Image
                        w={400}
                        h={400}
                        src={post.imageUrl}
                      />
                    )}
                    {isVideo(post.imageUrl) && (
                      <div
                        style={{
                          position: 'relative',
                          width: '400px',
                          height: 'auto',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent click from navigating
                      >
                        <video width="400" controls style={{ display: 'block', width: '100%', height: 'auto' }}>
                          <source
                            src={post.imageUrl}
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </>
                )}
                <Text mt="md">{post.content}</Text>
                <Group position="right" mt="md">
                  <Button
                    variant="light"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReport(post.post_id);
                    }}
                  >
                    Report ({post.reports})
                  </Button>
                  <Button
                    variant="light"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(post.post_id, post.likedByUser);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faHeart}
                      style={{ marginRight: '5px', color: post.likedByUser ? 'red' : 'black' }}
                    />
                    Like ({post.likesCount || 0})
                  </Button>
                </Group>
              </Card>
            ))
          )}
        </Stack>
      </Container>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Deletion"
      >
        <Text>Are you sure you want to delete this post?</Text>
        <Group position="apart" style={{ marginTop: 20 }}>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button color="red" onClick={handleDelete}>
            Confirm Delete
          </Button>
        </Group>
      </Modal>

      {/* Button to toggle iframe visibility */}
      <Button
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          borderRadius: '50%',
          padding: '10px',
          backgroundColor: '#007bff',
          color: '#fff',
        }}
        onClick={() => setShowIframe(!showIframe)}
      >
        <FontAwesomeIcon icon={faComment} />
      </Button>

      {/* Iframe */}
      {showIframe && (
        <div
          style={{
            position: 'fixed',
            bottom: 70, // Adjust based on button size
            right: 20,
            width: '300px',
            height: '400px',
            zIndex: 1000,
          }}
        >
          <iframe
            src="https://www.chatbase.co/chatbot-iframe/I5Un_oP8_JzmsccTSViso"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            frameBorder="0"
          ></iframe>
        </div>
      )}
    </>
  );
};

export default Posts;
