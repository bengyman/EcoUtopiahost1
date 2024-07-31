import React, { useEffect, useState } from 'react';
import { Table, Container, Button, Group, Title, Alert, TextInput, Paper, Pagination, ActionIcon, Select } from '@mantine/core';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ClipboardCopy } from 'tabler-icons-react'; // Import icon from tabler-icons
import copy from 'copy-to-clipboard'; // Import copy-to-clipboard library

function PostTable() {
  const [posts, setPosts] = useState([]);
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('reports'); // Default sorting field
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page
  const [expandedPostId, setExpandedPostId] = useState(null); // State for managing expanded post
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/posts/admin/posts', {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      console.log('API Response:', response.data); // Log API response
      setPosts(response.data || []);
      setDisplayedPosts(response.data.slice(0, itemsPerPage));
    } catch (error) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [search, sortField, page, posts]);

  const applyFilters = () => {
    let filteredPosts = posts;

    if (search) {
      filteredPosts = filteredPosts.filter(post =>
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.content.toLowerCase().includes(search.toLowerCase()) ||
        post.tags.toLowerCase().includes(search.toLowerCase()) ||
        post.residentName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortField) {
      filteredPosts = filteredPosts.sort((a, b) => {
        if (sortField === 'dateCreated') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortField === 'dateUpdated') {
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        } else if (sortField === 'postId') {
          return a.post_id - b.post_id;
        } else if (sortField === 'reports') {
          return b.reports - a.reports;
        }
        return 0;
      });
    }

    const offset = (page - 1) * itemsPerPage;
    setDisplayedPosts(filteredPosts.slice(offset, offset + itemsPerPage));
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      fetchPosts(); // Refresh the list of posts
    } catch (error) {
      setError('Failed to delete post');
      console.error('Error deleting post:', error);
    }
  };

  const handleCopyContent = (content) => {
    copy(content);
    alert('Content copied to clipboard!');
  };

  const toggleContentVisibility = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  const handleImageClick = (imageUrl) => {
    navigate(`/image/${encodeURIComponent(imageUrl)}`);
  };

  return (
    <Container size="xl" style={{ position: 'relative' }}>
      <Title align="center" style={{ marginTop: 20 }}>Post Management</Title>
      {error && <Alert title="Error" color="red" mt="md">{error}</Alert>}
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Group position="apart" mb="md">
          <TextInput
            placeholder="Search"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />
          <Group>
            <Select
              value={sortField}
              onChange={setSortField}
              data={[
                { value: 'reports', label: 'Reports (Descending)' },
                { value: 'postId', label: 'Post ID' },
                { value: 'dateCreated', label: 'Date Created' },
                { value: 'dateUpdated', label: 'Date Updated' },
              ]}
              placeholder="Sort by"
              style={{ width: 200 }}
            />
          </Group>
        </Group>
        <Table highlightOnHover withBorder>
          <thead>
            <tr>
              <th>Post ID</th>
              <th>Title</th>
              <th>Content</th>
              <th>Tags</th>
              <th>Image URL</th>
              <th>Reports</th>
              <th>Resident ID</th>
              <th>Resident Name</th>
              <th>Date Created</th>
              <th>Date Updated</th>
              <th>Actions</th> {/* Add an Actions column */}
            </tr>
          </thead>
          <tbody>
            {displayedPosts.length > 0 ? displayedPosts.map((post, index) => (
              <tr key={post.post_id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
                <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{post.post_id}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{post.title}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: '8px', position: 'relative' }}>
                  <Group position="right">
                    <ActionIcon onClick={() => handleCopyContent(post.content)} title="Copy Content">
                      <ClipboardCopy size={16} />
                    </ActionIcon>
                  </Group>
                  <Button onClick={() => toggleContentVisibility(post.post_id)}>
                    {expandedPostId === post.post_id ? 'Hide Content' : 'Show Content'}
                  </Button>
                  {expandedPostId === post.post_id && (
                    <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #e0e0e0' }}>
                      {post.content}
                    </div>
                  )}
                </td>
                <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{post.tags}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>
                  <Button variant="link" onClick={() => handleImageClick(post.imageUrl)}>
                    View Image
                  </Button>
                </td>
                <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{post.reports}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{post.resident_id}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{post.residentName}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{new Date(post.createdAt).toLocaleString()}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>{new Date(post.updatedAt).toLocaleString()}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>
                  <Button color="red" onClick={() => handleDelete(post.post_id)}>Delete</Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', border: '1px solid #e0e0e0', padding: '8px' }}>No posts found</td>
              </tr>
            )}
          </tbody>
        </Table>
        <Group position="center" mt="md">
          <Pagination page={page} onChange={setPage} total={Math.ceil(posts.length / itemsPerPage)} />
        </Group>
      </Paper>
    </Container>
  );
}

export default PostTable;
