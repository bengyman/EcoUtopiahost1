import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import http from '../http';
import dayjs from 'dayjs';
import global from '../global';
import { Link } from 'react-router-dom';

function EditOrders() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderId) {
      http.get(`/orders/${orderId}`).then((res) => {
        setOrder(res.data);
      });
    }
  }, [orderId]);

  const handleRefund = () => {
    http.put(`/orders/${orderId}`).then((res) => {
      setOrder(res.data);
    });
  };

  if (!order) {
    return <div>Loading...</div>;
  }

  return (
    <div className="edit-order-container">
      <h1>Edit Order {order.order_id}</h1>
      <div className="order-details">
        <p>
          <strong>Course Title:</strong> {order.Course.course_name}
        </p>
        <p>
          <strong>Order Status:</strong> {order.order_status}
        </p>
        <p>
          <strong>Order Date:</strong> {dayjs(order.order_date).format(global.datetimeFormat)}
        </p>
        <p>
          <strong>Instructor:</strong> {order.Course.course_instructor}
        </p>
        <p>
          <strong>Course Description</strong> {order.Course.course_description}
        </p>
        <p>
          <strong>Course Date:</strong> {dayjs(order.Course.course_date).format(global.datetimeFormat)}
        </p>
        <p>
          <strong>Start Time:</strong> {order.Course.course_start_time}
        </p>
        <p>
          <strong>End Time:</strong> {order.Course.course_end_time}
        </p>
        <Link to="/orders">
        <button onClick={handleRefund}>Refund Order</button>
        </Link>
      </div>
    </div>
  );
}

export default EditOrders;