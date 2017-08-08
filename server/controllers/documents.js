import Constants from '../constants/index';
import Validation from '../utils/validation';
import Helper from '../utils/helper';
import Repository from '../utils/repository';

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
   * @return {object} response object
   */
  static createDocument(req, res) {
    const userDetails = req.decoded;
    const title = Validation.checkDataValidityOf(req.body.title);
    const content = Validation.checkDataValidityOf(req.body.content);
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
    }).catch(() => res.status(400).json({
      message: 'Error encountered creating the documents. Check if invalid document access'
    }));
  }
  /**
   * Retrieves all document instances published by various
   * authors or users
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns {object} response object
   */
  static retrieveDocuments(req, res) {
    const userDetails = req.decoded;
    const roleId = userDetails.userRole;
    if (roleId === Constants.ADMIN || roleId === Constants.SUPERADMIN) {
      if (req.query) {
        const offset = req.query.offset || 0,
          limit = req.query.limit || Constants.MAXIMUM;
        Document.findAndCountAll({ offset, limit })
          .then(documents => res.status(200).json(Helper.listContextDetails(documents, limit, offset, 'Documents')));
      }
    } else {
      const offset = req.query && req.query.offset ? req.query.offset : 0,
        limit = req.query && req.query.limit ? req.query.limit : Constants.MAXIMUM;
      Document.findAndCountAll({
        offset,
        limit,
        where: {
          $or: [
            { access: { $eq: Constants.PUBLIC } },
            {
              $and: [
                { access: { $eq: Constants.ROLE } },
                { userRoleId: { $eq: roleId } }
              ] // ends $and
            }
          ]// ends $or
        },
      })
        .then(documents => res.status(200).json(Helper.listContextDetails(documents, limit, offset)));
    }
  }
  /**
   * Retrieves a single document instance from the database
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns {object} response object
   */
  static retrieveDocument(req, res) {
    const userDetails = req.decoded;
    const roleId = userDetails.userRole;
    if (roleId === Constants.ADMIN || roleId === Constants.SUPERADMIN) {
      Repository.findDataById(req.params.id, Document, 'Document')
        .then(document => res.status(document.status).json(document.data));
    } else {
      Repository.findDataById(req.params.id, Document, 'Document')
        .then((document) => {
          if (document.data.access === Constants.PUBLIC ||
          (document.data.access === Constants.ROLE && document.data.userRoleId === roleId)) {
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
  static updateDocument(req, res) {
    const userDetails = req.decoded;
    const userId = userDetails.userId;
    const roleId = userDetails.userRole;
    const title = req.body.title;
    const access = req.body.access;
    const content = req.body.content;
    const updateField = { title, content, access };
    Repository.findDataById(req.params.id, Document, 'Document')
      .then((document) => {
        if (userId === document.data.userId || roleId === document.data.userRoleId) {
          Repository.updateContextDetails(updateField, req.params.id, Document, 'Document')
            .then((newDocument) => {
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
  static deleteDocument(req, res) {
    const userDetails = req.decoded;
    const roleId = userDetails.userRole;
    const userId = userDetails.userId;
    Repository.findDataById(req.params.id, Document, 'Document')
      .then((document) => {
        if (roleId === Constants.SUPERADMIN || userId === document.data.userId) {
          Repository.deleteContextInstance(Document, 'Document', req.params.id)
            .then((deletedDocument) => {
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
  static retrieveOnlyUserDocuments(req, res) {
    Document.findAll({
      where: {
        userId: req.params.id
      }
    })
      .then((document) => {
        if (document.length === 0) {
          return res.status(404).json({ message: 'No document found created by this user' });
        }
        return res.status(200).json(document);
      })
      .catch(() => res.status(400).json({
        message: 'Eror encountered while trying to retrieve the user\'s document'
      }));
  }
  /**
   * Searches for matching user instance from the base
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns {object} response object
   */
  static searchDocument(req, res) {
    const filteredDocumentsList = [];
    const searchQuery = Validation.checkDataValidityOf(req.query.q);
    Document.findAll({
      where: {
        title: {
          $like: `${searchQuery}%`
        }
      }
    })
      .then((documents) => {
        if (documents.length === 0) {
          return res.status(404).json({ message: 'No match found for the search query' });
        }
        if (documents.length === 1) {
          return res.status(200).json(documents);
        }
        documents.forEach((document) => {
          filteredDocumentsList.push(document);
        });
        return res.status(200).json(filteredDocumentsList);
      })
      .catch(() => res.status(500).json({ message: 'Error occured while searching. Do try again!' }));
  }
}

export default DocumentController;
