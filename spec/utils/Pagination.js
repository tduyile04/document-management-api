import chai from 'chai';
import Pagination from '../../server/utils/Pagination';
import Constants from '../../server/constants/Constants';

const should = chai.should();

describe('for the pagination helper class', () => {
  it('should give the total maximum number of data on a page', () => {
    const pageSize = 3;
    Pagination.getPageSize(pageSize).should.be.eql(3);
  });
  it('should give the total maximum number of data on a page', () => {
    const pageSize = -1;
    Pagination.getPageSize(pageSize).should.be.eql(Constants.MAXIMUM);
  });
  it('should give the total number of pages', () => {
    const totalDataCount = 5;
    const limit = 2;
    Pagination.getPageCount(totalDataCount, limit).should.be.eql(3);
  });
  it('should give the total number of pages for zero data instance', () => {
    const totalDataCount = 0;
    const limit = -3;
    Pagination.getPageCount(totalDataCount, limit).should.be.eql(Constants.UNIT);
  });
  it('should give the current page being accessed', () => {
    const offset = 3;
    const limit = 2;
    Pagination.getCurrentPage(limit, offset).should.be.eql(2);
  });
    it('should give the current page being accessed', () => {
    const offset = -3;
    const limit = 2;
    Pagination.getCurrentPage(limit, offset).should.be.eql(Constants.UNIT);
  });
    it('should give the current page being accessed', () => {
    const offset = 4;
    const limit = 2;
    Pagination.getCurrentPage(limit, offset).should.be.eql(3);
  });
});