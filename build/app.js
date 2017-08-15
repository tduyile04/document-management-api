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

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _UserRoutes = require('./server/routes/UserRoutes');

var _UserRoutes2 = _interopRequireDefault(_UserRoutes);

var _DocumentRoutes = require('./server/routes/DocumentRoutes');

var _DocumentRoutes2 = _interopRequireDefault(_DocumentRoutes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config();

var app = (0, _express2.default)();

app.use((0, _morgan2.default)('dev'));
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: false }));

app.use('/', _express2.default.static(_path2.default.resolve(__dirname, './../public')));

(0, _UserRoutes2.default)(app);
(0, _DocumentRoutes2.default)(app);

app.get('*', function (req, res) {
  res.status(200).sendFile(_path2.default.resolve(__dirname, './../public', 'index.html'));
});

var port = parseInt(process.env.PORT, 10) || 5000;

var server = app.listen(port, function () {
  console.log('Listening on port ' + port);
});

exports.default = server;