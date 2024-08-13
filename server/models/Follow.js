module.exports = (sequelize, DataTypes) => {
  const Follow = sequelize.define("Follow", {
    follower_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: "user_id",
      },
    },
    following_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: "user_id",
      },
    },
  }, {
    tableName: 'follows',
    timestamps: true,
  });

  Follow.associate = (models) => {
    Follow.belongsTo(models.User, { as: "Follower", foreignKey: "follower_id" });
    Follow.belongsTo(models.User, { as: "Following", foreignKey: "following_id" });
  };

  return Follow;
};