import { useState, useRef } from 'react'
import { useEffect } from "react"
import { Container, Button, HoverCard, Text, Group, Notification } from "@mantine/core"
import { IconCheck, IconX } from '@tabler/icons-react';

function TestPage() {
  const [success, setSuccess] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  //const [loading, setLoading] = useState(false);
  //const fileInputRef = useRef(null);

  useEffect(() => {
    document.title = "Test Page - EcoUtopia"
  }, [])


  const handleUpload = async (e) => {
    e.preventDefault();
    const fileInput = e.target.elements.file;
    const file = fileInput.files[0];
    if (!file) {
      setErrorMessage('Please select a file');
      setTimeout(() => setErrorMessage(''), 2500);
      return;
    }

    if (file.size === 0) {
      setErrorMessage('File is empty');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    if (file.size > 1024 * 1024 * 5) {
      setErrorMessage('File size should be less than 5MB');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);
        setErrorMessage('');
        fileInput.value = '';
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setSuccess(false);
        setErrorMessage(data.message || 'An error occurred');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error(error);
      setSuccess(false);
      setErrorMessage('An error occurred');
      setTimeout(() => setErrorMessage(''), 1000);
    }
  };

  return (
    <Container size={"xl"}>
      <h1>Test Page</h1>
      <p>This is a test page.</p>
      <Button>Click me</Button>
      <HoverCard shadow="md">
        <HoverCard.Target>
          <Button>Hover me</Button>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <p>Test</p>
        </HoverCard.Dropdown>
      </HoverCard>
      <Group style={{ marginTop: 20 }} direction="column" spacing="xs">
        <Text size="xl" fw={700}>File Upload section:</Text>
        <form action="/api/upload" method="post" encType="multipart/form-data" onSubmit={handleUpload}>
          <input type="file" name="file" />
          <Button type="submit">Upload</Button>
        </form>
        {success && (
          <Notification
            title="Success"
            color="green"
            icon={<IconCheck size={20} />}
            onClose={() => setSuccess('')}
            withCloseButton
          >
            {success}
          </Notification>
        )}
        {errorMessage && (
          <Notification
            title="Error"
            color="red"
            icon={<IconX size={20} />}
            onClose={() => setErrorMessage('')}
            withCloseButton
          >
            {errorMessage}
          </Notification>
        )}
      </Group>
    </Container>
  )
}

export default TestPage