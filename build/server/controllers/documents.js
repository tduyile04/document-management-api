'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('../constants/index');

var _index2 = _interopRequireDefault(_index);

var _validation = require('../utils/validation');

var _validation2 = _interopRequireDefault(_validation);

var _helper = require('../utils/helper');

var _helper2 = _interopRequireDefault(_helper);

var _repository = require('../utils/repository');

var _repository2 = _interopRequireDefault(_repository);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Document = require('../models/').Document;

/**
 * Handles all the functionality for the document instances
 * @class DocumentController
 */
class DocumentController {
  /**
   * Creates a new document instance and saves it to 
   * the database
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns response object
   */
  static createDocument(req, res) {
    const userDetails = req.decoded;
    const title = _validation2.default.checkDataValidityOf(req.body.title);
    const content = _validation2.default.checkDataValidityOf(req.body.content);
    if (!title || !content) {
      return res.status(400).json({ message: 'Document title and content cannot be empty' });
    }
    const documentDetails = {
      title,
      content,
      access: req.body.access,
      userId: userDetails.userId,
      userRoleId: userDetails.userRole
    };
    Document.findOrCreate({
      where: {
        title: req.body.title
      },
      defaults: documentDetails
    }).spread((document, created) => {
      if (!created) {
        return res.status(409).json({ message: 'Document with the same title already exists' });
      }
      return res.status(200).json(document);
    }).catch(error => {
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
   * @returns response object
   */
  static retrieveDocuments(req, res) {
    const userDetails = req.decoded;
    const roleId = userDetails.userRole;
    if (roleId === _index2.default.ADMIN || roleId === _index2.default.SUPERADMIN) {
      if (req.query) {
        const offset = req.query.offset || 0,
              limit = req.query.limit || _index2.default.MAXIMUM;
        Document.findAndCountAll({ offset, limit }).then(documents => {
          return res.status(200).json(_helper2.default.listContextDetails(documents, limit, offset, 'Documents'));
        });
      }
    } else {
      const offset = req.query && req.query.offset ? req.query.offset : 0,
            limit = req.query && req.query.limit ? req.query.limit : _index2.default.MAXIMUM;
      Document.findAndCountAll({
        offset,
        limit,
        where: {
          $or: [{ access: { $eq: _index2.default.PUBLIC } }, {
            $and: [{ access: { $eq: _index2.default.ROLE } }, { userRoleId: { $eq: roleId } }] //ends $and
          }] //ends $or
        }
      }).then(documents => {
        return res.status(200).json(_helper2.default.listContextDetails(documents, limit, offset));
      });
    }
  }
  /**
   * Retrieves a single document instance from the database
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns response object
   */
  static retrieveDocument(req, res) {
    const userDetails = req.decoded;
    const roleId = userDetails.userRole;
    if (roleId === _index2.default.ADMIN || roleId === _index2.default.SUPERADMIN) {
      _repository2.default.findDataById(req.params.id, Document, 'Document').then(document => {
        return res.status(document.status).json(document.data);
      });
    } else {
      _repository2.default.findDataById(req.params.id, Document, 'Document').then(document => {
        if (document.data.access === _index2.default.PUBLIC || document.data.access === _index2.default.ROLE && document.data.userRoleId === roleId) {
          return res.status(document.status).json(document.data);
        } else {
          return res.status(403).json({
            message: 'Document requires admin priviledges'
          });
        }
      });
    }
  }
  /**
   * Updates the specified document attribute in the database
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns response object
   */
  static updateDocument(req, res) {
    const userDetails = req.decoded;
    const userId = userDetails.userId;
    const roleId = userDetails.userRole;
    const title = req.body.title;
    const access = req.body.access;
    const content = req.body.content;
    const updateField = { title, content, access };
    _repository2.default.findDataById(req.params.id, Document, 'Document').then(document => {
      if (userId === document.data.userId || roleId === document.data.userRoleId) {
        _repository2.default.updateContextDetails(updateField, req.params.id, Document, 'Document').then(newDocument => {
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
   * @returns response object
   */
  static deleteDocument(req, res) {
    const userDetails = req.decoded;
    const roleId = userDetails.userRole;
    const userId = userDetails.userId;
    _repository2.default.findDataById(req.params.id, Document, 'Document').then(document => {
      if (roleId === _index2.default.SUPERADMIN || userId === document.data.userId) {
        _repository2.default.deleteContextInstance(Document, 'Document', req.params.id).then(deletedDocument => {
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
   * @returns response object
   */
  static retrieveOnlyUserDocuments(req, res) {
    Document.findAll({
      where: {
        userId: req.params.id
      }
    }).then(document => {
      if (document.length === 0) {
        return res.status(404).json({ message: 'No document found created by this user' });
      }
      return res.status(200).json(document);
    }).catch(error => {
      return res.status(400).json({
        message: 'Eror encountered while trying to retrieve the user\'s document'
      });
    });
  }
  /**
   * Searches for matching user instance from the base
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns response object
   */
  static searchDocument(req, res) {
    const filteredDocumentsList = [];
    const searchQuery = _validation2.default.checkDataValidityOf(req.query.q);
    Document.findAll({
      where: {
        title: {
          $like: `${searchQuery}%`
        }
      }
    }).then(documents => {
      if (documents.length === 0) {
        return res.status(404).json({ message: 'No match found for the search query' });
      }
      if (documents.length === 1) {
        return res.status(200).json(documents);
      }
      documents.forEach(document => {
        filteredDocumentsList.push(document);
      });
      return res.status(200).json(filteredDocumentsList);
    }).catch(error => {
      return res.status(500).json({ message: 'Error occured while searching. Do try again!' });
    });
  }
}

exports.default = DocumentController;