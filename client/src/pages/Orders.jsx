import https from '../https';
import global from '../global';
import dayjs from 'dayjs';
import './orders.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CiEdit } from 'react-icons/ci';

function Orders() {
  const [orderslist, setOrdersList] = useState([]);
  const [filter, setFilter] = useState('Upcoming');

  useEffect(() => {
    https.get('/orders').then((res) => {
      console.log(res.data);
      setOrdersList(Array.isArray(res.data) ? res.data : []);
    });
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const filteredOrders = orderslist.filter((order) => {
    if (filter === 'Upcoming') return order.order_status === 'Upcoming';
    if (filter === 'Completed') return order.order_status === 'Completed';
    if (filter === 'Refunded') return order.order_status === 'Refunded';
    return true;
  });

  return (
    <div className="orders-container">
      <div className="header-container">
        <h1>Orders</h1>
        <div className="filter-buttons">
          <button
            className={filter === 'Upcoming' ? 'selected' : ''}
            onClick={() => handleFilterChange('Upcoming')}
          >
            Upcoming
          </button>
          <button
            className={filter === 'Completed' ? 'selected' : ''}
            onClick={() => handleFilterChange('Completed')}
          >
            Completed
          </button>
          <button
            className={filter === 'Refunded' ? 'selected' : ''}
            onClick={() => handleFilterChange('Refunded')}
          >
            Refunded
          </button>
        </div>
        <Link to="/add-orders">
          <button className="Add">Add Order</button>
        </Link>
      </div>
      <ol className="orders-list">
        {filteredOrders.map((order, i) => (
          <li key={i} className={`order-item ${order.order_status.toLowerCase()}`}>
            <div className="order-item-header">
              <h2>{order.order_id}</h2>
              {filter === 'Upcoming' && (
                <Link to={`/editorders/${order.order_id}`}>
                  <button className="edit-button">
                    <CiEdit />
                  </button>
                </Link>
              )}
            </div>
            <p>Course Title: {order.Course.course_name}</p>
            <p>{order.order_status}</p>
            <p>{dayjs(order.order_date).format(global.datetimeFormat)}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default Orders;