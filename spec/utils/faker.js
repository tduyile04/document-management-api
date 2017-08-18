import Constants from '../../server/constants/Constants';

const Faker = {
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
    },
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
    roleId: Constants.SUPERADMIN
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
    roleId: Constants.SUPERADMIN
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
  },
}

export default Faker;