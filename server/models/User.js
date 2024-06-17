module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
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
            type: DataTypes.DATE,
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
            type: DataTypes.DATE,
            allowNull: true,
        }
    }, {
        tableName: 'users'
    });

    User.associate = (models) => {
        User.hasOne(models.Staff, { foreignKey: 'user_id', as: 'staff' });
        User.hasMany(models.Resident, { foreignKey: 'user_id' });
    };

    return User;
}
