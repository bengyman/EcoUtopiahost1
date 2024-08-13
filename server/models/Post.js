const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Post = sequelize.define('Post', {
        post_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
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
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        reports: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        likesCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        resident_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        instructor_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        residentName: {  // Make residentName nullable
            type: DataTypes.STRING,
            allowNull: true,
        },
        name: {  // Add new column for name
            type: DataTypes.STRING,
            allowNull: true,  // Adjust according to your needs
        },
        commentsCount: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.getComments().then(comments => comments.length);
            }
        }
    }, {
        tableName: 'posts',
        defaultScope: {
            attributes: { include: ['commentsCount'] },
        },
        scopes: {
            withCommentsCount: {
                attributes: {
                    include: [
                        [sequelize.fn('COUNT', sequelize.col('Comments.post_id')), 'commentsCount']
                    ]
                },
                include: [
                    {
                        model: sequelize.models.Comment,
                        attributes: []
                    }
                ],
                group: ['Post.post_id']
            }
        }
    });

    Post.associate = function (models) {
        Post.hasMany(models.PostReports, { foreignKey: 'postId' });
        Post.belongsTo(models.Resident, { foreignKey: 'resident_id' });
        Post.belongsTo(models.Instructor, { foreignKey: 'instructor_id' });
        Post.hasMany(models.Comment, { foreignKey: 'post_id', onDelete: 'CASCADE' });
        Post.belongsToMany(models.User, { through: 'PostLikes', as: 'likedByUsers', foreignKey: 'postId' });
    };

    return Post;
};