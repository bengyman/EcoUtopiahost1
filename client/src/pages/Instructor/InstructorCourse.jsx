import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  IconChecklist,
  IconFileCertificate,
  IconSearch,
} from '@tabler/icons-react';
import { Container, Table, Text, ActionIcon, Group, Title, Box } from '@mantine/core';

function InstructorCourse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { instructorId } = useParams();
  //const navigate = useNavigate();

  useEffect(() => {
    const fetchInstructorCourses = async () => {
      try {
        const response = await axios.get(`/courses/getInstructorCourses`, {
          params: { instructorId },
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });
        setCourses(response.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchInstructorCourses();
  }, [instructorId]);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const rows = courses.map(course => (
    <Table.Tr key={course.course_id}>
      <Table.Td>{course.course_name}</Table.Td>
      <Table.Td>
        <Group>
          <ActionIcon variant="subtle" color="gray" onClick={() => viewCourseDetails(course.course_id)}>
            <IconSearch />
          </ActionIcon>
          <ActionIcon variant="subtle" color="blue" onClick={() => checkAttendance(course.course_id)}>
            <IconChecklist />
          </ActionIcon>
          <ActionIcon variant="subtle" color="green" onClick={() => giveCertificate(course.course_id)}>
            <IconFileCertificate />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container>
      <Title order={2}>Assigned Courses</Title>
      <Box padding="xl" style={{marginTop: '40px'}} />
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Course Name</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
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
  //console.log(`Checking attendance for course ID: ${courseId}`);
  window.location.href = `/instructor/check-attendance/${courseId}`;
};

const giveCertificate = (courseId) => {
  // Implement certificate giving logic
  console.log(`Giving certificate for course ID: ${courseId}`);
};

export default InstructorCourse;