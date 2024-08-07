import { AppShell, Flex, Anchor, Button, Text, Image, Menu, Avatar } from "@mantine/core";
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconUser, IconGift, IconLogout } from '@tabler/icons-react';
import logo from "../assets/logo.png";

function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isProfilePage = user && location.pathname === `/profile/${user.user_id}`;
  const isStaff = user && user.role === 'STAFF';
  const isResident = user && user.role === 'RESIDENT';

  return (
    <AppShell header={{ height: 50 }} navbar={{ width: 200, breakpoint: "xl" }}>
      <AppShell.Header style={{ height: 50, backgroundColor: isStaff ? "#00A0D2" : "#0F9D58" }}>
        <Flex align="center" justify="space-between" style={{ height: "100%" }}>
          <Flex align="center">
            <Anchor href="/" style={{ textDecoration: "none" }}>
              <Image src={logo} alt="EcoUtopia" width={70} height={70} />
            </Anchor>
          </Flex>
          <Flex align="center">
            <Anchor href="/" style={{ textDecoration: "none" }}>
              <Text tt="uppercase" fw={'500'} c="black" style={{ marginLeft: 10, marginRight: 10 }}>
                Home
              </Text>
            </Anchor>
            {isResident && (
              <Anchor href="/courses" style={{ textDecoration: "none" }}>
                <Text tt="uppercase" fw={'500'} c="black" style={{ marginLeft: 10, marginRight: 10 }}>
                  Courses
                </Text>
              </Anchor>
            )}
            {isResident && (
              <Anchor href="/orders" style={{ textDecoration: "none" }}>
                <Text tt="uppercase" fw={'500'} c="black" style={{ marginLeft: 10, marginRight: 10 }}>
                  Orders
                </Text>
              </Anchor>
            )}
            {isStaff && (
              <Anchor href="/admin/orders" style={{ textDecoration: "none" }}>
                <Text tt="uppercase" fw={'500'} c="black" style={{ marginLeft: 10, marginRight: 10 }}>
                  Admin Orders
                </Text>
              </Anchor>
            )}
            {isStaff && (
              <Anchor href="/admin/view-courses" style={{ textDecoration: "none" }}>
                <Text tt="uppercase" fw={'500'} c="black" style={{ marginLeft: 10, marginRight: 10 }}>
                  Admin Courses
                </Text>
              </Anchor>
            )}
            {isStaff && (
              <Anchor href="/admin/posts" style={{ textDecoration: "none" }}>
                <Text tt="uppercase" fw={'500'} c="black" style={{ marginLeft: 10, marginRight: 10 }}>
                  Admin Posts
                </Text>
              </Anchor>
            )}
            {isResident && (
              <Anchor href="/posts" style={{ textDecoration: "none" }}>
                <Text tt="uppercase" fw={'500'} c="black" style={{ marginLeft: 10, marginRight: 10 }}>
                  Posts
                </Text>
              </Anchor>
            )}
            {isStaff && (
              <Anchor href="/account-management" style={{ textDecoration: "none" }}>
                <Text tt="uppercase" fw={'500'} c="black" style={{ marginLeft: 10, marginRight: 10 }}>
                  Admin Users
                </Text>
              </Anchor>
            )}
            {isStaff && (
              <Anchor href="/rewards" style={{ textDecoration: "none" }}>
                <Text tt="uppercase" fw={'500'} c="black" style={{ marginLeft: 10, marginRight: 10 }}>
                  Rewards
                </Text>
              </Anchor>
            )}
            {isResident && (
              <Anchor href="/rewards" style={{ textDecoration: "none" }}>
                <Text tt="uppercase" fw={'500'} c="black" style={{ marginLeft: 10, marginRight: 10 }}>
                  Rewards
                </Text>
              </Anchor>
            )}
          </Flex>
          <Flex align="center">
            {!user && location.pathname !== '/login' && (
              <Anchor href="/login" style={{ textDecoration: "none" }}>
                <Button color="black" style={{ marginLeft: 10, marginRight: 10 }}>
                  Login
                </Button>
              </Anchor>
            )}
            {!user && location.pathname !== '/register' && (
              <Anchor href="/register" style={{ textDecoration: "none" }}>
                <Button color="black" style={{ marginLeft: 10, marginRight: 10 }}>
                  Sign Up
                </Button>
              </Anchor>
            )}
            {user && !isProfilePage && (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Avatar variant="filled" radius="xl" src="" style={{ marginRight: '2rem' }} />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item icon={<IconUser size={14} />} onClick={() => navigate(`/profile/${user.user_id}`)}>
                    Profile
                  </Menu.Item>
                  <Menu.Item icon={<IconGift size={14} />} onClick={() => navigate('/rewards')}>
                    Rewards
                  </Menu.Item>
                  <Menu.Item icon={<IconLogout size={14} />} onClick={handleLogout} >
                    Log Out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Flex>
        </Flex>
      </AppShell.Header>
    </AppShell>
  );
}

export default Navbar;
