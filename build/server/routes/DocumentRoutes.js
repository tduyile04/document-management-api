'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _DocumentsController = require('../controllers/DocumentsController');

var _DocumentsController2 = _interopRequireDefault(_DocumentsController);

var _AuthenticationController = require('../controllers/AuthenticationController');

var _AuthenticationController2 = _interopRequireDefault(_AuthenticationController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

var DocumentRoutes = function DocumentRoutes(app) {
  app.use('/api/v1', router);

  router.use(_AuthenticationController2.default.authenticate);
  router.post('/documents', _DocumentsController2.default.createDocument);
  router.get('/documents', _DocumentsController2.default.retrieveDocuments);
  router.get('/documents/:id', _DocumentsController2.default.retrieveDocument);
  router.get('/search/documents', _DocumentsController2.default.searchDocument);
  router.get('/users/:id/documents/alone', _DocumentsController2.default.retrieveOnlyUserDocuments);
  router.put('/documents/:id', _DocumentsController2.default.updateDocument);
  router.delete('/documents/:id', _DocumentsController2.default.deleteDocument);
};

exports.default = DocumentRoutes;