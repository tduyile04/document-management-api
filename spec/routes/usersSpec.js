const app = require('../../app');
const request = require('supertest');

describe('User list integration tests', () => {
  describe('get / users', () => {
    it('should get all users', (done) => {
      request(app).get('/users')
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.be.empty;
        done();
      })
    });
  });
});