import Constants from '../constants/Constants';

/**
 * Creates a pagination helper class that helps abstract the page functionality
 * from the controller class to aid code readability
 * @export
 * @class Pagination
 */
export default class Pagination {
  /**
   * Gets the total number of data that can be accomodated
   * for a single page
   * @static
   * @param {any} limit the highest number of data accomodated
   * @returns {int} page size
   * @memberof Pagination
   */
  static getPageSize(limit) {
    const newlimit = limit && typeof limit !== 'object'
      ? limit
      : Constants.DEFAULT;
    if (newlimit < 1) {
      return Constants.MAXIMUM;
    }
    return newlimit;
  }

  /**
   * Gets the total number of pages for the total number of data
   * @static
   * @param {any} totalDataCount the total number of data
   * @param {any} limit the highest number of data accomodated
   * @param {any} offset the starting point of the data
   * @returns {int} psge count
   * @memberof Pagination
   */
  static getPageCount(totalDataCount, limit) {
    const newTotalDataCount = totalDataCount && totalDataCount > 0
      ? totalDataCount
      : 0;
    const newlimit = limit && limit > 0 ? limit : Constants.MAXIMUM;
    if (newTotalDataCount === 0) {
      return Constants.UNIT;
    }
    const result = Math.ceil(
      newTotalDataCount / Pagination.getPageSize(newlimit)
    );
    if (result === 0) {
      return Constants.UNIT;
    }
    return result;
  }

  /**
   * Gets the current page that the is retrieved from the database
   * @static
   * @param {any} limit the highest number of data accomodated
   * @param {any} offset the starting point of the data
   * @returns {int} current page
   * @memberof Pagination
   */
  static getCurrentPage(limit, offset) {
    const newlimit = limit && limit > 0 ? limit : Constants.MAXIMUM;
    const newOffset = offset && offset > 0 ? offset : Constants.ZERO;
    const result = Math.ceil(newOffset / newlimit);
    if ((newOffset % newlimit) === 0 || result === 0) {
      return result + 1;
    }
    return result;
  }
}
