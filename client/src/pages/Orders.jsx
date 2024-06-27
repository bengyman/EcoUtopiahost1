import React, { useEffect, useState } from 'react';
import http from '../http';
import global from '../global';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { CiEdit } from 'react-icons/ci';
import { FaRegEye } from "react-icons/fa6";
import {
  Container,
  Grid,
  Anchor,
  Card,
  Text,
  Button,
  Group,
  SegmentedControl,
  Loader,
} from "@mantine/core";

function Orders() {
  const [orderslist, setOrdersList] = useState([]);
  const [filter, setFilter] = useState('Upcoming');

  useEffect(() => {
    let timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Display loader for at least 0.3 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    http.get('/orders').then((res) => {
      console.log(res.data);
      setOrdersList(res.data);
    });
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const filteredOrders = orderslist.filter((order) => {
    if (filter === 'Upcoming') return order.order_status === 'Upcoming';
    if (filter === 'Completed') return order.order_status === 'Completed';
    if (filter === 'Refunded') return order.order_status === 'Refunded';
    return true;
  });

  const getCardStyle = (status) => {
    switch (status) {
      case 'Upcoming':
        return { backgroundColor: '#1F51FF' };
      case 'Completed':
        return { backgroundColor: '#0f9d58' };
      case 'Refunded':
        return { backgroundColor: 'red' };
      default:
        return {};
    }
  };

  if (!orderslist.length) {
    return <Loader size={50} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  return (
    <Container size="xl" style={{ marginTop: 20 }}>
      <Text
        align="start"
        weight={700}
        style={{ fontSize: 30, marginBottom: 20 }}
        color="deepBlue"
        fw={500}
        size="xl"
      >
        Orders
      </Text>
      <Group position="apart" style={{ marginBottom: 20 }}>
        <SegmentedControl
          value={filter}
          onChange={handleFilterChange}
          data={[
            { label: 'Upcoming', value: 'Upcoming' },
            { label: 'Completed', value: 'Completed' },
            { label: 'Refunded', value: 'Refunded' },
          ]}
        />
        <Anchor component={Link} to="/courses">
          <Button color="deepBlue" style={{ marginLeft: 'auto' }}>Add Order</Button>
        </Anchor>
      </Group>
      <Grid>
        {filteredOrders.map((order, i) => (
          <Grid.Col span={4} key={i}>
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ ...getCardStyle(order.order_status), height: '100%' }}>              <Group position="apart">
              <Text weight={500} size="lg" style={{ color: 'white' }}>Order {order.order_id}</Text>
              {filter === 'Upcoming' && (
                <Anchor component={Link} to={`/editorders/${order.order_id}`} style={{ textDecoration: 'none' }}>
                  <Button size="xs" color="white" variant="outline">
                    <CiEdit />
                  </Button>
                </Anchor>
              )}
              <Anchor component={Link} to={`/orderdetails/${order.order_id}`} style={{ textDecoration: 'none' }}>
                <Button size="xs" color="white" variant="outline">
                  <FaRegEye />
                </Button>
              </Anchor>
            </Group>
              <Text mt="sm" style={{ color: 'white' }}>Course Title: {order.Course.course_name}</Text>
              <Text style={{ color: 'white' }}>Status: {order.order_status}</Text>
              <Text style={{ color: 'white' }}>Date: {dayjs(order.order_date).format(global.datetimeFormat)}</Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}

export default Orders;
