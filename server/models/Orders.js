module.exports = (sequelize, DataTypes) => {
    const Orders = sequelize.define('Orders', {
        order_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userid: {
            //call from resident table as foreign key
            type: DataTypes.STRING,
            allowNull: false
        },
        courseid: {
            //call from course table as foreign key
            type: DataTypes.STRING,
            allowNull: false
        },
        order_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        order_status: {
            type: DataTypes.ENUM('Upcoming', 'Completed', 'Refunded'),
            allowNull: false
        }
        
    }, {
        tableName: 'orders',
    });
    Orders.associate = (models) => {
        Orders.belongsTo(models.Resident, { foreignKey: 'userid' });
        Orders.belongsTo(models.Course, { foreignKey: 'courseid' });
    };
    
    return Orders;
}