import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import path from 'path';
import UserRoutes from './server/routes/UserRoutes';
import DocumentRoutes from './server/routes/DocumentRoutes';

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', express.static(path.resolve(__dirname, './../public')));

UserRoutes(app);
DocumentRoutes(app);

app.get('*', (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname, './../public', 'index.html'));
});

const port = parseInt(process.env.PORT, 10) || 5000;

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

export default server;
