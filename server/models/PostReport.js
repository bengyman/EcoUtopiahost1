
module.exports = (sequelize, DataTypes) => {
    const PostReports = sequelize.define('PostReports', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'posts',  // This should match the table name in your Post model
                key: 'post_id'   // This should match the primary key in your Post model
            },
            onDelete: 'CASCADE',  // Optional: to automatically delete reports if the post is deleted
            onUpdate: 'CASCADE'   // Optional: to update reports if the post ID is changed
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',  // This should match the table name in your User model
                key: 'user_id'   // This should match the primary key in your User model
            },
            onDelete: 'CASCADE',  // Optional: to automatically delete reports if the user is deleted
            onUpdate: 'CASCADE'   // Optional: to update reports if the user ID is changed
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'postreport'
    });

    // Associations
    PostReports.associate = function(models) {
        PostReports.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
        PostReports.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };

    return PostReports;
};
