'use strict';

var _supertest = require('supertest');

var _supertest2 = _interopRequireDefault(_supertest);

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiHttp = require('chai-http');

var _chaiHttp2 = _interopRequireDefault(_chaiHttp);

var _app = require('../../app');

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_chai2.default.use(_chaiHttp2.default);

describe('For the API guide', function () {
  it('should return the default view', function () {
    _chai2.default.request(_app2.default).get('/api/v1').end(function (err, res) {
      if (!err) {
        res.body.should.have.status(200);
        res.body.message.should.be.eql('Welcome to the Document Management System API');
      }
    });
  });
});