'use strict';

module.exports = (sequelize, DataTypes) => {
  const Roles = sequelize.define('Roles', {
    roleType: DataTypes.STRING
  });
  Roles.associate = models => {
    Roles.hasMany(models.User, {
      foreignKey: 'roleId'
    });
  };
  return Roles;
};