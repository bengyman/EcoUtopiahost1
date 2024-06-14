module.exports = (sequelize, DataTypes) => {
    const Resident = sequelize.define("Resident", {
        resident_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            foreignKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        mobile_num: {
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
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'userid'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        }
    }, {
        tableName: 'resident'
    });

    Resident.associate = (models) => {
        Resident.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };

    Resident.associate = (models) => {
        Resident.hasMany(models.Orders, { foreignKey: 'resident_id' });
    };

    return Resident;
}
