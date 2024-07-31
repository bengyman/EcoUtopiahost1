import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Center, Container, Loader, Text } from '@mantine/core';

const Success = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const sessionId = new URLSearchParams(location.search).get('session_id');

    useEffect(() => {
        const processOrder = async () => {
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/payment/process-order`, { sessionId });
                if (response.status === 200) {
                    // Redirect to orders page after successful processing
                    setTimeout(() => {
                        navigate('/orders');
                    }, 3000); // 3 seconds delay
                } else {
                    console.error('Order processing failed:', response.data.error);
                }
            } catch (error) {
                console.error('Error processing order:', error);
            }
        };

        if (sessionId) {
            processOrder();
        }
    }, [sessionId, navigate]);

    return (
        <Center style={{ height: '100vh' }}>
            <Container>
                <Text size="xl" align="center">Payment Successful!</Text>
                <Text align="center">Your order is being processed. You will be redirected to the orders page shortly.</Text>
                <Center>
                    <Loader />
                </Center>
            </Container>
        </Center>
    );
};

export default Success;
