'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = (0, _express2.default)();

app.use((0, _morgan2.default)('dev'));
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: false }));

require('./server/routes/user')(app);
require('./server/routes/documents')(app);

app.get('*', (req, res) => {
  res.status(200).send({ message: 'API endpoint is unavailable. Refer to documentation for available endpoints' });
});

const port = process.env.port || 5000;

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

exports.default = server;