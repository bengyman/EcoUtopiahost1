module.exports = (sequelize, DataTypes) => {
    const Rewards = sequelize.define("Rewards", {
        reward_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        reward_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        reward_description: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        reward_points: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reward_expiry_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        reward_image: {
            type: DataTypes.STRING,
            allowNull: true
        },
        reward_value: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reward_type: {
            type: DataTypes.ENUM,
            values: ['Discount_Voucher', 'Cash_Voucher', 'Others'],
            allowNull: false
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },

    }, {
        tableName: 'rewards'
    });

    Rewards.associate = (models) => {
        Rewards.belongsTo(models.Resident, { foreignKey: 'resident_id' });
    };

    return Rewards;
};
