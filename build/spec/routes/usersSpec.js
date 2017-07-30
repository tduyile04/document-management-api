'use strict';

var app = require('../../app');
var request = require('supertest');

describe('User list integration tests', function () {
  describe('get / users', function () {
    it('should get all users', function (done) {
      request(app).get('/users').end(function (err, res) {
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.be.empty;
        done();
      });
    });
  });
});