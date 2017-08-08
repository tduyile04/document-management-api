import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import localStorage from 'local-storage';
import Validation from '../utils/validation';
import Constants from '../constants/index';
import Helper from '../utils/helper';
import Repository from '../utils/repository';

const User = require('../models/').User;
const Document = require('../models/').Document;

dotenv.config();

/**
 * Handles all the functionality for the user instances
 * @class UsersController
 */
class UsersController {
  /**
   * Creates a new user instance and saves it to 
   * the database
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns {object} response object
   */
  static signUp(req, res) {
    const validatedUser = Validation
      .validateSignUp(req.body.name, req.body.email, req.body.password);
    let name, email, password;
    if (validatedUser) {
      name = validatedUser.name;
      email = validatedUser.email;
      password = validatedUser.password;
    } else {
      return res.status(400).json({
        message: 'User input cannot be empty and Email entry must be an email'
      });
    }
    const hashedPassword = Helper.hashPassword(password);
    const userDetails = {
      name,
      email,
      password: hashedPassword,
      roleId: req.body.roleId
    };
    return User.findOrCreate({
      where: {
        email: userDetails.email
      },
      defaults: userDetails
    }).spread((user, created) => {
      if (!created) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      const token = Helper.getJWT(user.id, user.email, user.roleId);
      localStorage.set('token', token);
      return res.status(200).json({
        success: true,
        message: 'You have signed up successfully',
        token
      });
    })
      .catch(() => res.status(500).json({
        message: 'Error signing up user, check if invalid role value'
      }));
  }
  /**
   * Logs in the creates user instance to the app if
   * successfully signed up
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns {object} response object
   */
  static logIn(req, res) {
    const email = Validation.checkEmailValidityOf(req.body.email) ?
      Validation.checkEmailValidityOf(req.body.email) :
      false;
    const password = Validation.checkPasswordValidityOf(req.body.password) ?
      Validation.checkPasswordValidityOf(req.body.password) :
      false;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password input cannnot be empty' });
    }
    return User.findOne({
      where: {
        email
      }
    }).then((user) => {
      const result = bcrypt.compareSync(password, user.password);
      if (result) {
        const token = Helper.getJWT(user.id, user.email, user.roleId);
        localStorage.set('token', token);
        res.status(200).json({ user, token });
      } else {
        res.status(400).json({ message: 'Invalid Password' });
      }
    }).catch(() => {
      res.status(500).json({
        message: 'Problems with either the email or password, Check and try again'
      });
    });
  }
  /**
   * Shows a detail of all the users successfully signed up on the 
   * database
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns {object} response object
   */
  static getUsers(req, res) {
    const userDetails = req.decoded;
    if (userDetails.userRole !== Constants.ADMIN &&
      userDetails.userRole !== Constants.SUPERADMIN) {
      return res.status(403).json({
        message: 'You do not have the permission to perform this action'
      });
    }
    if (req.query) {
      const offset = req.query && req.query.offset ? req.query.offset : 0,
        limit = req.query && req.query.limit ? req.query.limit : Constants.MAXIMUM;
      return User.findAndCountAll({ offset, limit })
        .then((users) => {
          res.status(200).json(Helper.listContextDetails(users, limit, offset, 'User'));
        });
    }
  }

  /**
   * Retrieves a specific user data from the database
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns {object} response object
   */
  static getUser(req, res) {
    const userDetails = req.decoded;
    if (userDetails.userRole !== Constants.ADMIN &&
      userDetails.userRole !== Constants.SUPERADMIN) {
      return res.status(403).json({
        message: 'You do not have the permission to perform this action'
      });
    }
    Repository.findDataById(req.params.id, User, 'User').then(user => res.status(user.status).json(user.data));
  }

  /**
   * Updates a specific user data attribute in the database
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns {object} response object
   */
  static updateUser(req, res) {
    const userDetails = req.decoded;
    if (userDetails.userRole !== Constants.SUPERADMIN) {
      const validatedUser = Validation
        .validateUpdateUser(req.body.name, req.body.email, req.body.password);
      if (!validatedUser) {
        return res.status(400).json({ message: 'Empty fields not allowed, fill them' });
      }
      const name = validatedUser.name;
      const email = validatedUser.email;
      const password = validatedUser.password;
      const id = req.params.id;
      const hashedPassword = Helper.hashPassword(password);
      const updateField = {
        name,
        email,
        password: hashedPassword
      };
      if (req.body.roleId) {
        return res.status(401).json({ message: 'You do not have admin priviledges' });
      } else if (userDetails.userId == req.params.id) {
        Repository.updateContextDetails(updateField, id, User, 'User')
          .then(user => res.status(user.status).json(user.data));
      } else {
        return res.status(401).json({ message: 'You cannot edit another user\'s document' });
      }
    } else {
      Repository.updateUserRoles(req.body.roleId, req.params.id, User, 'User')
        .then(user => res.status(user.status).json(user.data));
    }
  }

  /**
   * Deletes a user instance from the database
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns {object} response object
   */
  static deleteUser(req, res) {
    const userDetails = req.decoded;
    if (userDetails.userRole !== Constants.SUPERADMIN) {
      return res.status(403).json({
        message: 'You do not have the permission to perform this action'
      });
    }
    Repository.deleteContextInstance(User, 'User', req.params.id)
      .then(user => res.status(user.status).json(user.data));
  }
  /**
   * Searches for matching user instance from the base
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns {object} response object
   */
  static searchUser(req, res) {
    const userDetails = req.decoded;
    if (userDetails.userRole !== Constants.ADMIN &&
      userDetails.userRole !== Constants.SUPERADMIN) {
      return res.status(403).json({
        message: 'You do not have the permission to perform this action'
      });
    }
    const filteredUsersList = [];
    User.findAll({
      where: {
        $or: [
          {
            name: {
              $like: `${req.query.q}%`
            }
          },
          {
            email: {
              $like: `${req.query.q}%`
            }
          }
        ]
      }
    })
      .then((users) => {
        if (users.length === 0) {
          return res.status(404).json({ message: 'No match found for the search query' });
        }
        users.forEach((user) => {
          filteredUsersList.push(user);
        });
        return res.status(200).json(filteredUsersList);
      })
      .catch(() => res.status(400).json({
        message: 'Error occured while searching. Do try again!'
      }));
  }
  /**
   * Retrieves all documents instance for a requested user instance,
   * includes the documents in the user details
   * @static
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns {object} response object
   * @memberof UsersController
   */
  static retrieveUserDocuments(req, res) {
    const userDetails = req.decoded;
    const userEmail = userDetails.userEmail;
    const roleId = userDetails.userRole;
    User.findById(req.params.id)
      .then((user) => {
        if (roleId === Constants.ADMIN || roleId === Constants.SUPERADMIN ||
        userEmail === user.email) {
          User.findAll({
            where: {
              id: req.params.id,
            },
            include: [{
              model: Document
            }]
          })
            .then((allUser) => {
              if (user.length > 0) {
                res.status(200).json(allUser);
              } else {
                res.status(400).json({ message: 'The user does not exist in the database' });
              }
            })
            .catch(() => {
              res.status(400).json({ message: 'Error while getting data from the database' });
            });
        } else {
          res.status(400).json({
            message: 'You do not have admin privledges to view this user document'
          });
        }
      });
  }

  /**
   * Removes the token from the local storage hence ending its session
   * abruptly
   * @static
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns {object} response object
   * @memberof UsersController
   */
  static logout(req, res) {
    localStorage.clear();
    res.status(200).json({ message: 'User successfully logged out' });
  }
}

export default UsersController;
