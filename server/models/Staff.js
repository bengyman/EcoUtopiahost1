module.exports = (sequelize, DataTypes) => {
    const Staff = sequelize.define("Staff", {
        staffid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        mobilenum: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        about_me: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        profile_pic: {
            type: DataTypes.STRING,
            allowNull: true
        },
        background_pic: {
            type: DataTypes.STRING,
            allowNull: true
        },
    }, {
        tableName: 'staff'
    });

    Staff.associate = (models) => {
        Staff.belongsTo(models.User, { foreignKey: 'user_id' });
    };

    return Staff;
};

