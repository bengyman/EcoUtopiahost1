// middleware/cron.js
const cron = require('node-cron');
const { Orders, Course } = require('../models'); // Adjust the path as needed
const { Op } = require('sequelize');

// Schedule a job to run every minute
cron.schedule('* * * * *', async () => {
  try {
    // Get the current date
    const currentDate = new Date();

    // Find all orders where the status is 'Upcoming' and the course date is past
    const ordersToUpdate = await Orders.findAll({
      where: {
        order_status: 'Upcoming',
      },
      include: {
        model: Course,
        where: {
          course_date: {
            [Op.lt]: currentDate // Assuming `course_date` is the field name in Course model
          }
        }
      }
    });

    // Update the status of the found orders
    for (const order of ordersToUpdate) {
      order.order_status = 'Completed';
      await order.save();
    }
  } catch (error) {
    console.error('Error updating orders:', error);
  }
});
