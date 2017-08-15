'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _Pagination = require('./Pagination');

var _Pagination2 = _interopRequireDefault(_Pagination);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_dotenv2.default.config();

/**
 * Helper class that helps abstract simple functionalities so the
 * controllers become more readable
 * @export
 * @class Helper
 */

var Helper = function () {
  function Helper() {
    _classCallCheck(this, Helper);
  }

  _createClass(Helper, null, [{
    key: 'hashPassword',

    /**
     * Hashes the password supplied by the user to enhance
     * password security
     * @static
     * @param {any} password password supplied by the user
     * @returns {string} the hashed password
     * @memberof Helpers
     */
    value: function hashPassword(password) {
      var saltRounds = 10;
      var salt = _bcrypt2.default.genSaltSync(saltRounds);
      return _bcrypt2.default.hashSync(password, salt);
    }

    /**
     * Creates a JWT from the user information supplied
     * @static
     * @param {integer} id obtained from req.params.id
     * @param {string} email 
     * @param {integer} roleId 
     * @returns {object} response object
     * @memberof Helpers
     */

  }, {
    key: 'getJWT',
    value: function getJWT(id, email, roleId) {
      return _jsonwebtoken2.default.sign({
        userId: id,
        userEmail: email,
        userRole: roleId
      }, process.env.SECRET, {
        expiresIn: '24h'
      });
    }

    /**
     * List all context instances associated to the passed in object and 
     * the page details
     * @static
     * @param {object} context the object's details to be listed 
     * @param {int} limit the maximum amount of instance capacity
     * @param {int} offset the number of instances skipped
     * @param {string} modelName the name of the model
     * @returns {object} the page details 
     * @memberof Helpers
     */

  }, {
    key: 'listContextDetails',
    value: function listContextDetails(context, limit, offset, modelName) {
      var result = {};
      var filteredArray = [];
      if (context.rows.length === 0) {
        result = context.rows;
        return result;
      }
      context.rows.forEach(function (data) {
        filteredArray.push(data);
      });
      var totalDataCount = context.count;
      var pageSize = parseInt(_Pagination2.default.getPageSize(limit), 10);
      var pageCount = _Pagination2.default.getPageCount(totalDataCount, limit);
      var currentPage = _Pagination2.default.getCurrentPage(limit, offset);
      var pageDetails = {
        totalDataCount: totalDataCount,
        pageSize: pageSize,
        pageCount: pageCount,
        currentPage: currentPage
      };
      result['' + modelName] = filteredArray;
      result.pageDetails = pageDetails;
      return result;
    }
  }]);

  return Helper;
}();

exports.default = Helper;