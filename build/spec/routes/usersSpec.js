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

var _Constants = require('../../server/constants/Constants');

var _Constants2 = _interopRequireDefault(_Constants);

var _models = require('../../server/models');

var _models2 = _interopRequireDefault(_models);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var User = _models2.default.User;
var Role = _models2.default.Roles;

var should = _chai2.default.should();

var adminToken = void 0;

_chai2.default.use(_chaiHttp2.default);

describe('Users integration tests for the user endpoint', function () {
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
    it('should display an error message if the user supplies a wrong password', function (done) {
      var user = {
        email: 'randomuser@random.com',
        password: 'halleluyah'
      };
      _chai2.default.request(_app2.default).post('/app/v1/users/login').send(user).end(function (err, res) {
        if (!err) {
          res.should.have.status(400);
          res.body.message.should.be.eql('Invalid Password');
        }
        done();
      });
    });
    it('should return the right response if valid user inputs', function (done) {
      var saltRounds = 10;
      var salt = _bcrypt2.default.genSaltSync(saltRounds);
      var password = _bcrypt2.default.hashSync('randomuser', salt);
      var user = {
        email: 'randomuser@random.com',
        password: password
      };
      _chai2.default.request(_app2.default).post('/api/v1/users/login').send(user).end(function (err, res) {
        if (!err) {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('user');
          res.body.should.have.property('token');
        }
        done();
      });
    });
    it('should not be able to get the user list, if user has a regular role', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/users').end(function (err, res) {
        if (!err) {
          res.should.have.status(403);
          res.body.message.should.be.eql('You do not have the permission to perform this action');
        }
        done();
      });
    });
    it('should not be able to get a particular user, if user has a regular role', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/user/1').end(function (err, res) {
        if (!err) {
          res.should.have.status(403);
          res.body.message.should.be.eql('You do not have the permission to perform this action');
        }
        done();
      });
    });
    it('should not be able to update a particular user, if user has a regular role', function (done) {
      _chai2.default.request(_app2.default).put('/api/v1/user/1').send({
        roleId: _Constants2.default.ADMIN
      }).end(function (err, res) {
        if (!err) {
          res.should.have.status(403);
          res.body.message.should.be.eql('You do not have the permission to perform this action');
        }
        done();
      });
    });
    it('should not be able to delete users, if user has a regular role', function (done) {
      _chai2.default.request(_app2.default).delete('/api/v1/user/1').end(function (err, res) {
        if (!err) {
          res.should.have.status(403);
          res.body.message.should.be.eql('You do not have the permission to perform this action');
        }
        done();
      });
    });
    it('should not be able to search for all users, if user has a regular role', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/search/users/?q=superadmin').end(function (err, res) {
        if (!err) {
          res.should.have.status(403);
          res.body.message.should.be.eql('You do not have the permission to perform this action');
        }
        done();
      });
    });
    it('should be able to retrieve his documents, if user has a regular role', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/users/1/documents').end(function (err, res) {
        if (!err) {
          res.should.have.status(200);
          res.body.should.be.a('array');
        }
        done();
      });
    });
  });

  describe('while checking appropriate response for admin and super admins', function () {
    beforeEach(function (done) {
      var saltRounds = 10;
      var salt = _bcrypt2.default.genSaltSync(saltRounds);
      var password = _bcrypt2.default.hashSync('randomuser', salt);
      var user = {
        name: 'superadmin',
        email: 'superadmin@random.com',
        password: password,
        roleId: _Constants2.default.SUPERADMIN
      };
      _chai2.default.request(_app2.default).post('/api/v1/users').send(user).end(function (err) {
        done();
      });
    });
    it('should be able to update the user detail successfully', function (done) {
      var saltRounds = 10;
      var salt = _bcrypt2.default.genSaltSync(saltRounds);
      var password = _bcrypt2.default.hashSync('superadmin', salt);
      _chai2.default.request(_app2.default).put('/api/v1/user/1').send({
        name: 'newsuperadmin',
        email: 'newsuperadmin@random.com',
        password: password
      }).end(function (err, res) {
        if (!err) {
          res.should.have.status(200);
          res.body.message.should.be.eql('User has been successfully updated');
        }
        done();
      });
    });
    it('should return the list of users when queried by an admin', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/users').end(function (err, res) {
        if (!err) {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.User.length.should.be.eql(1);
          res.body.pageDetails.should.be.a('object');
        }
        done();
      });
    });
    it('should return a paginated data if limit and offset is supplied', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/users/?limit=3&offset=0').end(function (err, res) {
        if (!err) {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.User.length.should.be.eql(1);
          res.body.pageDetails.should.be.a('object');
        }
        done();
      });
    });
    it('should give a message if user not found when queried by an admin', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/user/2').end(function (err, res) {
        if (!err) {
          res.should.have.status(404);
          res.body.message.should.be.eql('User does not exist in the database');
        }
        done();
      });
    });
    it('should return the particular user when queried by an admin', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/user/1').end(function (err, res) {
        if (!err) {
          res.should.have.status(200);
          res.body.should.be.a('object');
        }
        done();
      });
    });
    it('should be able to update the user detail when queried by an admin', function (done) {
      _chai2.default.request(_app2.default).put('/api/v1/user/5').send({
        roleId: _Constants2.default.SUPERADMIN
      }).end(function (err, res) {
        if (!err) {
          res.should.have.status(400);
          res.body.message.should.should.be.eql('No matching user was found in the database, No updates made');
        }
        done();
      });
    });
    it('should be able to delete user when queried by an admin', function (done) {
      _chai2.default.request(_app2.default).put('/api/v1/user/1').send({
        roleId: _Constants2.default.SUPERADMIN
      }).end(function (err, res) {
        if (!err) {
          res.should.have.status(200);
          res.body.message.should.be.eql('User has been successfully updated');
        }
        done();
      });
    });
    describe('for delete priviledges', function () {
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
      it('should be able to delete the user detail when queried by an admin', function (done) {
        _chai2.default.request(_app2.default).delete('/api/v1/user/2').end(function (err, res) {
          if (!err) {
            res.should.have.status(200);
            res.body.message.should.should.be.eql('User has been removed from the database successfully');
          }
          done();
        });
      });
      it('should return a message if the user cannot be found', function (done) {
        _chai2.default.request(_app2.default).delete('/api/v1/user/5').end(function (err, res) {
          if (!err) {
            res.should.have.status(400);
            res.body.message.should.should.be.eql('No matching user was found in the database');
          }
          done();
        });
      });
      it('should return the appropriate message if no user was found', function (done) {
        var query = 'zzzzz';
        _chai2.default.request(_app2.default).get('/api/v1/search/users/?q=' + query).end(function (err, res) {
          if (!err) {
            res.should.have.status(400);
            res.body.message.should.should.be.eql('No match found for the search query');
          }
          done();
        });
      });
    });
    describe('for search priviledges', function () {
      beforeEach(function (done) {
        var saltRounds = 10;
        var salt = _bcrypt2.default.genSaltSync(saltRounds);
        var password = _bcrypt2.default.hashSync('superdmin', salt);
        var user = {
          name: 'newsuper admin',
          email: 'newsuperadmin@random.com',
          password: password,
          roleId: _Constants2.default.SUPERADMIN
        };
        _chai2.default.request(_app2.default).post('/api/v1/users').send(user).end(function (err, res) {
          if (!err) {
            adminToken = res.body.token;
          }
          done();
        });
      });
      it('should return the user detail if a match was detected', function (done) {
        var query = 'super';
        _chai2.default.request(_app2.default).get('/api/v1/search/users/?q=' + query).set('Authorization', adminToken).end(function (err, res) {
          if (!err) {
            res.should.have.status(200);
            res.body.length.should.be.eql(1);
          }
          done();
        });
      });
    });
  });
});