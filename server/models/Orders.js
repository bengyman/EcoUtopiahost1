module.exports = (sequelize, DataTypes) => {
  const Orders = sequelize.define('Orders', {
      order_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      resident_id: {
          type: DataTypes.INTEGER,
          allowNull: false
      },
      course_id: {
          type: DataTypes.INTEGER,
          allowNull: false
      },
      order_date: {
          type: DataTypes.DATE,
          allowNull: false
      },
      order_status: {
          type: DataTypes.ENUM('Upcoming', 'Completed', 'Refunded', 'Pending'),
          allowNull: false
      },
      payment_intent: {
          type: DataTypes.STRING,
          allowNull: true
      }

  }, {
      tableName: 'orders',
  });
  Orders.associate = (models) => {
      Orders.belongsTo(models.Resident, { foreignKey: 'resident_id' });
      Orders.belongsTo(models.Course, { foreignKey: 'course_id' });
  };

  return Orders;
};