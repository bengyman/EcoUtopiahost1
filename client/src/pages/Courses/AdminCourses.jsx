import axios from "axios";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import {
   Container,
   Flex, 
   Button, 
   TextInput, 
   Box, 
   Anchor,
   Table, 
   Group, 
   Text, 
   ActionIcon, 
   Menu, 
   Title,
   Modal,
   LoadingOverlay,
   rem 
  } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconPencil,
  IconStackPush,
  IconTrash,
  IconDots,
} from '@tabler/icons-react';

function AdminCourses() {
    const [opened, { open, close }] = useDisclosure(false);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

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
      document.title = "Admin - EcoUtopia";
    }, []);

    const deleteCourse = async () => {
      console.log(`Deleting course with ID: ${courseToDelete}`);
      try {
        await axios.delete(`http://localhost:3000/api/courses/deleteCourse/${courseToDelete}`);
        console.log(`Course with ID ${courseToDelete} deleted`);
        setCourses(courses.filter((course) => course.course_id !== courseToDelete));
      } catch (error) {
        console.error(error);
      } finally {
        close();
        setCourseToDelete(null);
      }
    };

    if (loading) return <LoadingOverlay visible />;
    if (error) return <Text align="center">Error: {error.message}</Text>;
    if (courses.length === 0) return <Text align="center">No courses found</Text>

    const filteredCourses = courses.filter((course) =>
      course.course_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const rows = filteredCourses.map((course) => (
        <Table.Tr key={course.course_id}>
          <Table.Td>
            <Group gap="sm">
              <div>
                <Text fz="sm" fw={500}>
                  {course.course_name}
                </Text> 
              </div>
            </Group>
          </Table.Td>
          <Table.Td>
            <Text fz="sm">{course.course_instructor}</Text>
          </Table.Td>
          <Table.Td>
            <Text fz="sm">{dayjs(course.createdAt).format('DD/MM/YYYY')}</Text>
          </Table.Td>
          <Table.Td>
            <Text fz="sm">{course.course_capacity} students</Text>
          </Table.Td>
          <Table.Td>
            <Group gap={0} justify="flex-start">
              <Anchor href={`/admin/edit-course/${course.course_id}`}>
                <ActionIcon variant="subtle" color="gray">
                  <IconPencil style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                </ActionIcon>
              </Anchor>
              <Menu
                transitionProps={{ transition: 'pop' }}
                withArrow
                position="bottom-end"
                withinPortal
              >
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray">
                    <IconDots style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={
                      <IconStackPush style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                    }
                  >
                    Publish course
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                    color="red"
                    onClick={() => {
                      setCourseToDelete(course.course_id);
                      open();
                    }}
                  >
                    Delete course
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Table.Td>
        </Table.Tr>
      ));
  return (
    <Container size="xl">
        <Box padding="xl" style={{marginTop: '30px'}} />
        <Title>Manage Courses</Title>
        {/*<Button color="blue" variant="outline">Test Button</Button> */}
        <Box padding="xl" style={{marginTop: '70px'}} />
        <Flex justify={{ sm: "space-between", md: "space-between" }} direction={{ xs: "column", sm: "row" }}>
            <Box>
                <Flex gap="md">
                    <TextInput 
                    placeholder="Search courses" 
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.currentTarget.value)}
                    />
                    {/*<Button color="blue">Search</Button>
                    <Button color="gray">Filter</Button>*/}
                    <Text c="dimmed">{filteredCourses.length} courses found</Text>
                </Flex>
            </Box>
            <Anchor href="/admin/create-course">
                <Button justify='flex-end' color="blue">Create Course</Button>
            </Anchor>
        </Flex>
        <Modal opened={opened} onClose={close} title="Delete Course">
            <Title c='red' order={3}>Are you sure you want to delete this course?</Title>
            <Box padding="xl" style={{marginTop: '20px'}} />
            <Text>This action cannot be undone.</Text>
            <Box padding="xl" style={{marginTop: '20px'}} />
            <Group align='right'>
                <Button 
                color='red'
                onClick={deleteCourse}
                >Delete
                </Button>
                <Button variant="transparent" onClick={close} color='gray'>Cancel</Button>
            </Group>
        </Modal>
        <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="md">
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Course Name</Table.Th>
                <Table.Th>Offered By</Table.Th>
                <Table.Th>Created At</Table.Th>
                <Table.Th>Capacity</Table.Th>
                <Table.Th>Actions</Table.Th>
                <Table.Th />
            </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
        </Table>
        </Table.ScrollContainer>
    </Container>
  )
}

export default AdminCourses