import React, { useEffect, useState } from 'react';
import http from '../http';
import global from '../global';
import dayjs from 'dayjs';

function AdminOrders() {
  const [orderslist, setOrdersList] = useState([]);

  useEffect(() => {
    http.get('/orders').then((res) => {
      console.log(res.data);
      setOrdersList(res.data);
    });
  }, []);

  return (
    <div>
      <h1>Admin Orders</h1>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Course Title</th>
            <th>Status</th>
            <th>Order Date</th>
          </tr>
        </thead>
        <tbody>
          {orderslist.map((order, i) => (
            <tr key={i}>
              <td>{order.order_id}</td>
              <td>{order.Course.course_name}</td>
              <td>{order.order_status}</td>
              <td>{dayjs(order.order_date).format(global.datetimeFormat)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminOrders;
