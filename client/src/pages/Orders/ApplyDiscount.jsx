import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Text,
  Button,
  TextInput,
  Grid,
  Title,
  Divider,
  Notification,
  Image,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useStripe } from '@stripe/react-stripe-js';
import { useAuth } from '../../context/AuthContext'; 

function ApplyDiscount() {
  const { courseId } = useParams();
  const { user } = useAuth(); // Access the user and token from AuthContext
  const [course, setCourse] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState(null);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountedPrice, setDiscountedPrice] = useState(0);  // Initialize to 0 to ensure it's a number
  const [loading, setLoading] = useState(true);
  const stripe = useStripe();
  const navigate = useNavigate();

  useEffect(() => { 
    document.title = 'Course Details - EcoUtopia'; 
    const fetchCourse = async () => { 
      try { 
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/courses/getCourse/${courseId}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}` // Ensure token is sent with the request
          }
        });  
        setCourse(response.data);
        setDiscountedPrice(response.data.course_price); // Set the initial discountedPrice to course_price
        setLoading(false);
      } 
      catch (error) { 
        setDiscountError('Failed to load course details.');
        setLoading(false); 
      } 
    }; 
    fetchCourse(); 
  }, [courseId]);

  const handleApplyDiscount = async () => {
    if (!course || !user?.resident) return; // Ensure the user is a resident
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/discount/validate`, {
        discountCode,
        courseId,
        residentId: user.resident.resident_id, // Include the resident_id in the request body
      }, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}` // Include the token in the request header
        }
      });

      const { reward_type, reward_value } = response.data;

      let newPrice = course.course_price;

      if (reward_type === 'Cash_Voucher') {
        newPrice = Math.max(0, course.course_price - reward_value);
      } else if (reward_type === 'Discount_Voucher') {
        newPrice = Math.max(0, course.course_price * (1 - reward_value / 100));
      } else {
        throw new Error('Invalid discount type');
      }

      setDiscountedPrice(newPrice);
      setDiscountApplied(true);
      setDiscountError(null);
    } catch (error) {
      setDiscountError(error.response?.data?.error || 'Failed to apply discount.');
      setDiscountApplied(false);
    } finally {
      setLoading(false);
    }
  };

  const handleNoDiscount = () => {
    if (!course) return;
    setDiscountApplied(true);
    setDiscountedPrice(course.course_price);
    setDiscountError(null);
  };

  const handleProceedToPayment = async () => {
    if (!stripe || !course) {
      return;
    }
  
    try {
      const { data: { id } } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/payment/create-checkout-session`, {
        items: [
          { name: course.course_name, price: discountedPrice * 100, quantity: 1 },
        ],
        course_id: course.course_id,
        voucherCode: discountCode,  // Pass the voucherCode here
        cancel_url: `${window.location.origin}/course/${courseId}`,
      }, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}` // Include the token in the request header
        }
      });
  
      const { error } = await stripe.redirectToCheckout({ sessionId: id });
  
      if (error) {
        console.error('Stripe checkout error:', error);
        setDiscountError(error.message);
      }
    } catch (error) {
      console.error('There was an error creating the checkout session!', error);
      setDiscountError(error.message);
    }
  };
  

  if (loading) {
    return <Text align="center">Loading course details...</Text>;
  }

  return (
    <Container size="sm" mt="5%">
      <Paper withBorder shadow="md" p="xl" radius="md">
      <Title align="center" mb="lg">Apply Discount</Title>
      <Divider mb="lg" />
        {course?.course_image_url && (
          <Image
            src={course.course_image_url}  // Ensure this URL is valid and points to the correct image
            alt={course.course_name}
            withPlaceholder
            mb="lg"
            radius="md"
          />
        )}
        {course && (
          <>
            <Text align="center" style={{ fontSize: '1.7rem', fontWeight: 'bold' }} mb="md">
                {course.course_name}
            </Text>
            <Text align="center" size="xl" weight={700} mb="lg">
              Price: ${discountedPrice !== null && !isNaN(discountedPrice) ? discountedPrice : 'Loading...'}
            </Text>
          </>
        )}
        <Grid gutter="lg" mb="lg">
          <Grid.Col span={8}>
            <TextInput
              label="Discount Code"
              placeholder="Enter your discount code"
              value={discountCode}
              onChange={(event) => setDiscountCode(event.currentTarget.value)}
              disabled={discountApplied || loading}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Button
              fullWidth
              mt="xl"
              onClick={handleApplyDiscount}
              loading={loading}
              disabled={discountApplied || loading}
            >
              Redeem
            </Button>
          </Grid.Col>
        </Grid>
        <Button
          variant="outline"
          fullWidth
          mt="md"
          onClick={handleNoDiscount}
          disabled={discountApplied || loading}
        >
          No Discount Code
        </Button>
        <Divider my="lg" />
        <Button
          fullWidth
          size="lg"
          onClick={handleProceedToPayment}
          disabled={loading || !discountApplied}
        >
          Proceed to Payment
        </Button>
        {discountError && (
          <Notification
            mt="lg"
            color="red"
            icon={<IconAlertCircle size={24} />}
            onClose={() => setDiscountError(null)}
          >
            {discountError}
          </Notification>
        )}
      </Paper>
    </Container>
  );
}

export default ApplyDiscount;
