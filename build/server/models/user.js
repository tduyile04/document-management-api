'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'User name field cannot be empty'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: 'Email is already in use'
      },
      validate: {
        isEmail: {
          args: true,
          msg: 'Input provided is not a valid email'
        },
        notEmpty: {
          args: true,
          msg: 'Email field cannot be empty'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        min: 8,
        notEmpty: true
      }
    },
    roleId: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      references: {
        model: 'Roles',
        key: 'id',
        as: 'roleId'
      },
      validate: {
        notEmpty: {
          args: true,
          msg: 'User must have a role'
        }
      }
    }
  });

  User.associate = models => {
    User.hasMany(models.Document, {
      foreignKey: 'userId'
    });
    User.belongsTo(models.Roles, {
      foreignKey: 'roleId'
    });
  };

  return User;
};