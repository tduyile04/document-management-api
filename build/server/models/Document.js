'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (sequelize, DataTypes) {
  var Document = sequelize.define('Document', {
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

  Document.associate = function (models) {
    Document.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
      onUpdate: 'CACSCADE'
    });
  };

  return Document;
};