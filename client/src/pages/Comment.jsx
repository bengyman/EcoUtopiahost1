// src/components/Comment.jsx
import React, { useState } from 'react';
import { Button, TextInput, Group, Text } from '@mantine/core';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Comment = ({ comment, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);

  const handleUpdate = async () => {
    try {
      await axios.put(`/comments/${comment.id}`, { content });
      onUpdate(comment.id, content);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/comments/${comment.id}`);
      onDelete(comment.id);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div>
      {isEditing ? (
        <TextInput
          value={content}
          onChange={(e) => setContent(e.target.value)}
          mb="md"
        />
      ) : (
        <Text mb="md">{comment.content}</Text>
      )}
      <Group>
        {isEditing ? (
          <>
            <Button onClick={handleUpdate}>Update</Button>
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
          </>
        ) : (
          <>
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
            <Button onClick={handleDelete}>Delete</Button>
          </>
        )}
      </Group>
    </div>
  );
};

export default Comment;
