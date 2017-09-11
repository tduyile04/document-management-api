import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Protects the routes by checking for user validation before giving
 * access to an endpoint
 * @class Authentication
 */
class AuthenticationController {
  /**
   * Retrieves the token obtained from the request made from the client
   * @static
   * @param {object} req request made from the client
   * @returns {string} token obtained from sign up
   * @memberof Authentication
   */
  static getTokenFromRequest(req) {
    const token = req.body.token || req.headers['x-access-token'] ||
      req.headers.Authorization;
    return token;
  }

  /**
   * Checks the authenticaton state of the current user to limit or allow
   * access to the endpoints
   * @static
   * @param {object} req request made from the client
   * @param {object} res response from the server
   * @param {function} next pass action to the next middleware/controller
   * @returns {null} passes action to the next moddleware
   * @memberof Authentication
   */
  static authenticate(req, res, next) {
    const token = AuthenticationController.getTokenFromRequest(req);
    if (token) {
      jwt.verify(token, process.env.SECRET, (error, decoded) => {
        if (error) {
          return res.status(401).json({
            message: 'Failed to authenticate token'
          });
        }
        req.decoded = decoded;
        next();
      });
    } else {
      res.status(401).send({
        success: false,
        message: 'No token provided'
      });
    }
  }
}

export default AuthenticationController;
