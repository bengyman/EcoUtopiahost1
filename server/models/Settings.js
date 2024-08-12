module.exports = (sequelize, DataTypes) => {
    const Settings = sequelize.define("Settings", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        dark_mode: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        auto_play: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'settings'
    });

    Settings.associate = (models) => {
        Settings.belongsTo(models.Resident, { foreignKey: 'resident_id' });
        Settings.belongsTo(models.Instructor, { foreignKey: 'instructor_id' });
    };

    return Settings;
};
