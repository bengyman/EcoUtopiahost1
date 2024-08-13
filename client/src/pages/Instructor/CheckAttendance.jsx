import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Table, Button, Checkbox, Group, Title, Box } from '@mantine/core';

function CheckAttendance() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { courseId } = useParams();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`/attendance/getAttendance/${courseId}`, {
          //params: { courseId },
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });
        console.log(response.data);
        const attendanceData = response.data.map(record => ({
          student_id: record.resident_id,
          student_name: record.Resident.name,
          attendance_status: record.attendance_status,
        }));
        const uniqueResident = filterUniqueResident(attendanceData);
        console.log(`Attendance Data: ${attendanceData}`);
        console.log(`Unique Resident: ${uniqueResident}`);
        //setStudents(attendanceData);
        setStudents(uniqueResident);
        const initialAttendance = {};
        attendanceData.forEach(record => {
          initialAttendance[record.student_id] = record.attendance_status;
        });
        setAttendance(initialAttendance);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [courseId]);

  const filterUniqueResident = (residents) => {
    const uniqueResident = [];
    const residentIds = new Set();
    
    residents.forEach((resident) => {
      if (!residentIds.has(resident.student_id)) {
        uniqueResident.push(resident);
        residentIds.add(resident.student_id);
      }
    });
    return uniqueResident;
  };

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
        attendance_date: new Date().toISOString().split('T')[0], // current date
      }));
      await axios.post('/attendance/attendance', {
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
            <Table.Th>Mark as Present</Table.Th>
            <Table.Th>Attendance Status</Table.Th>
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
              <Table.Td>{attendance[student.student_id]}</Table.Td>
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