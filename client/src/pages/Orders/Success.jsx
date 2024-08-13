import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Center, Container, Loader, Text } from '@mantine/core';
import { useAuth } from '../../context/AuthContext';

const Success = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, setUser } = useAuth(); // Destructure setUser
    const [hasProcessed, setHasProcessed] = useState(false);
    const sessionId = new URLSearchParams(location.search).get('session_id');

    useEffect(() => {
        const processOrder = async () => {
            if (hasProcessed || !sessionId) return; // Prevent multiple calls or missing sessionId

            setHasProcessed(true); // Mark as processed to prevent duplicate calls

            try {
                console.log('Processing order with sessionId:', sessionId);
                const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/payment/process-order`, { 
                    sessionId,
                });

                if (response.status === 200) {
                    console.log('Order processed successfully');

                    // Update the ecoPoints in the user context
                    const { updatedEcoPoints } = response.data;

                    if (updatedEcoPoints !== undefined) {
                        const updatedUser = {
                            ...user,
                            resident: {
                                ...user.resident,
                                ecoPoints: updatedEcoPoints,
                            },
                        };

                        setUser(updatedUser); // Update the user state and session storage
                        sessionStorage.setItem('user', JSON.stringify(updatedUser)); // Update the session storage
                    }

                    // Handle the voucher code update if applicable
                    const { voucherCode } = response.data;
                    if (voucherCode) {
                        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/redeemreward/use`, { voucherCode });
                        console.log('Voucher code marked as used:', voucherCode);
                    }

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

        processOrder();
    }, [sessionId, navigate, hasProcessed, user, setUser]);

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
