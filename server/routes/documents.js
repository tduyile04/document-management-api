import express from 'express';
import documentController from '../controllers/documents';
import authenticateController from '../controllers/authenticate';

const router = express.Router();

module.exports = (app) => {
  app.use('/api/v1', router);

  router.use(authenticateController.authenticate);
  router.post('/documents', documentController.createDocument);
  router.get('/documents', documentController.retrieveDocuments);
  router.get('/documents/:id', documentController.retrieveDocument);
  router.get('/search/documents', documentController.searchDocument);
  router.get('/users/:id/documents/alone', documentController.retrieveOnlyUserDocuments);
  router.put('/documents/:id', documentController.updateDocument);
  router.delete('/documents/:id', documentController.deleteDocument);
}