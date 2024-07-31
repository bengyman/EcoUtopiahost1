// comment.model.js
module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        resident_id: {
            //call from resident table as foreign key
            type: DataTypes.INTEGER,
            allowNull: false
        },
        post_id: {
            //call from post table as foreign key
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reports: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        tableName: 'comments',
    });

    Comment.associate = function (models) {
        Comment.belongsTo(models.Resident, { foreignKey: 'resident_id' });
        Comment.belongsTo(models.Post, { foreignKey: 'post_id', onDelete: 'CASCADE' });
    }

    return Comment;
};
