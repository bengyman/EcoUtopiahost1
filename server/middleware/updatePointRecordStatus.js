const { PointRecord, Orders, Course } = require('../models');

const updatePointRecordStatus = async () => {
    try {
        const pointRecords = await PointRecord.findAll({
            include: [
                {
                    model: Orders,
                    include: [
                        {
                            model: Course
                        }
                    ]
                }
            ]
        });

        const now = new Date();
        for (const pointRecord of pointRecords) {
            const order = pointRecord.Order;
            const course = order.Course;

            if (order.order_status === 'Refunded') {
                pointRecord.status = 'refunded';
            } else if (course.course_date < now && course.course_end_time < now) {
                pointRecord.status = 'awarded';
            } else {
                pointRecord.status = 'pending';
            }

            await pointRecord.save();
        }
    } catch (error) {
        console.error('Error updating point record status:', error);
    }
};

module.exports = { updatePointRecordStatus };
