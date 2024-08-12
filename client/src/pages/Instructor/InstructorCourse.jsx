import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Text, Button, Group } from '@mantine/core';
import { useParams } from 'react-router-dom';

function InstructorCourse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { instructorId } = useParams();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/instructor/getCourses/${instructorId}`);
        setCourses(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [instructorId]);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <Container>
      <Text size="xl" weight={700}>Assigned Courses</Text>
      <Table>
        <thead>
          <tr>
            <th>Course Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.course_id}>
              <td>{course.course_name}</td>
              <td>
                <Group>
                  <Button onClick={() => viewCourseDetails(course.course_id)}>View Details</Button>
                  <Button onClick={() => checkAttendance(course.course_id)}>Check Attendance</Button>
                  <Button onClick={() => giveCertificate(course.course_id)}>Give Certificate</Button>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

const viewCourseDetails = (courseId) => {
  // Navigate to course details page
  window.location.href = `/instructor/course/${courseId}`;
};

const checkAttendance = (courseId) => {
  // Implement attendance checking logic
  console.log(`Checking attendance for course ID: ${courseId}`);
};

const giveCertificate = (courseId) => {
  // Implement certificate giving logic
  console.log(`Giving certificate for course ID: ${courseId}`);
};

export default InstructorCourse;