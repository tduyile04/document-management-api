'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('../constants/index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Pagination {
  /**
   * Gets the total number of data that can be accomodated
   * for a single page
   * @static
   * @param {any} limit the highest number of data accomodated
   * @returns int
   * @memberof Pagination
   */
  static getPageSize(limit) {
    const newlimit = limit && typeof limit !== 'object' ? limit : _index2.default.DEFAULT;
    if (newlimit < 1) {
      return _index2.default.MAXIMUM;
    }
    return newlimit;
  }

  /**
   * Gets the total number of pages for the total number of data
   * @static
   * @param {any} totalDataCount the total number of data
   * @param {any} limit the highest number of data accomodated
   * @param {any} offset the starting point of the data
   * @returns int
   * @memberof Pagination
   */
  static getPageCount(totalDataCount, limit) {
    let result;
    const newTotalDataCount = totalDataCount && totalDataCount > 0 ? totalDataCount : 0;
    const newlimit = limit && limit > 0 ? limit : _index2.default.MAXIMUM;
    if (newTotalDataCount === 0) {
      return _index2.default.UNIT;
    }
    result = Math.ceil(newTotalDataCount / Pagination.getPageSize(newlimit));
    if (result === 0) {
      return _index2.default.UNIT;
    }
    return result;
  }

  /**
   * Gets the current page that the is retrieved from the database
   * @static
   * @param {any} totalDataCount the total number of data
   * @param {any} limit the highest number of data accomodated
   * @param {any} offset the starting point of the data
   * @returns int
   * @memberof Pagination
   */
  static getCurrentPage(limit, offset) {
    let result;
    const newlimit = limit && limit > 0 ? limit : _index2.default.MAXIMUM;
    const newOffset = offset && offset > 0 ? offset : _index2.default.ZERO;
    result = Math.ceil(newOffset / newlimit);
    if (newOffset % newlimit === 0 || result === 0) {
      return result + 1;
    }
    return result;
  }
}
exports.default = Pagination;