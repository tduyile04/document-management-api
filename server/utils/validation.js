import validator from 'validator';

/**
 * Ensures user entry validation before hitting the database
 * @export
 * @class Validation
 */
export default class Validation {
  /**
   * Removes whitespaces before and after the value
   * @static
   * @param {string} value 
   * @returns {boolean} true/false
   * @memberof Validation
   */
  static trim(value) {
    if (typeof value !== 'string') {
      return '';
    }
    return validator.trim(value);
  }
  /**
   * Checks if email input is really a valid email
   * @static
   * @param {string} email 
   * @returns {boolean} true/false
   * @memberof Validation
   */
  static isEmail(email) {
    if (typeof email !== 'string') {
      return '';
    }
    return validator.isEmail(email);
  }
  /**
   * Checks if user input is empty
   * @static
   * @param {string} stringValue 
   * @returns {boolean} true/false
   * @memberof Validation
   */
  static isEmpty(stringValue) {
    return validator.isEmpty(Validation.trim(stringValue));
  }
  /**
   * Checks if user input is an integer
   * @static
   * @param {string} value 
   * @returns {boolean} true/false
   * @memberof Validation
   */
  static isInt(value) {
    return validator.isInt(Validation.trim(value));
  }
  /**
   * Escapes html entities from user inputs, to prevent sql injection
   * @static
   * @param {string} input 
   * @returns {boolean} true/fasle
   * @memberof Validation
   */
  static escape(input) {
    return validator.escape(Validation.trim(input));
  }
  /**
   * Checks if password supplied is not empty
   * @static
   * @param {any} password 
   * @returns {string} validated and formatted output
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
   * @returns {string} validated and formatted output
   * @memberof Validation
   */
  static checkDataValidityOf(input) {
    const processedInput = !Validation.isEmpty(input) ? Validation.escape(input) : '';
    return processedInput;
  }
  /**
   * Checks if the email supplied is a valid email
   * @static
   * @param {sring} mail 
   * @returns {string} validated and formatted output
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
   * @returns {string} validated and formatted output
   * @memberof Validation
   */
  static checkIntegerValidityOf(input) {
    const processedInput = Validation.isInt(input) ? Validation.escape(input) : '';
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
  static validateSignUp(_name, _email, _password) {
    const name = !Validation.isEmpty(_name) ? Validation.trim(_name) : false;
    const email = Validation.checkEmailValidityOf(_email) ? _email : false;
    const password = !Validation.isEmpty(_password) ? _password : false;
    const userData = { name, email, password };
    return (name && email && password) ? userData : false;
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
  static validateUpdateUser(_name, _email, _password) {
    const name = !Validation.isEmpty(_name) ? Validation.trim(_name) : false;
    const email = Validation.checkEmailValidityOf(_email) ? _email : false;
    const password = !Validation.isEmpty(_password) ? _password : false;
    const userData = { name, email, password };
    return (name && email && password) ? userData : false;
  }
}
