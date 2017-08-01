import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import localStorage from 'local-storage';
import Validation from '../utils/validation';
import Constants from '../constants/index';
import Pagination from '../utils/pagination';

const User = require('../models/').User;
const Document = require('../models/').Document;

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
   * @returns response object
   */
  static signUp(req, res) {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const validatedUser = Validation.validateSignUp(req.body.name, req.body.email, req.body.password);
    let name, email, password;
    if (validatedUser) {
      name = validatedUser.name;
      email = validatedUser.email;
      password = validatedUser.password;
    } else {
      return res.status(400).json({ message: 'User input cannot be empty and Email entry must be an email' })
    }
    const hashedPassword = bcrypt.hashSync(password, salt);
    const userDetails = {
      name,
      email,
      password: hashedPassword,
      roleId: req.body.role
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
      const token = jwt.sign({
        userId: user.id,
        userEmail: user.email,
        userRole: user.roleId
      }, 'zabuzatovadase', {
        expiresIn: '24h'
      });
      localStorage.set('token', token);
      return res.status(200).json({
        success: true,
        message: 'You have signed up successfully',
        token
      });
    })
    .catch(error => res.status(500).json({ message: 'Error signing up user, check if invalid role value' }));
  }
  /**
   * Logs in the creates user instance to the app if
   * successfully signed up
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns response object
   */
  static logIn(req, res) {
    const email = Validation.checkEmailValidityOf(req.body.email) ? 
      Validation.checkEmailValidityOf(req.body.email) :
      false;
    const password = Validation.checkPasswordValidityOf(req.body.password) ?
      Validation.checkPasswordValidityOf(req.body.password) :
      false;
    if(!email || !password) {
      return res.status(400).json({ message: 'Email and password input cannnot be empty' });
    }
    return User.findOne({
      where: {
        email
      }
    }).then((user) => {
      const result = bcrypt.compareSync(password, user.password);
      if(result) {
        const token = jwt.sign({
          userId: user.id,
          userEmail: user.email,
          userRole: user.roleId
        }, 'zabuzatovadase', {
          expiresIn: '24h'
        });
        localStorage.set('token', token);
        res.status(200).json({ user, token });
      } else {
        res.status(400).json({ message: 'Invalid Password' });
      }
    }).catch((error) => {
      res.status(500).json({ message: 'Problems with either the email or password, Check and try again' });
    })
  }
  /**
   * Shows a detail of all the users successfully signed up on the 
   * database
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns response object
   */
  static getUsers(req, res) {
    const userList = [];
    const userDetails = req.decoded;
    if (userDetails.userRole !== Constants.ADMIN && userDetails.userRole !== Constants.SUPERADMIN) {
      return res.status(403).json({ message: 'You do not have the permission to perform this action' });
    }
    if(req.query) {
      const max = Constants.MAXIMUM;
      const selectedUsersList = [];
      const offset = req.query.offset || 0,
            limit = req.query.limit || max;
      return User.findAndCountAll({ offset, limit })
      .then((users) => {
        if(users.rows.length === 0) {
          res.status(500).json({ message: 'No users available for the page selected' });
        } else {
          const totalUsersCount = users.count;
					const pageSize = Pagination.getPageSize(limit, offset);
					const pageCount = Pagination.getPageCount(totalUsersCount, limit);
					const currentPage = Pagination.getCurrentPage(totalUsersCount, limit, offset);
					const pageDetails = { totalUsersCount, pageSize, pageCount, currentPage };
          users.rows.forEach((user) => {
            selectedUsersList.push({
              userName: user.name,
              userEmail: user.email,
              userRole: user.roleId
            });
          });
          res.status(200).json({ selectedUsersList, pageDetails });
        }
      });
    }
  }
  /**
   * Retrieves a specific user data from the database
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns response object
   */
  static getUser(req, res) {
    const userDetails = req.decoded;
    if (userDetails.userRole !== Constants.ADMIN && userDetails.userRole !== Constants.SUPERADMIN) {
      return res.status(403).json({ message: 'You do not have the permission to perform this action' });
    }
    User.findById(req.params.id).then((user) => {
      if(!user) {
        res.status(500).json({ message: 'User does not exist in the database' });
      } else {
        res.status(200).json({
          userName: user.name,
          userEmail: user.email,
          userRole: user.roleId
        })
      }
    })
  }
  /**
   * Updates a specific user data attribute in the database
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns response object
   */
  static updateUser(req, res) {
    const userDetails = req.decoded;
    if (userDetails.userRole !== Constants.SUPERADMIN) {
      return res.status(403).json({ message: 'You do not have the permission to perform this action' });
    }
    User.update({
      roleId: req.body.roleId
    }, {
      where: {
        id: req.params.id
      }
    })
    .then((updatedUser) => {
      if (updatedUser[0] === 1) {
        return res.status(200).json({ message: 'User has been succesfully updated' });
      } else {
        return res.status(400).json({ message: 'No matching user was found in the database, No updates made' });
      }
    })
    .catch((error) => {
      return res.status(500).json({ message: 'Error encoutered while updating. Please check your fields and try again' });
    });
  }
  /**
   * Deletes a user instance from the database
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns response object
   */
  static deleteUser(req, res) {
    const userDetails = req.decoded;
    if (userDetails.userRole !== Constants.SUPERADMIN) {
      return res.status(403).json({ message: 'You do not have the permission to perform this action' });
    }
    User.destroy({
      where: {
        id: req.params.id
      }
    })
    .then((deletedUserCount) => {
      if (deletedUserCount === 1) {
        return res.status(200).json({ message: 'User has been removed from the database successfully' });
      } else {
        return res.status(400).json({ message: 'No matching user was found in the database' });
      }
    })
    .catch((error) => {
      return res.status(500).json({ message: 'Error encountered while trying to delete user, Please try again' });
    });
  }
  /**
   * Searches for matching user instance from the base
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns response object
   */
  static searchUser(req, res) {
    const userDetails = req.decoded;
    if (userDetails.userRole !== Constants.ADMIN && userDetails.userRole !== Constants.SUPERADMIN) {
      return res.status(403).json({ message: 'You do not have the permission to perform this action' });
    }
    const filteredUsersList = [];
    const query = Validator.checkDataValidityOf(req.query.q);
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
      if(users.length === 0) {
        return res.status(400).json({ message: 'No match found for the search query' });
      }
      if (users.length === 1) {
        return res.status(200).json(users);
      }
      users.forEach((user) => {
        filteredUsersList.push(user);
      })
      return res.status(200).json(filteredUsersList);
    })
    .catch((error) => {
      return res.status(400).json({ message: 'Error occured while searching. Do try again!' });
    })
  }
  /**
   * Retrieves all documents instance for a requested user instance,
   * includes the documents in the user details
   * @static
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @memberof UsersController
   */
  static retrieveUserDocuments(req, res) {
    const userDetails = req.decoded;
    const userEmail = userDetails.userEmail;
    const roleId = userDetails.userRole;
    User.findById(req.params.id)
    .then((user) => {
      if (roleId === Constants.ADMIN || roleId === Constants.SUPERADMIN || userEmail === user.email) {
        User.findAll({
          where: {
            id: req.params.id,
          },
          include: [{
            model: Document
          }]
        })
        .then((user) => {
          if(user.length > 0) {
            res.status(200).json(user);
          } else {
            res.status(400).json({ message: 'The user does not exist in the database' });
          }
        })
        .catch((error) => {
          res.status(400).json({ message: 'Error while getting data from the database', error });
        });
      } else {
        res.status(400).json({ message: 'You do not have admin privledges to view this user document' });
      }
    });
  }

  /**
   * Removes the token from the local storage hence ending its session
   * abruptly
   * @static
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @memberof UsersController
   */
  static logout(req, res) {
    localStorage.clear();
    res.status(200).json({ message: 'User successfully logged out' });
  }
};

export default UsersController;
