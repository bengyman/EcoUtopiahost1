import {
  Button,
  Container,
  Group,
  Anchor,
  Text,
  Box,
  Card,
  Grid,
  Title,
  BackgroundImage,
  Divider
} from "@mantine/core";
import Navbar from "../components/Navbar";
import { useEffect } from "react";


function App() {
  useEffect(() => {
    document.title = "Home - EcoUtopia";
  });

  return (
    <Container fluid>
      {/* Hero Section */}
      <BackgroundImage
        src="https://plus.unsplash.com/premium_photo-1709440655728-295d8c1cb722?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        style={{ padding: "5rem 0", textAlign: "center", color: "white" }}
      >
        <Container maw={800}>
          <Title
            order={1}
            align="center"
            style={{ fontSize: "3rem", fontWeight: 800 }}
          >
            Welcome to EcoUtopia
          </Title>
          <Text align="center" size="lg" style={{ margin: "1rem 0" }}>
            Your one-stop shop for all things sustainable
          </Text>
          {/*<Group position="center" mt="lg">
            <Anchor href="/explore" style={{ textDecoration: 'none' }}>
              <Button size="lg" radius="xl" variant="filled" color="deepBlue" style={{ padding: '1rem 2rem', alignItems: 'center' }}>
                Explore Now
              </Button>
            </Anchor>
          </Group>*/}
        </Container>
      </BackgroundImage>

      <Container maw={800} style={{ marginTop: "3rem" }}>
        {/* About Us Section */}
        <Box mt="xl">
          <Divider my="sm" />
        </Box>
        <Box mt="xl">
          <Card shadow="xl" padding="xl" radius="xl" withBorder>
            <Title order={2} align="center" style={{ marginBottom: "1rem" }}>
              About Us
            </Title>
            <Text align="center" size="lg">
              EcoUtopia is dedicated to promoting sustainability and
              eco-friendly living. Our mission is to provide high-quality
              products and educational resources to help individuals and
              communities reduce their environmental impact.
            </Text>
            <Text align="center" size="lg" mt="sm">
              Whether you&apos;re looking for sustainable products or want to learn
              more about green practices, EcoUtopia is here to support your
              journey towards a more sustainable future.
            </Text>
          </Card>
        </Box>
        <Box mt="xl">
          <Divider my="sm" />
        </Box>
        {/* Featured Card Section */}
        <Title order={2} align="center" style={{ marginBottom: "1rem" }}>
          Our Features
        </Title>
        <Grid spacing="xl">
          <Grid.Col span={{ xs: 12, sm: 8, md: 6 }}>
            <Card shadow="xl" padding="xl" radius="xl" withBorder>
              <Text align="center" size="xl" weight={700}>
                Sustainable Products
              </Text>
              <Text align="center" size="lg" style={{ marginTop: "1rem" }}>
                Discover our range of rewards designed to gift you
                and have a positive impact on the environment.
              </Text>
              <Group position="center" mt="lg">
                <Anchor href="/rewards" style={{ textDecoration: "none" }}>
                  <Button color="green" radius="xl">
                    Shop Now
                  </Button>
                </Anchor>
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ xs: 12, sm: 8, md: 6 }}>
            <Card shadow="xl" padding="xl" radius="xl" withBorder>
              <Text align="center" size="xl" weight={700}>
                Courses and Workshops
              </Text>
              <Text align="center" size="lg" style={{ marginTop: "1rem" }}>
                Join our courses and workshops to learn more about
                sustainability and eco-friendly practices.
              </Text>
              <Group position="center" mt="lg">
                <Anchor href="/courses" style={{ textDecoration: "none" }}>
                  <Button color="orange" radius="xl">
                    Browse Courses
                  </Button>
                </Anchor>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
        <Box mt="xl">
          <Divider my="sm" />
        </Box>
        <Navbar />
        <Box mt="xl">
          <Text align="center" size="lg">
            &copy; {new Date().getFullYear()} EcoUtopia. All rights reserved.
          </Text>
        </Box>
      </Container>
    </Container>
  )
}

export default App
