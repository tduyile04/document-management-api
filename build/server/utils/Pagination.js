'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Constants = require('../constants/Constants');

var _Constants2 = _interopRequireDefault(_Constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Creates a pagination helper class that helps abstract the page functionality
 * from the controller class to aid code readability
 * @export
 * @class Pagination
 */
var Pagination = function () {
  function Pagination() {
    _classCallCheck(this, Pagination);
  }

  _createClass(Pagination, null, [{
    key: 'getPageSize',

    /**
     * Gets the total number of data that can be accomodated
     * for a single page
     * @static
     * @param {any} limit the highest number of data accomodated
     * @returns {int} page size
     * @memberof Pagination
     */
    value: function getPageSize(limit) {
      var newlimit = limit && (typeof limit === 'undefined' ? 'undefined' : _typeof(limit)) !== 'object' ? limit : _Constants2.default.DEFAULT;
      if (newlimit < 1) {
        return _Constants2.default.MAXIMUM;
      }
      return newlimit;
    }

    /**
     * Gets the total number of pages for the total number of data
     * @static
     * @param {any} totalDataCount the total number of data
     * @param {any} limit the highest number of data accomodated
     * @param {any} offset the starting point of the data
     * @returns {int} psge count
     * @memberof Pagination
     */

  }, {
    key: 'getPageCount',
    value: function getPageCount(totalDataCount, limit) {
      var newTotalDataCount = totalDataCount && totalDataCount > 0 ? totalDataCount : 0;
      var newlimit = limit && limit > 0 ? limit : _Constants2.default.MAXIMUM;
      if (newTotalDataCount === 0) {
        return _Constants2.default.UNIT;
      }
      var result = Math.ceil(newTotalDataCount / Pagination.getPageSize(newlimit));
      if (result === 0) {
        return _Constants2.default.UNIT;
      }
      return result;
    }

    /**
     * Gets the current page that the is retrieved from the database
     * @static
     * @param {any} limit the highest number of data accomodated
     * @param {any} offset the starting point of the data
     * @returns {int} current page
     * @memberof Pagination
     */

  }, {
    key: 'getCurrentPage',
    value: function getCurrentPage(limit, offset) {
      var newlimit = limit && limit > 0 ? limit : _Constants2.default.MAXIMUM;
      var newOffset = offset && offset > 0 ? offset : _Constants2.default.ZERO;
      var result = Math.ceil(newOffset / newlimit);
      if (newOffset % newlimit === 0 || result === 0) {
        return result + 1;
      }
      return result;
    }
  }]);

  return Pagination;
}();

exports.default = Pagination;