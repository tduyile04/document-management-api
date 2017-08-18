'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Constants = require('../../server/constants/Constants');

var _Constants2 = _interopRequireDefault(_Constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Faker = {
  randomUser: {
    name: 'random user',
    email: 'randomuser@random.com',
    password: 'randomuser'
  },
  signUp: {
    noNameUser: {
      name: '',
      email: 'randomuser@random.com',
      password: 'random'
    },
    nullUser: {
      name: '',
      email: '',
      password: ''
    }
  },
  logIn: {
    nullUser: {
      email: '',
      password: ''
    }
  },
  wrongPasswordUser: {
    email: 'randomuser@random.com',
    password: 'halleluyah'
  },
  alreadyLoggedUser: {
    email: 'randomuser@random.com',
    password: 'randomuser'
  },
  superAdmin: {
    name: 'superadmin',
    email: 'superadmin@random.com',
    password: 'superadmin',
    roleId: _Constants2.default.SUPERADMIN
  },
  superAdminLogged: {
    name: 'superadmin',
    email: 'superadmin@random.com',
    password: 'superadmin'
  },
  newSuperAdmin: {
    name: 'newsuperadmin',
    email: 'newsuperadmin@random.com',
    password: 'newsuperadmin',
    roleId: _Constants2.default.SUPERADMIN
  },
  documentOne: {
    title: 'The new red book',
    content: 'The details of the new red book',
    access: 'private'
  },
  documentTwo: {
    title: 'The cinderella book',
    content: 'How the maid became a princess',
    access: 'role'
  },
  documentThree: {
    title: 'The new red book',
    content: 'How the maid became made',
    access: 'role'
  },
  documentFour: {
    title: 'The new very black book',
    content: 'The details of the new very black book',
    access: 'private'
  },
  noTitleDocument: {
    title: '',
    content: 'The details of the new red book',
    access: 'private'
  }
};

exports.default = Faker;