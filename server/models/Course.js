
module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define("Course", {
        course_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        course_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        course_description: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        course_instructor: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        course_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        course_start_time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        course_end_time: {
            type: DataTypes.TIME,
            allowNull: false
        },

    }, {
        tableName: 'courses',
    });
}
