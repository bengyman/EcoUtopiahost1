import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin, faWhatsapp, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton, WhatsappShareButton, TelegramShareButton } from 'react-share';
import { faPencil, faTrash, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { Container, Paper, Text, Title, Image, AspectRatio, Select, Group, Button, Textarea, Divider, Loader, Center, Avatar } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

const PostDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translatedContent, setTranslatedContent] = useState('');
  const [sortedComments, setSortedComments] = useState([]);

  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/posts/${id}`);
        console.log('Response from server:', response.data);

        

        if (response.data) {
          setPost(response.data);
          setComments(response.data.Comments || []);
          translateContent(response.data.content, selectedLanguage);
        } else {
          console.error('Post data is missing in response:', response.data);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, selectedLanguage]);

  useEffect(() => {
    // Sort comments by newest first
    const sorted = [...comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setSortedComments(sorted);
  }, [comments]);

  

  const translateContent = async (content, targetLanguage) => {
    try {
      const response = await axios.post('http://localhost:3001/api/translate', {
        text: content,
        targetLanguage,
      });
      console.log('Translation response:', response.data);
      setTranslatedContent(response.data.translatedText);
    } catch (error) {
      console.error('Error translating content:', error);
    }
  };

  const handleCreateComment = async (event) => {
    event.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const formData = new FormData();
      formData.append("content", newComment);
      formData.append("resident_id", user?.resident?.resident_id);
      formData.append("residentName", user?.resident?.name);
      formData.append("residentAvatar", user?.resident?.profile_pic);
      formData.append("post_id", id);

      const response = await axios.post(`http://localhost:3001/posts/${id}/comments`, formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log('Comment creation response:', response.data);

      if (response.data && response.data.comment) {
        setNewComment('');
        window.location.reload();
      } else {
        console.error('Unexpected response structure:', response.data);
      }
    } catch (error) {
      console.error('Error creating comment:', error.response?.data || error.message);
      alert("Failed to create comment: " + (error.response?.data.message || error.message));
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this comment?");

    if (confirmDelete) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.delete(`http://localhost:3001/posts/comments/${commentId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        console.log('Comment deletion response:', response.data);

        if (response.status === 200) {
          setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
        } else {
          console.error('Unexpected response status:', response.status);
        }
      } catch (error) {
        console.error('Error deleting comment:', error.response?.data || error.message);
        alert("Failed to delete comment: " + (error.response?.data.message || error.message));
      }
    }
  };

  const handleUpdateComment = (commentId, content) => {
    setEditingCommentId(commentId);
    setEditingContent(content);
  };

  const updateComment = async (event) => {
    event.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:3001/posts/comments/${editingCommentId}`,
        { content: editingContent },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log('Comment update response:', response.data);

      if (response.data) {
        setComments(prevComments => prevComments.map(comment =>
          comment.id === editingCommentId ? response.data : comment
        ));
        setEditingCommentId(null);
        setEditingContent('');
      } else {
        console.error('Unexpected response structure:', response.data);
      }
    } catch (error) {
      console.error('Error updating comment:', error.response?.data || error.message);
      alert("Failed to update comment: " + (error.response?.data.message || error.message));
    }
  };

  const handleLanguageChange = (value) => {
    setSelectedLanguage(value);
    if (post) {
      translateContent(post.content, value);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader />
      </Center>
    );
  }

  if (!post) {
    return (
      <Container>
        <Text align="center">Post not found.</Text>
      </Container>
    );
  }

  const isImageUrl = (url) => {
    return /\.(jpeg|jpg|gif|png)$/i.test(url);
  };

  const postUrl = `http://localhost:3000/posts/${post.post_id}`;
  const postTitle = encodeURIComponent(post.title);
  const postContent = encodeURIComponent(post.content);
  const customMessage = "Check out this amazing post I found!%0A";

  return (
    <Container size="sm">
      <Paper withBorder shadow="md" p="md" mt="md">
        <Group position="apart" mb="md">
          <Group>
          {post.Resident ? (
              <Avatar src={post.Resident.profile_pic} alt="Resident Profile picture" radius="xl" size={50} />
            ) : post.Instructor ? (
              <Avatar src={post.Instructor.profile_pic} alt="Instructor Profile picture" radius="xl" size={50} />
            ) : null}
            <div>
              <Text size="sm" color="dimmed">{post.name}</Text>
              <Group align="center">
                <Text weight={500}>
                  {post.Resident ? post.Resident.name : post.Instructor ? post.Instructor.name : 'Unknown'}
                </Text>
                {post.Instructor && <FontAwesomeIcon icon={faCheckCircle} color="blue" />}
              </Group>
              <Text size="xs" color="dimmed">{formatDate(post.createdAt)}</Text>
            </div>
          </Group>
          <Select
            data={[
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Español' },
              { value: 'fr', label: 'Français' },
              { value: 'zh', label: '中文' },
              { value: 'ja', label: '日本語' },
              { value: 'ko', label: '한국어' },
              { value: 'id', label: 'Bahasa Indonesia' },
              { value: 'ms', label: 'Bahasa Melayu' },
              { value: 'hi', label: 'हिन्दी' },
            ]}
            value={selectedLanguage}
            onChange={handleLanguageChange}
            style={{ maxWidth: 150 }}
            size="sm"
          />
        </Group>
        <Title order={1} align="center" mb="sm">{post.title}</Title>
        {post.tags && <Text align="center" size="sm" italic mb="md">Tags: {post.tags}</Text>}
        {post.imageUrl && (
          isImageUrl(post.imageUrl) ? (
            <Image
              src={`${post.imageUrl}`}
              alt={post.title}
              radius="md"
              mb="md"
              height={isMobile ? 200 : 400}
              fit="cover"
            />
          ) : (
            <AspectRatio ratio={16 / 9} mb="md">
              <video controls>
                <source src={post.imageUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </AspectRatio>
          )
        )}
        <Text align="justify" size="md" mb="md">{selectedLanguage === 'en' ? post.content : translatedContent}</Text>
        <Divider my="md" />
        <Title order={2} align="center" mb="sm">Share this post:</Title>
        <Group position="center" spacing="md" mb="md">
          <FacebookShareButton url={postUrl} quote={postContent} className="share-button">
            <FontAwesomeIcon icon={faFacebook} size="2x" />
          </FacebookShareButton>
          <TwitterShareButton url={postUrl} title={postContent} className="share-button">
            <FontAwesomeIcon icon={faTwitter} size="2x" />
          </TwitterShareButton>
          <LinkedinShareButton url={postUrl} title={postContent} summary={postContent} source={postUrl} className="share-button">
            <FontAwesomeIcon icon={faLinkedin} size="2x" />
          </LinkedinShareButton>
          <WhatsappShareButton url={postUrl} title={customMessage} separator=":: " className="share-button">
            <FontAwesomeIcon icon={faWhatsapp} size="2x" />
          </WhatsappShareButton>
          <TelegramShareButton url={postUrl} title={customMessage} className="share-button">
            <FontAwesomeIcon icon={faTelegram} size="2x" />
          </TelegramShareButton>
        </Group>
        <Divider my="md" />
        <Title order={2} mb="sm">Comments:</Title>
        {sortedComments.length > 0 ? (
          sortedComments.map((comment) => (
            <Paper key={comment.id} withBorder shadow="sm" p="sm" mb="md" style={{ position: 'relative' }}>
              <Group position="apart" mb="sm">
                <Group spacing="xs">
                  <Avatar src={comment.Resident.profile_pic} alt={comment.Resident.name} radius="xl" size="sm" />
                  <Text size="sm" color="dimmed">{comment.Resident.name}</Text>
                </Group>
                <Group spacing="xs">
                  {user && user.resident && comment.resident_id === user.resident.resident_id && (
                    <>
                      <Button
                        onClick={() => handleUpdateComment(comment.id, comment.content)}
                        variant="subtle"
                        color="blue"
                        size="xs"
                        style={{ position: 'absolute', top: '10px', right: '40px', padding: 0, minWidth: 'auto', height: 'auto' }}
                      >
                        <FontAwesomeIcon icon={faPencil} size="lg" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteComment(comment.id)}
                        variant="subtle"
                        color="red"
                        size="xs"
                        style={{ position: 'absolute', top: '10px', right: '5px', padding: 0, minWidth: 'auto', height: 'auto' }}
                      >
                        <FontAwesomeIcon icon={faTrash} size="lg" />
                      </Button>
                    </>
                  )}
                  <Text size="xs" color="dimmed">{formatDate(comment.createdAt)}</Text>
                </Group>
              </Group>
              {editingCommentId === comment.id ? (
                <form onSubmit={updateComment}>
                  <Textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows="4"
                    autosize
                    minRows={3}
                    maxRows={6}
                    mb="sm"
                  />
                  <Button type="submit" size="xs" fullWidth>
                    Save
                  </Button>
                </form>
              ) : (
                <Text mb="sm">{comment.content}</Text>
              )}
            </Paper>
          ))
        ) : (
          <Text align="center">No comments yet.</Text>
        )}
        <Divider my="md" />
        <form onSubmit={handleCreateComment}>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows="4"
            autosize
            minRows={3}
            maxRows={6}
            mb="sm"
          />
          <Button type="submit" fullWidth>
            Post Comment
          </Button>
        </form>
      </Paper>
    </Container>
  );
}



export default PostDetails;