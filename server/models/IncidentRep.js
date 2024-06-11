module.exports = (sequelize, DataTypes) => {
    const IncidentRep = sequelize.define("Incident Report", {
        repid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true
        },
        reppic:{
            type: DataTypes.STRING,
            allowNull: false
        },
        repdesc:{
            type: DataTypes.STRING(250),
            allowNull: false
        },
        repemail: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            }
        }

    }, {
        tableName: 'incidentrep'
    });
}