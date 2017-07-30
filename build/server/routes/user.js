'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _users = require('../controllers/users');

var _users2 = _interopRequireDefault(_users);

var _authenticate = require('../controllers/authenticate');

var _authenticate2 = _interopRequireDefault(_authenticate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

module.exports = function (app) {
  app.use('/api/v1', router);

  //Default route
  router.get('/', function (req, res) {
    res.status(200).send({
      message: 'Welcome to the Document Management System API'
    });
  });

  router.post('/users', _users2.default.signUp);
  router.post('/users/login', _users2.default.logIn);

  //Authentication middleware
  router.use(_authenticate2.default.authenticate);

  router.get('/users', _users2.default.getUsers);
  router.get('/user/:id', _users2.default.getUser);
  router.put('/user/:id', _users2.default.updateUser);
  router.delete('/user/:id', _users2.default.deleteUser);
  router.get('/search/users/', _users2.default.searchUser);
  router.get('/users/:id/documents/', _users2.default.retrieveUserDocuments);
};