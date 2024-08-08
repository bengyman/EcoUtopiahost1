import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Table, Container, Button, Group, Title, Text, TextInput, SegmentedControl, Modal, Pagination, Select } from '@mantine/core';
import { Search } from 'tabler-icons-react';
import { useAuth } from '../../context/AuthContext';

function AdminOrders() {
  const { user } = useAuth();
  const [ordersList, setOrdersList] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('order_id'); // Sort field state
  const itemsPerPage = 10;

  useEffect(() => {
    let timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!user?.staff) {
      return;
    }

    const fetchOrders = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await axios.get('http://localhost:3001/orders', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrdersList(res.data);
        setFilteredOrders(res.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [user]);

  useEffect(() => {
    let result = ordersList;

    if (filter === 'Pending') {
      result = result.filter(order => order.order_status === 'Pending');
    } else if (filter === 'All') {
      result = result.filter(order => order.order_status !== 'Pending');
    }

    if (searchQuery) {
      result = result.filter(order =>
        order.order_id.toString().includes(searchQuery) ||
        order.resident_id.toString().includes(searchQuery) ||
        order.Course.course_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort orders based on the selected sort field
    result = result.sort((a, b) => {
      if (sortField === 'order_date') {
        return new Date(b.order_date) - new Date(a.order_date);
      } else if (sortField === 'course_price') {
        return b.Course.course_price - a.Course.course_price;
      } else {
        return a.order_id - b.order_id;
      }
    });

    setFilteredOrders(result);
  }, [filter, searchQuery, sortField, ordersList]);

  const handleApproveClick = (orderId) => {
    setCurrentOrderId(orderId);
    setIsModalOpen(true);
  };

  const handleApprove = async () => {
    try {
      const token = sessionStorage.getItem('token');
      console.log('Approving order ID:', currentOrderId);
      await axios.put(`http://localhost:3001/orders/approveRefund/${currentOrderId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const updatedOrders = ordersList.map(order =>
        order.order_id === currentOrderId
          ? { ...order, order_status: 'Refunded' }
          : order
      );
      setOrdersList(updatedOrders);
      setFilteredOrders(updatedOrders.filter(order =>
        filter === 'Pending'
          ? order.order_status === 'Pending'
          : filter === 'All'
            ? order.order_status !== 'Pending'
            : true
      ));
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error processing refund approval:', error);
    }
  };

  if (!user?.staff) {
    return null;
  }

  if (isLoading) {
    return <Text align="center" style={{ marginTop: 50 }}>Loading...</Text>;
  }

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const rows = paginatedOrders.map((order, i) => (
    <tr key={order.order_id} style={{ backgroundColor: i % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
      <td style={{ border: '1px solid #e0e0e0', padding: '8px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.order_id}</td>
      <td style={{ border: '1px solid #e0e0e0', padding: '8px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {order.resident_id} ({order.Resident ? order.Resident.name : 'Unknown'})
      </td>
      <td style={{ border: '1px solid #e0e0e0', padding: '8px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.Course.course_name}</td>
      <td style={{ border: '1px solid #e0e0e0', padding: '8px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.order_status}</td>
      <td style={{ border: '1px solid #e0e0e0', padding: '8px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dayjs(order.order_date).format('YYYY-MM-DD HH:mm:ss')}</td>
      <td style={{ border: '1px solid #e0e0e0', padding: '8px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.Course.course_price}</td>
      {filter === 'Pending' && (
        <td style={{ border: '1px solid #e0e0e0', padding: '8px' }}>
          <Button color="green" onClick={() => handleApproveClick(order.order_id)}>Approve Refund</Button>
        </td>
      )}
    </tr>
  ));


  return (
    <Container size="md" style={{ marginTop: 20 }}>
      <Title align="start" style={{ marginBottom: 20 }}>Admin Orders</Title>
      <Group position="apart" style={{ marginBottom: 20 }}>
        <TextInput
          placeholder="Search Orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={16} />}
        />
        <Group>
          <SegmentedControl
            value={filter}
            onChange={setFilter}
            data={[
              { label: 'All Orders', value: 'All' },
              { label: 'Pending Refunds', value: 'Pending' }
            ]}
          />
          <Select
            value={sortField}
            onChange={setSortField}
            data={[
              { value: 'order_id', label: 'Order ID' },
              { value: 'order_date', label: 'Order Date' },
              { value: 'course_price', label: 'Course Price' }
            ]}
            placeholder="Sort by"
          />
        </Group>
      </Group>
      <Table striped highlightOnHover style={{ border: '1px solid #e0e0e0' }}>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Resident ID</th>
            <th>Course Title</th>
            <th>Status</th>
            <th>Order Date</th>
            <th>Course Price</th>
            {filter === 'Pending' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
      <Pagination
        page={currentPage}
        onChange={setCurrentPage}
        total={totalPages}
        style={{ marginTop: 20, display: 'flex', justifyContent: 'center', paddingBottom: 20 }}
      />
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Refund"
      >
        <Text>Are you sure you want to approve this refund?</Text>
        <Group position="apart" style={{ marginTop: 20 }}>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button color="green" onClick={handleApprove}>Confirm Refund</Button>
        </Group>
      </Modal>
    </Container>
  );
}

export default AdminOrders;
