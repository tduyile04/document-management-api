import express from 'express';
import UsersController from '../controllers/UsersController';
import AuthenticationController from '../controllers/AuthenticationController';

const router = express.Router();

const UserRoutes = (app) => {
  app.use('/api/v1', router);

  // Default route
  router.get('/', (req, res) => {
    res.status(200).send({
      message: 'Welcome to the Document Management System API'
    });
  });

  router.post('/users', UsersController.signUp);
  router.post('/users/login', UsersController.logIn);
  router.post('/users/logout', UsersController.logout);

  // Authentication middleware
  router.use(AuthenticationController.authenticate);

  router.get('/users', UsersController.getUsers);
  router.get('/user/:id', UsersController.getUser);
  router.put('/user/:id', UsersController.updateUser);
  router.delete('/user/:id', UsersController.deleteUser);
  router.get('/search/users/', UsersController.searchUser);
  router.get('/users/:id/documents/', UsersController.retrieveUserDocuments);
};

export default UserRoutes;
