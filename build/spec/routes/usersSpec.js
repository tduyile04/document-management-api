'use strict';

var _supertest = require('supertest');

var _supertest2 = _interopRequireDefault(_supertest);

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiHttp = require('chai-http');

var _chaiHttp2 = _interopRequireDefault(_chaiHttp);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _localStorage = require('local-storage');

var _localStorage2 = _interopRequireDefault(_localStorage);

var _app = require('../../app');

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var User = require('../../server/models/').User;
var Role = require('../../server/models/').Roles;
var should = _chai2.default.should();

_chai2.default.use(_chaiHttp2.default);

describe('User list integration tests for the user endpoint', function () {
  beforeEach(function (done) {
    _localStorage2.default.clear();
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
    it('should display a success mesg when no user has signed up', function (done) {
      var user = {
        name: 'random user',
        email: 'randomuser@random.com',
        password: 'randomuser'
      };
      _chai2.default.request(_app2.default).post('/api/v1/users').send(user).end(function (err, res) {
        if (!err) {
          res.should.have.status(200);
          res.body.message.should.be.eql('You have signed up successfully');
          done();
        }
      });
    });
    it('should display an error message when user enters empty mail/password', function (done) {
      var user = {
        name: '',
        email: 'randomuser@random.com',
        password: 'random'
      };
      _chai2.default.request(_app2.default).post('/api/v1/users').send(user).end(function (err, res) {
        if (!err) {
          res.should.have.status(400);
          res.body.message.should.be.eql('User input cannot be empty and Email entry must be an email');
          done();
        }
        done();
      });
    });
  });
  describe('while checking for duplicates during signup', function () {
    beforeEach(function (done) {
      var user = {
        name: 'random user',
        email: 'randomuser@random.com',
        password: 'randomuser'
      };
      _chai2.default.request(_app2.default).post('/api/v1/users').send(user).end(function (err) {
        done();
      });
    });
    it('if the user email has been taken', function (done) {
      var user = {
        name: 'random user',
        email: 'randomuser@random.com',
        password: 'randomuser'
      };
      _chai2.default.request(_app2.default).post('/api/v1/users').send(user).end(function (err, res) {
        if (!err) {
          res.should.have.status(400);
          res.body.message.should.be.eql('Email already exists');
          done();
        }
        done();
      });
    });
  });

  describe('while checking appropriate response during log in', function () {
    beforeEach(function (done) {
      var saltRounds = 10;
      var salt = _bcrypt2.default.genSaltSync(saltRounds);
      var password = _bcrypt2.default.hashSync('randomuser', salt);
      var user = {
        name: 'random user',
        email: 'randomuser@random.com',
        password: password
      };
      _chai2.default.request(_app2.default).post('/api/v1/users').send(user).end(function (err) {
        done();
      });
    });
    it('should display an error message when user enters empty details', function (done) {
      var user = {
        email: 'randomuser@random.com',
        password: ''
      };
      _chai2.default.request(_app2.default).post('/app/v1/users/login').send(user).end(function (err, res) {
        if (!err) {
          res.should.have.status(400);
          res.body.message.should.be.eql('Email and password input cannnot be empty');
        }
        done();
      });
    });
    it('should display an error message if the user supplies a wrong password', function () {
      var user = {
        email: 'randomuser@random.com',
        password: 'halleluyah'
      };
      _chai2.default.request(_app2.default).post('/app/v1/users/login').send(user).end(function (err, res) {
        res.should.have.status(400);
        res.body.message.should.be.eql('Invalid Password');
      });
    });
    // it('should return the right response if valid user inputs', (done) => {
    //   const saltRounds = 10;
    //   const salt = bcrypt.genSaltSync(saltRounds);
    //   const password = bcrypt.hashSync('randomuser', salt);
    //   const user = {
    //     email: 'randomuser@random.com',
    //     password
    //   };
    //   chai.request(server)
    //   .post('/api/v1/users/login')
    //   .send(user)
    //   .end((err, res) => {
    //     if(!err) {
    //       res.should.have.status(200);
    //       res.body.should.be.a('object');
    //       res.body.should.have.property('user');
    //       res.body.should.have.property('token');
    //     }
    //     done();
    //   })
    // });
    it('should not be able to get the user list, if user has a regular role', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/users').end(function (err, res) {
        if (!err) {
          res.should.have.status(403);
          res.body.message.should.be.eql('You do not have the permission to perform this action');
        }
        done();
      });
    });
  });
});