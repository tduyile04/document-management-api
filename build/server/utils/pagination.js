"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Pagination = function () {
  function Pagination() {
    _classCallCheck(this, Pagination);
  }

  _createClass(Pagination, null, [{
    key: "getPageSize",

    /**
     * Gets the total number of data that can be accomodated
     * for a single page
     * @static
     * @param {any} limit the highest number of data accomodated
     * @param {any} offset the starting point of the data
     * @returns int
     * @memberof Pagination
     */
    value: function getPageSize(limit) {
      return limit;
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

  }, {
    key: "getPageCount",
    value: function getPageCount(totalDataCount, limit) {
      return Math.ceil(totalDataCount / Pagination.getPageSize(limit));
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

  }, {
    key: "getCurrentPage",
    value: function getCurrentPage(totalDataCount, limit, offset) {
      return Math.ceil(offset / limit);
    }
  }]);

  return Pagination;
}();

exports.default = Pagination;