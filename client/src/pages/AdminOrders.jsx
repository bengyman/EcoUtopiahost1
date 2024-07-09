import React, { useEffect, useState } from 'react';
import http from '../http';
import global from '../global';
import dayjs from 'dayjs';
import { Container, Text, Table, Flex, Loader } from '@mantine/core';

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
    http.get('/orders').then((res) => {
      setOrdersList(res.data);
    });
  }, []);

  if (isLoading || !orderslist) {
    return <Loader size={50} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  const rows = orderslist.map((order, i) => (
    <Table.Tr key={i}>
      <Table.Td>{order.order_id}</Table.Td>
      <Table.Td>{order.Course.course_name}</Table.Td>
      <Table.Td>{order.order_status}</Table.Td>
      <Table.Td>{dayjs(order.order_date).format(global.datetimeFormat)}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="md">
      <Text size="xl" align="center" style={{ marginBottom: 20 }}>
        Admin Orders
      </Text>

      <Table
        striped horizontalSpacing={Flex}
        verticalSpacing={"md"}
        highlightOnHover
        withTableBorder
        mb={40}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Order ID</Table.Th>
            <Table.Th>Course Title</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Order Date</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows}
        </Table.Tbody>
      </Table>
    </Container>
  );
}

export default AdminOrders;
