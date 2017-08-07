'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _documents = require('../controllers/documents');

var _documents2 = _interopRequireDefault(_documents);

var _authenticate = require('../controllers/authenticate');

var _authenticate2 = _interopRequireDefault(_authenticate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express2.default.Router();

module.exports = app => {
  app.use('/api/v1', router);

  router.use(_authenticate2.default.authenticate);
  router.post('/documents', _documents2.default.createDocument);
  router.get('/documents', _documents2.default.retrieveDocuments);
  router.get('/documents/:id', _documents2.default.retrieveDocument);
  router.get('/search/documents', _documents2.default.searchDocument);
  router.get('/users/:id/documents/alone', _documents2.default.retrieveOnlyUserDocuments);
  router.put('/documents/:id', _documents2.default.updateDocument);
  router.delete('/documents/:id', _documents2.default.deleteDocument);
};