const validator = require('validator');

export default class Validation {
  /**
   * Removes whitespaces before and after the value
   * @static
   * @param {any} value 
   * @returns boolean
   * @memberof Validation
   */
  static trim(value) {
    return validator.trim(value);
  }
  /**
   * Checks if email input is really a valid email
   * @static
   * @param {any} email 
   * @returns boolean
   * @memberof Validation
   */
  static isEmail(email) {
    return validator.isEmail(email)
  }
  /**
   * Checks if user input is empty
   * @static
   * @param {any} stringValue 
   * @returns boolean
   * @memberof Validation
   */
  static isEmpty(stringValue) {
    return validator.isEmpty(Validation.trim(stringValue));
  }
  /**
   * Checks if user input is an integer
   * @static
   * @param {any} value 
   * @returns boolean
   * @memberof Validation
   */
  static isInt(value) {
    return validator.isInt(value);
  }
  /**
   * Escapes html entities from user inputs, to prevent sql injection
   * @static
   * @param {any} input 
   * @returns boolean
   * @memberof Validation
   */
  static escape(input) {
    return validator.escape(Validation.trim(input));
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
   * @param {any} input 
   * @returns string
   * @memberof Validation
   */
  static checkDataValidityOf(input)  {
    const processedInput = !Validation.isEmpty(input) ? Validation.escape(input) : '';
    return processedInput;
  }
  /**
   * Checks if the email supplied is a valid email
   * @static
   * @param {any} email 
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
   * @param {any} input 
   * @returns string
   * @memberof Validation
   */
  static checkIntegerValidityOf(input) {
    const processedInput = Validation.isInt(input) ? Validation.escape(input) : '';
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
  static validateSignUp(_name, _email, _password) {
    const name = !Validation.isEmpty(_name) ? Validation.trim(_name) : false;
    const email = Validation.checkEmailValidityOf(_email) ? _email : false;
    const password = !Validation.isEmpty(_password) ? _password : false;
    const userData = { name, email, password };
    return (name && email && password) ? userData : false;
  }
}