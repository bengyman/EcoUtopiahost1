import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { Container, Grid, Anchor, Card, Text, Button, Group, SegmentedControl, Badge, Image, Modal } from "@mantine/core";
import LoaderComponent from '../components/Loader.jsx';

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

function Orders() {
  const [ordersList, setOrdersList] = useState([]);
  const [filter, setFilter] = useState('Upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  useEffect(() => {
    let timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/orders', {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`
          }
        });
        setOrdersList(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleRefundClick = (orderId) => {
    setCurrentOrderId(orderId);
    setIsModalOpen(true);
  };

  const handleRefund = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.put(`/orders/refund/${currentOrderId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Update the orders list to reflect the pending refund order
      setOrdersList((prevOrdersList) => 
        prevOrdersList.map((order) =>
          order.order_id === currentOrderId ? { ...order, order_status: 'Pending' } : order
        )
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error processing refund:', error);
    }
  };

  const filteredOrders = ordersList.filter((order) => {
    if (filter === 'Upcoming') return order.order_status === 'Upcoming';
    if (filter === 'Completed') return order.order_status === 'Completed';
    if (filter === 'Refunded') return order.order_status === 'Refunded';
    if (filter === 'Pending') return order.order_status === 'Pending';
    return true;
  });

  if (!ordersList.length && isLoading) {
    return <LoaderComponent />;
  }

  return (
    <Container size="xl" style={{ marginTop: 20 }}>
      <Text align="start" weight={700} style={{ fontSize: 30, marginBottom: 20 }} color="deepBlue" fw={500} size="xl">
        Orders
      </Text>
      <Group position="apart" style={{ marginBottom: 20 }}>
        <SegmentedControl
          value={filter}
          onChange={handleFilterChange}
          data={[
            { label: 'Paid', value: 'Upcoming' },
            { label: 'Completed', value: 'Completed' },
            { label: 'Refunded', value: 'Refunded' },
            { label: 'Pending', value: 'Pending' },
          ]}
        />
      </Group>
      <Grid>
        {filteredOrders.map((order, i) => (
          <Grid.Col span={4} key={i}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section>
                <Image
                  src={order.Course.course_image_url || 'https://www.svgrepo.com/show/508699/landscape-placeholder.svg'}
                  height={160}
                  alt="Course Image"
                />
              </Card.Section>

              <Group position="apart" mt="md" mb="xs">
                <Text fw={500} style={{ color: '#1F51FF' }}>Order {order.order_id}</Text>
                <Badge color={order.order_status === 'Upcoming' ? 'blue' : order.order_status === 'Completed' ? 'green' : order.order_status === 'Refunded' ? 'red' : 'yellow'}>
                  {order.order_status}
                </Badge>
              </Group>

              <Text size="sm" c="dimmed">
                Course Title: {order.Course.course_name}
              </Text>
              <Text size="sm" c="dimmed">
                Date: {dayjs(order.order_date).format(DATE_FORMAT)}
              </Text>

              <Group mt="md">
                {filter === 'Upcoming' && (
                  <Button color="red" fullWidth mt="md" radius="md" onClick={() => handleRefundClick(order.order_id)}>
                    Refund Course
                  </Button>
                )}
                <Anchor component={Link} to={`/orderdetails/${order.order_id}`} style={{ textDecoration: 'none', width: '100%' }}>
                  <Button color="blue" fullWidth radius="md">
                    View Order
                  </Button>
                </Anchor>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

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

export default Orders;
