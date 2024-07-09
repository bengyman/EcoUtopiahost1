import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import http from '../http';
import dayjs from 'dayjs';
import global from '../global';
import {
  Container,
  Card,
  Text,
  Button,
  Loader,
  Modal,
  Group,
} from '@mantine/core';
import { TiArrowBack } from "react-icons/ti";
import LoaderComponent from '../components/Loader.jsx';

function EditOrders() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Display loader for at least 0.3 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (orderId) {
      http.get(`/orders/${orderId}`).then((res) => {
        setOrder(res.data);
      });
    }
  }, [orderId]);

  const handleRefund = () => {
    http.put(`/orders/${orderId}`).then((res) => {
      setOrder(res.data);
      setIsModalOpen(false); // Close the modal
      navigate('/orders'); // Navigate back to the orders page
    });
  };

  if (isLoading || !order) {
    return <LoaderComponent />;
  }

  return (
    <Container size="md" style={{ marginTop: 20 }}>
      <Group position="apart" mb={30}>
        <Button component={Link} to="/orders" variant="link">
          <TiArrowBack />
        </Button>
        <Text
          align="start"
          weight={700}
          style={{ fontSize: 30 }}
          color="deepBlue"
          fw={500}
          size="xl"
        >
          Refund Order {order.order_id}
        </Text>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text size="lg" weight={500}>
          <strong>Course Title:</strong> {order.Course.course_name}
        </Text>
        <Text size="lg" weight={500}>
          <strong>Order Status:</strong> {order.order_status}
        </Text>
        <Text size="lg" weight={500}>
          <strong>Order Date:</strong> {dayjs(order.order_date).format(global.datetimeFormat)}
        </Text>
        <Text size="lg" weight={500}>
          <strong>Instructor:</strong> {order.Course.course_instructor}
        </Text>
        <Text size="lg" weight={500}>
          <strong>Course Description:</strong> {order.Course.course_description}
        </Text>
        <Text size="lg" weight={500}>
          <strong>Course Date:</strong> {dayjs(order.Course.course_date).format(global.datetimeFormat)}
        </Text>
        <Text size="lg" weight={500}>
          <strong>Start Time:</strong> {order.Course.course_start_time}
        </Text>
        <Text size="lg" weight={500}>
          <strong>End Time:</strong> {order.Course.course_end_time}
        </Text>
        <Button
          variant="outline"
          color="red"
          style={{ marginTop: 20 }}
          onClick={() => setIsModalOpen(true)}
        >
          Refund Order
        </Button>
      </Card>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Refund"
      >
        <Text>Are you sure you want to refund this order?</Text>
        <Group position="apart" style={{ marginTop: 20 }}>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button color="red" onClick={handleRefund}>Confirm Refund</Button>
        </Group>
      </Modal>
    </Container>
  );
}

export default EditOrders;
