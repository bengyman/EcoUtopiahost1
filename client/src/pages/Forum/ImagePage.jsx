import { useParams } from 'react-router-dom';
import { Container, Image, Text } from '@mantine/core';

const ImagePage = () => {
    const { imageUrl } = useParams();
    const mediaSrc = `${decodeURIComponent(imageUrl)}`;

    const isImage = (url) => /\.(jpg|jpeg|png|gif)$/i.test(url);
    const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);

    return (
        <Container style={{ textAlign: 'center', marginTop: '20px' }}>
            {isImage(mediaSrc) && (
                <Image
                    src={mediaSrc}
                    alt="Media"
                    style={{ maxWidth: '100%', maxHeight: '80vh' }}
                />
            )}
            {isVideo(mediaSrc) && (
                <video
                    controls
                    style={{ maxWidth: '100%', maxHeight: '80vh' }}
                >
                    <source src={mediaSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            )}
            {!isImage(mediaSrc) && !isVideo(mediaSrc) && (
                <Text>No media available</Text>
            )}
        </Container>
    );
};

export default ImagePage;
