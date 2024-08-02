import axios from "axios";
import dayjs from "dayjs";
import Navbar from "../../components/Navbar";
import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Anchor,
  Card,
  Image,
  Text,
  Badge,
  Button,
  Group,
  Box,
  Avatar,
  LoadingOverlay,
  Flex,
  Select,
  RangeSlider,
  Checkbox,
} from "@mantine/core";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state variables
  const [selectedType, setSelectedType] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [selectedFree, setSelectedFree] = useState(false);

  function formatMySQLTimeString(mysqlTimeString) {
    const [hours, minutes] = mysqlTimeString.split(':');
    const ampm = parseInt(hours, 10) >= 12 ? 'PM' : 'AM';
    let hours12 = parseInt(hours, 10) % 12;
    hours12 = hours12 ? hours12 : 12;
    return `${hours12}:${minutes} ${ampm}`;
  }

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/courses/getCourses"
        );
        setCourses(response.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchCourses();
    document.title = "Courses - EcoUtopia";
  }, []);

  // Apply filters to the courses
  const filteredCourses = courses.filter((course) => {
    return (
      (!selectedType || course.course_type === selectedType) &&
      (!selectedInstructor || course.course_instructor === selectedInstructor) &&
      (!selectedFree || course.course_price === 0) &&
      course.course_price >= priceRange[0] &&
      course.course_price <= priceRange[1]
    );
  });

  if (loading) return <LoadingOverlay visible />;
  if (error) return <Text align="center">Error: {error.message}</Text>;
  if (filteredCourses.length === 0) return <Text align="center">No courses found</Text>;

  return (
    <Container size="xl" style={{ marginTop: 20 }}>
      <Box padding="xl" style={{marginTop: '70px'}} />
      <Navbar />
      <Flex style={{ marginTop: 20 }} justify="space-between">
        {/* Sidebar for filters */}
        <Box style={{ width: '25%', marginRight: 20 }}>
          <Text weight={700} style={{ fontSize: 20, marginBottom: 20 }} c="deepBlue">
            Filters
          </Text>
          <Select
            label="Course Type"
            placeholder="Select course type"
            data={['Online', 'Physical']}
            value={selectedType}
            onChange={setSelectedType}
          />
          <Select
            label="Instructor"
            placeholder="Select instructor"
            data={[...new Set(courses.map((course) => course.course_instructor))]}
            value={selectedInstructor}
            onChange={setSelectedInstructor}
          />
          <Checkbox
            label="Show only free courses"
            style={{ marginTop: 20 }}
            checked={selectedFree}
            onChange={(event) => setSelectedFree(event.currentTarget.checked)}
          />
          <Text weight={700} style={{ marginTop: 20 }}>
            Price Range
          </Text>
          <RangeSlider
            min={0}
            max={50}
            value={priceRange}
            onChange={setPriceRange}
            labelAlwaysOn
            marks={[
              { value: 0, label: '$0' },
              { value: 50, label: '$50' },
            ]}
            style={{ marginTop: 30 }}
          />
          {/* Clear Filters Button */}
          <Button
            variant="outline"
            color="deepBlue"
            style={{ marginTop: 30 }}
            onClick={() => {
              setSelectedType(null);
              setSelectedInstructor(null);
              setPriceRange([0, 50]);
              setSelectedFree(false);
            }}
          >Clear Filters</Button>
        </Box>

        {/* Courses Grid */}
        <Box style={{ width: '75%' }}>
          <Text
            align="start"
            weight={700}
            style={{ fontSize: 30, marginBottom: 20 }}
            c="deepBlue"
            fw={500}
            size="xl"
          >
            Course Catalog
          </Text>
          <Grid>
        {filteredCourses.map((course) => (
          <Grid.Col key={course.course_id} span={4}>
            <Card
              shadow="md"
              radius="md"
              padding="lg"
              style={{
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              <Card.Section>
                <Image
                  src={course.course_image_url}
                  fallbackSrc="https://placehold.co/600x400?text=Placeholder"
                  alt={course.course_name}
                  height={160}
                  style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                />
              </Card.Section>
              <Badge
                color={course.course_type === "Online" ? "blue" : "orange"}
                style={{ position: "absolute", top: 10, right: 10 }}
              >
                {course.course_type}
              </Badge>
              <Text weight={500} size="md" style={{ marginTop: 10, marginBottom: 5 }}>
                {course.course_name}
              </Text>
              <Text size="sm" color="dimmed">
                {dayjs(course.start_date).format("DD MMM YYYY")} |{" "}
                {formatMySQLTimeString(course.course_start_time)} -{" "}
                {formatMySQLTimeString(course.course_end_time)}
              </Text>
              <Flex align="center" style={{ marginTop: 10 }}>
                <Avatar size="sm" />
                <Text size="sm" ml="sm">
                  {course.course_instructor}
                </Text>
              </Flex>
              <Group style={{ marginTop: 15 }} justify="space-between">
                <Text weight={700}>${course.course_price}</Text>
                <Anchor
                  href={`/course/${course.course_id}`}
                  style={{ textDecoration: "none" }}
                >
                  <Button variant="filled" color="blue" radius="md">
                    View Course
                  </Button>
                </Anchor>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
        </Box>
      </Flex>
    </Container>
  );
}

export default Courses;