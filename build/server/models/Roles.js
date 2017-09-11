'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (sequelize, DataTypes) {
  var Roles = sequelize.define('Roles', {
    roleType: DataTypes.STRING
  });
  Roles.associate = function (models) {
    Roles.hasMany(models.User, {
      foreignKey: 'roleId'
    });
  };
  return Roles;
};