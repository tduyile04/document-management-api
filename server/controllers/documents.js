import Constants from '../constants/index';
import Validation from '../utils/validation';
import Pagination from '../utils/pagination';

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
		const title = Validation.checkDataValidityOf(req.body.title);
		const content = Validation.checkDataValidityOf(req.body.content);
		if (!title || !content) {
			res.status(400).json({ message: 'Document title and content cannot be empty' });
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
        return res.status(400).json({ message: 'Document with the same title already exists' });
      }
      return res.status(200).json(document);
		}).catch((error) => {
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
	static retrieveDocuments(req, res) {
		const max = Constants.MAXIMUM;
		const documentList = [];
		const userDetails = req.decoded;
		const roleId = userDetails.userRole;
		const filteredDocumentList = [];
		if (roleId === Constants.ADMIN || roleId === Constants.SUPERADMIN) {
			if(req.query) {
				const offset = req.query.offset || 0,
							limit = req.query.limit || max;
				Document.findAndCountAll({ offset, limit})
				.then((documents) => {
					if(documents.rows.length === 0) {
						return res.status(500).json({ message: 'No documents retrieved for the page selected' });
					}
					documents.rows.forEach((document) => {
						filteredDocumentList.push(document);
					});
					const totalDocumentCount = documents.count;
					const pageSize = Pagination.getPageSize(limit, offset);
					const pageCount = Pagination.getPageCount(totalDocumentCount, limit, offset);
					const currentPage = Pagination.getCurrentPage(totalDocumentCount, limit, offset);
					const pageDetails = { totalDocumentCount, pageSize, pageCount, currentPage };
					return res.status(200).json({ filteredDocumentList, pageDetails });
				});
			}
		} else {
			const offset = req.query.offset || 0,
						limit = req.query.limit || max;
			Document.findAndCountAll({
				offset,
				limit,
				where: {
					$or: [
						{ access: { $eq: Constants.PUBLIC }},
						{
							$and: [
								{	access: { $eq: Constants.ROLE	}	},
								{	userRoleId: { $eq: roleId }	}
							] //ends $and
						}
					]//ends $or
				},
			})
			.then((documents) => {
				if(documents.rows.length === 0) {
					return res.status(500).json({ message: 'No documents retrieved for the page selected' });
				}
				documents.rows.forEach((document) => {
					filteredDocumentList.push(document);
				});
				const totalDocumentCount = documents.count;
				const pageSize = Pagination.getPageSize(limit, offset);
				const pageCount = Pagination.getPageCount(totalDocumentCount, limit, offset);
				const currentPage = Pagination.getCurrentPage(totalDocumentCount, limit, offset);
				const pageDetails = { totalDocumentCount, pageSize, pageCount, currentPage };
				return res.status(200).json({ filteredDocumentList, pageDetails });
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
		if (roleId === Constants.ADMIN || roleId === Constants.SUPERADMIN) {
			Document.findById(req.params.id).then((document) => {
				if(document.length === 0) {
					return res.status(500).json({ message: 'Document does not exist in the database' });
				} else {
					return res.status(200).json(document);
				}
			});
		} else {
			Document.findById(req.params.id).then((document) => {
				if(document.access === Constants.PUBLIC || (document.access === Constants.ROLE && document.userRoleId === roleId)) {
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
	static updateDocument(req, res) {
		const userDetails = req.decoded;
		const roleId = userDetails.userRole;
		Document.update(req.body, {
			where: {
				$and: [
					{ id: req.params.id },
					{ userRoleId: { $eq: roleId } }
				]
			}
		})
		.then((updatedDocument) => {
			if (updatedDocument[0] === 1) {
        return res.status(200).json({ message: 'Document has been succesfully updated' });
      } else {
        return res.status(400).json({ message: 'You cannot update another user\'s document or a document that does not exist' });
      }
    })
    .catch((error) => {
      return res.status(500).json({ message: 'Error encoutered while updating. Please check your fields and try again' });
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
		Document.findById(req.params.id)
		.then((document) => {
			if (roleId === Constants.SUPERADMIN ||roleId === document.userRoleId ) {
				Document.destroy({
					where: {
						id: req.params.id,
					}
				})
				.then((deletedDocumentCount) => {
					if (deletedDocumentCount === 1) {
						return res.status(200).json({ message: 'Document has been removed from the database successfully' });
					} else {
						return res.status(400).json({ message: 'You cannot delete another user\'s document or a document that does not exist' });
					}
				})
				.catch((error) => {
					return res.status(500).json({ message: 'Error encountered while trying to delete document, Please try again', error });
				});
			} else {
				res.status(400).json({ message: 'You cannot delete another user\'s document' })
			}
		})
		.catch(error => res.status(400).json({ message: 'Error while retrieving the selected document' }));

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
			where:{
				userId: req.params.id
			}
		})
    .then((document) => {
      if(document.length === 0) {
        return res.status(400).json({ message: 'No document found created by this user' });
      }
      return res.status(200).json(document);
    })
    .catch((error) => {
      return res.status(400).json({ message: 'Eror created while trying to retrieve the user\'s document' });
    })
	}
  /**
   * Searches for matching user instance from the base
   * @param {any} req request made from the client
   * @param {any} res response from the server
   * @returns response object
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
      if(documents.length === 0) {
        return res.status(400).json({ message: 'No match found for the search query' });
      }
      if (documents.length === 1) {
        return res.status(200).json(documents);
      }
      documents.forEach((document) => {
        filteredDocumentsList.push(document);
      })
      return res.status(200).json(filteredDocumentsList);
    })
    .catch((error) => {
      return res.status(400).json({ message: 'Error occured while searching. Do try again!', error });
    })
	}
}

export default DocumentController;
