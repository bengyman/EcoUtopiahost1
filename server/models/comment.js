module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Posts',
                key: 'id'
            }
        },
        reports: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0 // Default value for reports
        }
    });

    Comment.associate = (models) => {
        Comment.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
        Comment.belongsTo(models.Post, {
            foreignKey: 'postId',
            as: 'post'
        });
    };

    return Comment;
};
