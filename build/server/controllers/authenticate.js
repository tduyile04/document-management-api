'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _localStorage = require('local-storage');

var _localStorage2 = _interopRequireDefault(_localStorage);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config();

class Authentication {

  /**
   * Retrieves the token obtained from the request made from the client
   * @static
   * @param {any} req request made from the client
   * @returns {string} token obtained from sign up
   * @memberof Authentication
   */
  static getTokenFromRequest(req) {
    const token = req.body.token || req.headers['x-access-token'] || req.headers.Authorization || _localStorage2.default.get('token');
    return token;
  }

  /**
   * Checks the authenticaton state of the current user to limit or allow
   * access to the endpoints
   * @static
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @param {any} next pass action to the next middleware/controller
   * 
   * @memberof Authentication
   */
  static authenticate(req, res, next) {
    const token = Authentication.getTokenFromRequest(req);
    if (token) {
      _jsonwebtoken2.default.verify(token, process.env.SECRET, (error, decoded) => {
        if (error) {
          return res.status(401).json({ message: 'Failed to authenticate token' });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      res.status(400).send({
        success: false,
        message: 'No token provided'
      });
    }
  }
}

exports.default = Authentication;