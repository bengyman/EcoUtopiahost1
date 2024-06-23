import axios from "axios";
import dayjs from "dayjs";
import {
  Container,
  Grid,
  Paper,
  Anchor,
  Card,
  Image,
  Text,
  Badge,
  Button,
  Group,
  LoadingOverlay,
} from "@mantine/core";
import { useState, useEffect } from "react";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  if (loading) return <LoadingOverlay visible />;
  if (error) return <Text align="center">Error: {error.message}</Text>;
  if (courses.length === 0) return <Text align="center">No courses found</Text>;

  return (
    <Container size="xl" style={{ marginTop: 20 }}>
      <Text
        align="start"
        weight={700}
        style={{ fontSize: 30, marginBottom: 20 }}
        c="deepBlue"
        fw={500}
        size="xl"
      >
        Check out our courses
      </Text>
      <Grid>
        {courses.map((course) => (
          <Card
            key={course.course_id}
            shadow="xs"
            style={{ width: 300, margin: 10 }}
          >
            <Paper padding="md" style={{ position: "relative" }}>
              <Image
                src={null}
                fallbackSrc="https://placehold.co/600x400?text=Placeholder"
                alt="aa"
                h={200}
              />
              <Badge
                color={course.course_type === "Online" ? "blue" : "orange"}
                style={{ position: "absolute", bottom: 10, right: 10}}
              >
                {course.course_type}
              </Badge>
            </Paper>
            <Text fw={700} c={'purple'} weight={700}>{dayjs(course.start_date).format("DD MMM YYYY")} | {course.course_start_time} - {course.course_end_time}</Text>
            <Text align="center" fw={700} style={{ margin: 10 }}>
              {course.course_name}
            </Text>
            <Text align="center" style={{ margin: 10 }}>
              {course.course_description}
            </Text>
            <Group grow justify="center">
              <Text weight={700}>Price : ${course.course_price}</Text>
              <Anchor style={{ textDecoration: 'none' }} href={`/course/${course.course_id}`}>
                <Button fullWidth color="deepBlue" style={{ margin: 10 }}>
                  View Course
                </Button>
              </Anchor>
            </Group>
          </Card>
        ))}
      </Grid>
    </Container>
  );
}

export default Courses;
