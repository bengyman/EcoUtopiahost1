module.exports = (sequelize, DataTypes) => {
  const RedeemReward = sequelize.define('RedeemReward', {
    redeem_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    voucher_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    redeemed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    reward_used: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    reward_used_at: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'redeem_reward',
  });

  RedeemReward.associate = (models) => {
    RedeemReward.belongsTo(models.Resident, { foreignKey: 'resident_id' });
    RedeemReward.belongsTo(models.Rewards, { foreignKey: 'reward_id' });
  };

  return RedeemReward;
};