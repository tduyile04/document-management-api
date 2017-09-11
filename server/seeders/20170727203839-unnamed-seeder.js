module.exports = {
  up(queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert('Roles', [
      {
        roleType: 'regular',
        createdAt: '2017-03-20T20:31:45.000Z',
        updatedAt: '2017-03-20T20:31:45.000Z',
      },
      {
        roleType: 'admin',
        createdAt: '2017-03-20T20:31:45.000Z',
        updatedAt: '2017-03-20T20:31:45.000Z',
      },
      {
        roleType: 'superadmin',
        createdAt: '2017-03-20T20:31:45.000Z',
        updatedAt: '2017-03-20T20:31:45.000Z',
      }
    ], {});
  },

  down(queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return queryInterface.bulkDelete('Roles', null, {});
  }
};
