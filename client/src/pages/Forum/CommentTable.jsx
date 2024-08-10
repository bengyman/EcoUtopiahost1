import axios from "axios";
import copy from "copy-to-clipboard";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Container,
  Button,
  Group,
  Title,
  Alert,
  TextInput,
  Paper,
  ActionIcon,
} from "@mantine/core";
import { ClipboardCopy } from "tabler-icons-react";

function CommentTable() {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchComments = async () => {
    try {
      console.log("Fetching comments...");
      const response = await axios.get('/posts/admin/comments', {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      console.log("API Response:", response.data);
      setComments(response.data);
    } catch (error) {
      setError("Failed to fetch comments");
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [user]);

  const handleDelete = async (commentId) => {
    try {
      await axios.delete(`/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      fetchComments();
    } catch (error) {
      setError("Failed to delete comment");
      console.error("Error deleting comment:", error);
    }
  };

  const handleCopyContent = (content) => {
    copy(content);
    alert("Content copied to clipboard!");
  };

  return (
    <Container size="xl" style={{ position: "relative" }}>
      <Title align="center" style={{ marginTop: 20 }}>
        Comment Management
      </Title>
      {error && (
        <Alert title="Error" color="red" mt="md">
          {error}
        </Alert>
      )}
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Table highlightOnHover withBorder>
          <thead>
            <tr>
              <th>Comment ID</th>
              <th>Content</th>
              <th>Resident ID</th>
              <th>Resident Name</th>
              <th>Post ID</th>
              <th>Reports</th>
              <th>Date Created</th>
              <th>Date Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <tr
                  key={comment.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                  }}
                >
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px" }}>
                    {comment.id}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e0e0e0",
                      padding: "8px",
                      position: "relative",
                    }}
                  >
                    <Group position="right">
                      <ActionIcon
                        onClick={() => handleCopyContent(comment.content)}
                        title="Copy Content"
                      >
                        <ClipboardCopy size={16} />
                      </ActionIcon>
                    </Group>
                    {comment.content}
                  </td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px" }}>
                    {comment.resident_id}
                  </td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px" }}>
                    {comment.residentName}
                  </td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px" }}>
                    {comment.post_id}
                  </td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px" }}>
                    {comment.reports}
                  </td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px" }}>
                    {new Date(comment.createdAt).toLocaleString()}
                  </td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px" }}>
                    {new Date(comment.updatedAt).toLocaleString()}
                  </td>
                  <td style={{ border: "1px solid #e0e0e0", padding: "8px" }}>
                    <Button
                      color="red"
                      onClick={() => handleDelete(comment.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    textAlign: "center",
                    border: "1px solid #e0e0e0",
                    padding: "8px",
                  }}
                >
                  No comments found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Paper>
    </Container>
  );
}

export default CommentTable;
