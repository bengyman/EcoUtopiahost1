import axios from 'axios';
import { 
    Container,
    Text,
    Button,
    Title,
    Box,
    ActionIcon,
    TextInput,
    rem,
    Textarea,
    NumberInput,
    Anchor,
    Notification,
    Select,
    Group,
    FileInput
} from '@mantine/core'
import { DateTimePicker, /*TimeInput*/ } from '@mantine/dates';
import { IconClock } from '@tabler/icons-react';
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
//import AdminNav from '../../components/AdminNav'

function CreateCourse() {
    const navigate = useNavigate();
    //const [image, setImage] = useState(null);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [error, setError] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        course_name: '',
        course_description: '',
        course_price: '',
        course_instructor: '',
        course_type: '',
        course_date: new Date(),
        course_start_time: '',
        course_end_time: '',
        course_capacity: '',
        course_image_url: ''
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
        //if (!image) errors.course_image_url = "Course image is required";
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
        formDataToSend.append('course_date', formData.course_date.toISOString().slice(0, 19).replace('T', ' '));
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
            console.log("FormData entries:");
            formDataToSend.forEach((value, key) => {
                console.log(key, value);
            });
            
            const response = await axios.post('/courses/create-course', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('Response:', response.data);
            console.log('Course created successfully');
            setSuccess(true);
            setError(false);
            setFormErrors({});
            navigate('/admin/view-courses')
            /*setTimeout(() => {
                navigate('/admin/view-courses')
            }, 2000);*/
        } catch (error) {
            console.error('Error:', error);
            setError(true);
            if (error.response) {
                const responseErrors = error.response.data.errors || {};
                setFormErrors(responseErrors);
                setErrorMessage(JSON.stringify(error.response.data));
            } else if (error.request) {
                setErrorMessage('Error: No response received from the server.');
            } else {
                setErrorMessage(`Error: ${error.message}`);
            }
        }
    };

    useEffect(() => {
        document.title = 'Create Course - EcoUtopia';
    }, []);

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
        <>
        {/*<AdminNav /> */}
        <Container size="xl">
            <Box mt="lg" p="lg" style={{maxWidth: "800px", margin: "auto"}}>
                <Title order={1}>Create Course</Title>
                <form onSubmit={handleSubmit}>
                    <TextInput
                        label="Course Name"
                        placeholder="Enter course name"
                        value={formData.course_name}
                        onChange={(event) => setFormData({ ...formData, course_name: event.target.value })}
                        error={formErrors.course_name}
                        styles={(theme) => ({
                        input: {
                            borderColor: formErrors.course_name ? theme.colors.red[7] : undefined,
                            color: formErrors.course_name ? theme.colors.red[7] : undefined,
                        },
                        })}
                    />
                    <Textarea
                        label="Course Description"
                        placeholder="Enter course description"
                        value={formData.course_description}
                        onChange={(event) => setFormData({ ...formData, course_description: event.target.value })}
                        error={formErrors.course_description}
                        styles={(theme) => ({
                        input: {
                            borderColor: formErrors.course_description ? theme.colors.red[7] : undefined,
                            color: formErrors.course_description ? theme.colors.red[7] : undefined,
                        },
                        })}
                    />
                    <TextInput
                        label="Course Instructor"
                        placeholder="Enter course instructor"
                        value={formData.course_instructor}
                        onChange={(event) => setFormData({ ...formData, course_instructor: event.target.value })}
                        error={formErrors.course_instructor}
                        styles={(theme) => ({
                        input: {
                            borderColor: formErrors.course_instructor ? theme.colors.red[7] : undefined,
                            color: formErrors.course_instructor ? theme.colors.red[7] : undefined,
                        },
                        })}
                    />
                    <NumberInput
                        label="Course Price"
                        placeholder="Enter course price"
                        value={formData.course_price}
                        onChange={(value) => setFormData({ ...formData, course_price: value })}
                        error={formErrors.course_price}
                        styles={(theme) => ({
                        input: {
                            borderColor: formErrors.course_price ? theme.colors.red[7] : undefined,
                            color: formErrors.course_price ? theme.colors.red[7] : undefined,
                        },
                        })}
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
                        error={formErrors.course_type}
                        styles={(theme) => ({
                            input: {
                                borderColor: formErrors.course_type ? theme.colors.red[7] : undefined,
                                color: formErrors.course_type ? theme.colors.red[7] : undefined,
                            },
                        })}
                    />
                    <DateTimePicker
                        label="Course Date"
                        placeholder="Enter course date"
                        valueFormat='YYYY-MM-DD HH:mm:ss'
                        value={new Date(formData.course_date)}
                        onChange={(date) => setFormData({ ...formData, course_date: date })}
                        style={{ marginBottom: rem(1) }}
                        error={formErrors.course_date}
                        styles={(theme) => ({
                            input: {
                                borderColor: formErrors.course_date ? theme.colors.red[7] : undefined,
                                color: formErrors.course_date ? theme.colors.red[7] : undefined,
                            },
                        })}
                    />
                    <TextInput
                        label="Start Time"
                        placeholder="Enter start time"
                        value={formData.course_start_time}
                        style={{ marginBottom: rem(1) }}
                        onChange={(event) => setFormData({ ...formData, course_start_time: event.target.value })}
                        error={formErrors.course_start_time}
                        styles={(theme) => ({
                            input: {
                                borderColor: formErrors.course_start_time ? theme.colors.red[7] : undefined,
                                color: formErrors.course_start_time ? theme.colors.red[7] : undefined,
                            },
                        })}
                    />
                    <TextInput
                        label="End Time"
                        placeholder="Enter end time"
                        value={formData.course_end_time}
                        style={{ marginBottom: rem(1) }}
                        onChange={(event) => setFormData({ ...formData, course_end_time: event.target.value })}
                        error={formErrors.course_end_time}
                    />
                    {/*<TimeInput
                        label="Start Time"
                        placeholder="Enter start time"
                        rightSection={pickerControl}
                        ref={ref}
                        value={formData.course_start_time}
                        style={{ marginBottom: rem(1) }}
                        onChange={(time) => setFormData({ ...formData, course_start_time: time })}
                        required
                        withSeconds
                        error={formErrors.course_start_time}
                    />*/}
                    {/*<TimeInput
                        label="End Time"
                        placeholder="Enter end time"
                        rightSection={pickerControl}
                        ref={ref}
                        value={formData.course_end_time}
                        style={{ marginBottom: rem(1) }}
                        onChange={(time) => setFormData({ ...formData, course_end_time: time })}
                        required
                        withSeconds
                        error={formErrors.course_end_time}
                    />*/}
                    <NumberInput
                        label="Capacity"
                        placeholder="Enter capacity"
                        value={formData.course_capacity}
                        style={{ marginBottom: rem(1) }}
                        onChange={(value) => setFormData({ ...formData, course_capacity: value })}
                        error={formErrors.course_capacity}
                        styles={(theme) => ({
                            input: {
                                borderColor: formErrors.course_capacity ? theme.colors.red[7] : undefined,
                                color: formErrors.course_capacity ? theme.colors.red[7] : undefined,
                            },
                        })}
                    />
                    <FileInput
                        label="Course Image"
                        name='course_image_url'
                        placeholder="Select course image"
                        accept="image/*"
                        onChange={(file) => setFormData({ ...formData, course_image_url: file })}
                        style={{ marginBottom: rem(1) }}
                        error={formErrors.course_image_url}
                        styles={(theme) => ({
                            input: {
                                borderColor: formErrors.course_image_url ? theme.colors.red[7] : undefined,
                                color: formErrors.course_image_url ? theme.colors.red[7] : undefined,
                            },
                        })}
                    />
                    <Box mt="lg" />
                    <Group position="right" style={{ marginTop: 20 }}>
                        <Button 
                        type="submit" 
                        variant="filled" 
                        color="blue"
                        >Create Course
                        </Button>
                        <Anchor href="/admin/view-courses">
                            <Button variant="transparent" color="gray" style={{marginLeft: "10px"}}>Cancel</Button>
                        </Anchor>
                    </Group>
                    {success && (
                        <Notification onClose={() => setSuccess(false)} color="green">
                            Course created successfully
                        </Notification>
                    )}
                    {error && (
                        <Notification onClose={() => setError(false)} color="red">
                            {errorMessage}
                        </Notification>
                    )}
                </form>
            </Box>
        </Container>
        </>
    )
}

export default CreateCourse