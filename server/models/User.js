module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        userid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        role: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        password_reset_code: {
            type: DataTypes.STRING,
            allowNull: true
        },
        password_reset_expiry: {
            type: DataTypes.DATETIME,
            allowNull: true
        },
        is_activated: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        activation_code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        activation_code_expiry: {
            type: DataTypes.DATETIME,
            allowNull: true,
        }
    }, {
        tableName: 'users'
    });
}
