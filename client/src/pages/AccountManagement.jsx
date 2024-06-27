import React, { useEffect, useState } from 'react';
import { Table, Container, Button, Group, Title, Alert, TextInput, Paper, Pagination, Switch } from '@mantine/core';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Check, X } from 'tabler-icons-react';

function AccountManagement() {
  const [allUsers, setAllUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page
  const { user } = useAuth();
  const adminEmail = 'admin@ecoutopia.com'; // Seeded admin email

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/user', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('API Response:', response.data); // Log API response
        setAllUsers(response.data || []);
        setDisplayedUsers(response.data.slice(0, itemsPerPage));
      } catch (error) {
        setError('Failed to fetch users');
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [user]);

  useEffect(() => {
    const offset = (page - 1) * itemsPerPage;
    setDisplayedUsers(allUsers.slice(offset, offset + itemsPerPage));
  }, [page, allUsers]);

  const handleToggleActivate = async (userId, isActivated) => {
    try {
      await axios.put(`/user/activate/${userId}`, { is_activated: isActivated }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAllUsers(allUsers.map(user => user.user_id === userId ? { ...user, is_activated: isActivated } : user));
    } catch (error) {
      setError('Failed to toggle activation status');
      console.error('Error toggling activation status:', error);
    }
  };

  const handleToggleDelete = async (userId, isDeleted) => {
    try {
      const endpoint = isDeleted ? `/user/softdelete/${userId}` : `/user/softrestore/${userId}`;
      await axios.put(endpoint, { is_deleted: isDeleted }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAllUsers(allUsers.map(user => user.user_id === userId ? { ...user, is_deleted: isDeleted } : user));
    } catch (error) {
      setError('Failed to toggle delete status');
      console.error('Error toggling delete status:', error);
    }
  };

  const isGreyedOut = (email) => {
    return email === adminEmail || user.email === email;
  };

  return (
    <Container size="xl">
      <Title align="center" style={{ marginTop: 20 }}>Account Management</Title>
      {error && <Alert title="Error" color="red" mt="md">{error}</Alert>}
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Group position="apart" mb="md">
          <TextInput
            placeholder="Search"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />
          <Group>
            <Button onClick={() => setSortField('name')}>Sort</Button>
            <Button>Filter</Button>
          </Group>
          <Button>Add Account</Button>
        </Group>
        <Table highlightOnHover withborder="true">
          <thead>
            <tr>
              <th>UserID</th>
              <th>Email</th>
              <th>Role</th>
              <th>Name</th>
              <th>Contact Number</th>
              <th>Activated</th>
              <th>Deleted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.length > 0 ? displayedUsers.map((user, index) => {
              const residentInfo = user.Residents.length > 0 ? user.Residents[0] : null;
              const staffInfo = user.Staffs.length > 0 ? user.Staffs[0] : null;
              const greyedOut = isGreyedOut(user.email);

              return (
                <tr key={user.user_id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
                  <th style={{ border: '1px solid #e0e0e0', padding: '8px', color: greyedOut ? '#9e9e9e' : 'inherit' }}>{user.user_id}</th>
                  <th style={{ border: '1px solid #e0e0e0', padding: '8px', color: greyedOut ? '#9e9e9e' : 'inherit' }}>{user.email}</th>
                  <th style={{ border: '1px solid #e0e0e0', padding: '8px', color: greyedOut ? '#9e9e9e' : 'inherit' }}>{user.role}</th>
                  <th style={{ border: '1px solid #e0e0e0', padding: '8px', color: greyedOut ? '#9e9e9e' : 'inherit' }}>{residentInfo ? residentInfo.name : (staffInfo ? staffInfo.name : 'N/A')}</th>
                  <th style={{ border: '1px solid #e0e0e0', padding: '8px', color: greyedOut ? '#9e9e9e' : 'inherit' }}>{residentInfo ? residentInfo.mobile_num : (staffInfo ? staffInfo.mobilenum : 'N/A')}</th>
                  <th style={{ border: '1px solid #e0e0e0', padding: '8px', color: greyedOut ? '#9e9e9e' : 'inherit' }}>
                    <Group align="center">
                      <Switch
                        checked={user.is_activated}
                        onChange={() => handleToggleActivate(user.user_id, !user.is_activated)}
                        disabled={greyedOut}
                      />
                      {user.is_activated ? (
                        <Check color="green" size={16} />
                      ) : (
                        <X color="red" size={16} />
                      )}
                    </Group>
                  </th>
                  <th style={{ border: '1px solid #e0e0e0', padding: '8px', color: greyedOut ? '#9e9e9e' : 'inherit' }}>
                    <Group align="center">
                      <Switch
                        checked={user.is_deleted}
                        onChange={() => handleToggleDelete(user.user_id, !user.is_deleted)}
                        disabled={greyedOut}
                      />
                      {user.is_deleted ? (
                        <Check color="green" size={16} />
                      ) : (
                        <X color="red" size={16} />
                      )}
                    </Group>
                  </th>
                  <th style={{ border: '1px solid #e0e0e0', padding: '8px', color: greyedOut ? '#9e9e9e' : 'inherit' }}>
                    <Button color="blue" onClick={() => handleEdit(user.user_id)} disabled={greyedOut}>Edit</Button>
                  </th>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', border: '1px solid #e0e0e0', padding: '8px' }}>No users found</td>
              </tr>
            )}
          </tbody>
        </Table>
        <Group position="center" mt="md">
          <Pagination page={page} onChange={setPage} total={Math.ceil(allUsers.length / itemsPerPage)} />
        </Group>
      </Paper>
    </Container>
  );

  function handleEdit(userId) {
    // Redirect to edit user page or open a modal for editing user details
  }
}

export default AccountManagement;
