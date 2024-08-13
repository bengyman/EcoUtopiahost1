const cron = require('node-cron');
const { Orders, Course, sequelize } = require('../models'); // Adjust the path as needed
const { Op } = require('sequelize');

// Schedule a job to run every 5 seconds
cron.schedule('*/1 * * * * *', async () => {
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
          course_end_date: {
            [Op.lt]: currentDate
          }
        }
      }
    });

    // Update the status of the found orders
    for (const order of ordersToUpdate) {
      order.order_status = 'Completed';
      await order.save();
    }

    // Check for duplicate orders based on payment_intent
    const duplicates = await Orders.findAll({
      attributes: ['payment_intent'],
      group: ['payment_intent'],
      having: sequelize.literal('COUNT(*) > 1')
    });

    for (const duplicate of duplicates) {
      // Find all orders that match the duplicate payment_intent
      const duplicateOrders = await Orders.findAll({
        where: {
          payment_intent: duplicate.payment_intent
        },
        order: [['createdAt', 'ASC']] // Keeps the oldest record
      });

      // Delete all but the first order (oldest)
      for (let i = 1; i < duplicateOrders.length; i++) {
        await duplicateOrders[i].destroy();
      }
    }

  } catch (error) {
    console.error('Error updating orders or checking duplicates:', error);
  }
});
