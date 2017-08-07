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

var _index = require('../../server/constants/index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const User = require('../../server/models/').User;
const Role = require('../../server/models/').Roles;
const Document = require('../../server/models/').Document;
const should = _chai2.default.should();

_chai2.default.use(_chaiHttp2.default);
let regularUser, adminUser;

describe('Documents integration tests for the documents endpoint', () => {
  beforeEach(done => {
    _localStorage2.default.clear();
    Document.destroy({
      where: {},
      truncate: true,
      cascade: true,
      restartIdentity: true
    }).then(err => {
      if (!err) {
        User.destroy({
          where: {},
          truncate: true,
          cascade: true,
          restartIdentity: true
        }).then(err => {
          if (!err) {
            Role.destroy({
              where: {},
              truncate: true,
              cascade: true,
              restartIdentity: true
            }).then(err => {
              if (!err) {
                Role.bulkCreate([{ role: 'regular' }, { role: 'admin' }, { role: 'superadmin' }]).then(() => {
                  done();
                });
              }
            });
          }
        });
      }
    });
  });
  describe('and document creation', () => {
    beforeEach(done => {
      const saltRounds = 10;
      const salt = _bcrypt2.default.genSaltSync(saltRounds);
      const password = _bcrypt2.default.hashSync('superadmin', salt);
      const user = {
        name: 'random user',
        email: 'randomuser@random.com',
        password
      };
      _chai2.default.request(_app2.default).post('/api/v1/users').send(user).end((err, res) => {
        if (!err) {
          regularUser = res.body.token;
        }
        done();
      });
    });
    describe('for updating document', () => {
      beforeEach(done => {
        const document = {
          title: 'The new red book',
          content: 'The details of the new red book',
          access: 'private'
        };
        _chai2.default.request(_app2.default).post('/api/v1/documents').set('Authorization', regularUser).send(document).end((err, res) => {
          done();
        });
      });
      it('should be able to update an existing document', done => {
        const document = {
          title: 'The cinderella book',
          content: 'How the maid became a princess',
          access: 'role'
        };
        _chai2.default.request(_app2.default).put('/api/v1/documents/1').set('Authorization', regularUser).send(document).end((err, res) => {
          if (!err) {
            res.should.have.status(200);
            res.body.message.should.be.eql('Document has been successfully updated');
          }
          done();
        });
      });
    });
    it('should create a new document if all user data is valid', done => {
      const document = {
        title: 'The new red book',
        content: 'The details of the new red book',
        access: 'private'
      };
      _chai2.default.request(_app2.default).post('/api/v1/documents').set('Authorization', regularUser).send(document).end((err, res) => {
        if (!err) {
          res.should.have.status(200);
          res.body.should.be.a('object');
        }
        done();
      });
    });
    it('should return the appropriate message if the user supplies empty data', done => {
      const document = {
        title: '',
        content: 'The details of the new red book',
        access: 'private'
      };
      _chai2.default.request(_app2.default).post('/api/v1/documents').set('Authorization', regularUser).send(document).end((err, res) => {
        if (!err) {
          res.should.have.status(400);
          res.body.message.should.be.eql('Document title and content cannot be empty');
        }
        done();
      });
    });
    it('should return documents if user has regular priviledges', done => {
      _chai2.default.request(_app2.default).get('/api/v1/documents').set('Authorization', regularUser).end((err, res) => {
        if (!err) {
          res.should.have.status(200);
          res.body.should.be.eql([]);
        }
        done();
      });
    });
    it('should return a paginated list of documents when accessed by a regular user', done => {
      _chai2.default.request(_app2.default).get('/api/v1/documents/?limit=1&offset=0').set('Authorization', regularUser).end((err, res) => {
        if (!err) {
          res.should.have.status(200);
          res.body.should.be.eql([]);
        }
        done();
      });
    });
    describe('for paginated document', () => {
      beforeEach(done => {
        const document = {
          title: 'The new red book',
          content: 'The details of the new red book',
          access: 'private'
        };
        _chai2.default.request(_app2.default).post('/api/v1/documents').send(document).end((err, res) => {
          done();
        });
      });
      it('should return the requested document when accessed by a regular user', done => {
        _chai2.default.request(_app2.default).get('/api/v1/documents/1').set('Authorization', regularUser).end((err, res) => {
          if (!err) {
            res.should.have.status(200);
            res.body.message.should.be.eql('object');
          }
          done();
        });
      });
    });

    describe('for document same title entry validations', () => {
      const document = {
        title: 'The new red book',
        content: 'The details of the new red book',
        access: 'private'
      };
      beforeEach(done => {
        _chai2.default.request(_app2.default).post('/api/v1/users').send(document).end(err => {
          done();
        });
      });
      it('should not create a document if it has the same title', () => {
        const newDocument = {
          title: 'The new red book',
          content: 'The details of my new red book',
          access: 'private'
        };
        _chai2.default.request(_app2.default).post('/api/v1/users').send(newDocument).end((err, res) => {
          if (!err) {
            res.should.have.status(400);
            res.body.message.should.be.eql('Document with the same title already exists');
          }
          done();
        });
      });
    });
  });
  describe('and document retrival', () => {
    beforeEach(done => {
      const saltRounds = 10;
      const salt = _bcrypt2.default.genSaltSync(saltRounds);
      const password = _bcrypt2.default.hashSync('superadmin', salt);
      const user = {
        name: 'super admin',
        email: 'superadmin@admin.com',
        password,
        roleId: _index2.default.SUPERADMIN
      };
      _chai2.default.request(_app2.default).post('/api/v1/users').send(user).end((err, res) => {
        if (!err) {
          adminUser = res.body.token;
        }
        done();
      });
    });
    describe('for document pagination', done => {
      beforeEach(done => {
        const document = {
          title: 'The new very black book',
          content: 'The details of the new very black book',
          access: 'private'
        };
        _chai2.default.request(_app2.default).post('/api/v1/documents').send(document).end(err => {
          done();
        });
      });
      it('should return all documents when accessed by an admin/superadmin user', done => {
        _chai2.default.request(_app2.default).get('/api/v1/documents').set('Authorization', adminUser).end((err, res) => {
          if (!err) {
            res.should.have.status(200);
            res.body.should.have.property('Documents');
            res.body.should.have.property('pageDetails');
          }
          done();
        });
      });
      it('should return a paginated list of documents when accessed by an admin/superadmin user', done => {
        const limit = 1,
              offset = 0;
        _chai2.default.request(_app2.default).get(`/api/v1/documents/?limit=${limit}&offset=${offset}`).set('Authorization', adminUser).end((err, res) => {
          if (!err) {
            res.should.have.status(200);
            res.body.should.have.property('Documents');
            res.body.should.have.property('pageDetails');
          }
          done();
        });
      });
      it('should return the requested document when accessed by an admin/superadmin user', done => {
        const userId = 2;
        _chai2.default.request(_app2.default).get('/api/v1/documents/' + userId).set('Authorization', adminUser).end((err, res) => {
          if (!err) {
            res.should.have.status(200);
            res.body.should.be.eql('object');
          }
          done();
        });
      });
      it('should return a message if requested document is not found', done => {
        _chai2.default.request(_app2.default).get('/api/v1/documents/53').set('Authorization', adminUser).end((err, res) => {
          if (!err) {
            res.should.have.status(500);
            res.body.message.should.be.eql('Document either not in the database or requires admin priviledges');
          }
          done();
        });
      });
      it('should return the appropriate response if the document was deleted successfully', done => {
        const userId = 1;
        _chai2.default.request(_app2.default).delete('/api/v1/documents/' + userId).set('Authorization', adminUser).end((err, res) => {
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