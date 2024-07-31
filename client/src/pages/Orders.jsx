import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { Container, Grid, Anchor, Card, Text, Button, Group, SegmentedControl, Badge, Image } from "@mantine/core";
import LoaderComponent from '../components/Loader.jsx';

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'; // Define your date format here

function Orders() {
  const [ordersList, setOrdersList] = useState([]);
  const [filter, setFilter] = useState('Upcoming');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Display loader for at least 0.3 seconds

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

  const filteredOrders = ordersList.filter((order) => {
    if (filter === 'Upcoming') return order.order_status === 'Upcoming';
    if (filter === 'Completed') return order.order_status === 'Completed';
    if (filter === 'Refunded') return order.order_status === 'Refunded';
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
          ]}
        />
      </Group>
      <Grid>
        {filteredOrders.map((order, i) => (
          <Grid.Col span={4} key={i}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section>
                <Image
                  src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
                  height={160}
                  alt="Course Image"
                />
              </Card.Section>

              <Group position="apart" mt="md" mb="xs">
                <Text fw={500} style={{ color: '#1F51FF' }}>Order {order.order_id}</Text>
                <Badge color={order.order_status === 'Upcoming' ? 'pink' : order.order_status === 'Completed' ? 'green' : 'red'}>
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
                  <Anchor component={Link} to={`/editorders/${order.order_id}`} style={{ textDecoration: 'none', width: '100%' }}>
                    <Button color="blue" fullWidth mt="md" radius="md">
                      Edit Order
                    </Button>
                  </Anchor>
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
    </Container>
  );
}

export default Orders;
