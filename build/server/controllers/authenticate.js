'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _localStorage = require('local-storage');

var _localStorage2 = _interopRequireDefault(_localStorage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Authentication = function () {
  function Authentication() {
    _classCallCheck(this, Authentication);
  }

  _createClass(Authentication, null, [{
    key: 'authenticate',
    value: function authenticate(req, res, next) {
      var token = req.body.token || req.headers['x-access-token'] || req.headerlocalStorage.get('token');
      if (token) {
        _jsonwebtoken2.default.verify(token, 'zabuzatovadase', function (error, decoded) {
          if (error) {
            return res.status(500).json({ message: 'Failed to authenticate token' });
          } else {
            req.decoded = decoded;
            next();
          }
        });
      } else {
        res.status(403).send({
          success: false,
          message: 'No token provided'
        });
      }
    }
  }]);

  return Authentication;
}();

exports.default = Authentication;