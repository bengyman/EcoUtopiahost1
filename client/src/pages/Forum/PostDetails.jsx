import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin, faWhatsapp, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton, WhatsappShareButton, TelegramShareButton } from 'react-share';

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

  const handleLanguageChange = (event) => {
    const selectedLang = event.target.value;
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
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="language">Select Language:</label>
        <select id="language" value={selectedLanguage} onChange={handleLanguageChange}>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="zh">中文</option>
          <option value="ja">日本語</option>
          <option value="ko">한국어</option>
          <option value="id">Bahasa Indonesia</option>
          <option value="ms">Bahasa Melayu</option>
          <option value="hi">हिन्दी</option>
        </select>
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
      <p>{selectedLanguage === 'en' ? post.content : translatedContent}</p>
      <div style={{ marginTop: '20px' }}>
        <h2>Share this post:</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
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
        </div>
      </div>
      <h3>Comments:</h3>
      {comments.length > 0 ? (
        comments.map(comment => (
          <div key={comment.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            {editingCommentId === comment.id ? (
              <form onSubmit={updateComment}>
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  rows="4"
                  cols="50"
                  style={{ display: 'block', width: '100%', marginBottom: '10px' }}
                />
                <button type="submit">Save</button>
              </form>
            ) : (
              <>
                <p>{comment.content}</p>
                <p>
                  <strong>By: {comment.Resident.name}</strong> on {formatDate(comment.createdAt)}
                </p>
                {user && user.resident && comment.resident_id === user.resident.resident_id && (
                  <button onClick={() => handleUpdateComment(comment.id, comment.content)}>Edit</button>
                )}
              </>
            )}
          </div>
        ))
      ) : (
        <p>No comments yet.</p>
      )}
      <form onSubmit={handleCreateComment} style={{ marginTop: '20px' }}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows="4"
          cols="50"
          style={{ display: 'block', width: '100%', marginBottom: '10px' }}
        />
        <button type="submit">Post Comment</button>
      </form>
    </div>
  );
};

export default PostDetails;
