'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _UsersController = require('../controllers/UsersController');

var _UsersController2 = _interopRequireDefault(_UsersController);

var _AuthenticationController = require('../controllers/AuthenticationController');

var _AuthenticationController2 = _interopRequireDefault(_AuthenticationController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

var UserRoutes = function UserRoutes(app) {
  app.use('/api/v1', router);

  // Default route
  router.get('/', function (req, res) {
    res.status(200).send({
      message: 'Welcome to the Document Management System API'
    });
  });

  router.post('/users', _UsersController2.default.signUp);
  router.post('/users/login', _UsersController2.default.logIn);
  router.post('/users/logout', _UsersController2.default.logout);

  // Authentication middleware
  router.use(_AuthenticationController2.default.authenticate);

  router.get('/users', _UsersController2.default.getUsers);
  router.get('/users/:id', _UsersController2.default.getUser);
  router.put('/users/:id', _UsersController2.default.updateUser);
  router.delete('/users/:id', _UsersController2.default.deleteUser);
  router.get('/search/users/', _UsersController2.default.searchUser);
  router.get('/users/:id/documents/', _UsersController2.default.retrieveUserDocuments);
};

exports.default = UserRoutes;