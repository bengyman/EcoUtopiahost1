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
        background_pic: {
            type: DataTypes.STRING,
            allowNull: true
        },
        ecoPoints: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        }
    }, {
        tableName: 'resident'
    });

    Resident.associate = (models) => {
        Resident.belongsTo(models.User, { foreignKey: 'user_id' });
    };

    Resident.associate = (models) => {
        Resident.hasMany(models.Orders, { foreignKey: 'resident_id' });
    };

    Resident.associate = (models) => {
        Resident.hasMany(models.Post, { foreignKey: 'resident_id' });
    };

    Resident.associate = (models) => {
        Resident.hasMany(models.Reports, { foreignKey: 'resident_id' });
    };

    Resident.associate = (models) => {
        Resident.hasMany(models.Rewards, { foreignKey: 'resident_id' });
    }

    Resident.associate = (models) => {
        Resident.hasOne(models.Settings, { foreignKey: 'resident_id' });
    }

    Resident.associate = (models) => {
        Resident.hasMany(models.Comment, { foreignKey: 'resident_id' });
    }

    return Resident;
}