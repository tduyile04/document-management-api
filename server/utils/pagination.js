export default class Pagination {
  /**
   * Gets the total number of data that can be accomodated
   * for a single page
   * @static
   * @param {any} limit the highest number of data accomodated
   * @param {any} offset the starting point of the data
   * @returns int
   * @memberof Pagination
   */
  static getPageSize(limit) {
    return limit;
  }

  /**
   * Gets the total number of pages for the total number of data
   * @static
   * @param {any} totalDataCount the total number of data
   * @param {any} limit the highest number of data accomodated
   * @param {any} offset the starting point of the data
   * @returns int
   * @memberof Pagination
   */
  static getPageCount(totalDataCount, limit) {
    return Math.ceil(totalDataCount / Pagination.getPageSize(limit));
  }

  /**
   * Gets the current page that the is retrieved from the database
   * @static
   * @param {any} totalDataCount the total number of data
   * @param {any} limit the highest number of data accomodated
   * @param {any} offset the starting point of the data
   * @returns int
   * @memberof Pagination
   */
  static getCurrentPage(totalDataCount, limit, offset) {
    return Math.ceil(offset / limit);
  }
}