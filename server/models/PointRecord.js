module.exports = (sequelize, DataTypes) => {
    const PointRecord = sequelize.define("PointRecord", {
        record_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        resident_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        status: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'pending'
        }
    }, {
        tableName: 'point_records'
    });

    PointRecord.associate = (models) => {
        PointRecord.belongsTo(models.Resident, { foreignKey: 'resident_id' });
        PointRecord.belongsTo(models.Orders, { foreignKey: 'order_id' });
    };

    return PointRecord;
}
