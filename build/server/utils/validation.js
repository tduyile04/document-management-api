'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var validator = require('validator');

var Validation = function () {
  function Validation() {
    _classCallCheck(this, Validation);
  }

  _createClass(Validation, null, [{
    key: 'trim',

    /**
     * Removes whitespaces before and after the value
     * @static
     * @param {any} value 
     * @returns boolean
     * @memberof Validation
     */
    value: function trim(value) {
      return validator.trim(value);
    }
    /**
     * Checks if email input is really a valid email
     * @static
     * @param {any} email 
     * @returns boolean
     * @memberof Validation
     */

  }, {
    key: 'isEmail',
    value: function isEmail(email) {
      return validator.isEmail(email);
    }
    /**
     * Checks if user input is empty
     * @static
     * @param {any} stringValue 
     * @returns boolean
     * @memberof Validation
     */

  }, {
    key: 'isEmpty',
    value: function isEmpty(stringValue) {
      return validator.isEmpty(Validation.trim(stringValue));
    }
    /**
     * Checks if user input is an integer
     * @static
     * @param {any} value 
     * @returns boolean
     * @memberof Validation
     */

  }, {
    key: 'isInt',
    value: function isInt(value) {
      return validator.isInt(value);
    }
    /**
     * Escapes html entities from user inputs, to prevent sql injection
     * @static
     * @param {any} input 
     * @returns boolean
     * @memberof Validation
     */

  }, {
    key: 'escape',
    value: function escape(input) {
      return validator.escape(Validation.trim(input));
    }
    /**
     * Checks if password supplied is not empty
     * @static
     * @param {any} pasword 
     * @returns string
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
     * @param {any} input 
     * @returns string
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
     * @param {any} email 
     * @returns string
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
     * @param {any} input 
     * @returns string
     * @memberof Validation
     */

  }, {
    key: 'checkIntegerValidityOf',
    value: function checkIntegerValidityOf(input) {
      var processedInput = Validation.isInt(input) ? Validation.escape(input) : '';
      return processedInput;
    }

    /**
     * Checks the validity of each user input supplied 
     * @static
     * @param {any} name 
     * @param {any} email 
     * @param {any} password 
     * @returns object
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
  }]);

  return Validation;
}();

exports.default = Validation;