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
var Document = _models2.default.Document;

var should = _chai2.default.should();

_chai2.default.use(_chaiHttp2.default);
var regularUser = void 0,
    adminUser = void 0;

describe('Documents integration tests for the documents endpoint', function () {
  beforeEach(function (done) {
    _localStorage2.default.clear();
    Document.destroy({
      where: {},
      truncate: true,
      cascade: true,
      restartIdentity: true
    }).then(function (err) {
      if (!err) {
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
      }
    });
  });
  describe('and document creation', function () {
    beforeEach(function (done) {
      var saltRounds = 10;
      var salt = _bcrypt2.default.genSaltSync(saltRounds);
      var password = _bcrypt2.default.hashSync('superadmin', salt);
      var user = {
        name: 'random user',
        email: 'randomuser@random.com',
        password: password
      };
      _chai2.default.request(_app2.default).post('/api/v1/users').send(user).end(function (err, res) {
        if (!err) {
          regularUser = res.body.token;
        }
        done();
      });
    });
    describe('for updating document', function () {
      beforeEach(function (done) {
        var document = {
          title: 'The new red book',
          content: 'The details of the new red book',
          access: 'private'
        };
        _chai2.default.request(_app2.default).post('/api/v1/documents').set('Authorization', regularUser).send(document).end(function (err, res) {
          done();
        });
      });
      it('should be able to update an existing document', function (done) {
        var document = {
          title: 'The cinderella book',
          content: 'How the maid became a princess',
          access: 'role'
        };
        _chai2.default.request(_app2.default).put('/api/v1/documents/1').set('Authorization', regularUser).send(document).end(function (err, res) {
          if (!err) {
            res.should.have.status(200);
            res.body.message.should.be.eql('Document has been successfully updated');
          }
          done();
        });
      });
    });
    it('should create a new document if all user data is valid', function (done) {
      var document = {
        title: 'The new red book',
        content: 'The details of the new red book',
        access: 'private'
      };
      _chai2.default.request(_app2.default).post('/api/v1/documents').set('Authorization', regularUser).send(document).end(function (err, res) {
        if (!err) {
          res.should.have.status(200);
          res.body.should.be.a('object');
        }
        done();
      });
    });
    it('should return the appropriate message if the user supplies empty data', function (done) {
      var document = {
        title: '',
        content: 'The details of the new red book',
        access: 'private'
      };
      _chai2.default.request(_app2.default).post('/api/v1/documents').set('Authorization', regularUser).send(document).end(function (err, res) {
        if (!err) {
          res.should.have.status(400);
          res.body.message.should.be.eql('Document title and content cannot be empty');
        }
        done();
      });
    });
    it('should return documents if user has regular priviledges', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/documents').set('Authorization', regularUser).end(function (err, res) {
        if (!err) {
          res.should.have.status(200);
          res.body.should.be.eql([]);
        }
        done();
      });
    });
    it('should return a paginated list of documents when accessed by a regular user', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/documents/?limit=1&offset=0').set('Authorization', regularUser).end(function (err, res) {
        if (!err) {
          res.should.have.status(200);
          res.body.should.be.eql([]);
        }
        done();
      });
    });
    describe('for paginated document', function () {
      beforeEach(function (done) {
        var document = {
          title: 'The new red book',
          content: 'The details of the new red book',
          access: 'private'
        };
        _chai2.default.request(_app2.default).post('/api/v1/documents').send(document).end(function (err, res) {
          done();
        });
      });
      it('should return the requested document when accessed by a regular user', function (done) {
        _chai2.default.request(_app2.default).get('/api/v1/documents/1').set('Authorization', regularUser).end(function (err, res) {
          if (!err) {
            res.should.have.status(200);
            res.body.message.should.be.eql('object');
          }
          done();
        });
      });
    });

    describe('for document same title entry validations', function () {
      var document = {
        title: 'The new red book',
        content: 'The details of the new red book',
        access: 'private'
      };
      beforeEach(function (done) {
        _chai2.default.request(_app2.default).post('/api/v1/users').send(document).end(function (err) {
          done();
        });
      });
      it('should not create a document if it has the same title', function () {
        var newDocument = {
          title: 'The new red book',
          content: 'The details of my new red book',
          access: 'private'
        };
        _chai2.default.request(_app2.default).post('/api/v1/users').send(newDocument).end(function (err, res) {
          if (!err) {
            res.should.have.status(400);
            res.body.message.should.be.eql('Document with the same title already exists');
          }
          done();
        });
      });
    });
  });
  describe('and document retrival', function () {
    beforeEach(function (done) {
      var saltRounds = 10;
      var salt = _bcrypt2.default.genSaltSync(saltRounds);
      var password = _bcrypt2.default.hashSync('superadmin', salt);
      var user = {
        name: 'super admin',
        email: 'superadmin@admin.com',
        password: password,
        roleId: _Constants2.default.SUPERADMIN
      };
      _chai2.default.request(_app2.default).post('/api/v1/users').send(user).end(function (err, res) {
        if (!err) {
          adminUser = res.body.token;
        }
        done();
      });
    });
    describe('for document pagination', function (done) {
      beforeEach(function (done) {
        var document = {
          title: 'The new very black book',
          content: 'The details of the new very black book',
          access: 'private'
        };
        _chai2.default.request(_app2.default).post('/api/v1/documents').send(document).end(function (err) {
          done();
        });
      });
      it('should return all documents when accessed by an admin/superadmin user', function (done) {
        _chai2.default.request(_app2.default).get('/api/v1/documents').set('Authorization', adminUser).end(function (err, res) {
          if (!err) {
            res.should.have.status(200);
            res.body.should.have.property('Documents');
            res.body.should.have.property('pageDetails');
          }
          done();
        });
      });
      it('should return a paginated list of documents when accessed by an admin/superadmin user', function (done) {
        var limit = 1,
            offset = 0;
        _chai2.default.request(_app2.default).get('/api/v1/documents/?limit=' + limit + '&offset=' + offset).set('Authorization', adminUser).end(function (err, res) {
          if (!err) {
            res.should.have.status(200);
            res.body.should.have.property('Documents');
            res.body.should.have.property('pageDetails');
          }
          done();
        });
      });
      it('should return the requested document when accessed by an admin/superadmin user', function (done) {
        var userId = 2;
        _chai2.default.request(_app2.default).get('/api/v1/documents/' + userId).set('Authorization', adminUser).end(function (err, res) {
          if (!err) {
            res.should.have.status(200);
            res.body.should.be.eql('object');
          }
          done();
        });
      });
      it('should return a message if requested document is not found', function (done) {
        _chai2.default.request(_app2.default).get('/api/v1/documents/53').set('Authorization', adminUser).end(function (err, res) {
          if (!err) {
            res.should.have.status(500);
            res.body.message.should.be.eql('Document either not in the database or requires admin priviledges');
          }
          done();
        });
      });
      it('should return the appropriate response if the document was deleted successfully', function (done) {
        var userId = 1;
        _chai2.default.request(_app2.default).delete('/api/v1/documents/' + userId).set('Authorization', adminUser).end(function (err, res) {
          if (!err) {
            res.should.have.status(200);
            res.body.message.should.be.eql('Document has been removed from the database successfully');
          }
          done();
        });
      });
    });
  });
});