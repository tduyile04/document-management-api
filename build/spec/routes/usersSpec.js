'use strict';

var _supertest = require('supertest');

var _supertest2 = _interopRequireDefault(_supertest);

var _app = require('../../app');

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var User = require('../../server/models/').User;
var Roles = require('../../server/models/').Roles;

describe('User API Endpoints integration tests', function () {
  beforeEach(function (done) {
    User.destroy({
      where: {},
      truncate: true,
      cascade: true,
      restartIdentity: true
    }).then(function (err) {
      if (!err) {
        Roles.destroy({
          where: {},
          truncate: true,
          cascade: true,
          restartIdentity: true
        }).then(function (err) {
          if (!err) {
            Roles.bulkCreate([{ roleType: 'Super Admin' }, { roleType: 'Admin' }, { roleType: 'User' }]).then(function () {
              done();
            });
          }
        });
      }
    });
  });

  it('should return');
});