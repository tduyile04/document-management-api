'use strict';

var _supertest = require('supertest');

var _supertest2 = _interopRequireDefault(_supertest);

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiHttp = require('chai-http');

var _chaiHttp2 = _interopRequireDefault(_chaiHttp);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _app = require('../../app');

var _app2 = _interopRequireDefault(_app);

var _Constants = require('../../server/constants/Constants');

var _Constants2 = _interopRequireDefault(_Constants);

var _models = require('../../server/models');

var _models2 = _interopRequireDefault(_models);

var _faker = require('../utils/faker');

var _faker2 = _interopRequireDefault(_faker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var User = _models2.default.User;
var Role = _models2.default.Roles;

var should = _chai2.default.should();

var randomToken = void 0,
    adminToken = void 0;

_chai2.default.use(_chaiHttp2.default);

describe('Users integration tests for the user endpoint', function () {
  beforeEach(function (done) {
    User.destroy({
      where: {},
      truncate: true,
      cascade: true,
      restartIdentity: true
    }).then(function (err) {
      if (!err) {
        Role.destroy({
          where: {},
          truncate: true,
          cascade: true,
          restartIdentity: true
        }).then(function (err) {
          if (!err) {
            Role.bulkCreate([{ role: 'regular' }, { role: 'admin' }, { role: 'superadmin' }]).then(function () {
              done();
            });
          }
        });
      }
    });
  });
  describe('while checking appropriate response during signup', function () {
    it('should display a success mesg when new a user signs up', function (done) {
      var randomUser = _faker2.default.randomUser;
      _chai2.default.request(_app2.default).post('/api/v1/users').send(randomUser).end(function (err, res) {
        if (!err) {
          res.should.have.status(201);
          res.body.should.have.property('user');
          res.body.should.have.property('token');
          res.body.user.should.have.property('name');
          res.body.user.email.should.be.eql('randomuser@random.com');
          res.body.token.should.be.a('string');
        }
        done();
      });
    });
    it('should display an error message when user enters no name', function (done) {
      var noNameUser = _faker2.default.signUp.noNameUser;
      _chai2.default.request(_app2.default).post('/api/v1/users').send(noNameUser).end(function (err, res) {
        res.should.have.status(400);
        res.body.message.should.be.a('array');
        res.body.message.should.be.eql(['Name field cannot be empty']);
        done();
      });
    });
    it('should display an error message when user enters no input entry', function (done) {
      var nullUser = _faker2.default.signUp.nullUser;
      _chai2.default.request(_app2.default).post('/api/v1/users').send(nullUser).end(function (err, res) {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.be.a('array');
        res.body.message.should.be.eql(['Email cannot be empty', 'Email is invalid', 'Password cannot be empty', 'Name field cannot be empty']);
        done();
      });
    });
  });
  describe('while checking for duplicates during signup', function () {
    beforeEach(function (done) {
      var randomUser = _faker2.default.randomUser;
      _chai2.default.request(_app2.default).post('/api/v1/users').send(randomUser).end(function (err) {
        done();
      });
    });
    it('should check if the user email has been taken', function (done) {
      var randomUser = _faker2.default.randomUser;
      _chai2.default.request(_app2.default).post('/api/v1/users').send(randomUser).end(function (err, res) {
        res.should.have.status(409);
        res.body.message.should.be.eql('Email already exists');
        done();
      });
    });
  });

  describe('while checking appropriate response during log in', function () {
    beforeEach(function (done) {
      var randomUser = _faker2.default.randomUser;
      _chai2.default.request(_app2.default).post('/api/v1/users').send(randomUser).end(function (err, res) {
        if (!err) {
          randomToken = res.body.token;
        }
        done();
      });
    });
    it('should not be able to access authenticated routes', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/users/').end(function (err, res) {
        res.should.have.status(401);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.should.have.property('success');
        res.body.success.should.be.eql(false);
        res.body.message.should.be.eql('No token provided');
        done();
      });
    });
    it('should display an error message when user enters empty details', function (done) {
      var nullUser = _faker2.default.logIn.nullUser;
      _chai2.default.request(_app2.default).post('/api/v1/users/login').send(nullUser).end(function (err, res) {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.be.a('array');
        res.body.message.should.be.eql(['Email cannot be empty', 'Email is invalid', 'Password cannot be empty']);
        done();
      });
    });
    it('should display an error message if the user supplies a wrong password', function (done) {
      var wrongPasswordUser = _faker2.default.wrongPasswordUser;
      _chai2.default.request(_app2.default).post('/api/v1/users/login').send(wrongPasswordUser).end(function (err, res) {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.be.eql('Invalid Password');
        done();
      });
    });
    it('should return the user details and token if valid user inputs', function (done) {
      var alreadyLoggedUser = _faker2.default.alreadyLoggedUser;
      _chai2.default.request(_app2.default).post('/api/v1/users/login').send(alreadyLoggedUser).end(function (err, res) {
        if (!err) {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('user');
          res.body.should.have.property('token');
          res.body.user.email.should.be.eql('randomuser@random.com');
          res.body.token.should.be.a('string');
        }
        done();
      });
    });
    it('should not be able to get the user list, if user has a regular role', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/users/').set('x-access-token', randomToken).end(function (err, res) {
        res.should.have.status(403);
        res.body.message.should.be.eql('You do not have the permission to perform this action');
        done();
      });
    });
    it('should not be able to get a particular user, if user has a regular role', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/users/1').set('x-access-token', randomToken).end(function (err, res) {
        res.should.have.status(403);
        res.body.message.should.be.eql('You do not have the permission to perform this action');
        done();
      });
    });
    it('should not have access to update roles, if user has a regular role', function (done) {
      _chai2.default.request(_app2.default).put('/api/v1/users/1').set('x-access-token', randomToken).send({
        name: 'telling',
        email: 'telling@tells.com',
        password: 'telling',
        roleId: _Constants2.default.ADMIN
      }).end(function (err, res) {
        res.should.have.status(403);
        res.body.message.should.be.eql('Only a superadmin can change user roles');
        done();
      });
    });
    it('should not allow empty entries, if user has a regular role', function (done) {
      _chai2.default.request(_app2.default).put('/api/v1/users/1').set('x-access-token', randomToken).send({
        name: '',
        email: '',
        password: 'telling'
      }).end(function (err, res) {
        res.should.have.status(422);
        res.body.message.should.be.eql('Empty fields not allowed, fill them');
        done();
      });
    });
    it('should not be able to delete users, if user has a regular role', function (done) {
      _chai2.default.request(_app2.default).delete('/api/v1/users/1').set('x-access-token', randomToken).end(function (err, res) {
        res.should.have.status(403);
        res.body.message.should.be.eql('You do not have the permission to perform this action');
        done();
      });
    });
    it('should not be able to search for all users, if user has a regular role', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/search/users/?q=superadmin').set('x-access-token', randomToken).end(function (err, res) {
        res.should.have.status(403);
        res.body.message.should.be.eql('You do not have the permission to perform this action');
        done();
      });
    });
    it('should be able to retrieve his documents, if user has a regular role', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/users/1/documents').set('x-access-token', randomToken).end(function (err, res) {
        if (!err) {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body[0].should.have.property('Documents');
          res.body[0].Documents.length.should.be.eql(0);
        }
        done();
      });
    });
  });

  describe('while checking appropriate response for admin and super admins', function () {
    beforeEach(function (done) {
      var superAdmin = _faker2.default.superAdmin;
      _chai2.default.request(_app2.default).post('/api/v1/users').send(superAdmin).end(function (err, res) {
        adminToken = res.body.token;
        done();
      });
    });
    it('should be able to update the user detail successfully', function (done) {
      _chai2.default.request(_app2.default).put('/api/v1/users/1').set('x-access-token', adminToken).send({
        name: 'newsuperadmin',
        email: 'newsuperadmin@random.com',
        password: 'newsuperadmin'
      }).end(function (err, res) {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.name.should.be.eql('newsuperadmin');
        res.body.email.should.be.eql('newsuperadmin@random.com');
        done();
      });
    });
    it('should return the list of users when queried by an admin', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/users').set('x-access-token', adminToken).end(function (err, res) {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('users');
        res.body.users.should.be.a('array');
        res.body.users.length.should.be.eql(1);
        res.body.should.have.property('pageDetails');
        res.body.pageDetails.should.be.a('object');
        res.body.pageDetails.should.have.property('totalDataCount').eql(1);
        done();
      });
    });
    it('should return a paginated data if limit and offset is supplied', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/users/?limit=3&offset=0').set('x-access-token', adminToken).end(function (err, res) {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.users.should.be.a('array');
        res.body.users.length.should.be.eql(1);
        res.body.users[0].should.have.property('name').eql('superadmin');
        res.body.pageDetails.should.be.a('object');
        res.body.pageDetails.should.have.property('currentPage').eql(1);
        done();
      });
    });
    it('should give a message if user not found when queried by an admin', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/users/100').set('x-access-token', adminToken).end(function (err, res) {
        res.should.have.status(404);
        res.body.should.have.property('message');
        res.body.message.should.be.eql('users does not exist in the database');
        done();
      });
    });
    it('should return the particular user when queried by an admin', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/users/1').set('x-access-token', adminToken).end(function (err, res) {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('name').eql('superadmin');
        res.body.should.have.property('email').eql('superadmin@random.com');
        done();
      });
    });
    describe('when a regular user logs in', function () {
      beforeEach(function (done) {
        var randomUser = _faker2.default.randomUser;
        _chai2.default.request(_app2.default).post('/api/v1/users').send(randomUser).end(function (err, res) {
          done();
        });
      });
      it('should get its detail updated when queried by an admin', function (done) {
        _chai2.default.request(_app2.default).put('/api/v1/users/2').set('x-access-token', adminToken).send({
          roleId: _Constants2.default.SUPERADMIN
        }).end(function (err, res) {
          res.should.have.status(200);
          res.body.should.have.property('name').eql('random user');
          res.body.should.have.property('roleId').eql(_Constants2.default.SUPERADMIN);
          done();
        });
      });
    });
    describe('with super admin priviledges', function () {
      beforeEach(function (done) {
        var randomUser = _faker2.default.randomUser;
        _chai2.default.request(_app2.default).post('/api/v1/users').send(randomUser).end(function (err) {
          done();
        });
      });
      it('should be able to delete the user detail when queried by an admin', function (done) {
        _chai2.default.request(_app2.default).delete('/api/v1/users/2').set('x-access-token', adminToken).end(function (err, res) {
          res.should.have.status(200);
          res.body.message.should.be.eql('users has been removed successfully');
          done();
        });
      });
      it('should return a message if the user cannot be found', function (done) {
        _chai2.default.request(_app2.default).delete('/api/v1/users/5').set('x-access-token', adminToken).end(function (err, res) {
          res.should.have.status(404);
          res.body.message.should.be.eql('No matching users was found');
          done();
        });
      });
      it('should return a message if no user was found', function (done) {
        var query = 'zzzzz';
        _chai2.default.request(_app2.default).get('/api/v1/search/users/?q=' + query).set('x-access-token', adminToken).end(function (err, res) {
          res.should.have.status(404);
          res.body.message.should.be.eql('No match found for the search query');
          done();
        });
      });
      it('should return the user detail if a match was detected', function (done) {
        var query = 'super';
        _chai2.default.request(_app2.default).get('/api/v1/search/users/?q=' + query).set('x-access-token', adminToken).end(function (err, res) {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          res.body[0].should.have.property('name').eql('superadmin');
          res.body[0].should.have.property('email').eql('superadmin@random.com');
          done();
        });
      });
    });
  });
});