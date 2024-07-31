import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Container, Text, Table, Flex, Loader, ScrollArea } from '@mantine/core';

function AdminOrders() {
  const [orderslist, setOrdersList] = useState([]);
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
        const token = sessionStorage.getItem('token'); // Assuming you store the token in localStorage
        const res = await axios.get('http://localhost:3001/orders', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrdersList(res.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  if (isLoading || !orderslist.length) {
    return <Loader size={50} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  const rows = orderslist.map((order, i) => (
    <tr key={i}>
      <td>{order.order_id}</td>
      <td>{order.resident_id}</td>
      <td>{order.Course.course_name}</td>
      <td>{order.order_status}</td>
      <td>{dayjs(order.order_date).format('YYYY-MM-DD HH:mm:ss')}</td>
      <td>{order.Course.course_price}</td>
    </tr>
  ));

  return (
    <Container size="md">
      <Text size="xl" align="center" style={{ marginBottom: 20 }}>
        Admin Orders
      </Text>
      <ScrollArea>
        <Table striped highlightOnHover withBorder mb={40}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Resident ID</th>
              <th>Course Title</th>
              <th>Status</th>
              <th>Order Date</th>
              <th>Course Price</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </ScrollArea>
    </Container>
  );
}

export default AdminOrders;
