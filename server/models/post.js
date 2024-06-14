// post.model.js
module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        tags: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users', // Adjust this to your new User model name if different
                key: 'user_id' // Adjust this based on the actual field in your new User model
            }
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        reports: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0, // Set default value to 0
        }
    }, {
        tableName: 'posts'
    });

    // Define new association with the new User model
    Post.belongsTo(sequelize.models.NewUser, {
        foreignKey: 'user_id',
        as: 'user'
    });

    return Post;
};
