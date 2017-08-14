import request from 'supertest';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import localStorage from 'local-storage';
import server from '../../app';
import Constants from '../../server/constants/Constants';
import models from '../../server/models';

const User = models.User;
const Role = models.Roles;
const Document = models.Document;

const should = chai.should();

chai.use(chaiHttp);
let regularUser, adminUser;

describe('Documents integration tests for the documents endpoint', () => {
  beforeEach((done) => {
    localStorage.clear();
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
  describe('and document creation', () => {
    beforeEach((done) => {
      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const password = bcrypt.hashSync('superadmin', salt);
      const user = {
        name: 'random user',
        email: 'randomuser@random.com',
        password
      };
      chai.request(server)
      .post('/api/v1/users')
      .send(user)
      .end((err, res) => {
        if(!err) {
          regularUser = res.body.token;
        }
        done();
      });
    });
    describe('for updating document', () => {
      beforeEach((done) => {
        const document = {
          title: 'The new red book',
          content: 'The details of the new red book',
          access: 'private'
        };
        chai.request(server)
        .post('/api/v1/documents')
        .set('Authorization', regularUser)
        .send(document)
        .end((err, res) => {
          done();
        });
      });
      it('should be able to update an existing document', (done) => {
        const document = {
          title: 'The cinderella book',
          content: 'How the maid became a princess',
          access: 'role'
        };
        chai.request(server)
        .put('/api/v1/documents/1')
        .set('Authorization', regularUser)
        .send(document)
        .end((err, res) => {
          if(!err) {
            res.should.have.status(200);
            res.body.message.should.be.eql('Document has been successfully updated');
          }
          done();
        });
      })
    })
    it('should create a new document if all user data is valid', (done) => {
      const document = {
        title: 'The new red book',
        content: 'The details of the new red book',
        access: 'private'
      };
      chai.request(server)
      .post('/api/v1/documents')
      .set('Authorization', regularUser)
      .send(document)
      .end((err, res) => {
        if(!err) {
          res.should.have.status(200);
          res.body.should.be.a('object');
        }
        done();
      });
    });
    it('should return the appropriate message if the user supplies empty data', (done) => {
      const document = {
        title: '',
        content: 'The details of the new red book',
        access: 'private'
      };
      chai.request(server)
      .post('/api/v1/documents')
      .set('Authorization', regularUser)
      .send(document)
      .end((err, res) => {
        if(!err) {
          res.should.have.status(400);
          res.body.message.should.be.eql('Document title and content cannot be empty');
        }
        done();
      });
    });
    it('should return documents if user has regular priviledges', (done) => {
      chai.request(server)
      .get('/api/v1/documents')
      .set('Authorization', regularUser)
      .end((err, res) => {
        if(!err) {
          res.should.have.status(200);
          res.body.should.be.eql([]);
        }
        done();
      });
    });
    it('should return a paginated list of documents when accessed by a regular user', (done) => {
      chai.request(server)
      .get('/api/v1/documents/?limit=1&offset=0')
      .set('Authorization', regularUser)
      .end((err, res) => {
        if(!err) {
          res.should.have.status(200);
          res.body.should.be.eql([]);
        }
        done();
      });
    });
    describe('for paginated document', () => {
      beforeEach((done) => {
        const document = {
          title: 'The new red book',
          content: 'The details of the new red book',
          access: 'private'
        };
        chai.request(server)
        .post('/api/v1/documents')
        .send(document)
        .end((err, res) => {
          done();
        });
      });
      it('should return the requested document when accessed by a regular user', (done) => {
        chai.request(server)
        .get('/api/v1/documents/1')
        .set('Authorization', regularUser)
        .end((err, res) => {
          if(!err) {
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
      beforeEach((done) => {
        chai.request(server)
        .post('/api/v1/users')
        .send(document)
        .end((err) => {
          done();
        });
      });
      it('should not create a document if it has the same title', () => {
        const newDocument = {
          title: 'The new red book',
          content: 'The details of my new red book',
          access: 'private'
        };
        chai.request(server)
        .post('/api/v1/users')
        .send(newDocument)
        .end((err, res) => {
          if(!err) {
            res.should.have.status(400);
            res.body.message.should.be.eql('Document with the same title already exists');
          }
          done();
        });
      });
    });
  });
  describe('and document retrival', () => {
    beforeEach((done) => {
     const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const password = bcrypt.hashSync('superadmin', salt);
      const user = {
        name: 'super admin',
        email: 'superadmin@admin.com',
        password,
        roleId: Constants.SUPERADMIN
      };
      chai.request(server)
      .post('/api/v1/users')
      .send(user)
      .end((err, res) => {
        if(!err) {
          adminUser = res.body.token;
        }
        done();
      });      
    });
    describe('for document pagination', (done) => {
      beforeEach((done) => {
        const document = {
          title: 'The new very black book',
          content: 'The details of the new very black book',
          access: 'private'
        };
        chai.request(server)
        .post('/api/v1/documents')
        .send(document)
        .end((err) => {
          done();
        });
      });
      it('should return all documents when accessed by an admin/superadmin user', (done) => {
        chai.request(server)
        .get('/api/v1/documents')
        .set('Authorization', adminUser)
        .end((err, res) => {
          if(!err) {
            res.should.have.status(200);
            res.body.should.have.property('Documents');
            res.body.should.have.property('pageDetails');
          }
          done();
        });
      });
      it('should return a paginated list of documents when accessed by an admin/superadmin user', (done) => {
        const limit = 1, offset = 0;
        chai.request(server)
        .get(`/api/v1/documents/?limit=${limit}&offset=${offset}`)
        .set('Authorization', adminUser)
        .end((err, res) => {
          if(!err) {
            res.should.have.status(200);
            res.body.should.have.property('Documents');
            res.body.should.have.property('pageDetails');
          }
          done();
        });
      });
      it('should return the requested document when accessed by an admin/superadmin user', (done) => {
        const userId = 2;
        chai.request(server)
        .get('/api/v1/documents/' + userId)
        .set('Authorization', adminUser)
        .end((err, res) => {
          if(!err) {
            res.should.have.status(200);
            res.body.should.be.eql('object');
          }
          done();
        });
      });
      it('should return a message if requested document is not found', (done) => {
        chai.request(server)
        .get('/api/v1/documents/53')
        .set('Authorization', adminUser)
        .end((err, res) => {
          if(!err) {
            res.should.have.status(500);
            res.body.message.should.be.eql('Document either not in the database or requires admin priviledges');
          }
          done();
        });
      });
      it('should return the appropriate response if the document was deleted successfully', (done) => {
        const userId = 1;
        chai.request(server)
        .delete('/api/v1/documents/' + userId)
        .set('Authorization', adminUser)
        .end((err, res) => {
          if(!err) {
            res.should.have.status(200);
            res.body.message.should.be.eql('Document has been removed from the database successfully');
          }
          done();
        });
      });
    });   
  });
});
