import React, { useEffect, useState } from 'react';
import { Table, Container, Button, Group, Title, Alert, TextInput, Paper, Pagination, Switch, Modal, Select } from '@mantine/core';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Check, X } from 'tabler-icons-react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

function AccountManagement() {
  const [allUsers, setAllUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page
  const { user } = useAuth();
  const navigate = useNavigate();
  const adminEmail = 'admin@ecoutopia.com'; // Seeded admin email
  const [modalOpened, setModalOpened] = useState(false);

  const validationSchema = yup.object().shape({
    firstName: yup.string().required('First Name is required'),
    lastName: yup.string().required('Last Name is required'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm Password is required'),
    contactNumber: yup.string().required('Contact Number is required'),
    role: yup.string().oneOf(['RESIDENT', 'STAFF']).required('Role is required')
  });

  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      contactNumber: '',
      role: 'RESIDENT'
    }
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/user', {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
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

  useEffect(() => {
    fetchUsers();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [search, sortField, filterRole, page, allUsers]);

  const applyFilters = () => {
    let filteredUsers = allUsers;

    if (search) {
      filteredUsers = filteredUsers.filter(user =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase()) ||
        (user.Residents.length > 0 && user.Residents[0].name.toLowerCase().includes(search.toLowerCase())) ||
        (user.Staffs.length > 0 && user.Staffs[0].name.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (filterRole) {
      filteredUsers = filteredUsers.filter(user => user.role === filterRole);
    }

    if (sortField) {
      filteredUsers = filteredUsers.sort((a, b) => {
        if (a[sortField] < b[sortField]) return -1;
        if (a[sortField] > b[sortField]) return 1;
        return 0;
      });
    }

    const offset = (page - 1) * itemsPerPage;
    setDisplayedUsers(filteredUsers.slice(offset, offset + itemsPerPage));
  };

  const handleToggleActivate = async (userId, isActivated) => {
    try {
      await axios.put(`/user/activate/${userId}`, { is_activated: isActivated }, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
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
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
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

  const handleEdit = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('/user/createaccount', data, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      console.log('User registered:', response.data);
      setModalOpened(false);
      reset(); // Reset the form values to default values after successful submission
      fetchUsers(); // Refresh the list of users
    } catch (error) {
      setError('Failed to create user account');
      console.error('Error creating user account:', error);
    }
  };

  return (
    <Container size="xl" style={{ position: 'relative' }}>
      <Title align="center" style={{ marginTop: 20 }}>Account Management</Title>
      <Button 
        color="green"
        style={{ position: 'absolute', top: 20, right: 20 }} 
        onClick={() => {
          reset({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            contactNumber: '',
            role: 'RESIDENT'
          });
          setModalOpened(true);
        }}
      >
        Create Account
      </Button>
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
            <Select
              placeholder="Filter by role"
              data={[
                { value: 'RESIDENT', label: 'Resident' },
                { value: 'STAFF', label: 'Staff' },
              ]}
              value={filterRole}
              onChange={setFilterRole}
            />
          </Group>
        </Group>
        <Table highlightOnHover withborder="true">
          <thead>
            <tr>
              <th>UserID</th>
              <th>Email</th>
              <th>Role</th>
              <th>Name</th>
              <th>Contact Number</th>
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
                  <td style={{ border: '1px solid #e0e0e0', padding: '8px', color: greyedOut ? '#9e9e9e' : 'inherit' }}>{user.user_id}</td>
                  <td style={{ border: '1px solid #e0e0e0', padding: '8px', color: greyedOut ? '#9e9e9e' : 'inherit' }}>{user.email}</td>
                  <td style={{ border: '1px solid #e0e0e0', padding: '8px', color: greyedOut ? '#9e9e9e' : 'inherit' }}>{user.role}</td>
                  <td style={{ border: '1px solid #e0e0e0', padding: '8px', color: greyedOut ? '#9e9e9e' : 'inherit' }}>{residentInfo ? residentInfo.name : (staffInfo ? staffInfo.name : 'N/A')}</td>
                  <td style={{ border: '1px solid #e0e0e0', padding: '8px', color: greyedOut ? '#9e9e9e' : 'inherit' }}>{residentInfo ? residentInfo.mobile_num : (staffInfo ? staffInfo.mobilenum : 'N/A')}</td>
                  <td style={{ border: '1px solid #e0e0e0', padding: '8px', color: greyedOut ? '#9e9e9e' : 'inherit' }}>
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
                  </td>
                  <td style={{ border: '1px solid #e0e0e0', padding: '8px', color: greyedOut ? '#9e9e9e' : 'inherit' }}>
                    <Button color="blue" onClick={() => handleEdit(user.user_id)} disabled={greyedOut}>Edit</Button>
                  </td>
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
      
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Create Account"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="firstName"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                label="First Name"
                required
                {...field}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="lastName"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                label="Last Name"
                required
                {...field}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                label="Email"
                required
                {...field}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                label="Password"
                type="password"
                required
                {...field}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                label="Confirm Password"
                type="password"
                required
                {...field}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="contactNumber"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                label="Contact Number"
                required
                {...field}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                label="Role"
                data={[
                  { value: 'RESIDENT', label: 'Resident' },
                  { value: 'STAFF', label: 'Staff' },
                ]}
                required
                {...field}
                error={fieldState.error?.message}
              />
            )}
          />
          <Group position="right" mt="md">
            <Button onClick={() => setModalOpened(false)}>Cancel</Button>
            <Button type="submit">Create Account</Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}

export default AccountManagement;
