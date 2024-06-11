module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
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
        isDeleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        passwordResetCode: {
            type: DataTypes.STRING,
            allowNull: true
        },
        passwordResetExpiry: {
            type: DataTypes.DATETIME,
            allowNull: true
        },
        isActivated: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        activationCode: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        activationCodeExpiry: {
            type: DataTypes.DATETIME,
            allowNull: true,
        }
    }, {
        tableName: 'users'
    });
}
