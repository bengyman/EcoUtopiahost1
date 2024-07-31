import React from 'react';
import { useParams } from 'react-router-dom';
import { Image, Container, Loader, Text } from '@mantine/core';

const ImagePage = () => {
    const { imageUrl } = useParams();
    const imageSrc = `http://localhost:3001/${decodeURIComponent(imageUrl)}`;

    return (
        <Container style={{ textAlign: 'center' }}>
            <Image 
                src={imageSrc} 
                alt="Post Image" 
                style={{ maxWidth: '100%', maxHeight: '100vh' }} 
            />
        </Container>
    );
};

export default ImagePage;
