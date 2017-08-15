'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Constants = require('../constants/Constants');

var _Constants2 = _interopRequireDefault(_Constants);

var _Validation = require('../utils/Validation');

var _Validation2 = _interopRequireDefault(_Validation);

var _Helper = require('../utils/Helper');

var _Helper2 = _interopRequireDefault(_Helper);

var _Repository = require('../utils/Repository');

var _Repository2 = _interopRequireDefault(_Repository);

var _models = require('../../server/models');

var _models2 = _interopRequireDefault(_models);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Document = _models2.default.Document;

/**
 * Handles all the functionality for the document instances
 * @class DocumentController
 */

var DocumentsController = function () {
  function DocumentsController() {
    _classCallCheck(this, DocumentsController);
  }

  _createClass(DocumentsController, null, [{
    key: 'createDocument',

    /**
     * Creates a new document instance and saves it to 
     * the database
     * @param {any} req request made from the client
     * @param {any} res response from the server
     * @return {object} response object
     */
    value: function createDocument(req, res) {
      var userDetails = req.decoded;
      var title = _Validation2.default.checkDataValidityOf(req.body.title);
      var content = _Validation2.default.checkDataValidityOf(req.body.content);
      if (!title || !content) {
        return res.status(400).json({ message: 'Document title and content cannot be empty' });
      }
      var documentDetails = {
        title: title,
        content: content,
        access: req.body.access,
        userId: userDetails.userId,
        userRoleId: userDetails.userRole
      };
      Document.findOrCreate({
        where: {
          title: req.body.title
        },
        defaults: documentDetails
      }).spread(function (document, created) {
        if (!created) {
          return res.status(409).json({ message: 'Document with the same title already exists' });
        }
        return res.status(200).json(document);
      }).catch(function () {
        return res.status(400).json({
          message: 'Error encountered creating the documents. Check if invalid document access'
        });
      });
    }
    /**
     * Retrieves all document instances published by various
     * authors or users
     * @param {any} req request made from the client
     * @param {any} res response from the server
     * @returns {object} response object
     */

  }, {
    key: 'retrieveDocuments',
    value: function retrieveDocuments(req, res) {
      var userDetails = req.decoded;
      var roleId = userDetails.userRole;
      if (roleId === _Constants2.default.ADMIN || roleId === _Constants2.default.SUPERADMIN) {
        if (req.query) {
          var offset = req.query.offset || 0,
              limit = req.query.limit || _Constants2.default.MAXIMUM;
          Document.findAndCountAll({ offset: offset, limit: limit }).then(function (documents) {
            return res.status(200).json(_Helper2.default.listContextDetails(documents, limit, offset, 'Documents'));
          });
        }
      } else {
        var _offset = req.query && req.query.offset ? req.query.offset : 0,
            _limit = req.query && req.query.limit ? req.query.limit : _Constants2.default.MAXIMUM;
        Document.findAndCountAll({
          offset: _offset,
          limit: _limit,
          where: {
            $or: [{ access: { $eq: _Constants2.default.PUBLIC } }, {
              $and: [{ access: { $eq: _Constants2.default.ROLE } }, { userRoleId: { $eq: roleId } }] // ends $and
            }] // ends $or
          }
        }).then(function (documents) {
          return res.status(200).json(_Helper2.default.listContextDetails(documents, _limit, _offset, 'Documents'));
        });
      }
    }
    /**
     * Retrieves a single document instance from the database
     * @param {any} req request made from the client
     * @param {any} res response from the server
     * @returns {object} response object
     */

  }, {
    key: 'retrieveDocument',
    value: function retrieveDocument(req, res) {
      var userDetails = req.decoded;
      var roleId = userDetails.userRole;
      if (roleId === _Constants2.default.ADMIN || roleId === _Constants2.default.SUPERADMIN) {
        _Repository2.default.findDataById(req.params.id, Document, 'Document').then(function (document) {
          return res.status(document.status).json(document.data);
        });
      } else {
        _Repository2.default.findDataById(req.params.id, Document, 'Document').then(function (document) {
          if (document.data.access === _Constants2.default.PUBLIC || document.data.access === _Constants2.default.ROLE && document.data.userRoleId === roleId) {
            return res.status(document.status).json(document.data);
          }
          return res.status(403).json({
            message: 'Document requires admin priviledges'
          });
        });
      }
    }
    /**
     * Updates the specified document attribute in the database
     * @param {any} req request made from the client
     * @param {any} res response from the server
     * @returns {object} response object
     */

  }, {
    key: 'updateDocument',
    value: function updateDocument(req, res) {
      var userDetails = req.decoded;
      var userId = userDetails.userId;
      var roleId = userDetails.userRole;
      var title = req.body.title;
      var access = req.body.access;
      var content = req.body.content;
      var updateField = { title: title, content: content, access: access };
      _Repository2.default.findDataById(req.params.id, Document, 'Document').then(function (document) {
        if (userId === document.data.userId || roleId === document.data.userRoleId) {
          _Repository2.default.updateContextDetails(updateField, req.params.id, Document, 'Document').then(function (newDocument) {
            res.status(newDocument.status).json(newDocument.data);
          });
        } else {
          res.status(403).json({
            message: 'You cannot update another user\'s document or a document that does not exist'
          });
        }
      });
    }

    /**
     * Deletes a document instance from the database
     * @param {any} req request made from the client
     * @param {any} res response from the server
     * @returns {object} response object
     */

  }, {
    key: 'deleteDocument',
    value: function deleteDocument(req, res) {
      var userDetails = req.decoded;
      var roleId = userDetails.userRole;
      var userId = userDetails.userId;
      _Repository2.default.findDataById(req.params.id, Document, 'Document').then(function (document) {
        if (roleId === _Constants2.default.SUPERADMIN || userId === document.data.userId) {
          _Repository2.default.deleteContextInstance(Document, 'Document', req.params.id).then(function (deletedDocument) {
            res.status(deletedDocument.status).json(deletedDocument.data);
          });
        } else {
          res.status(400).json({ message: 'You cannot delete another user\'s document' });
        }
      });
    }
    /**
     * Gives an exhaustive list of all documents made by the specified
     * user/author saved in the database
     * @param {any} req request made from the client
     * @param {any} res response from the server
     * @returns {object} response object
     */

  }, {
    key: 'retrieveOnlyUserDocuments',
    value: function retrieveOnlyUserDocuments(req, res) {
      Document.findAll({
        where: {
          userId: req.params.id
        }
      }).then(function (document) {
        if (document.length === 0) {
          return res.status(404).json({ message: 'No document found created by this user' });
        }
        return res.status(200).json(document);
      }).catch(function () {
        return res.status(400).json({
          message: 'Eror encountered while trying to retrieve the user\'s document'
        });
      });
    }
    /**
     * Searches for matching user instance from the base
     * @param {any} req request made from the client
     * @param {any} res response from the server
     * @returns {object} response object
     */

  }, {
    key: 'searchDocument',
    value: function searchDocument(req, res) {
      var filteredDocumentsList = [];
      var searchQuery = _Validation2.default.checkDataValidityOf(req.query.q);
      Document.findAll({
        where: {
          title: {
            $like: searchQuery + '%'
          }
        }
      }).then(function (documents) {
        if (documents.length === 0) {
          return res.status(404).json({ message: 'No match found for the search query' });
        }
        if (documents.length === 1) {
          return res.status(200).json(documents);
        }
        documents.forEach(function (document) {
          filteredDocumentsList.push(document);
        });
        return res.status(200).json(filteredDocumentsList);
      }).catch(function () {
        return res.status(500).json({ message: 'Error occured while searching. Do try again!' });
      });
    }
  }]);

  return DocumentsController;
}();

exports.default = DocumentsController;