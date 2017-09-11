'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _Pagination = require('../../server/utils/Pagination');

var _Pagination2 = _interopRequireDefault(_Pagination);

var _Constants = require('../../server/constants/Constants');

var _Constants2 = _interopRequireDefault(_Constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var should = _chai2.default.should();

describe('for the pagination helper class', function () {
  it('should give the total maximum number of data on a page', function () {
    var pageSize = 3;
    _Pagination2.default.getPageSize(pageSize).should.be.eql(3);
  });
  it('should give the total maximum number of data on a page', function () {
    var pageSize = -1;
    _Pagination2.default.getPageSize(pageSize).should.be.eql(_Constants2.default.MAXIMUM);
  });
  it('should give the total number of pages', function () {
    var totalDataCount = 5;
    var limit = 2;
    _Pagination2.default.getPageCount(totalDataCount, limit).should.be.eql(3);
  });
  it('should give the total number of pages for zero data instance', function () {
    var totalDataCount = 0;
    var limit = -3;
    _Pagination2.default.getPageCount(totalDataCount, limit).should.be.eql(_Constants2.default.UNIT);
  });
  it('should give the current page being accessed', function () {
    var offset = 3;
    var limit = 2;
    _Pagination2.default.getCurrentPage(limit, offset).should.be.eql(2);
  });
  it('should give the current page being accessed', function () {
    var offset = -3;
    var limit = 2;
    _Pagination2.default.getCurrentPage(limit, offset).should.be.eql(_Constants2.default.UNIT);
  });
  it('should give the current page being accessed', function () {
    var offset = 4;
    var limit = 2;
    _Pagination2.default.getCurrentPage(limit, offset).should.be.eql(3);
  });
});