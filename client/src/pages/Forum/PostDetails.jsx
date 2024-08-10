import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin, faWhatsapp, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton, WhatsappShareButton, TelegramShareButton } from 'react-share';
import { Button, Textarea, Select } from '@mantine/core';

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
  const maxCommentLength = 100;

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

  const handleUpdateComment = (commentId, content) => {
    setEditingCommentId(commentId);
    setEditingContent(content);
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
        window.location.reload();  // Reload the page after editing a comment
      } else {
        console.error('Unexpected response structure:', response.data);
      }
    } catch (error) {
      console.error('Error updating comment:', error.response?.data || error.message);
      alert("Failed to update comment: " + (error.response?.data.message || error.message));
    }
  };

  const handleLanguageChange = (event) => {
    const selectedLang = event;
    setSelectedLanguage(selectedLang);
    if (post) {
      translateContent(post.content, selectedLang);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!post) {
    return <p>Post not found.</p>;
  }

  const isImageUrl = (url) => {
    return /\.(jpeg|jpg|gif|png)$/i.test(url);
  };

  const postUrl = `http://localhost:3000/posts/${post.post_id}`;
  const postTitle = encodeURIComponent(post.title);
  const postContent = encodeURIComponent(post.content);
  const customMessage = "Check out this amazing post I found!%0A";

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="language">Select Language:</label>
          <Select
            id="language"
            value={selectedLanguage}
            onChange={handleLanguageChange}
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
          />
        </div>

        <div style={{ marginBottom: '10px', fontSize: '1.1em' }}>
          <strong>Creator: {post.residentName}</strong>
        </div>
        <h1 style={{ marginBottom: '5px' }}>{post.title}</h1>
        {post.tags && <p style={{ fontStyle: 'italic', marginBottom: '10px' }}>Tags: {post.tags}</p>}
        {post.imageUrl && (
          isImageUrl(post.imageUrl) ? (
            <img src={`${post.imageUrl}`} alt={post.title} style={{ width: '400px', height: '400px', objectFit: 'cover', marginBottom: '10px' }} />
          ) : (
            <video
              controls
              style={{ width: '400px', height: '400px', objectFit: 'cover', marginBottom: '10px' }}
              onEnded={(e) => { e.target.currentTime = 0; e.target.play(); }}
            >
              <source src={`${post.imageUrl}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )
        )}
        <p>{translatedContent}</p>

        <div className="share-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', marginBottom: '20px' }}>
          <FacebookShareButton url={postUrl} quote={postTitle} className="share-button">
            <FontAwesomeIcon icon={faFacebook} size="2x" />
          </FacebookShareButton>
          <TwitterShareButton url={postUrl} title={postContent} className="share-button">
            <FontAwesomeIcon icon={faTwitter} size="2x" />
          </TwitterShareButton>
          <LinkedinShareButton url={postUrl} summary={postContent} className="share-button">
            <FontAwesomeIcon icon={faLinkedin} size="2x" />
          </LinkedinShareButton>
          <WhatsappShareButton url={postUrl} title={customMessage} separator="%0A" className="share-button">
            <FontAwesomeIcon icon={faWhatsapp} size="2x" />
          </WhatsappShareButton>
          <TelegramShareButton url={postUrl} title={customMessage} className="share-button">
            <FontAwesomeIcon icon={faTelegram} size="2x" />
          </TelegramShareButton>
        </div>
      </div>

      <div>
        <h2>Comments:</h2>
        <form onSubmit={handleCreateComment} style={{ position: 'relative' }}>
          <Textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder="Write your comment here..."
            maxLength={maxCommentLength} // Enforces max length
            style={{
              width: '100%',
              height: '150px',
              marginBottom: '1px',
              borderRadius: '10px',
              padding: '10px',
              boxSizing: 'border-box'
            }} // Increased height and added box-sizing
          />
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            color: 'gray',
            fontSize: '0.9em'
          }}>
            {`${maxCommentLength - newComment.length} characters remaining`}
          </div>
          <Button
            type="submit"
            color="teal"
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px' // Moved button to the left
            }}
          >
            Add Comment
          </Button>
        </form>
        {comments.map((comment) => (
          <div key={comment.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px', position: 'relative', textAlign: 'left', borderRadius: '8px', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '5px', fontSize: '0.9em', color: '#555' }}>By: {comment.Resident.name}</div>
            <div style={{ marginBottom: '5px', fontSize: '0.8em', color: '#888' }}>Date created: {formatDate(comment.createdAt)}</div>
            {editingCommentId === comment.id ? (
              <form onSubmit={updateComment}>
                <Textarea
                  value={editingContent}
                  onChange={(event) => setEditingContent(event.target.value)}
                  style={{ width: '100%', height: '150px', marginBottom: '10px', borderRadius: '8px', padding: '10px', boxSizing: 'border-box' }} // Increased height and added box-sizing
                />
                <Button type="submit" color="teal" style={{ marginRight: '10px' }}>
                  Save
                </Button>
                <Button onClick={() => setEditingCommentId(null)} color="red">
                  Cancel
                </Button>
              </form>
            ) : (
              <>
                <p>{comment.content}</p>
                {user?.role === 'staff' || comment.resident_id === user?.resident?.resident_id ? (
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <Button
                      onClick={() => handleUpdateComment(comment.id, comment.content)}
                      color="blue"
                      variant="subtle"
                      style={{ marginRight: '5px' }}
                    >
                      <FontAwesomeIcon icon={faPencil} />
                    </Button>
                    <Button
                      onClick={() => handleDeleteComment(comment.id)}
                      color="red"
                      variant="subtle"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostDetails;
