module.exports = (sequelize, DataTypes) => {
    const Attendance = sequelize.define("Attendance", {
        attendance_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        resident_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        course_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        attendance_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        attendance_status: {
            type: DataTypes.STRING(10),
            allowNull: false
        }
    }, {
        tableName: 'attendances',
    });

    Attendance.associate = (models) => {
        Attendance.belongsTo(models.Resident, { foreignKey: 'resident_id' });
        Attendance.belongsTo(models.Course, { foreignKey: 'course_id' });
    };

    return Attendance;
};