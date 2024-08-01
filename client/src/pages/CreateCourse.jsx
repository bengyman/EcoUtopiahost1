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
} from '@mantine/core'
import { DateTimePicker, TimeInput } from '@mantine/dates';
import { IconClock } from '@tabler/icons-react';
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
//import AdminNav from '../../components/AdminNav'

function CreateCourse() {
    const navigate = useNavigate();
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
        course_capacity: ''
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
        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        try {
            const formattedData = {
                ...formData,
                course_date: new Date(formData.course_date).toISOString(),
                course_start_time: formData.course_start_time,
                course_end_time: formData.course_end_time
            };
            console.log(`Formatted data: ${JSON.stringify(formattedData)}`);
            const response = await axios.post('http://localhost:3001/courses/createCourse', formattedData);
            console.log(`Response: ${JSON.stringify(response.data)}`);
            console.log(response.data);
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
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(formData); }}>
                    <TextInput
                        label="Course Name"
                        placeholder="Enter course name"
                        required
                        value={formData.course_name}
                        onChange={(event) => setFormData({ ...formData, course_name: event.target.value })}
                    />
                    <Textarea
                        label="Course Description"
                        placeholder="Enter course description"
                        required
                        value={formData.course_description}
                        onChange={(event) => setFormData({ ...formData, course_description: event.target.value })}
                    />
                    <TextInput
                        label="Course Instructor"
                        placeholder="Enter course instructor"
                        required
                        value={formData.course_instructor}
                        onChange={(event) => setFormData({ ...formData, course_instructor: event.target.value })}
                    />
                    <NumberInput
                        label="Course Price"
                        placeholder="Enter course price"
                        required
                        value={formData.course_price}
                        onChange={(value) => setFormData({ ...formData, course_price: value })}
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
                        label="Course Date"
                        placeholder="Enter course date"
                        valueFormat='YYYY-MM-DD HH:mm:ss'
                        value={new Date(formData.course_date)}
                        onChange={(date) => setFormData({ ...formData, course_date: date })}
                        style={{ marginBottom: rem(1) }}
                        required
                        error={formErrors.course_date}
                    />
                    <TextInput
                        label="Start Time"
                        placeholder="Enter start time"
                        value={formData.course_start_time}
                        style={{ marginBottom: rem(1) }}
                        onChange={(event) => setFormData({ ...formData, course_start_time: event.target.value })}
                        required
                        error={formErrors.course_start_time}
                    />
                    <TextInput
                        label="End Time"
                        placeholder="Enter end time"
                        value={formData.course_end_time}
                        style={{ marginBottom: rem(1) }}
                        onChange={(event) => setFormData({ ...formData, course_end_time: event.target.value })}
                        required
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
                        required
                        error={formErrors.course_capacity}
                    />
                    <Box mt="lg" />
                    <Group position="right" style={{ marginTop: 20 }}>
                        <Button 
                        type="submit" 
                        variant="filled" 
                        color="blue"
                        onClick={() => {
                            handleSubmit(formData)
                            console.log(formData)
                        }}
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