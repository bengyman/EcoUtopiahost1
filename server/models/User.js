
// models/User.js
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        role: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: "RESIDENT"
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        password_reset_code: {
            type: DataTypes.STRING,
            allowNull: true
        },
        password_reset_expiry: {
            type: DataTypes.DATE,
            allowNull: true
        },
        is_activated: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        activation_code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        activation_code_expiry: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    }, {
        tableName: 'users'
    });

    User.associate = (models) => {
        User.hasMany(models.Staff, { foreignKey: 'user_id' });
        User.hasMany(models.Resident, { foreignKey: 'user_id' });
        User.hasMany(models.Instructor, { foreignKey: 'user_id' });
        User.belongsToMany(models.Post, { through: 'PostLikes', as: 'likedPosts', foreignKey: 'userId' });
        User.belongsToMany(models.User, { through: models.Follow, as: 'Followers', foreignKey: 'following_id'});
        User.belongsToMany(models.User, { through: models.Follow, as: 'Following', foreignKey: 'follower_id'});
        User.hasMany(models.PostReports, { foreignKey: 'userId' });
    };

    return User;
};
