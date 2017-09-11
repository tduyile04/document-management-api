export default (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    content: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: true
      }
    },
    access: {
      type: DataTypes.ENUM,
      values: ['public', 'private', 'role'],
      defaultValue: 'private'
    },
    userRoleId: {
      type: DataTypes.INTEGER
    }
  });

  Document.associate = (models) => {
    Document.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
      onUpdate: 'CACSCADE'
    });
  };

  return Document;
};
