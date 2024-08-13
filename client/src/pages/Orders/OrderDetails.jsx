import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import http from '../../http.js';
import dayjs from 'dayjs';
import global from '../../global.js';
import { Text, Container, Card, Button, Group } from '@mantine/core';
import { TiArrowBack } from "react-icons/ti";
import LoaderComponent from '../../components/Loader.jsx';

function ViewOrders() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            const token = sessionStorage.getItem('token');
            http.get(`/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then((res) => {
                setOrder(res.data);
                setIsLoading(false); // Set loading to false when data is loaded
            }).catch(() => setIsLoading(false)); // Handle potential errors
        }
    }, [orderId]);

    if (isLoading) {
        return <LoaderComponent />;
    }

    if (!order) {
        return <Text>No order found.</Text>;
    }

    return (
        <Container size="md" style={{ marginTop: 20 }}>
            <Group position="apart" mb={30}>
                <Button component={Link} to="/orders" variant="link">
                    <TiArrowBack />
                </Button>
                <Text
                    align="start"
                    weight={700}
                    style={{ fontSize: 30 }}
                    color="deepBlue"
                    fw={500}
                    size="xl"
                >
                    View Order {order.order_id}
                </Text>
            </Group>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text size="lg" weight={500} align="left">
                    <strong>Course Title:</strong> {order.Course.course_name}
                </Text>
                <Text size="lg" weight={500} align="left">
                    <strong>Order Status:</strong> {order.order_status}
                </Text>
                <Text size="lg" weight={500} align="left">
                    <strong>Order Date:</strong> {dayjs(order.order_date).format(global.datetimeFormat)}
                </Text>
                <Text size="lg" weight={500} align="left">
                    <strong>Order Amount:</strong> ${order.Course.course_price}
                </Text>
                <Text size="lg" weight={500} align="left">
                    <strong>Instructor:</strong> {order.Course.Instructor.name}
                </Text>
                <Text size="lg" weight={500} align="left">
                    <strong>Course Description:</strong> {order.Course.course_description}
                </Text>
                <Text size="lg" weight={500} align="left">
                    <strong>Start Time:</strong> {dayjs(order.Course.course_start_date).format(global.datetimeFormat)}
                </Text>
                <Text size="lg" weight={500} align="left">
                    <strong>End Time:</strong> {dayjs(order.Course.course_end_date).format(global.datetimeFormat)}
                </Text>
            </Card>
        </Container>
    );
}

export default ViewOrders;
