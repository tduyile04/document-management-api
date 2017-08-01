import express from 'express';
import userController from '../controllers/users';
import authenticateController from '../controllers/authenticate';

const router = express.Router();

module.exports = (app) => {
  app.use('/api/v1', router);

  //Default route
  router.get('/', (req, res) => {
    res.status(200).send({
      message: 'Welcome to the Document Management System API'
    });
  });

  router.post('/users', userController.signUp);
  router.post('/users/login', userController.logIn);
  router.post('/users/logout', userController.logout);

  //Authentication middleware
  router.use(authenticateController.authenticate)

  router.get('/users', userController.getUsers);
  router.get('/user/:id', userController.getUser);
  router.put('/user/:id', userController.updateUser);
  router.delete('/user/:id', userController.deleteUser);
  router.get('/search/users/', userController.searchUser);
  router.get('/users/:id/documents/', userController.retrieveUserDocuments);
}