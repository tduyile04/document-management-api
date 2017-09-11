import request from 'supertest';
import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../app';

chai.use(chaiHttp);

describe('For the API guide', () => {
  it('should return the default view', () => {
    chai.request(server)
    .get('/api/v1')
    .end((err, res) => {
      if(!err) {
        res.body.should.have.status(200);
        res.body.message.should.be.eql('Welcome to the Document Management System API');
      }
    })
  })
})