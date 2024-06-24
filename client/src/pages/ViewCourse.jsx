import axios from 'axios';
import { 
  Container,
  Text,
  Button,
  LoadingOverlay,
  Paper,
  Grid,
  Image,
  Group,
  Title,
} from '@mantine/core';
import { useState, useEffect } from "react"
import { useParams } from 'react-router-dom';

function ViewCourse() {
    const { courseId } = useParams()
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    useEffect(() => {
        document.title = 'Course Details - EcoUtopia'
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/courses/getCourse/${courseId}`)
                setCourse(response.data)
                setLoading(false)
            } catch (error) {
                setError(error)
            } finally {
                setLoading(false)
            }
        }
        fetchCourse()
    }, [courseId])

    if (loading) {
        return (
            <Container size="xl">
                <LoadingOverlay visible />
            </Container>
        )
    }

    if (error) {
        return (
            <Container size="xl">
                <Text c={'red'} align="center" size="xl" style={{ marginTop: 20 }}>
                    {error.message} 
                </Text>
            </Container>
        )
    }

  return (
    <Container size="xl">
      <Paper padding="xl" shadow="xs" style={{ marginTop: 20 }}>
        <Grid>
          <Grid.Col span={6}>
            <Image
              //src={course.image}
              alt={course.course_name}
              fallbackSrc="https://placehold.co/600x400?text=Placeholder"
              height={300}
              width={500}
              fit="cover"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Group direction="column" align="flex-start">
              <Title order={1}>{course.course_name}</Title>
              <Text size="xl" style={{ marginTop: 10 }}>
                {course.course_description}
              </Text>
              <Text size="xl" style={{ marginTop: 10 }}>
                Price: ${course.course_price}
              </Text>
              <Button
                component="a"
                href={`/checkout/${course.course_id}`}
                size="lg"
                style={{ marginTop: 20 }}
              >
                Buy Course
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Paper>
    </Container>
  )
}

export default ViewCourse