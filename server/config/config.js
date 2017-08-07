import dotenv from 'dotenv';

dotenv.config();

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
}