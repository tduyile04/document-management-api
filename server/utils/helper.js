import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Pagination from './pagination';

dotenv.config();

/**
 * Helper class that helps abstract simple functionalities so the
 * controllers become more readable
 * @export
 * @class Helper
 */
export default class Helper {
  /**
   * Hashes the password supplied by the user to enhance
   * password security
   * @static
   * @param {any} password password supplied by the user
   * @returns {string} the hashed password
   * @memberof Helpers
   */
  static hashPassword(password) {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
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
  static getJWT(id, email, roleId) {
    return jwt.sign({
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
  static listContextDetails(context, limit, offset, modelName) {
    let result = {};
    const filteredArray = [];
    if (context.rows.length === 0) {
      result = context.rows;
      return result;
    }
    context.rows.forEach((data) => {
      filteredArray.push(data);
    });
    const totalDataCount = context.count;
    const pageSize = parseInt(Pagination.getPageSize(limit));
    const pageCount = Pagination.getPageCount(totalDataCount, limit);
    const currentPage = Pagination.getCurrentPage(limit, offset);
    const pageDetails = {
      totalDataCount,
      pageSize,
      pageCount,
      currentPage
    };
    result[`${modelName}`] = filteredArray;
    result.pageDetails = pageDetails;
    return result;
  }
}
