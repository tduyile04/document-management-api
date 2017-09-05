import Constants from '../constants/Constants';
import Validation from '../utils/Validation';
import Helper from '../utils/Helper';
import Repository from '../utils/Repository';
import models from '../../server/models';

const Document = models.Document;

/**
 * Handles all the functionality for the document instances
 * @class DocumentController
 */
class DocumentsController {
  /**
   * Creates a new document instance and saves it to 
   * the database
   * @param {object} req request made from the client
   * @param {object} res response from the server
   * @return {object} response object
   */
  static createDocument(req, res) {
    const userDetails = req.decoded;
    const title = Validation.checkDataValidityOf(req.body.title);
    const content = Validation.checkDataValidityOf(req.body.content);
    if (!title || !content) {
      return res.status(400).json({
        message: Validation.checkCreateDocumentValidity(title, content)
      });
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
        return res.status(409).json({
          message: 'Document with the same title already exists'
        });
      }
      return res.status(201).json(document);
    }).catch(() => res.status(500).json({
      message: 'Error encountered while creating the documents'
    }));
  }
  /**
   * Retrieves all document instances published by various
   * authors or users
   * @param {object} req request made from the client
   * @param {object} res response from the server
   * @returns {object} response object
   */
  static retrieveDocuments(req, res) {
    const userDetails = req.decoded;
    const roleId = userDetails.userRole;
    const id = userDetails.userId;
    if (roleId === Constants.ADMIN || roleId === Constants.SUPERADMIN) {
      if (req.query) {
        const offset = req.query.offset || 0;
        const limit = req.query.limit || Constants.MAXIMUM;
        Document.findAndCountAll({ offset, limit })
          .then(documents => res.status(200).json(
            Helper.listContextDetails(documents, limit, offset, 'documents')
          ));
      }
    } else {
      const offset = req.query && req.query.offset ? req.query.offset : 0;
      const limit = req.query && req.query.limit
        ? req.query.limit
        : Constants.MAXIMUM;
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
            },
            {
              $and: [
                { access: { $eq: Constants.PRIVATE } },
                { userId: { $eq: id } }
              ] // ends $and
            }
          ]// ends $or
        },
      })
        .then(documents => res.status(200).json(
          Helper.listContextDetails(documents, limit, offset, 'documents')
        ))
        .catch(() => {
          res.status(500).json({
            message: 'Error encountered retrieving all documents'
          });
        });
    }
  }
  /**
   * Retrieves a single document instance from the database
   * @param {object} req request made from the client
   * @param {object} res response from the server
   * @returns {object} response object
   */
  static retrieveDocument(req, res) {
    const userDetails = req.decoded;
    const roleId = userDetails.userRole;
    const id = userDetails.userId;
    if (roleId === Constants.ADMIN || roleId === Constants.SUPERADMIN) {
      Repository.findDataById(req.params.id, Document, 'documents')
        .then(document => res.status(document.status).json(document.data));
    } else {
      Repository.findDataById(req.params.id, Document, 'documents')
        .then((document) => {
          if (document.data.access === Constants.PUBLIC ||
          (document.data.access === Constants.ROLE
            && document.data.userRoleId === roleId) ||
          (document.data.access === Constants.PRIVATE
            && document.data.userId === id)) {
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
   * @param {object} req request made from the client
   * @param {object} res response from the server
   * @returns {object} response object
   */
  static updateDocument(req, res) {
    const userDetails = req.decoded;
    const userId = userDetails.userId;
    const roleId = userDetails.userRole;
    const title = req.body.title;
    const access = req.body.access;
    const content = req.body.content;
    const updateField = {
      title,
      content,
      access
    };
    Repository.findDataById(req.params.id, Document, 'documents')
      .then((document) => {
        if (userId === document.data.userId
          || roleId === document.data.userRoleId) {
          Repository.updateContextDetails(
            updateField, req.params.id, Document, 'documents'
          ).then((newDocument) => {
            res.status(newDocument.status).json(newDocument.data);
          });
        } else {
          res.status(403).json({
            message:
            'You cant update another user\'s doc or a doc that doesnt exist'
          });
        }
      });
  }

  /**
   * Deletes a document instance from the database
   * @param {object} req request made from the client
   * @param {object} res response from the server
   * @returns {object} response object
   */
  static deleteDocument(req, res) {
    const userDetails = req.decoded;
    const roleId = userDetails.userRole;
    const userId = userDetails.userId;
    Repository.findDataById(req.params.id, Document, 'documents')
      .then((document) => {
        if (roleId === Constants.SUPERADMIN
          || userId === document.data.userId) {
          Repository.deleteContextInstance(Document, 'documents', req.params.id)
            .then((deletedDocument) => {
              res.status(deletedDocument.status).json(deletedDocument.data);
            });
        } else {
          res.status(400).json({
            message: 'You cannot delete another user\'s document'
          });
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
          return res.status(404).json({
            message: 'No document found created by this user'
          });
        }
        return res.status(200).json(document);
      })
      .catch(() => res.status(500).json({
        message: 'Eror encountered while retrieving the user\'s document'
      }));
  }
  /**
   * Searches for matching user instance from the base
   * @param {object} req request made from the client
   * @param {object} res response from the server
   * @returns {object} response object
   */
  static searchDocument(req, res) {
    const userDetails = req.decoded;
    const roleId = userDetails.userRole;
    const userId = userDetails.userId;
    let filteredDocumentsList = [];
    const searchQuery = Validation.checkDataValidityOf(req.query.q);
    Document.findAll({
      where: {
        title: {
          $like: `%${searchQuery}%`
        }
      }
    })
      .then((documents) => {
        if (roleId === Constants.REGULAR) {
          filteredDocumentsList = documents
            .filter(document => userId === document.userId);
          return res.status(200).json(filteredDocumentsList);
        } else if (roleId === Constants.SUPERADMIN
          || roleId === Constants.ADMIN) {
          if (documents.length === 0) {
            return res.status(404).json({
              message: 'No match found for the search query'
            });
          }
          documents.forEach((document) => {
            filteredDocumentsList.push(document);
          });
          return res.status(200).json(filteredDocumentsList);
        }
        return res.status(404).json({
          message: 'No match found for the search query'
        });
      })
      .catch(() => res.status(500).json({
        message: 'Error occured while searching. Do try again!'
      }));
  }
}

export default DocumentsController;
