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
  Badge,
  Divider,
  Tabs,
  Rating,
  Box,
  Avatar,
  Notification,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { useStripe } from '@stripe/react-stripe-js';

function ViewCourse() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
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
        cancel_url: `${window.location.origin}/course/${courseId}`, // Set cancel URL
      });

      const { error } = await stripe.redirectToCheckout({ sessionId: id });

      if (error) {
        console.error('Stripe checkout error:', error);
        setError(error);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    } catch (error) {
      console.error('There was an error creating the checkout session!', error);
      setError(error);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  if (loading) {
    return (
      <Container size="xl">
        <LoadingOverlay visible />
      </Container>
    );
  }



  if (!course) return <Text align="center">Course not found</Text>;

  return (
    console.log(course),
    <Container size="xl" style={{ marginTop: 30 }}>
      <Paper padding="xl" shadow="md" radius="md" withBorder>
        <Title align="center" order={1} mb="md">
          {course.course_name}
        </Title>
        <Divider mb="lg" />
        <Grid gutter="xl">
          <Grid.Col span={6}>
            <Image
              src={course.course_image_url}
              alt={course.course_name}
              fallbackSrc="https://placehold.co/600x400?text=Placeholder"
              height={350}
              fit="cover"
              radius="md"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Box>
              <Badge color="teal" size="lg" mb="sm">
                Best Seller
              </Badge>
              <Rating value={4.5} readOnly mb="sm" />
              <Text size="lg" mb="md">
                {course.course_description}
              </Text>
              <Text size="xl" weight={700} mb="md">
                Price: ${course.course_price}
              </Text>
              <Button
                size="lg"
                radius="md"
                onClick={handleAddToOrder}
              >
                Buy Course
              </Button>
            </Box>
          </Grid.Col>
        </Grid>
        <Divider my="lg" />
        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="curriculum">Curriculum</Tabs.Tab>
            <Tabs.Tab value="instructor">Instructor</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="xs">
            <Text>
              {course.course_long_description || 'No additional information available.'}
            </Text>
          </Tabs.Panel>

          <Tabs.Panel value="curriculum" pt="xs">
            <Box>
              <ul>
                <li>Introduction to the course</li>
                <li>Module 1: Getting Started</li>
                <li>Module 2: Advanced Topics</li>
              </ul>
            </Box>
          </Tabs.Panel>


          <Tabs.Panel value="instructor" pt="xs">
            <Group direction="row" align="center">
              <Avatar
                src={course.Instructor.profile_pic}
                alt={course.course_instructor}
                radius="xl"
                size="lg"
                style={{ marginRight: 15 }}
              />
              <Text size="lg">{course.course_instructor}</Text>
            </Group>
            <Text mt="xs">
              {course.instructor_bio || 'Instructor information is not available at the moment.'}
            </Text>
          </Tabs.Panel>
        </Tabs>
      </Paper>
      {showNotification && (
        <Notification
          title="Error"
          color="red"
          icon={<IconAlertCircle size={24} />}
          onClose={() => setShowNotification(false)}
          styles={(theme) => ({
            root: {
              backgroundColor: theme.colors.red[0],
              borderColor: theme.colors.red[6],
            },
            title: {
              color: theme.colors.red[7],
            },
            description: {
              color: theme.colors.red[7],
            },
            closeButton: {
              color: theme.colors.red[7],
              '&:hover': {
                backgroundColor: theme.colors.red[1],
              },
            },
          })}
        >
        {error.message}
        </Notification>
      )}
    </Container>
  );
}

export default ViewCourse;