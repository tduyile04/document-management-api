'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Ensures user entry validation before hitting the database
 * @export
 * @class Validation
 */
var Validation = function () {
  function Validation() {
    _classCallCheck(this, Validation);
  }

  _createClass(Validation, null, [{
    key: 'trim',

    /**
     * Removes whitespaces before and after the value
     * @static
     * @param {string} value 
     * @returns {boolean} true/false
     * @memberof Validation
     */
    value: function trim(value) {
      if (typeof value !== 'string') {
        return '';
      }
      return _validator2.default.trim(value);
    }
    /**
     * Checks if email input is really a valid email
     * @static
     * @param {string} email 
     * @returns {boolean} true/false
     * @memberof Validation
     */

  }, {
    key: 'isEmail',
    value: function isEmail(email) {
      if (typeof email !== 'string') {
        return '';
      }
      return _validator2.default.isEmail(email);
    }
    /**
     * Checks if user input is empty
     * @static
     * @param {string} stringValue 
     * @returns {boolean} true/false
     * @memberof Validation
     */

  }, {
    key: 'isEmpty',
    value: function isEmpty(stringValue) {
      return _validator2.default.isEmpty(Validation.trim(stringValue));
    }
    /**
     * Checks if user input is an integer
     * @static
     * @param {string} value 
     * @returns {boolean} true/false
     * @memberof Validation
     */

  }, {
    key: 'isInt',
    value: function isInt(value) {
      return _validator2.default.isInt(Validation.trim(value));
    }
    /**
     * Escapes html entities from user inputs, to prevent sql injection
     * @static
     * @param {string} input 
     * @returns {boolean} true/fasle
     * @memberof Validation
     */

  }, {
    key: 'escape',
    value: function escape(input) {
      return _validator2.default.escape(Validation.trim(input));
    }
    /**
     * Checks if password supplied is not empty
     * @static
     * @param {any} password 
     * @returns {string} validated and formatted output
     * @memberof Validation
     */

  }, {
    key: 'checkPasswordValidityOf',
    value: function checkPasswordValidityOf(password) {
      var processedInput = !Validation.isEmpty(password) ? password : '';
      return processedInput;
    }
    /**
     * Checks if the data input is not emty and escapes all html entities in the data
     * @static
     * @param {string} input 
     * @returns {string} validated and formatted output
     * @memberof Validation
     */

  }, {
    key: 'checkDataValidityOf',
    value: function checkDataValidityOf(input) {
      var processedInput = !Validation.isEmpty(input) ? Validation.escape(input) : '';
      return processedInput;
    }
    /**
     * Checks if the email supplied is a valid email
     * @static
     * @param {sring} mail 
     * @returns {string} validated and formatted output
     * @memberof Validation
     */

  }, {
    key: 'checkEmailValidityOf',
    value: function checkEmailValidityOf(mail) {
      var email = Validation.isEmail(mail) ? mail : '';
      return email;
    }
    /**
     * Checks if the string input supplied is number
     * @static
     * @param {string} input 
     * @returns {string} validated and formatted output
     * @memberof Validation
     */

  }, {
    key: 'checkIntegerValidityOf',
    value: function checkIntegerValidityOf(input) {
      var processedInput = Validation.isInt(input) ? Validation.escape(input) : '';
      return processedInput;
    }

    /**
     * Checks the validity of each user input supplied during user sign up
     * @static
     * @param {string} _name 
     * @param {string} _email 
     * @param {string} _password 
     * @returns {object} validated and formatted output
     * @memberof Validation
     */

  }, {
    key: 'validateSignUp',
    value: function validateSignUp(_name, _email, _password) {
      var name = !Validation.isEmpty(_name) ? Validation.trim(_name) : false;
      var email = Validation.checkEmailValidityOf(_email) ? _email : false;
      var password = !Validation.isEmpty(_password) ? _password : false;
      var userData = { name: name, email: email, password: password };
      return name && email && password ? userData : false;
    }

    /**
     * Checks the validity of each user input supplied during user updates
     * @static
     * @param {string} _name 
     * @param {string} _email 
     * @param {string} _password 
     * @returns {object} validated and formatted output
     * @memberof Validation
     */

  }, {
    key: 'validateUpdateUser',
    value: function validateUpdateUser(_name, _email, _password) {
      var name = !Validation.isEmpty(_name) ? Validation.trim(_name) : false;
      var email = Validation.checkEmailValidityOf(_email) ? _email : false;
      var password = !Validation.isEmpty(_password) ? _password : false;
      var userData = { name: name, email: email, password: password };
      return name && email && password ? userData : false;
    }
  }]);

  return Validation;
}();

exports.default = Validation;