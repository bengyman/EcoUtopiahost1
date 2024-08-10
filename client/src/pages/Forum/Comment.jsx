import { useState } from 'react';
import { Button, TextInput, Group, Text } from '@mantine/core';
import axios from 'axios';

const Comment = ({ comment, onUpdate, onDelete, isOwner }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);

  const handleUpdate = async () => {
    try {
      await axios.put(`posts/comments/${comment.id}`, { content });
      onUpdate(comment.id, content);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`posts/comments/${comment.id}`);
      onDelete(comment.id);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      <Text weight={500} mb="xs">{comment.resident.name}</Text>
      <Text size="sm" color="gray" mb="md">{new Date(comment.createdAt).toLocaleDateString()}</Text>
      {isEditing ? (
        <TextInput
          value={content}
          onChange={(e) => setContent(e.target.value)}
          mb="md"
        />
      ) : (
        <Text mb="md">{content}</Text>
      )}
      <Group>
        {isEditing ? (
          <>
            <Button onClick={handleUpdate}>Update</Button>
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
          </>
        ) : (
          <>
            {isOwner && (
              <>
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
                <Button onClick={handleDelete}>Delete</Button>
              </>
            )}
          </>
        )}
      </Group>
    </div>
  );
};

export default Comment;
