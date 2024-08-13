import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Table, Button, Checkbox, Group, Title, Box } from '@mantine/core';

function CheckAttendance() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const { courseId } = useParams();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`/courses/${courseId}/students`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });
        setStudents(response.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [courseId]);

  const handleAttendanceChange = (studentId, isChecked) => {
    setAttendance({
      ...attendance,
      [studentId]: isChecked ? 'present' : 'absent',
    });
  };

  const handleSubmit = async () => {
    try {
      const attendanceRecords = students.map(student => ({
        studentId: student.student_id,
        status: attendance[student.student_id] || 'absent', // default to absent if not marked
        date: new Date().toISOString().split('T')[0], // current date
      }));

      await axios.post('/attendance', {
        courseId,
        attendanceRecords,
      }, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      alert('Attendance submitted successfully');
    } catch (error) {
      console.error("Error submitting attendance:", error);
      alert('Error submitting attendance');
    }
  };

  return (
    <Container>
      <Title order={2}>Attendance for Course</Title>
      <Box padding="xl" style={{marginTop: '20px'}} />
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Student Name</Table.Th>
            <Table.Th>Present</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {students.map(student => (
            <Table.Tr key={student.student_id}>
              <Table.Td>{student.student_name}</Table.Td>
              <Table.Td>
                <Checkbox
                  checked={attendance[student.student_id] === 'present'}
                  onChange={(e) => handleAttendanceChange(student.student_id, e.target.checked)}
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Group position="right" style={{ marginTop: '20px' }}>
        <Button onClick={handleSubmit}>Submit Attendance</Button>
      </Group>
    </Container>
  );
}

export default CheckAttendance;
