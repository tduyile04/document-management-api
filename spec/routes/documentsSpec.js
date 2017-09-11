import request from 'supertest';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import localStorage from 'local-storage';
import server from '../../app';
import Constants from '../../server/constants/Constants';
import models from '../../server/models';
import Faker from '../utils/faker';

const User = models.User;
const Role = models.Roles;
const Document = models.Document;

const should = chai.should();

chai.use(chaiHttp);
let regularUser, regularToken, adminUser, adminToken;

describe('Documents integration tests for the documents endpoint', () => {
  beforeEach((done) => {
    Document.destroy({
      where: {},
      truncate: true,
      cascade: true,
      restartIdentity: true
    })
    .then((err) => {
      if (!err) {
        User.destroy({
          where: {},
          truncate: true,
          cascade: true,
          restartIdentity: true
        })
        .then((err) => {
          if (!err) {
            Role.destroy({
              where: {},
              truncate: true,
              cascade: true,
              restartIdentity: true
            })
            .then((err) => {
              if (!err) {
                Role.bulkCreate([
                  { role: 'regular' },
                  { role: 'admin' },
                  { role: 'superadmin' }
                ]).then(() => {
                  done();
                });
              }
            });
          }
        });
      }
    });
  });
  describe('For document creation', () => {
    beforeEach((done) => {
      const randomUser = Faker.randomUser;
      chai.request(server)
      .post('/api/v1/users')
      .send(randomUser)
      .end((err, res) => {
        regularToken = res.body.token;
        done();
      });
    });
    describe('while checking for document updates', () => {
      beforeEach((done) => {
        const document = Faker.documentOne;
        chai.request(server)
        .post('/api/v1/documents')
        .set('x-access-token', regularToken)
        .send(document)
        .end((err, res) => {
          done();
        });
      });
      it('should be able to update an existing document', (done) => {
        const document = Faker.documentTwo;
        chai.request(server)
        .put('/api/v1/documents/1')
        .set('x-access-token', regularToken)
        .send(document)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('title')
            .eql('The cinderella book');
          res.body.should.have.property('content')
            .eql('How the maid became a princess');
          res.body.should.have.property('access').eql('role');
          done();
        });
      })
    })
    it('should create a new document if all user data is valid', (done) => {
      const document = Faker.redBook;
      chai.request(server)
      .post('/api/v1/documents')
      .set('x-access-token', regularToken)
      .send(document)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.have.property('title')
          .eql('The new red book');
        res.body.should.have.property('content')
          .eql('The details of the new red book');
        res.body.should.have.property('access').eql('private');
        done();
      });
    });
    it('should return the appropriate message if the user supplies empty data', (done) => {
      const document = Faker.noTitleDocument;
      chai.request(server)
      .post('/api/v1/documents')
      .set('x-access-token', regularToken)
      .send(document)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.be.a('array');
        res.body.message[0].should.be.eql('Document title cannot be empty');
        done();
      });
    });
    it('should return documents if user has regular priviledges', (done) => {
      chai.request(server)
      .get('/api/v1/documents')
      .set('x-access-token', regularToken)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.should.be.eql([]);
        done();
      });
    });
    it('should return a paginated list of documents when accessed by a regular user', (done) => {
      chai.request(server)
      .get('/api/v1/documents/?limit=1&offset=0')
      .set('x-access-token', regularToken)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.eql([]);
        done();
      });
    });
    describe('while checking for document pagination', () => {
      beforeEach((done) => {
        const document = Faker.documentOne;
        chai.request(server)
        .post('/api/v1/documents')
        .set('x-access-token', regularToken)
        .send(document)
        .end((err, res) => {
          done();
        });
      });
      it('should return the requested document when accessed by a regular user', (done) => {
        chai.request(server)
        .get('/api/v1/documents/1')
        .set('x-access-token', regularToken)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('title').eql('The new red book');
          res.body.should.have.property('content').eql('The details of the new red book');
          res.body.should.have.property('access').eql('private');
          done();
        });
      });
    });
 
    describe('for document with the same title entry', () => {
      const document = Faker.documentOne;
      beforeEach((done) => {
        chai.request(server)
        .post('/api/v1/documents')
        .set('x-access-token', regularToken)
        .send(document)
        .end((err) => {
          done();
        });
      });
      it('should not create another document with the same title', (done) => {
        const newDocument = Faker.documentThree;
        chai.request(server)
        .post('/api/v1/documents')
        .set('x-access-token', regularToken)
        .send(newDocument)
        .end((err, res) => {
          res.should.have.status(409);
          res.body.message.should.be.eql('Document with the same title already exists');
          done();
        });
      });
    });
  });
  describe('and document retrival', () => {
    beforeEach((done) => {
      const user = Faker.superAdmin;
      chai.request(server)
      .post('/api/v1/users')
      .send(user)
      .end((err, res) => {
        if(!err) {
          adminToken = res.body.token;
        }
        done();
      });      
    });
    describe('while checking for document pagination', (done) => {
      beforeEach((done) => {
        const document = Faker.documentFour;
        chai.request(server)
        .post('/api/v1/documents')
        .set('x-access-token', adminToken)
        .send(document)
        .end((err) => {
          done();
        });
      });
      it('should return all documents when accessed by an admin/superadmin user', (done) => {
        chai.request(server)
        .get('/api/v1/documents')
        .set('x-access-token', adminToken)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('documents');
          res.body.documents[0].should.have.property('title')
            .eql('The new very black book');
          res.body.documents[0].should.have.property('content')
            .eql('The details of the new very black book');
          res.body.documents[0].should.have.property('access')
            .eql('private');
          res.body.should.have.property('pageDetails');
          res.body.pageDetails.should.have.property('currentPage').eql(1);
          done();
        });
      });
      it('should return a paginated list of documents when accessed by an admin/superadmin user', (done) => {
        const limit = 1, offset = 0;
        chai.request(server)
        .get(`/api/v1/documents/?limit=${limit}&offset=${offset}`)
        .set('x-access-token', adminToken)
        .end((err, res) => {
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
      it('should return the requested document when accessed by an admin/superadmin user', (done) => {
        const userId = 1;
        chai.request(server)
        .get('/api/v1/documents/' + userId)
        .set('x-access-token', adminToken)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.title.should.be.eql('The new very black book');
          res.body.content.should.be.eql('The details of the new very black book');
          res.body.access.should.be.eql('private');
          done();
        });
      });
      it('should return a message if requested document is not found', (done) => {
        chai.request(server)
        .get('/api/v1/documents/53')
        .set('x-access-token', adminToken)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.message.should.be.eql('documents does not exist in the database');
          done();
        });
      });
      it('should return a message response if the document was deleted successfully', (done) => {
        const userId = 1;
        chai.request(server)
        .delete('/api/v1/documents/' + userId)
        .set('x-access-token', adminToken)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.message.should.be.eql('documents has been removed successfully');
          done();
        });
      });
      it('should return the documents matching the query input', (done) => {
        const query = 'The new'
        chai.request(server)
        .get('/api/v1/search/documents/?q=' + query)
        .set('x-access-token', adminToken)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body[0].title.should.be.eql('The new very black book');
          res.body[0].content.should.be.eql('The details of the new very black book');
          res.body[0].access.should.be.eql('private');          done();
        });
      });
      it('should return no documents if none matches the query input', (done) => {
        const query = 'red fish'
        chai.request(server)
        .get('/api/v1/search/documents/?q=' + query)
        .set('x-access-token', adminToken)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.message.should.be.eql('No match found for the search query');
         done();
        });
      });
      it('should return all documents of a user when accessed by an admin/superadmin user', (done) => {
        chai.request(server)
        .get('/api/v1/users/1/documents/clean')
        .set('x-access-token', adminToken)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          res.body[0].should.have.property('title')
            .eql('The new very black book');
          res.body[0].should.have.property('content')
            .eql('The details of the new very black book');
          res.body[0].should.have.property('access')
            .eql('private');
          done();
        });
      });
      it('should return "a no document found" message when the user has created no documents', (done) => {
        chai.request(server)
        .get('/api/v1/users/10/documents/clean')
        .set('x-access-token', adminToken)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('message');
          res.body.message.should.be.eql('No document found created by this user');
          done();
        });
      });
    });   
  });
});
