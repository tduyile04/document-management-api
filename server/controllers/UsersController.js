import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Validation from '../utils/Validation';
import Constants from '../constants/Constants';
import Helper from '../utils/Helper';
import Repository from '../utils/Repository';
import models from '../../server/models';

const User = models.User;
const Document = models.Document;

dotenv.config();

/**
 * Handles all the functionality for the user instances
 * @class UsersController
 */
class UsersController {
  /**
   * Creates a new user instance and saves it to
   * the database
   * @param {object} req request made from the client
   * @param {object} res response from the server
   * @returns {object} response object
   */
  static signUp(req, res) {
    const validatedUser = Validation
      .validateSignUp(req.body.name, req.body.email, req.body.password);
    let name;
    let email;
    let password;
    if (validatedUser) {
      name = validatedUser.name;
      email = validatedUser.email;
      password = validatedUser.password;
    } else {
      return res.status(400).json({
        message: Validation
          .checkSignupValidity(req.body.name, req.body.email, req.body.password)
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
        return res.status(409).json({ message: 'Email already exists' });
      }
      const token = Helper.getJWT(user.id, user.email, user.roleId);
      const userProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId
      };
      return res.status(201).json({
        user: userProfile,
        token
      });
    })
      .catch(() => res.status(500).json({
        message: 'Error signing up user, check if invalid role value',
      }));
  }
  /**
   * Logs in the creates user instance to the app if
   * successfully signed up
   * @param {object} req request made from the client
   * @param {object} res response from the server
   * @returns {object} response object
   */
  static logIn(req, res) {
    const email = req.body.email;
    const password = Validation.checkPasswordValidityOf(req.body.password) ?
      Validation.checkPasswordValidityOf(req.body.password) :
      '';
    if (!email || !Validation.checkEmailValidityOf(email) || !password) {
      return res.status(400).json({
        message: Validation.checkLogInValidity(email, password)
      });
    }
    return User.findOne({
      where: {
        email
      }
    }).then((user) => {
      const result = bcrypt.compareSync(password, user.password);
      if (result) {
        const token = Helper.getJWT(user.id, user.email, user.roleId);
        const userProfile = {
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.roleId
        };
        res.status(200).json({ user: userProfile, token });
      } else {
        res.status(400).json({ message: 'Invalid Password' });
      }
    }).catch(() => {
      res.status(500).json({
        message: 'Problems with either the email or password, Try again',
      });
    });
  }
  /**
   * Shows a detail of all the users successfully signed up on the
   * database
   * @param {object} req request made from the client
   * @param {object} res response from the server
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
      const offset = req.query && req.query.offset ? req.query.offset : 0;
      const limit = req.query && req.query.limit
        ? req.query.limit
        : Constants.MAXIMUM;
      return User.findAndCountAll({ offset, limit })
        .then((users) => {
          res.status(200).json(
            Helper.listContextDetails(users, limit, offset, 'users')
          );
        })
        .catch(() => {
          res.status(500).json({
            message: 'Problems retrieving the user lists, Try again',
          });
        });
    }
  }

  /**
   * Retrieves a specific user data from the database
   * @param {object} req request made from the client
   * @param {object} res response from the server
   * @returns {object} response object
   */
  static getUser(req, res) {
    const userDetails = req.decoded;
    const userId = (userDetails.userId).toString();
    if (userDetails.userRole !== Constants.ADMIN &&
      userDetails.userRole !== Constants.SUPERADMIN &&
      userId !== req.params.id) {
      return res.status(403).json({
        message: 'You do not have the permission to perform this action'
      });
    }
    Repository
      .findDataById(req.params.id, User, 'users')
      .then(user => res.status(user.status).send(user.data));
  }

  /**
   * Updates a specific user data attribute in the database
   * @param {object} req request made from the client
   * @param {object} res response from the server
   * @returns {object} response object
   */
  static updateUser(req, res) {
    const userDetails = req.decoded;
    const userId = (userDetails.userId).toString();
    const roleId = userDetails.userRole;
    if (userId === req.params.id) {
      const validatedUser = Validation
        .validateUpdateUser(req.body.name, req.body.email, req.body.password);
      if (!validatedUser) {
        return res.status(400).json(
          { message: 'Empty fields not allowed, fill them' }
        );
      }
      if (req.body && req.body.roleId && roleId !== Constants.SUPERADMIN) {
        return res.status(403).json(
          { message: 'Only a superadmin can change user roles' }
        );
      }
      const id = req.params.id;
      const name = validatedUser.name;
      const email = validatedUser.email;
      const password = validatedUser.password;
      const hashedPassword = Helper.hashPassword(password);
      const updateField = {
        name,
        email,
        password: hashedPassword
      };
      Repository.updateContextDetails(updateField, id, User, 'users')
        .then((user) => {
          res.status(user.status).json(user.data);
        });
    } else if (userId !== req.params.id && roleId === Constants.SUPERADMIN) {
      if (req.body.name || req.body.email || req.body.password) {
        return res.status(403).json({
          message: 'Editing another user information is only done by the user'
        });
      }
      Repository.updateUserRoles(req.body.roleId, req.params.id, User, 'users')
        .then(user => res.status(user.status).json(user.data));
    } else {
      return res.status(403).json(
        { message: 'You cannot edit another user\'s details' }
      );
    }
  }

  /**
   * Deletes a user instance from the database
   * @param {object} req request made from the client
   * @param {object} res response from the server
   * @returns {object} response object
   */
  static deleteUser(req, res) {
    const userDetails = req.decoded;
    if (userDetails.userRole !== Constants.SUPERADMIN) {
      return res.status(403).json({
        message: 'You do not have the permission to perform this action'
      });
    }
    Repository.deleteContextInstance(User, 'users', req.params.id)
      .then(user => res.status(user.status).json(user.data));
  }
  /**
   * Searches for matching user instance from the base
   * @param {object} req request made from the client
   * @param {object} res response from the server
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
              $like: `%${req.query.q}%`
            }
          },
          {
            email: {
              $like: `%${req.query.q}%`
            }
          }
        ]
      }
    })
      .then((users) => {
        if (users.length === 0) {
          return res.status(404).json({
            message: 'No match found for the search query'
          });
        }
        users.forEach((user) => {
          filteredUsersList.push({
            id: user.id,
            name: user.name,
            email: user.email,
            roleId: user.roleId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          });
        });
        return res.status(200).json(filteredUsersList);
      })
      .catch(() => res.status(500).json({
        message: 'Error occured while searching. Do try again!'
      }));
  }
  /**
   * Retrieves all documents instance for a requested user instance,
   * includes the documents in the user details
   * @static
   * @param {object} req request made from the client
   * @param {object} res response from the server
   * @returns {object} response object
   * @memberof UsersController
   */
  static retrieveUserDocuments(req, res) {
    const userDetails = req.decoded;
    const userEmail = userDetails.userEmail;
    const roleId = userDetails.userRole;
    const showUsers = [];
    User.findById(req.params.id)
      .then((user) => {
        if (user) {
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
              .then((allUsers) => {
                allUsers.forEach((uniqueUser) => {
                  showUsers.push({
                    id: uniqueUser.id,
                    name: uniqueUser.name,
                    email: uniqueUser.email,
                    roleId: uniqueUser.roleId,
                    createdAt: uniqueUser.createdAt,
                    updatedAt: uniqueUser.updatedAt,
                    Documents: uniqueUser.Documents
                  });
                });
                res.status(200).json(showUsers);
              })
              .catch(() => {
                res.status(500).json({
                  message: 'Error while getting data from the database'
                });
              });
          } else {
            res.status(403).json({
              message: 'Requires admin access to view this user document'
            });
          }
        } else {
          res.status(404).json({
            message: 'The user does not exist in the database'
          });
        }
      })
      .catch(() => {
        res.status(500).json({
          message: 'Error while getting data from the database'
        });
      });
  }
}

export default UsersController;
