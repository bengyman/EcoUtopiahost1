module.exports = (sequelize, DataTypes) => {
    const Resident = sequelize.define("Resident", {
        residentid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        mobilenum: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        aboutMe: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        profilePic: {
            type: DataTypes.STRING,
            allowNull: true
        }

    }, {
        tableName: 'resident'
    });
}
