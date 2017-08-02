import request from 'supertest';
import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import localStorage from 'local-storage';
import server from '../../app';

const User = require('../../server/models/').User;
const Role = require('../../server/models/').Roles;
const should = chai.should();

chai.use(chaiHttp);

describe('User list integration tests for the user endpoint', () => {
  beforeEach((done) => {
    localStorage.clear();
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
    it('should display a success mesg when no user has signed up', (done) => {
      const user = {
        name: 'random user',
        email: 'randomuser@random.com',
        password: 'randomuser'
      };
      chai.request(server)
      .post('/api/v1/users')
      .send(user)
      .end((err, res) => {
        if(!err) {
          res.should.have.status(200);
          res.body.message.should.be.eql('You have signed up successfully');
          done();
        }
      });
    });
    it('should display an error message when user enters empty mail/password', (done) => {
      const user = {
        name: '',
        email: 'randomuser@random.com',
        password: 'random'
      };
      chai.request(server)
      .post('/api/v1/users')
      .send(user)
      .end((err, res) => {
        if(!err) {
          res.should.have.status(400);
          res.body.message.should.be.eql('User input cannot be empty and Email entry must be an email');
          done();
        }
        done();
      })
    });
  });
  describe('while checking for duplicates during signup', () => {
    beforeEach((done) => {
      const user = {
        name: 'random user',
        email: 'randomuser@random.com',
        password: 'randomuser'
      };
      chai.request(server)
      .post('/api/v1/users')
      .send(user)
      .end((err) => {
        done();
      });
    });
    it('if the user email has been taken', (done) => {
      const user = {
        name: 'random user',
        email: 'randomuser@random.com',
        password: 'randomuser'       
      };
      chai.request(server)
      .post('/api/v1/users')
      .send(user)
      .end((err, res) => {
        if(!err) {
          res.should.have.status(400);
          res.body.message.should.be.eql('Email already exists');
          done();
        }
        done();
      });
    });
  });

  describe('while checking appropriate response during log in', () => {
    beforeEach((done) => {
      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const password = bcrypt.hashSync('randomuser', salt);
      const user = {
        name: 'random user',
        email: 'randomuser@random.com',
        password
      };
      chai.request(server)
      .post('/api/v1/users')
      .send(user)
      .end((err) => {
        done();
      });
    });
    it('should display an error message when user enters empty details', (done) => {
      const user = {
        email: 'randomuser@random.com',
        password: ''
      }
      chai.request(server)
      .post('/app/v1/users/login')
      .send(user)
      .end((err, res) => {
        if(!err) {
          res.should.have.status(400);
          res.body.message.should.be.eql('Email and password input cannnot be empty');
        }
        done();
      })
    });
    it('should display an error message if the user supplies a wrong password', () => {
      const user = {
        email: 'randomuser@random.com',
        password: 'halleluyah'
      };
      chai.request(server)
      .post('/app/v1/users/login')
      .send(user)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.message.should.be.eql('Invalid Password');
      })
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
    it('should not be able to get the user list, if user has a regular role', (done) => {
      chai.request(server)
      .get('/api/v1/users')
      .end((err, res) => {
        if(!err) {
          res.should.have.status(403);
          res.body.message.should.be.eql('You do not have the permission to perform this action');
        }
        done();
      });
    });
  });
});
