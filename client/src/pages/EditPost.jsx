import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextInput, Container, Paper, Title, Button, Group } from '@mantine/core';
import LoaderComponent from '../components/Loader.jsx';

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:3001/posts/${id}`);
                setPost(response.data);
                setTitle(response.data.title);
                setContent(response.data.content);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching post:', error);
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await axios.put(`http://localhost:3001/posts/${id}`, { title, content });
            navigate('/posts');
        } catch (error) {
            console.error('Error updating post:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <LoaderComponent />;
    }

    return (
        <Container size="md" my={40}>
            <Paper withBorder shadow="md" p={30} radius="md">
                <Title order={3} mb="md">
                    Edit Post
                </Title>
                {post ? (
                    <form onSubmit={handleSubmit}>
                        <TextInput
                            label="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            mb="md"
                        />
                        <TextInput
                            label="Content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            mb="md"
                        />
                        <Group position="right" mt="md">
                            <Button type="submit">Update Post</Button>
                        </Group>
                    </form>
                ) : (
                    <p>Loading...</p>
                )}
            </Paper>
        </Container>
    );
};

export default EditPost;
