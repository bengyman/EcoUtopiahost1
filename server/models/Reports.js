module.exports = (sequelize, DataTypes) => {
    const Report = sequelize.define("Reports", {
        report_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        report_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        report_time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        report_desc: {
            type: DataTypes.STRING,
            allowNull: false
        },
        report_status: {
            type: DataTypes.STRING,
            allowNull: false
        }

    }, {
        tableName: 'reports',
    });

    Report.associate = (models) => {
        Report.belongsTo(models.Resident, { foreignKey: 'resident_id'})
    };

    return Report;
}