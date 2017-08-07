"use strict";

var _dotenv = require("dotenv");

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config();

module.exports = {
  "development": {
    "username": process.env.username,
    "password": process.env.password,
    "database": process.env.database_dev,
    "host": process.env.host,
    "dialect": process.env.dialect
  },
  "test": {
    "username": process.env.username,
    "password": process.env.password,
    "database": process.env.database_test,
    "host": process.env.host,
    "dialect": process.env.dialect
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "postgres"
  }
};