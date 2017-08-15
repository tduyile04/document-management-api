'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _localStorage = require('local-storage');

var _localStorage2 = _interopRequireDefault(_localStorage);

var _Validation = require('../utils/Validation');

var _Validation2 = _interopRequireDefault(_Validation);

var _Constants = require('../constants/Constants');

var _Constants2 = _interopRequireDefault(_Constants);

var _Helper = require('../utils/Helper');

var _Helper2 = _interopRequireDefault(_Helper);

var _Repository = require('../utils/Repository');

var _Repository2 = _interopRequireDefault(_Repository);

var _models = require('../../server/models');

var _models2 = _interopRequireDefault(_models);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var User = _models2.default.User;
var Document = _models2.default.Document;

_dotenv2.default.config();

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
     * @returns {object} response object
     */
    value: function signUp(req, res) {
      var validatedUser = _Validation2.default.validateSignUp(req.body.name, req.body.email, req.body.password);
      var name = void 0,
          email = void 0,
          password = void 0;
      if (validatedUser) {
        name = validatedUser.name;
        email = validatedUser.email;
        password = validatedUser.password;
      } else {
        return res.status(400).json({
          message: 'User input cannot be empty and Email entry must be an email'
        });
      }
      var hashedPassword = _Helper2.default.hashPassword(password);
      var userDetails = {
        name: name,
        email: email,
        password: hashedPassword,
        roleId: req.body.roleId
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
        var token = _Helper2.default.getJWT(user.id, user.email, user.roleId);
        _localStorage2.default.set('token', token);
        return res.status(200).json({
          success: true,
          message: 'You have signed up successfully',
          token: token
        });
      }).catch(function (error) {
        return res.status(500).json({
          message: 'Error signing up user, check if invalid role value',
          error: error
        });
      });
    }
    /**
     * Logs in the creates user instance to the app if
     * successfully signed up
     * @param {any} req request made from the client
     * @param {any} res response from the server
     * @returns {object} response object
     */

  }, {
    key: 'logIn',
    value: function logIn(req, res) {
      var email = _Validation2.default.checkEmailValidityOf(req.body.email) ? _Validation2.default.checkEmailValidityOf(req.body.email) : false;
      var password = _Validation2.default.checkPasswordValidityOf(req.body.password) ? _Validation2.default.checkPasswordValidityOf(req.body.password) : false;
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
          var token = _Helper2.default.getJWT(user.id, user.email, user.roleId);
          _localStorage2.default.set('token', token);
          var userProfile = {
            id: user.id,
            name: user.name,
            email: user.email,
            roleId: user.roleId
          };
          res.status(200).json({ user: userProfile, token: token });
        } else {
          res.status(400).json({ message: 'Invalid Password' });
        }
      }).catch(function () {
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

  }, {
    key: 'getUsers',
    value: function getUsers(req, res) {
      var userDetails = req.decoded;
      if (userDetails.userRole !== _Constants2.default.ADMIN && userDetails.userRole !== _Constants2.default.SUPERADMIN) {
        return res.status(403).json({
          message: 'You do not have the permission to perform this action'
        });
      }
      if (req.query) {
        var offset = req.query && req.query.offset ? req.query.offset : 0,
            limit = req.query && req.query.limit ? req.query.limit : _Constants2.default.MAXIMUM;
        return User.findAndCountAll({ offset: offset, limit: limit }).then(function (users) {
          res.status(200).json(_Helper2.default.listContextDetails(users, limit, offset, 'User'));
        });
      }
    }

    /**
     * Retrieves a specific user data from the database
     * @param {any} req request made from the client
     * @param {any} res response from the server
     * @returns {object} response object
     */

  }, {
    key: 'getUser',
    value: function getUser(req, res) {
      var userDetails = req.decoded;
      if (userDetails.userRole !== _Constants2.default.ADMIN && userDetails.userRole !== _Constants2.default.SUPERADMIN) {
        return res.status(403).json({
          message: 'You do not have the permission to perform this action'
        });
      }
      _Repository2.default.findDataById(req.params.id, User, 'User').then(function (user) {
        return res.status(user.status).json(user.data);
      });
    }

    /**
     * Updates a specific user data attribute in the database
     * @param {any} req request made from the client
     * @param {any} res response from the server
     * @returns {object} response object
     */

  }, {
    key: 'updateUser',
    value: function updateUser(req, res) {
      var userDetails = req.decoded;
      if (userDetails.userRole !== _Constants2.default.SUPERADMIN) {
        var validatedUser = _Validation2.default.validateUpdateUser(req.body.name, req.body.email, req.body.password);
        if (!validatedUser) {
          return res.status(400).json({ message: 'Empty fields not allowed, fill them' });
        }
        var name = validatedUser.name;
        var email = validatedUser.email;
        var password = validatedUser.password;
        var id = req.params.id;
        var hashedPassword = _Helper2.default.hashPassword(password);
        var updateField = {
          name: name,
          email: email,
          password: hashedPassword
        };
        if (req.body.roleId) {
          return res.status(401).json({ message: 'You do not have admin priviledges' });
        } else if (userDetails.userId == req.params.id) {
          _Repository2.default.updateContextDetails(updateField, id, User, 'User').then(function (user) {
            return res.status(user.status).json(user.data);
          });
        } else {
          return res.status(401).json({ message: 'You cannot edit another user\'s document' });
        }
      } else {
        _Repository2.default.updateUserRoles(req.body.roleId, req.params.id, User, 'User').then(function (user) {
          return res.status(user.status).json(user.data);
        });
      }
    }

    /**
     * Deletes a user instance from the database
     * @param {any} req request made from the client
     * @param {any} res response from the server
     * @returns {object} response object
     */

  }, {
    key: 'deleteUser',
    value: function deleteUser(req, res) {
      var userDetails = req.decoded;
      if (userDetails.userRole !== _Constants2.default.SUPERADMIN) {
        return res.status(403).json({
          message: 'You do not have the permission to perform this action'
        });
      }
      _Repository2.default.deleteContextInstance(User, 'User', req.params.id).then(function (user) {
        return res.status(user.status).json(user.data);
      });
    }
    /**
     * Searches for matching user instance from the base
     * @param {any} req request made from the client
     * @param {any} res response from the server
     * @returns {object} response object
     */

  }, {
    key: 'searchUser',
    value: function searchUser(req, res) {
      var userDetails = req.decoded;
      if (userDetails.userRole !== _Constants2.default.ADMIN && userDetails.userRole !== _Constants2.default.SUPERADMIN) {
        return res.status(403).json({
          message: 'You do not have the permission to perform this action'
        });
      }
      var filteredUsersList = [];
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
          return res.status(404).json({ message: 'No match found for the search query' });
        }
        users.forEach(function (user) {
          filteredUsersList.push(user);
        });
        return res.status(200).json(filteredUsersList);
      }).catch(function () {
        return res.status(400).json({
          message: 'Error occured while searching. Do try again!'
        });
      });
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

  }, {
    key: 'retrieveUserDocuments',
    value: function retrieveUserDocuments(req, res) {
      var userDetails = req.decoded;
      var userEmail = userDetails.userEmail;
      var roleId = userDetails.userRole;
      User.findById(req.params.id).then(function (user) {
        if (user) {
          if (roleId === _Constants2.default.ADMIN || roleId === _Constants2.default.SUPERADMIN || userEmail === user.email) {
            User.findAll({
              where: {
                id: req.params.id
              },
              include: [{
                model: Document
              }]
            }).then(function (allUser) {
              res.status(200).json(allUser);
            }).catch(function () {
              res.status(400).json({ message: 'Error while getting data from the database' });
            });
          } else {
            res.status(400).json({
              message: 'You do not have admin privledges to view this user document'
            });
          }
        } else {
          res.status(400).json({ message: 'The user does not exist in the database' });
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

  }, {
    key: 'logout',
    value: function logout(req, res) {
      _localStorage2.default.clear();
      res.status(200).json({ message: 'User successfully logged out' });
    }
  }]);

  return UsersController;
}();

exports.default = UsersController;