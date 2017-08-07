'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Validation {
  /**
   * Removes whitespaces before and after the value
   * @static
   * @param {string} value 
   * @returns boolean
   * @memberof Validation
   */
  static trim(value) {
    if (typeof value !== 'string') {
      return '';
    }
    return _validator2.default.trim(value);
  }
  /**
   * Checks if email input is really a valid email
   * @static
   * @param {string} email 
   * @returns boolean
   * @memberof Validation
   */
  static isEmail(email) {
    if (typeof email !== 'string') {
      return '';
    }
    return _validator2.default.isEmail(email);
  }
  /**
   * Checks if user input is empty
   * @static
   * @param {string} stringValue 
   * @returns boolean
   * @memberof Validation
   */
  static isEmpty(stringValue) {
    return _validator2.default.isEmpty(Validation.trim(stringValue));
  }
  /**
   * Checks if user input is an integer
   * @static
   * @param {string} value 
   * @returns boolean
   * @memberof Validation
   */
  static isInt(value) {
    return _validator2.default.isInt(trim(value));
  }
  /**
   * Escapes html entities from user inputs, to prevent sql injection
   * @static
   * @param {string} input 
   * @returns boolean
   * @memberof Validation
   */
  static escape(input) {
    return _validator2.default.escape(Validation.trim(input));
  }
  /**
   * Checks if password supplied is not empty
   * @static
   * @param {any} pasword 
   * @returns string
   * @memberof Validation
   */
  static checkPasswordValidityOf(password) {
    const processedInput = !Validation.isEmpty(password) ? password : '';
    return processedInput;
  }
  /**
   * Checks if the data input is not emty and escapes all html entities in the data
   * @static
   * @param {string} input 
   * @returns string
   * @memberof Validation
   */
  static checkDataValidityOf(input) {
    const processedInput = !Validation.isEmpty(input) ? Validation.escape(input) : '';
    return processedInput;
  }
  /**
   * Checks if the email supplied is a valid email
   * @static
   * @param {sring} email 
   * @returns string
   * @memberof Validation
   */
  static checkEmailValidityOf(mail) {
    const email = Validation.isEmail(mail) ? mail : '';
    return email;
  }
  /**
   * Checks if the string input supplied is number
   * @static
   * @param {string} input 
   * @returns string
   * @memberof Validation
   */
  static checkIntegerValidityOf(input) {
    const processedInput = Validation.isInt(input) ? Validation.escape(input) : '';
    return processedInput;
  }

  /**
   * Checks the validity of each user input supplied during user sign up
   * @static
   * @param {string} name 
   * @param {string} email 
   * @param {string} password 
   * @returns object
   * @memberof Validation
   */
  static validateSignUp(_name, _email, _password) {
    const name = !Validation.isEmpty(_name) ? Validation.trim(_name) : false;
    const email = Validation.checkEmailValidityOf(_email) ? _email : false;
    const password = !Validation.isEmpty(_password) ? _password : false;
    const userData = { name, email, password };
    return name && email && password ? userData : false;
  }

  /**
   * Checks the validity of each user input supplied during user updates
   * @static
   * @param {string} name 
   * @param {string} email 
   * @param {string} password 
   * @returns object
   * @memberof Validation
   */
  static validateUpdateUser(_name, _email, _password) {
    const name = !Validation.isEmpty(_name) ? Validation.trim(_name) : false;
    const email = Validation.checkEmailValidityOf(_email) ? _email : false;
    const password = !Validation.isEmpty(_password) ? _password : false;
    const userData = { name, email, password };
    return name && email && password ? userData : false;
  }
}
exports.default = Validation;