import React from 'react';
import axios from 'axios';
import {
  Container,
  Text,
  Button,
  LoadingOverlay,
  Paper,
  Grid,
  Image,
  Group,
  Title,
} from '@mantine/core';
import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { useStripe } from '@stripe/react-stripe-js';

// Load your Stripe public key
const stripePromise = loadStripe('your-publishable-key-here');

function ViewCourse() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const stripe = useStripe();

  useEffect(() => {
    document.title = 'Course Details - EcoUtopia';
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/courses/getCourse/${courseId}`);
        setCourse(response.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <Container size="xl">
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl">
        <Text color="red" align="center" size="xl" style={{ marginTop: 20 }}>
          {error.message}
        </Text>
      </Container>
    );
  }

  const handleAddToOrder = async () => {
    if (!stripe) {
      return;
    }

    try {
      const { data: { id } } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/payment/create-checkout-session`, {
        items: [
          { name: course.course_name, price: course.course_price * 100, quantity: 1 },
        ],
        course_id: course.course_id,
      });

      const { error } = await stripe.redirectToCheckout({ sessionId: id });

      if (error) {
        console.error('Stripe checkout error:', error);
      }
    } catch (error) {
      console.error('There was an error creating the checkout session!', error);
    }
  };

  if (!course) return <p>Loading...</p>;

  return (
    <Container size="xl">
      <Paper padding="xl" shadow="xs" style={{ marginTop: 20 }}>
        <Grid>
          <Grid.Col span={6}>
            <Image
              src={course.image}
              alt={course.course_name}
              fallbackSrc="https://placehold.co/600x400?text=Placeholder"
              height={300}
              width={500}
              fit="cover"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Group direction="column" align="flex-start">
              <Title order={1}>{course.course_name}</Title>
              <Text size="xl" style={{ marginTop: 10 }}>
                {course.course_description}
              </Text>
              <Text size="xl" style={{ marginTop: 10 }}>
                Price: ${course.course_price}
              </Text>
              <Button
                component="a"
                onClick={handleAddToOrder}
                size="lg"
                style={{ marginTop: 20 }}
              >
                Buy Course
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Paper>
    </Container>
  );
}

export default ViewCourse;
