[![Coverage Status](https://coveralls.io/repos/github/tolupatrick004/document-management-api/badge.svg?branch=staging)](https://coveralls.io/github/tolupatrick004/document-management-api?branch=staging)
[![Build Status](https://travis-ci.org/tolupatrick004/document-management-api.svg?branch=staging)](https://travis-ci.org/tolupatrick004/document-management-api)
[![Code Climate](https://codeclimate.com/github/tolupatrick004/document-management-api/badges/gpa.svg)](https://codeclimate.com/github/tolupatrick004/document-management-api)


### Technologies Used

JavaScript (ES6)
Node.js
Express
Postgresql
Sequelize ORM.
Local Development

### Prerequisites includes

Postgresql and
Node.js >= v8.0.0.

### Project Dependencies

### Dependencies

**babel-cli** - Allows running the app in ES6 mode on the fly without having to transpile down to ES5

**babel-preset-es2015, babel-preset-stage-0** - These packages provide Babel presets for es2015 plugins, stage 0 plugins

**bcryptjs** - Used to hash passwords

**body-parser** - Node.js body parsing middleware. Parse incoming request bodies in a middleware before your handlers, available under the req.body property.

**dotenv** - Loads environment variables

**express** - Used as the web server for this application

**express-validator** - Validates input on request body, params and query

**jsonwebtoken** - Generates JWT tokens and can verify them

**pg** - Non-blocking PostgreSQL client for node.js. Pure JavaScript and optional native libpq bindings

**pg-hstore** - A node package for serializing and deserializing JSON data to hstore format

**sequelize** - Sequelize is a promise-based Node.js ORM for Postgres, MySQL, SQLite and Microsoft SQL Server. It features solid transaction support, relations, read replication and more

**sequelize-cli** - The Sequelize Command Line Interface (CLI)
etc.


### Development Dependencies

**chai** - Chai is a BDD / TDD assertion library for node and the browser that can be delightfully paired with any javascript testing framework.

**coveralls** - Coveralls.io support for node.js. Get the great coverage reporting of coveralls.io and add a cool coverage button to your README.

**gulp** - gulp is a toolkit that helps you automate painful or time-consuming tasks in your development workflow.

**gulp-babel** - Use next generation JavaScript, today, with Babel

**gulp-exit** - ensures that the task is terminated after finishing.

**gulp-inject-modules** - Loads JavaScript files on-demand from a Gulp stream into Node's module loader.

**gulp-istanbul** - Istanbul unit test coverage plugin for gulp.

**gulp-shell** - A handy command line interface for gulp

**gulp-nodemon** - it's gulp + nodemon + convenience

**mocha** - A basic testing framework

**supertest** - HTTP assertions made easy via superagent.
etc.

### Installation and Setup

Clone this repository locally
Move into the project directory
Install project dependencies npm install
Create Postgresql database and run migrations.
Populate database with seed data
Start the express server npm start.
Run test npm test-server.

### Authentication

Users are assigned a token when signup or signin. This token is then used for subsequent HTTP requests to the API for authentication and should be sent as one of the header values.

### Below are the API endpoints and their functions

EndPoint Functionality
**POST** /api/v1/users/login	Logs a user in.

**POST** /api/v1/users/	Creates a new user.

**GET** /api/v1/users/	Find matching instances of user.

**GET** /api/v1/users-docs/	Find matching instances of users and documents

**GET** /api/v1/users/	Find user.

**PUT** /api/v1/users/	Update user attributes.

**DELETE** /api/v1/users/	Delete user.

**POST** /api/v1/documents/	Creates a new document instance.

**POST** /api/v1/roles/	Creates a new role instance.

**GET** /api/v1/roles/	Find matching instances of role

**GET** /api/v1/roles-users/	Find matching instances of roles and users

**GET** /api/v1/documents/	Find matching instances of document.

**GET** /api/v1/documents/	Find document.

**PUT** /api/v1/documents/	Update document attributes.

**DELETE** /api/v1/documents/	Delete document.

**GET** /api/v1/users//documents	Find all documents belonging to the user.

**GET** /api/v1/search/users/	Gets all users with username, firstname or lastname matching or containing the search term

**GET** /api/v1/search/documents/	Gets all documents with title or content matching or containing the search term

**GET** /api/v1/users/page/?limit={integer}&offset={integer}	Pagination for users.

**GET** /api/v1/documents/page/?limit={integer}&offset={integer}	Pagination for docs.

### How to contribute

Contributions are a vital part to the growth of the project. If any feature strikes you as stale and you know to make it better, follow these simple steps:

Fork the project

Create a branch from the base branch.

Make some commits to improve the project.

Push this branch to your GitHub project.

Open a Pull Request on GitHub.

Discuss, and optionally continue committing.

The project owner merges or closes the Pull Request.


### API Documentation

The API documentation is found at the homepage of the hosted API https://edocumentmgtapi.herokuapp.com/

### Limitations

The application uses shared database package, this may lead to slow in response at some point. It also has query limit per day, once exceeded client won't get any response till the next day.

### License

(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### Author
Duyile Tolulope Patrick
tolulope.duyile@andela.com
