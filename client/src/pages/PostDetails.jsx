import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin, faWhatsapp, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton } from 'react-share';

const PostDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/posts/${id}`);
        console.log('Response from server:', response.data);

        if (response.data) {
          setPost(response.data);
          setComments(response.data.Comments || []);
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
  }, [id]);

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
        // Clear the new comment input field
        setNewComment('');
        // Reload the page to reflect the new comment
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

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!post) {
    return <p>Post not found.</p>;
  }

  const postUrl = `http://localhost:3000/posts/${post.post_id}`;
  const postTitle = encodeURIComponent(post.title);
  const postContent = encodeURIComponent(post.content);
  const customMessage = "Check out this amazing post I found!%0A";

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      {/* Creator's name */}
      <div style={{ marginBottom: '10px', fontSize: '1.1em' }}>
        <strong>Creator: {post.residentName}</strong>
      </div>
      {/* Post Title */}
      <h1 style={{ marginBottom: '5px' }}>{post.title}</h1>
      {/* Post Tags */}
      {post.tags && <p style={{ fontStyle: 'italic', marginBottom: '10px' }}>Tags: {post.tags}</p>}
      {/* Post Image */}
      {post.imageUrl && <img src={`http://localhost:3001/${post.imageUrl}`} alt={post.title} style={{ width: '400px', height: '400px', objectFit: 'cover', marginBottom: '10px' }} />}
      {/* Post Content */}
      <p>{post.content}</p>
      {/* Share Buttons */}
      <div style={{ marginTop: '20px' }}>
        <h2>Share this post:</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
          <FacebookShareButton url={postUrl} quote={post.title}>
            <FontAwesomeIcon icon={faFacebook} size="2x" />
          </FacebookShareButton>
          <TwitterShareButton url={postUrl} title={post.title}>
            <FontAwesomeIcon icon={faTwitter} size="2x" />
          </TwitterShareButton>
          <LinkedinShareButton url={postUrl} title={post.title} summary={post.content}>
            <FontAwesomeIcon icon={faLinkedin} size="2x" />
          </LinkedinShareButton>
          <a
            href={`https://wa.me/?text=${customMessage}${postTitle}%0A${postUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <FontAwesomeIcon icon={faWhatsapp} size="2x" />
          </a>
          <a
            href={`https://t.me/share/url?url=${postUrl}&text=${customMessage}${postTitle}%0A${postContent}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <FontAwesomeIcon icon={faTelegram} size="2x" />
          </a>
        </div>
      </div>
      {/* Comments */}
      <div>
        <h2>Comments</h2>
        {comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', position: 'relative', textAlign: 'left' }}>
              {editingCommentId === comment.id ? (
                <form onSubmit={updateComment}>
                  <textarea 
                    value={editingContent} 
                    onChange={(e) => setEditingContent(e.target.value)} 
                    rows="3" 
                    style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                  />
                  <button type="submit" style={{ padding: '5px 10px' }}>Update</button>
                  <button type="button" onClick={() => setEditingCommentId(null)} style={{ padding: '5px 10px', marginLeft: '10px' }}>Cancel</button>
                </form>
              ) : (
                <>
                  {/* Comment Content; Done */}
                  <p style={{ margin: '0' }}>{comment.content}</p>
                  {/* Commenter Name and Time Posted */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.8em', color: '#888' }}>
                    <div><strong>{comment.Resident?.name || 'Unknown'}</strong></div>
                    <div>{new Date(comment.createdAt).toLocaleString()}</div>
                  </div>
                  <button onClick={() => handleUpdateComment(comment.id, comment.content)} style={{ marginTop: '10px' }}>Edit</button>
                </>
              )}
            </div>
          ))
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}
      </div>
      <form onSubmit={handleCreateComment} style={{ marginTop: '20px' }}>
        <textarea 
          value={newComment} 
          onChange={(e) => setNewComment(e.target.value)} 
          rows="4" 
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>Add Comment</button>
      </form>
    </div>
  );
};

export default PostDetails;
