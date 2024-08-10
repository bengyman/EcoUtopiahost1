// models/Post.js
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
        residentName: {
            type: DataTypes.STRING,
            allowNull: false,
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
        Post.belongsTo(models.Resident, { foreignKey: 'resident_id' });
        Post.hasMany(models.Comment, { foreignKey: 'post_id', onDelete: 'CASCADE' });
        Post.belongsToMany(models.User, { through: 'PostLikes', as: 'likedByUsers', foreignKey: 'postId' });
    };

    return Post;
};
