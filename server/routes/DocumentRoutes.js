import express from 'express';
import DocumentsController from '../controllers/DocumentsController';
import AuthenticationController from '../controllers/AuthenticationController';

const router = express.Router();

const DocumentRoutes = (app) => {
  app.use('/api/v1', router);

  router.use(AuthenticationController.authenticate);
  router.post('/documents', DocumentsController.createDocument);
  router.get('/documents', DocumentsController.retrieveDocuments);
  router.get('/documents/:id', DocumentsController.retrieveDocument);
  router.get('/search/documents', DocumentsController.searchDocument);
  router.get('/users/:id/documents/alone', DocumentsController.retrieveOnlyUserDocuments);
  router.put('/documents/:id', DocumentsController.updateDocument);
  router.delete('/documents/:id', DocumentsController.deleteDocument);
};

export default DocumentRoutes;
