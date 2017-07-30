import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require('./server/routes/user')(app);
require('./server/routes/documents')(app);

app.get('*', (req, res) => {
  res.status(200).send({message: 'APi endpoint is unavailable. Refer to documentation for available endpoints'});
});

const port = process.env.port || 5000;

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

export default server;