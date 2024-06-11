module.exports = (sequelize, DataTypes) => {
    const Rewards = sequelize.define("Rewards", {
        rewardid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        rewadesc: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        rewadval: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        rewadpic: {
            type: DataTypes.STRING,
            allowNull: false
        }

    }, {
        tableName: 'rewards'
    });
}