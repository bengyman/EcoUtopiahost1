import axios from 'axios';
import { Container, Grid, Card, Image, Text, Badge, Button, Group } from "@mantine/core"
import { useState ,useEffect } from "react"

function Courses() {
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/courses/getCourses')
                setCourses(response.data)
                setLoading(false)
            } catch (error) {
                setError(error)
                setLoading(false)
            }
        }
        fetchCourses()
        document.title = "Courses - EcoUtopia"
    }, [])
    if (loading) return <Text align="center">Loading...</Text>
    if (error) return <Text align="center">Error: {error.message}</Text>
    if (courses.length === 0) return <Text align="center">No courses found</Text>

    return (
        <Container size="xl" style={{ marginTop: 20 }}>
            <Text align="center" weight={700} style={{ fontSize: 30, marginBottom: 20 }}>Courses</Text>
            <Grid>
                {courses.map(course => (
                    <Card key={course.course_id} shadow="xs" style={{ width: 300, margin: 10 }}>
                        <Image src={course.course_image} alt={course.course_name} height={200} />
                        <Text align="center" weight={700} style={{ margin: 10 }}>{course.course_name}</Text>
                        <Text align="center" style={{ margin: 10 }}>{course.course_description}</Text>
                        <Group align="center" style={{ margin: 10 }}>
                            <Badge color={course.course_type === 'Online' ? 'blue' : 'orange'}>{course.course_type}</Badge>
                        </Group>
                        <Button fullWidth color="blue" style={{ margin: 10 }}>Enroll</Button>
                    </Card>
                ))}
            </Grid>
        </Container>
    )
}

export default Courses