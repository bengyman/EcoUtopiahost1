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

const Posts = () => {
  const { user } = useAuth(); // Get user from AuthContext
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [search, setSearch] = useState("");
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
      setPosts(sortedPosts);
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
        `http://localhost:3000/api/posts/${postId}/report`,
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

  if (loading) return <LoaderComponent />;
  if (error) return <Text align="center">Error: {error}</Text>;

  const isImage = (url) => /\.(jpg|jpeg|png|gif)$/i.test(url);
  const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <Text align="center" size="xl" weight={700} mt={20}>
        Posts
      </Text>
      {/*<Button variant="light" style={{ marginLeft: 20 }}>
        <Link to="/createPost">Create Post</Link>
      </Button>*/}
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
                style={{ cursor: "pointer" }}
              >
                <Group position="apart">
                  {post.resident_id === user?.resident?.resident_id && (
                    <Group position="left">
                      <Button
                        variant="outline"
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPostId(post.post_id);
                          setIsModalOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                      <Link to={`/edit/${post.post_id}`}>
                        <Button
                          variant="outline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Edit
                        </Button>
                      </Link>
                    </Group>
                  )}
                  <Group position="right">
                    <Text size="sm" color="dimmed">
                      {post.residentName ? post.residentName : "Anonymous"}
                    </Text>
                    <Text size="sm">
                      {new Date(post.createdAt).toLocaleString()}
                    </Text>
                  </Group>
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
                        src={`${post.imageUrl}`}
                      />
                    )}
                    {isVideo(post.imageUrl) && (
                      <video width="400" controls>
                        <source
                          src={`${post.imageUrl}`}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
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
    </>
  );
};

export default Posts;
