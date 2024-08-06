import axios from 'axios'
import daysjs from 'dayjs'
import { 
    Container,
    Text,
    Button,
    LoadingOverlay,
    Title,
    Box,
    ActionIcon,
    TextInput,
    FileInput,
    rem,
    Textarea,
    NumberInput,
    Anchor,
    Notification,
    Select,
    Group,
} from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { DateTimePicker, TimeInput } from '@mantine/dates';

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from 'react-router-dom';

function EditCourse() {
    const { courseId } = useParams()
    const navigate = useNavigate()
    const [course, setCourse] = useState(null)
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        course_name: '',
        course_description: '',
        course_price: '',
        course_instructor: '',
        course_type: '',
        course_date: '',
        course_start_time: '',
        course_end_time: '',
        course_capacity: '',
        course_image_url: '', 
      });

    const ref = useRef(null);

    const pickerControl = (
        <ActionIcon variant="subtle" color="gray" onClick={() => ref.current?.showPicker()}>
        <IconClock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
        </ActionIcon>
    );

    const validateForm = () => {
        const errors = {};
        if (!formData.course_name) errors.course_name = "Course name is required";
        if (!formData.course_description) errors.course_description = "Course description is required";
        if (!formData.course_price) errors.course_price = "Course price is required";
        if (!formData.course_instructor) errors.course_instructor = "Course instructor is required";
        if (!formData.course_type) errors.course_type = "Course type is required";
        if (!formData.course_date) errors.course_date = "Course date is required";
        if (!formData.course_start_time) errors.course_start_time = "Course start time is required";
        if (!formData.course_end_time) errors.course_end_time = "Course end time is required";
        if (!formData.course_capacity) errors.course_capacity = "Course capacity is required";
        if (!formData.course_image_url) errors.course_image_url = "Course image is required";
        return errors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formDataToSend = new FormData();
        formDataToSend.append('course_name', formData.course_name);
        formDataToSend.append('course_description', formData.course_description);
        formDataToSend.append('course_price', formData.course_price);
        formDataToSend.append('course_instructor', formData.course_instructor);
        formDataToSend.append('course_type', formData.course_type);
        formDataToSend.append('course_date', daysjs(formData.course_date).format('YYYY-MM-DD HH:mm:ss'));
        formDataToSend.append('course_start_time', formData.course_start_time);
        formDataToSend.append('course_end_time', formData.course_end_time);
        formDataToSend.append('course_capacity', formData.course_capacity);
        formDataToSend.append('course_image_url', formData.course_image_url);

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        try {
            console.log("FormData entries");
            console.log(`Course ID: ${courseId}`);
            formDataToSend.forEach((value, key) => {
                console.log(key, value);
            });

            const response = await axios.put(`/courses/update-course/${courseId}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('Response:', response.data);
            console.log('Course updated successfully');
            setSuccess(true);
            navigate('/admin/view-courses');
            setFormErrors({});
        } catch (error) {
            setError(error)
            setErrorMessage(`Error: ${error.message}, ${error.response.data.error}`);
        }
    };

    useEffect(() => {
        document.title = 'Course Details - EcoUtopia'
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/courses/getCourse/${courseId}`)
                const fetchedCourse = response.data
                setCourse(fetchedCourse)
                setFormData({
                    course_name: fetchedCourse.course_name,
                    course_description: fetchedCourse.course_description,
                    course_price: fetchedCourse.course_price,
                    course_instructor: fetchedCourse.course_instructor,
                    course_type: fetchedCourse.course_type,
                    course_date: fetchedCourse.course_date,
                    course_start_time: fetchedCourse.course_start_time,
                    course_end_time: fetchedCourse.course_end_time,
                    course_capacity: fetchedCourse.course_capacity,
                    course_image_url: fetchedCourse.course_image_url,
                })
                setLoading(false)
            } catch (error) {
                setError(error)
                setErrorMessage(error.message)
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
            <Box style={{ marginTop: 40 }} />
            <Title order={1} style={{ marginBottom: 20 }}>Edit Course</Title>
            <form onSubmit={handleSubmit}>
                <Box>
                    <TextInput
                        label="Course Name"
                        placeholder="Enter course name"
                        value={formData.course_name}
                        onChange={(event) => setFormData({ ...formData, course_name: event.target.value })}
                        style={{ marginBottom: rem(1) }}
                        error={formErrors.course_name}
                        styles={(theme) => ({
                            input: {
                                borderColor: formErrors.course_name ? theme.colors.red[6] : theme.colors.gray[4],
                                color: formErrors.course_name ? theme.colors.red[6] : theme.colors.gray[9],
                            },
                        })
                        }
                    />
                    <Textarea
                        label="Course Description"
                        placeholder="Enter course description"
                        value={formData.course_description}
                        style={{ marginBottom: rem(1) }}
                        onChange={(event) => setFormData({ ...formData, course_description: event.target.value })}
                        required
                        error={formErrors.course_description}
                    />
                    <TextInput
                        label="Course Instructor"
                        placeholder="Enter course instructor"
                        value={formData.course_instructor}
                        style={{ marginBottom: rem(1) }}
                        onChange={(event) => setFormData({ ...formData, course_instructor: event.target.value })}
                        required
                        error={formErrors.course_instructor}
                    />
                    <NumberInput
                        label="Course Price"
                        placeholder="Enter course price"
                        value={formData.course_price}
                        style={{ marginBottom: rem(1) }}
                        onChange={(value) => setFormData({ ...formData, course_price: value })}
                        required
                        error={formErrors.course_price}
                    />
                    <Select
                        label="Course Type"
                        placeholder="Select course type"
                        data={[
                            { value: 'Online', label: 'Online' },
                            { value: 'Physical', label: 'Physical' },
                        ]}
                        value={formData.course_type}
                        style={{ marginBottom: rem(1) }}
                        onChange={(value) => setFormData({ ...formData, course_type: value })}
                        required
                        error={formErrors.course_type}
                    />
                    <DateTimePicker 
                        label="Pick date and time" 
                        placeholder="Pick date and time" 
                        valueFormat='YYYY-MM-DD HH:mm:ss'
                        value={new Date(formData.course_date)}
                        onChange={(date) => setFormData({ ...formData, course_date: date.toISOString() })}
                        style={{ marginBottom: rem(1) }}
                        required
                        error={formErrors.course_date}
                    />
                    <TimeInput
                        label="Start Time"
                        placeholder="Enter start time"
                        rightSection={pickerControl}
                        ref={ref}
                        value={formData.course_start_time}
                        style={{ marginBottom: rem(1) }}
                        onChange={(time) => setFormData({ ...formData, course_start_time: time })}
                        required
                        error={formErrors.course_start_time}
                    />
                    <TimeInput
                        label="End Time"
                        placeholder="Enter end time"
                        rightSection={pickerControl}
                        ref={ref}
                        value={formData.course_end_time}
                        style={{ marginBottom: rem(1) }}
                        onChange={(time) => setFormData({ ...formData, course_end_time: time })}
                        required
                        error={formErrors.course_end_time}
                    />
                    <NumberInput
                        label="Capacity"
                        placeholder="Enter capacity"
                        value={formData.course_capacity}
                        style={{ marginBottom: rem(1) }}
                        onChange={(value) => setFormData({ ...formData, course_capacity: value })}
                        required
                        error={formErrors.course_capacity}
                    />
                    <FileInput
                        label="Course Image"
                        name="course_image_url"
                        placeholder="Choose course image"
                        accept="image/*"
                        required
                        error={formErrors.course_image_url}
                        onChange={(file => setFormData({ ...formData, course_image_url: file }))}
                     />
                    <Box style={{ marginTop: 20 }} />
                    <Group position="right" style={{ marginTop: 20 }}>
                        <Button
                            color="teal"
                            variant="dark"
                            style={{ marginBottom: rem(1) }}
                            /*onClick={() => {
                                console.log(formData)
                                console.log(localStorage.getItem('fileLocation'))
                            }}*/
                            type='submit'
                        >
                            Update Course
                        </Button>
                        <Anchor href="/admin/view-courses" style={{ marginLeft: rem(1) }}>
                            <Button variant="transparent" color="gray">
                                Cancel
                            </Button>
                        </Anchor>
                    </Group>
                </Box>
            </form>
            {success && (
                <Notification onClose={() => setSuccess(false)} color="green">
                    Course updated successfully!
                </Notification>
            )}
            {error && (
                <Notification onClose={() => setError(false)} color="red">
                    {errorMessage}
                </Notification>
            )}
        </Container>
    )
}

export default EditCourse