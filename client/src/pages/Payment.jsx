import React from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import axios from 'axios';
import { Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

const Payment = ({ courseId }) => {
    const stripe = useStripe();
    const navigate = useNavigate();

    const handleAddToOrder = async (courseId) => {
        try {
            await axios.post('/orders/addCourse', { course_id: courseId }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            navigate('/orders'); // Redirect to orders page
        } catch (error) {
            console.error("There was an error adding the course to the order!", error);
        }
    };

    const handleCheckout = async () => {
        try {
            const { data: { id } } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/payment/create-checkout-session`, {
                items: [
                    { name: 'Course 1', price: 2000, quantity: 1 },
                    // Add more items here
                ],
                course_id: courseId // Pass the courseId here
            });

            const { error } = await stripe.redirectToCheckout({ sessionId: id });

            if (error) {
                console.error(error);
            } else {
                // Assuming that `handleAddToOrder` should be called after successful payment
                handleAddToOrder(courseId);
            }
        } catch (error) {
            console.error("There was an error creating the checkout session:", error);
        }
    };

    return (
        <div>
            <Button onClick={handleCheckout}>
                Checkout
            </Button>
        </div>
    );
};

export default Payment;
