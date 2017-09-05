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

var _faker = require('../utils/faker');

var _faker2 = _interopRequireDefault(_faker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var User = _models2.default.User;
var Role = _models2.default.Roles;
var Document = _models2.default.Document;

var should = _chai2.default.should();

_chai2.default.use(_chaiHttp2.default);
var regularUser = void 0,
    regularToken = void 0,
    adminUser = void 0,
    adminToken = void 0;

describe('Documents integration tests for the documents endpoint', function () {
  beforeEach(function (done) {
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
  describe('For document creation', function () {
    beforeEach(function (done) {
      var randomUser = _faker2.default.randomUser;
      _chai2.default.request(_app2.default).post('/api/v1/users').send(randomUser).end(function (err, res) {
        regularToken = res.body.token;
        done();
      });
    });
    describe('while checking for document updates', function () {
      beforeEach(function (done) {
        var document = _faker2.default.documentOne;
        _chai2.default.request(_app2.default).post('/api/v1/documents').set('x-access-token', regularToken).send(document).end(function (err, res) {
          done();
        });
      });
      it('should be able to update an existing document', function (done) {
        var document = _faker2.default.documentTwo;
        _chai2.default.request(_app2.default).put('/api/v1/documents/1').set('x-access-token', regularToken).send(document).end(function (err, res) {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('title').eql('The cinderella book');
          res.body.should.have.property('content').eql('How the maid became a princess');
          res.body.should.have.property('access').eql('role');
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
      _chai2.default.request(_app2.default).post('/api/v1/documents').set('x-access-token', regularToken).send(document).end(function (err, res) {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.have.property('title').eql('The new red book');
        res.body.should.have.property('content').eql('The details of the new red book');
        res.body.should.have.property('access').eql('private');
        done();
      });
    });
    it('should return the appropriate message if the user supplies empty data', function (done) {
      var document = _faker2.default.noTitleDocument;
      _chai2.default.request(_app2.default).post('/api/v1/documents').set('x-access-token', regularToken).send(document).end(function (err, res) {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.be.a('array');
        res.body.message[0].should.be.eql('Document title cannot be empty');
        done();
      });
    });
    it('should return documents if user has regular priviledges', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/documents').set('x-access-token', regularToken).end(function (err, res) {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.should.be.eql([]);
        done();
      });
    });
    it('should return a paginated list of documents when accessed by a regular user', function (done) {
      _chai2.default.request(_app2.default).get('/api/v1/documents/?limit=1&offset=0').set('x-access-token', regularToken).end(function (err, res) {
        res.should.have.status(200);
        res.body.should.be.eql([]);
        done();
      });
    });
    describe('while checking for document pagination', function () {
      beforeEach(function (done) {
        var document = _faker2.default.documentOne;
        _chai2.default.request(_app2.default).post('/api/v1/documents').set('x-access-token', regularToken).send(document).end(function (err, res) {
          done();
        });
      });
      it('should return the requested document when accessed by a regular user', function (done) {
        _chai2.default.request(_app2.default).get('/api/v1/documents/1').set('x-access-token', regularToken).end(function (err, res) {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('title').eql('The new red book');
          res.body.should.have.property('content').eql('The details of the new red book');
          res.body.should.have.property('access').eql('private');
          done();
        });
      });
    });

    describe('for document with the same title entry', function () {
      var document = _faker2.default.documentOne;
      beforeEach(function (done) {
        _chai2.default.request(_app2.default).post('/api/v1/documents').set('x-access-token', regularToken).send(document).end(function (err) {
          done();
        });
      });
      it('should not create another document with the same title', function (done) {
        var newDocument = _faker2.default.documentThree;
        _chai2.default.request(_app2.default).post('/api/v1/documents').set('x-access-token', regularToken).send(newDocument).end(function (err, res) {
          res.should.have.status(409);
          res.body.message.should.be.eql('Document with the same title already exists');
          done();
        });
      });
    });
  });
  describe('and document retrival', function () {
    beforeEach(function (done) {
      var user = _faker2.default.superAdmin;
      _chai2.default.request(_app2.default).post('/api/v1/users').send(user).end(function (err, res) {
        if (!err) {
          adminToken = res.body.token;
        }
        done();
      });
    });
    describe('while checking for document pagination', function (done) {
      beforeEach(function (done) {
        var document = _faker2.default.documentFour;
        _chai2.default.request(_app2.default).post('/api/v1/documents').set('x-access-token', adminToken).send(document).end(function (err) {
          done();
        });
      });
      it('should return all documents when accessed by an admin/superadmin user', function (done) {
        _chai2.default.request(_app2.default).get('/api/v1/documents').set('x-access-token', adminToken).end(function (err, res) {
          res.should.have.status(200);
          res.body.should.have.property('documents');
          res.body.documents[0].should.have.property('title').eql('The new very black book');
          res.body.documents[0].should.have.property('content').eql('The details of the new very black book');
          res.body.documents[0].should.have.property('access').eql('private');
          res.body.should.have.property('pageDetails');
          res.body.pageDetails.should.have.property('currentPage').eql(1);
          done();
        });
      });
      it('should return a paginated list of documents when accessed by an admin/superadmin user', function (done) {
        var limit = 1,
            offset = 0;
        _chai2.default.request(_app2.default).get('/api/v1/documents/?limit=' + limit + '&offset=' + offset).set('x-access-token', adminToken).end(function (err, res) {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('documents');
          res.body.documents.should.be.a('array');
          res.body.documents[0].title.should.be.eql('The new very black book');
          res.body.documents[0].content.should.be.eql('The details of the new very black book');
          res.body.documents[0].access.should.be.eql('private');
          res.body.should.have.property('pageDetails');
          res.body.pageDetails.totalDataCount.should.be.eql(1);
          res.body.pageDetails.pageSize.should.be.eql(1);
          done();
        });
      });
      it('should return the requested document when accessed by an admin/superadmin user', function (done) {
        var userId = 1;
        _chai2.default.request(_app2.default).get('/api/v1/documents/' + userId).set('x-access-token', adminToken).end(function (err, res) {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.title.should.be.eql('The new very black book');
          res.body.content.should.be.eql('The details of the new very black book');
          res.body.access.should.be.eql('private');
          done();
        });
      });
      it('should return a message if requested document is not found', function (done) {
        _chai2.default.request(_app2.default).get('/api/v1/documents/53').set('x-access-token', adminToken).end(function (err, res) {
          res.should.have.status(404);
          res.body.message.should.be.eql('documents does not exist in the database');
          done();
        });
      });
      it('should return a message response if the document was deleted successfully', function (done) {
        var userId = 1;
        _chai2.default.request(_app2.default).delete('/api/v1/documents/' + userId).set('x-access-token', adminToken).end(function (err, res) {
          res.should.have.status(200);
          res.body.message.should.be.eql('documents has been removed successfully');
          done();
        });
      });
      it('should return the documents matching the query input', function (done) {
        var query = 'The new';
        _chai2.default.request(_app2.default).get('/api/v1/search/documents/?q=' + query).set('x-access-token', adminToken).end(function (err, res) {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body[0].title.should.be.eql('The new very black book');
          res.body[0].content.should.be.eql('The details of the new very black book');
          res.body[0].access.should.be.eql('private');done();
        });
      });
      it('should return no documents if none matches the query input', function (done) {
        var query = 'red fish';
        _chai2.default.request(_app2.default).get('/api/v1/search/documents/?q=' + query).set('x-access-token', adminToken).end(function (err, res) {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.message.should.be.eql('No match found for the search query');
          done();
        });
      });
      it('should return all documents of a user when accessed by an admin/superadmin user', function (done) {
        _chai2.default.request(_app2.default).get('/api/v1/users/1/documents/clean').set('x-access-token', adminToken).end(function (err, res) {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          res.body[0].should.have.property('title').eql('The new very black book');
          res.body[0].should.have.property('content').eql('The details of the new very black book');
          res.body[0].should.have.property('access').eql('private');
          done();
        });
      });
      it('should return "a no document found" message when the user has created no documents', function (done) {
        _chai2.default.request(_app2.default).get('/api/v1/users/10/documents/clean').set('x-access-token', adminToken).end(function (err, res) {
          res.should.have.status(404);
          res.body.should.have.property('message');
          res.body.message.should.be.eql('No document found created by this user');
          done();
        });
      });
    });
  });
});