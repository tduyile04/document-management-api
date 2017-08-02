'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _localStorage = require('local-storage');

var _localStorage2 = _interopRequireDefault(_localStorage);

var _validation = require('../utils/validation');

var _validation2 = _interopRequireDefault(_validation);

var _index = require('../constants/index');

var _index2 = _interopRequireDefault(_index);

var _pagination = require('../utils/pagination');

var _pagination2 = _interopRequireDefault(_pagination);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var User = require('../models/').User;
var Document = require('../models/').Document;

/**
 * Handles all the functionality for the user instances
 * @class UsersController
 */

var UsersController = function () {
  function UsersController() {
    _classCallCheck(this, UsersController);
  }

  _createClass(UsersController, null, [{
    key: 'signUp',

    /**
     * Creates a new user instance and saves it to 
     * the database
     * @param {any} req request made from the client
     * @param {any} res response from the server
     * @returns response object
     */
    value: function signUp(req, res) {
      var saltRounds = 10;
      var salt = _bcrypt2.default.genSaltSync(saltRounds);
      var validatedUser = _validation2.default.validateSignUp(req.body.name, req.body.email, req.body.password);
      var name = void 0,
          email = void 0,
          password = void 0;
      if (validatedUser) {
        name = validatedUser.name;
        email = validatedUser.email;
        password = validatedUser.password;
      } else {
        return res.status(400).json({ message: 'User input cannot be empty and Email entry must be an email' });
      }
      var hashedPassword = _bcrypt2.default.hashSync(password, salt);
      var userDetails = {
        name: name,
        email: email,
        password: hashedPassword,
        roleId: req.body.role
      };
      return User.findOrCreate({
        where: {
          email: userDetails.email
        },
        defaults: userDetails
      }).spread(function (user, created) {
        if (!created) {
          return res.status(400).json({ message: 'Email already exists' });
        }
        var token = _jsonwebtoken2.default.sign({
          userId: user.id,
          userEmail: user.email,
          userRole: user.roleId
        }, 'zabuzatovadase', {
          expiresIn: '24h'
        });
        _localStorage2.default.set('token', token);
        return res.status(200).json({
          success: true,
          message: 'You have signed up successfully',
          token: token
        });
      }).catch(function (error) {
        return res.status(500).json({ message: 'Error signing up user, check if invalid role value' });
      });
    }
    /**
     * Logs in the creates user instance to the app if
     * successfully signed up
     * @param {any} req request made from the client
     * @param {any} res response from the server
     * @returns response object
     */

  }, {
    key: 'logIn',
    value: function logIn(req, res) {
      var email = _validation2.default.checkEmailValidityOf(req.body.email) ? _validation2.default.checkEmailValidityOf(req.body.email) : false;
      var password = _validation2.default.checkPasswordValidityOf(req.body.password) ? _validation2.default.checkPasswordValidityOf(req.body.password) : false;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password input cannnot be empty' });
      }
      return User.findOne({
        where: {
          email: email
        }
      }).then(function (user) {
        var result = _bcrypt2.default.compareSync(password, user.password);
        if (result) {
          var token = _jsonwebtoken2.default.sign({
            userId: user.id,
            userEmail: user.email,
            userRole: user.roleId
          }, 'zabuzatovadase', {
            expiresIn: '24h'
          });
          _localStorage2.default.set('token', token);
          res.status(200).json({ user: user, token: token });
        } else {
          res.status(400).json({ message: 'Invalid Password' });
        }
      }).catch(function (error) {
        res.status(500).json({ message: 'Problems with either the email or password, Check and try again' });
      });
    }
    /**
     * Shows a detail of all the users successfully signed up on the 
     * database
     * @param {any} req request made from the client
     * @param {any} res response from the server
     * @returns response object
     */

  }, {
    key: 'getUsers',
    value: function getUsers(req, res) {
      var userList = [];
      var userDetails = req.decoded;
      if (userDetails.userRole !== _index2.default.ADMIN && userDetails.userRole !== _index2.default.SUPERADMIN) {
        return res.status(403).json({ message: 'You do not have the permission to perform this action' });
      }
      if (req.query) {
        var selectedUsersList = [];
        var offset = req.query.offset || 0,
            limit = req.query.limit || _index2.default.MAXIMUM;
        return User.findAndCountAll({ offset: offset, limit: limit }).then(function (users) {
          if (users.rows.length === 0) {
            res.status(500).json({ message: 'No users available for the page selected' });
          } else {
            var totalUsersCount = users.count;
            var pageSize = _pagination2.default.getPageSize(limit, offset);
            var pageCount = _pagination2.default.getPageCount(totalUsersCount, limit);
            var currentPage = _pagination2.default.getCurrentPage(totalUsersCount, limit, offset);
            var pageDetails = { totalUsersCount: totalUsersCount, pageSize: pageSize, pageCount: pageCount, currentPage: currentPage };
            users.rows.forEach(function (user) {
              selectedUsersList.push({
                userName: user.name,
                userEmail: user.email,
                userRole: user.roleId
              });
            });
            res.status(200).json({ selectedUsersList: selectedUsersList, pageDetails: pageDetails });
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

  }, {
    key: 'getUser',
    value: function getUser(req, res) {
      var userDetails = req.decoded;
      if (userDetails.userRole !== _index2.default.ADMIN && userDetails.userRole !== _index2.default.SUPERADMIN) {
        return res.status(403).json({ message: 'You do not have the permission to perform this action' });
      }
      User.findById(req.params.id).then(function (user) {
        if (!user) {
          res.status(500).json({ message: 'User does not exist in the database' });
        } else {
          res.status(200).json({
            userName: user.name,
            userEmail: user.email,
            userRole: user.roleId
          });
        }
      });
    }
    /**
     * Updates a specific user data attribute in the database
     * @param {any} req request made from the client
     * @param {any} res response from the server
     * @returns response object
     */

  }, {
    key: 'updateUser',
    value: function updateUser(req, res) {
      var userDetails = req.decoded;
      if (userDetails.userRole !== _index2.default.SUPERADMIN) {
        return res.status(403).json({ message: 'You do not have the permission to perform this action' });
      }
      User.update({
        roleId: req.body.roleId
      }, {
        where: {
          id: req.params.id
        }
      }).then(function (updatedUser) {
        if (updatedUser[0] === 1) {
          return res.status(200).json({ message: 'User has been succesfully updated' });
        } else {
          return res.status(400).json({ message: 'No matching user was found in the database, No updates made' });
        }
      }).catch(function (error) {
        return res.status(500).json({ message: 'Error encoutered while updating. Please check your fields and try again' });
      });
    }
    /**
     * Deletes a user instance from the database
     * @param {any} req request made from the client
     * @param {any} res response from the server
     * @returns response object
     */

  }, {
    key: 'deleteUser',
    value: function deleteUser(req, res) {
      var userDetails = req.decoded;
      if (userDetails.userRole !== _index2.default.SUPERADMIN) {
        return res.status(403).json({ message: 'You do not have the permission to perform this action' });
      }
      User.destroy({
        where: {
          id: req.params.id
        }
      }).then(function (deletedUserCount) {
        if (deletedUserCount === 1) {
          return res.status(200).json({ message: 'User has been removed from the database successfully' });
        } else {
          return res.status(400).json({ message: 'No matching user was found in the database' });
        }
      }).catch(function (error) {
        return res.status(500).json({ message: 'Error encountered while trying to delete user, Please try again' });
      });
    }
    /**
     * Searches for matching user instance from the base
     * @param {any} req request made from the client
     * @param {any} res response from the server
     * @returns response object
     */

  }, {
    key: 'searchUser',
    value: function searchUser(req, res) {
      var userDetails = req.decoded;
      if (userDetails.userRole !== _index2.default.ADMIN && userDetails.userRole !== _index2.default.SUPERADMIN) {
        return res.status(403).json({ message: 'You do not have the permission to perform this action' });
      }
      var filteredUsersList = [];
      var query = Validator.checkDataValidityOf(req.query.q);
      User.findAll({
        where: {
          $or: [{
            name: {
              $like: req.query.q + '%'
            }
          }, {
            email: {
              $like: req.query.q + '%'
            }
          }]
        }
      }).then(function (users) {
        if (users.length === 0) {
          return res.status(400).json({ message: 'No match found for the search query' });
        }
        if (users.length === 1) {
          return res.status(200).json(users);
        }
        users.forEach(function (user) {
          filteredUsersList.push(user);
        });
        return res.status(200).json(filteredUsersList);
      }).catch(function (error) {
        return res.status(400).json({ message: 'Error occured while searching. Do try again!' });
      });
    }
    /**
     * Retrieves all documents instance for a requested user instance,
     * includes the documents in the user details
     * @static
     * @param {any} req request made from the client
     * @param {any} res response from the server
     * @memberof UsersController
     */

  }, {
    key: 'retrieveUserDocuments',
    value: function retrieveUserDocuments(req, res) {
      var userDetails = req.decoded;
      var userEmail = userDetails.userEmail;
      var roleId = userDetails.userRole;
      User.findById(req.params.id).then(function (user) {
        if (roleId === _index2.default.ADMIN || roleId === _index2.default.SUPERADMIN || userEmail === user.email) {
          User.findAll({
            where: {
              id: req.params.id
            },
            include: [{
              model: Document
            }]
          }).then(function (user) {
            if (user.length > 0) {
              res.status(200).json(user);
            } else {
              res.status(400).json({ message: 'The user does not exist in the database' });
            }
          }).catch(function (error) {
            res.status(400).json({ message: 'Error while getting data from the database', error: error });
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

  }, {
    key: 'logout',
    value: function logout(req, res) {
      _localStorage2.default.clear();
      res.status(200).json({ message: 'User successfully logged out' });
    }
  }]);

  return UsersController;
}();

;

exports.default = UsersController;