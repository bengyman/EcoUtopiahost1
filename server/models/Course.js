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
        course_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        // Course type can be either 'Online' or 'In-Person'
        course_type: {
            type: DataTypes.STRING(10),
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
        course_capacity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        course_image_url: {
            type: DataTypes.STRING(500),
            allowNull: true
        },

    }, {
        tableName: 'courses',
    });

    Course.associate = (models) => {
        Course.hasMany(models.Orders, { foreignKey: 'course_id' });
    };


    return Course;
}