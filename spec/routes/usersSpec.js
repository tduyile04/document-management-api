import request from 'supertest';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import server from '../../app';
import Constants from '../../server/constants/Constants';
import models from '../../server/models';
import Faker from '../utils/faker';

const User = models.User;
const Role = models.Roles;

const should = chai.should();

let randomToken, adminToken;

chai.use(chaiHttp);

describe('Users integration tests for the user endpoint', () => {
  beforeEach((done) => {
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
  });
  describe('while checking appropriate response during signup', () => {
    it('should display a success mesg when new a user signs up', (done) => {
      const randomUser = Faker.randomUser;
      chai.request(server)
      .post('/api/v1/users')
      .send(randomUser)
      .end((err, res) => {
        if(!err) {
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
    it('should display an error message when user enters no name', (done) => {
      const noNameUser = Faker.signUp.noNameUser;
      chai.request(server)
      .post('/api/v1/users')
      .send(noNameUser)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.message.should.be.a('array');
        res.body.message.should.be.eql(['Name field cannot be empty']);
        done();
      })
    });
    it('should display an error message when user enters no input entry', (done) => {
      const nullUser = Faker.signUp.nullUser;
      chai.request(server)
      .post('/api/v1/users')
      .send(nullUser)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.be.a('array');
        res.body.message.should.be.eql([
          'Email cannot be empty',
          'Email is invalid',
          'Password cannot be empty',
          'Name field cannot be empty'
        ]);
        done();
      })
    });
  });
  describe('while checking for duplicates during signup', () => {
    beforeEach((done) => {
      const randomUser = Faker.randomUser;
      chai.request(server)
      .post('/api/v1/users')
      .send(randomUser)
      .end((err) => {
        done();
      });
    });
    it('should check if the user email has been taken', (done) => {
      const randomUser = Faker.randomUser;
      chai.request(server)
      .post('/api/v1/users')
      .send(randomUser)
      .end((err, res) => {
        res.should.have.status(409);
        res.body.message.should.be.eql('Email already exists');
        done();
      });
    });
  });

  describe('while checking appropriate response during log in', () => {
    beforeEach((done) => {
      const randomUser = Faker.randomUser;
      chai.request(server)
      .post('/api/v1/users')
      .send(randomUser)
      .end((err, res) => {
        if (!err) {
          randomToken = res.body.token;
        }
        done();
      });
    });
    it('should not be able to access authenticated routes', (done) => {
      chai.request(server)
      .get('/api/v1/users/')
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.should.have.property('success');
        res.body.success.should.be.eql(false);
        res.body.message.should.be.eql('No token provided');
        done();
      });
    })
    it('should display an error message when user enters empty details', (done) => {
      const nullUser = Faker.logIn.nullUser;
      chai.request(server)
      .post('/api/v1/users/login')
      .send(nullUser)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.be.a('array');
        res.body.message.should.be.eql([
          'Email cannot be empty',
          'Email is invalid',
          'Password cannot be empty'
        ]);
        done();
      });
    });
    it('should display an error message if the user supplies a wrong password', (done) => {
      const wrongPasswordUser = Faker.wrongPasswordUser;
      chai.request(server)
      .post('/api/v1/users/login')
      .send(wrongPasswordUser)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.be.eql('Invalid Password');
        done();
      })
    });
    it('should return the user details and token if valid user inputs', (done) => {
      const alreadyLoggedUser = Faker.alreadyLoggedUser;
      chai.request(server)
      .post('/api/v1/users/login')
      .send(alreadyLoggedUser)
      .end((err, res) => {
        if(!err) {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('user');
          res.body.should.have.property('token');
          res.body.user.email.should.be.eql('randomuser@random.com');
          res.body.token.should.be.a('string');
        }
        done();
      })
    });
    it('should not be able to get the user list, if user has a regular role', (done) => {
      chai.request(server)
      .get('/api/v1/users/')
      .set('x-access-token', randomToken)
      .end((err, res) => {
        res.should.have.status(403);
        res.body.message.should.be.eql('You do not have the permission to perform this action');
        done();
      });
    });
    it('should not be able to get a particular user, if user has a regular role', (done) => {
      chai.request(server)
      .get('/api/v1/users/1')
      .set('x-access-token', randomToken)
      .end((err, res) => {
        res.should.have.status(403);
        res.body.message.should.be.eql('You do not have the permission to perform this action');
        done();
      });
    });
    it('should not have access to update roles, if user has a regular role', (done) => {
      chai.request(server)
      .put('/api/v1/users/1')
      .set('x-access-token', randomToken)
      .send({
        name: 'telling',
        email: 'telling@tells.com',
        password: 'telling',
        roleId: Constants.ADMIN
      })
      .end((err, res) => {
        res.should.have.status(403);
        res.body.message.should.be.eql('Only a superadmin can change user roles');
        done();
      });
    });
    it('should not allow empty entries, if user has a regular role', (done) => {
      chai.request(server)
      .put('/api/v1/users/1')
      .set('x-access-token', randomToken)
      .send({
        name: '',
        email: '',
        password: 'telling',
      })
      .end((err, res) => {
        res.should.have.status(422);
        res.body.message.should.be.eql('Empty fields not allowed, fill them');
        done();
      });
    });
    it('should not be able to delete users, if user has a regular role', (done) => {
      chai.request(server)
      .delete('/api/v1/users/1')
      .set('x-access-token', randomToken)
      .end((err, res) => {
        res.should.have.status(403);
        res.body.message.should.be.eql('You do not have the permission to perform this action');
        done();
      });
    });
    it('should not be able to search for all users, if user has a regular role', (done) => {
      chai.request(server)
      .get('/api/v1/search/users/?q=superadmin')
      .set('x-access-token', randomToken)
      .end((err, res) => {
        res.should.have.status(403);
        res.body.message.should.be.eql('You do not have the permission to perform this action');
        done();
      });
    });
    it('should be able to retrieve his documents, if user has a regular role', (done) => {
      chai.request(server)
      .get('/api/v1/users/1/documents')
      .set('x-access-token', randomToken)
      .end((err, res) => {
        if(!err) {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body[0].should.have.property('Documents');
          res.body[0].Documents.length.should.be.eql(0);
        }
        done();
      });
    });
  });

  describe('while checking appropriate response for admin and super admins', () => {
    beforeEach((done) => {
      const superAdmin = Faker.superAdmin;
      chai.request(server)
      .post('/api/v1/users')
      .send(superAdmin)
      .end((err, res) => {
        adminToken = res.body.token;
        done();
      });
    });
    it('should be able to update the user detail successfully', (done) => {
      chai.request(server)
      .put('/api/v1/users/1')
      .set('x-access-token', adminToken)
      .send({
        name: 'newsuperadmin',
        email: 'newsuperadmin@random.com',
        password: 'newsuperadmin'
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.name.should.be.eql('newsuperadmin');
        res.body.email.should.be.eql('newsuperadmin@random.com')
        done();
      });
    });  
    it('should return the list of users when queried by an admin', (done) => {
      chai.request(server)
      .get('/api/v1/users')
      .set('x-access-token', adminToken)
      .end((err,res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('users');
        res.body.users.should.be.a('array');
        res.body.users.length.should.be.eql(1);
        res.body.should.have.property('pageDetails');
        res.body.pageDetails.should.be.a('object');
        res.body.pageDetails.should.have.property('totalDataCount').eql(1)
        done();
      });
    });
    it('should return a paginated data if limit and offset is supplied', (done) => {
      chai.request(server)
      .get('/api/v1/users/?limit=3&offset=0')
      .set('x-access-token', adminToken)
      .end((err,res) => {
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
    it('should give a message if user not found when queried by an admin', (done) => {
      chai.request(server)
      .get('/api/v1/users/100')
      .set('x-access-token', adminToken)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property('message');
        res.body.message.should.be.eql('users does not exist in the database');
        done();
      });
    });
    it('should return the particular user when queried by an admin', (done) => {
      chai.request(server)
      .get('/api/v1/users/1')
      .set('x-access-token', adminToken)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('name').eql('superadmin');
        res.body.should.have.property('email').eql('superadmin@random.com');
        done();
      });
    });
    describe('when a regular user logs in', () => {
      beforeEach((done) => {
        const randomUser = Faker.randomUser;
        chai.request(server)
        .post('/api/v1/users')
        .send(randomUser)
        .end((err, res) => {
          done();
        });
      })
      it('should get its detail updated when queried by an admin', (done) => {
        chai.request(server)
        .put('/api/v1/users/2')
        .set('x-access-token', adminToken)
        .send({
          roleId: Constants.SUPERADMIN
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('name').eql('random user');
          res.body.should.have.property('roleId').eql(Constants.SUPERADMIN);
          done();
        });
      });
    })
    describe('with super admin priviledges', () => {
      beforeEach((done) => {
        const randomUser = Faker.randomUser;
        chai.request(server)
        .post('/api/v1/users')
        .send(randomUser)
        .end((err) => {
          done();
        });
      });
      it('should be able to delete the user detail when queried by an admin', (done) => {
        chai.request(server)
        .delete('/api/v1/users/2')
        .set('x-access-token', adminToken)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.message.should.be.eql('users has been removed successfully');
          done();
        });
      });
      it('should return a message if the user cannot be found', (done) => {
        chai.request(server)
        .delete('/api/v1/users/5')
        .set('x-access-token', adminToken)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.message.should.be.eql('No matching users was found');
          done();
        });
      });
      it('should return a message if no user was found', (done) => {
        const query = 'zzzzz';
        chai.request(server)
        .get('/api/v1/search/users/?q=' + query)
        .set('x-access-token', adminToken)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.message.should.be.eql('No match found for the search query');
          done();
        });
      });
      it('should return the user detail if a match was detected', (done) => {
        const query = 'super';
        chai.request(server)
        .get('/api/v1/search/users/?q=' + query)
        .set('x-access-token', adminToken)
        .end((err, res) => {
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
