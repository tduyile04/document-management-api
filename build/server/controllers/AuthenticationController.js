'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_dotenv2.default.config();

/**
 * Protects the routes by checking for user validation before giving
 * access to an endpoint
 * @class Authentication
 */

var AuthenticationController = function () {
  function AuthenticationController() {
    _classCallCheck(this, AuthenticationController);
  }

  _createClass(AuthenticationController, null, [{
    key: 'getTokenFromRequest',

    /**
     * Retrieves the token obtained from the request made from the client
     * @static
     * @param {object} req request made from the client
     * @returns {string} token obtained from sign up
     * @memberof Authentication
     */
    value: function getTokenFromRequest(req) {
      var token = req.body.token || req.headers['x-access-token'] || req.headers.Authorization;
      return token;
    }

    /**
     * Checks the authenticaton state of the current user to limit or allow
     * access to the endpoints
     * @static
     * @param {object} req request made from the client
     * @param {object} res response from the server
     * @param {function} next pass action to the next middleware/controller
     * @returns {null} passes action to the next moddleware
     * @memberof Authentication
     */

  }, {
    key: 'authenticate',
    value: function authenticate(req, res, next) {
      var token = AuthenticationController.getTokenFromRequest(req);
      if (token) {
        _jsonwebtoken2.default.verify(token, process.env.SECRET, function (error, decoded) {
          if (error) {
            return res.status(401).json({
              message: 'Failed to authenticate token'
            });
          }
          req.decoded = decoded;
          next();
        });
      } else {
        res.status(401).send({
          success: false,
          message: 'No token provided'
        });
      }
    }
  }]);

  return AuthenticationController;
}();

exports.default = AuthenticationController;