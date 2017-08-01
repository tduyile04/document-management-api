'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _index = require('../constants/index');

var _index2 = _interopRequireDefault(_index);

var _validation = require('../utils/validation');

var _validation2 = _interopRequireDefault(_validation);

var _pagination = require('../utils/pagination');

var _pagination2 = _interopRequireDefault(_pagination);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Document = require('../models/').Document;

/**
 * Handles all the functionality for the document instances
 * @class DocumentController
 */

var DocumentController = function () {
	function DocumentController() {
		_classCallCheck(this, DocumentController);
	}

	_createClass(DocumentController, null, [{
		key: 'createDocument',

		/**
   * Creates a new document instance and saves it to 
   * the database
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns response object
   */
		value: function createDocument(req, res) {
			var userDetails = req.decoded;
			var title = _validation2.default.checkDataValidityOf(req.body.title);
			var content = _validation2.default.checkDataValidityOf(req.body.content);
			if (!title || !content) {
				res.status(400).json({ message: 'Document title and content cannot be empty' });
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
					return res.status(400).json({ message: 'Document with the same title already exists' });
				}
				return res.status(200).json(document);
			}).catch(function (error) {
				return res.status(400).json({ message: 'Error creating the documents. Check if invalid document access' });
			});
		}
		/**
   * Retrieves all document instances published by various
   * authors or users
    * @param {any} req request made from the client
    * @param {any} res response from the server
    * @returns response object
   */

	}, {
		key: 'retrieveDocuments',
		value: function retrieveDocuments(req, res) {
			var max = _index2.default.MAXIMUM;
			var documentList = [];
			var userDetails = req.decoded;
			var roleId = userDetails.userRole;
			var filteredDocumentList = [];
			if (roleId === _index2.default.ADMIN || roleId === _index2.default.SUPERADMIN) {
				if (req.query) {
					var offset = req.query.offset || 0,
					    limit = req.query.limit || max;
					Document.findAndCountAll({ offset: offset, limit: limit }).then(function (documents) {
						if (documents.rows.length === 0) {
							return res.status(500).json({ message: 'No documents retrieved for the page selected' });
						}
						documents.rows.forEach(function (document) {
							filteredDocumentList.push(document);
						});
						var totalDocumentCount = documents.count;
						var pageSize = _pagination2.default.getPageSize(limit, offset);
						var pageCount = _pagination2.default.getPageCount(totalDocumentCount, limit, offset);
						var currentPage = _pagination2.default.getCurrentPage(totalDocumentCount, limit, offset);
						var pageDetails = { totalDocumentCount: totalDocumentCount, pageSize: pageSize, pageCount: pageCount, currentPage: currentPage };
						return res.status(200).json({ filteredDocumentList: filteredDocumentList, pageDetails: pageDetails });
					});
				}
			} else {
				var _offset = req.query.offset || 0,
				    _limit = req.query.limit || max;
				Document.findAndCountAll({
					offset: _offset,
					limit: _limit,
					where: {
						$or: [{ access: { $eq: _index2.default.PUBLIC } }, {
							$and: [{ access: { $eq: _index2.default.ROLE } }, { userRoleId: { $eq: roleId } }] //ends $and
						}] //ends $or
					}
				}).then(function (documents) {
					if (documents.rows.length === 0) {
						return res.status(500).json({ message: 'No documents retrieved for the page selected' });
					}
					documents.rows.forEach(function (document) {
						filteredDocumentList.push(document);
					});
					var totalDocumentCount = documents.count;
					var pageSize = _pagination2.default.getPageSize(_limit, _offset);
					var pageCount = _pagination2.default.getPageCount(totalDocumentCount, _limit, _offset);
					var currentPage = _pagination2.default.getCurrentPage(totalDocumentCount, _limit, _offset);
					var pageDetails = { totalDocumentCount: totalDocumentCount, pageSize: pageSize, pageCount: pageCount, currentPage: currentPage };
					return res.status(200).json({ filteredDocumentList: filteredDocumentList, pageDetails: pageDetails });
				});
			}
		}
		/**
   * Retrieves a single document instance from the database
    * @param {any} req request made from the client
    * @param {any} res response from the server
    * @returns response object
   */

	}, {
		key: 'retrieveDocument',
		value: function retrieveDocument(req, res) {
			var userDetails = req.decoded;
			var roleId = userDetails.userRole;
			if (roleId === _index2.default.ADMIN || roleId === _index2.default.SUPERADMIN) {
				Document.findById(req.params.id).then(function (document) {
					if (document.length === 0) {
						return res.status(500).json({ message: 'Document does not exist in the database' });
					} else {
						return res.status(200).json(document);
					}
				});
			} else {
				Document.findById(req.params.id).then(function (document) {
					if (document.access === _index2.default.PUBLIC || document.access === _index2.default.ROLE && document.userRoleId === roleId) {
						return res.status(200).json(document);
					} else {
						return res.status(500).json({ message: 'Document either not in the database or requires admin priviledges' });
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

	}, {
		key: 'updateDocument',
		value: function updateDocument(req, res) {
			var userDetails = req.decoded;
			var roleId = userDetails.userRole;
			Document.update(req.body, {
				where: {
					$and: [{ id: req.params.id }, { userRoleId: { $eq: roleId } }]
				}
			}).then(function (updatedDocument) {
				if (updatedDocument[0] === 1) {
					return res.status(200).json({ message: 'Document has been succesfully updated' });
				} else {
					return res.status(400).json({ message: 'You cannot update another user\'s document or a document that does not exist' });
				}
			}).catch(function (error) {
				return res.status(500).json({ message: 'Error encoutered while updating. Please check your fields and try again' });
			});
		}
		/**
   * Deletes a document instance from the database
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns response object
   */

	}, {
		key: 'deleteDocument',
		value: function deleteDocument(req, res) {
			var userDetails = req.decoded;
			var roleId = userDetails.userRole;
			Document.findById(req.params.id).then(function (document) {
				if (roleId === _index2.default.SUPERADMIN || roleId === document.userRoleId) {
					Document.destroy({
						where: {
							id: req.params.id
						}
					}).then(function (deletedDocumentCount) {
						if (deletedDocumentCount === 1) {
							return res.status(200).json({ message: 'Document has been removed from the database successfully' });
						} else {
							return res.status(400).json({ message: 'You cannot delete another user\'s document or a document that does not exist' });
						}
					}).catch(function (error) {
						return res.status(500).json({ message: 'Error encountered while trying to delete document, Please try again', error: error });
					});
				} else {
					res.status(400).json({ message: 'You cannot delete another user\'s document' });
				}
			}).catch(function (error) {
				return res.status(400).json({ message: 'Error while retrieving the selected document' });
			});
		}
		/**
   * Gives an exhaustive list of all documents made by the specified
   * user/author saved in the database
    * @param {any} req request made from the client
    * @param {any} res response from the server
    * @returns response object
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
					return res.status(400).json({ message: 'No document found created by this user' });
				}
				return res.status(200).json(document);
			}).catch(function (error) {
				return res.status(400).json({ message: 'Eror created while trying to retrieve the user\'s document' });
			});
		}
		/**
   * Searches for matching user instance from the base
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns response object
   */

	}, {
		key: 'searchDocument',
		value: function searchDocument(req, res) {
			var filteredDocumentsList = [];
			var searchQuery = _validation2.default.checkDataValidityOf(req.query.q);
			Document.findAll({
				where: {
					title: {
						$like: searchQuery + '%'
					}
				}
			}).then(function (documents) {
				if (documents.length === 0) {
					return res.status(400).json({ message: 'No match found for the search query' });
				}
				if (documents.length === 1) {
					return res.status(200).json(documents);
				}
				documents.forEach(function (document) {
					filteredDocumentsList.push(document);
				});
				return res.status(200).json(filteredDocumentsList);
			}).catch(function (error) {
				return res.status(400).json({ message: 'Error occured while searching. Do try again!', error: error });
			});
		}
	}]);

	return DocumentController;
}();

exports.default = DocumentController;