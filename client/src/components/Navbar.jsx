import { AppShell, Flex, Anchor, Button, Text, Image } from "@mantine/core";
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from "../assets/logo.png";

function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppShell header={{ height: 50 }} navbar={{ width: 200, breakpoint: "xl" }}>
      <AppShell.Header style={{ height: 50, backgroundColor: "#0F9D58" }}>
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
            <Anchor href="/courses" style={{ textDecoration: "none" }}>
              <Text tt="uppercase" fw={'500'} c="black" style={{ marginLeft: 10, marginRight: 10 }}>
                Courses
              </Text>
            </Anchor>
          </Flex>
          <Flex align="center">
            {location.pathname === '/' && (
              <>
                <Anchor href="/login" style={{ textDecoration: "none" }}>
                  <Button color="black" style={{ marginLeft: 10, marginRight: 10 }}>
                    Login
                  </Button>
                </Anchor>
                <Anchor href="/register" style={{ textDecoration: "none" }}>
                  <Button color="black" style={{ marginLeft: 10, marginRight: 10 }}>
                    Sign Up
                  </Button>
                </Anchor>
              </>
            )}
            {location.pathname === '/register' && (
              <Anchor href="/login" style={{ textDecoration: "none" }}>
                <Button color="black" style={{ marginLeft: 10, marginRight: 10 }}>
                  Login
                </Button>
              </Anchor>
            )}
            {location.pathname === '/login' && (
              <Anchor href="/register" style={{ textDecoration: "none" }}>
                <Button color="black" style={{ marginLeft: 10, marginRight: 10 }}>
                  Sign Up
                </Button>
              </Anchor>
            )}
            {location.pathname === '/account-management' && user && (
              <Button color="red" style={{ marginLeft: 10, marginRight: 10 }} onClick={handleLogout}>
                Logout
              </Button>
            )}
          </Flex>
        </Flex>
      </AppShell.Header>
    </AppShell>
  );
}

export default Navbar;
