module.exports = (sequelize, DataTypes) => {
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
        resident_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        residentName: { // Add this field to store the resident's name
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        tableName: 'posts',
    });

    Post.associate = function (models) {
        Post.belongsTo(models.Resident, { foreignKey: 'resident_id', as: 'resident', onDelete: 'SET NULL' });
        Post.hasMany(models.Comment, { foreignKey: 'post_id' });
    };

    return Post;
};