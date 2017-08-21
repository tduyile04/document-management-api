'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _regeneratorRuntime = require('regenerator-runtime');

var _regeneratorRuntime2 = _interopRequireDefault(_regeneratorRuntime);

var _Constants = require('../constants/Constants');

var _Constants2 = _interopRequireDefault(_Constants);

var _Helper = require('../utils/Helper');

var _Helper2 = _interopRequireDefault(_Helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * An helper class that abstracts shared model queries so as to prevent
 * code repetition
 * @export
 * @class Repository
 */
var Repository = function () {
  function Repository() {
    _classCallCheck(this, Repository);
  }

  _createClass(Repository, null, [{
    key: 'findDataById',

    /**
     * Gets the matching data that equals the id params
     * @static
     * @param {integer} id obtained from req.params.id
     * @param {object} model Model instance type
     * @param {string} modelName Name of the model instance
     * @returns {object} the requested data
     * @memberof Repository
     */
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime2.default.mark(function _callee(id, model, modelName) {
        var result;
        return _regeneratorRuntime2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                result = void 0;
                _context.next = 3;
                return model.findById(id).then(function (data) {
                  if (!data) {
                    result = {
                      data: { message: modelName + ' does not exist in the database' },
                      status: 404
                    };
                  } else {
                    result = { data: data, status: 200 };
                  }
                }).catch(function () {
                  result = {
                    message: 'Error occured while retrieving the data', status: 500
                  };
                });

              case 3:
                return _context.abrupt('return', result);

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function findDataById(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return findDataById;
    }()

    /**
     * Updates the matching data that equals the id params
     * @static
     * @param {object} userRequest the user details sent
     * @param {object} updateId the specific id to be updated
     * @param {object} model the choice model
     * @param {string} modelName the name of the choice model
     * @returns {object} feedback message
     * @memberof Repository
     */

  }, {
    key: 'updateContextDetails',
    value: function () {
      var _ref2 = _asyncToGenerator(_regeneratorRuntime2.default.mark(function _callee2(userRequest, updateId, model, modelName) {
        var result, name, email, password, title, content, access, updateField;
        return _regeneratorRuntime2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                result = void 0, name = void 0, email = void 0, password = void 0, title = void 0, content = void 0, access = void 0;
                updateField = void 0;

                if (!(userRequest.name && userRequest.email && userRequest.password)) {
                  _context2.next = 9;
                  break;
                }

                name = userRequest.name;
                email = userRequest.email;
                password = userRequest.password;
                updateField = { name: name, email: email, password: password };
                _context2.next = 17;
                break;

              case 9:
                if (!(userRequest.title && userRequest.content && userRequest.access)) {
                  _context2.next = 16;
                  break;
                }

                title = userRequest.title;
                content = userRequest.content;
                access = userRequest.access;
                updateField = { title: title, content: content, access: access };
                _context2.next = 17;
                break;

              case 16:
                return _context2.abrupt('return', {
                  data: { message: 'Empty fields not allowed, check and fill them' },
                  status: 400
                });

              case 17:
                _context2.next = 19;
                return model.update(updateField, { where: { id: updateId } }).then(function (updatedContext) {
                  if (updatedContext[0] === _Constants2.default.UPDATED) {
                    result = {
                      data: { message: modelName + ' has been successfully updated' },
                      status: 200
                    };
                  } else {
                    result = {
                      data: {
                        message: 'You do not have the permission to perform this action'
                      },
                      status: 403
                    };
                  }
                }).catch(function () {
                  result = {
                    data: { message: 'Error encoutered while updating...' },
                    status: 500
                  };
                });

              case 19:
                if (!(result.status === 200)) {
                  _context2.next = 22;
                  break;
                }

                _context2.next = 22;
                return model.findById(updateId).then(function (updatedField) {
                  result = {
                    data: _Helper2.default.chooseContext(modelName, updatedField),
                    status: 200
                  };
                }).catch(function () {
                  result = {
                    data: {
                      message: 'Error encoutered while retrieving the updated document'
                    },
                    status: 500
                  };
                });

              case 22:
                return _context2.abrupt('return', result);

              case 23:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function updateContextDetails(_x4, _x5, _x6, _x7) {
        return _ref2.apply(this, arguments);
      }

      return updateContextDetails;
    }()

    /**
     * Updates the matching data roles that equals the id params
     * @static
     * @param {integer} roleId the id of the users role 
     * @param {integer} updateId the id to be updated
     * @param {object} model the choice model
     * @param {string} modelName the name of the choice model
     * @returns {object} feedback message
     * 
     * @memberof Repository
     */

  }, {
    key: 'updateUserRoles',
    value: function () {
      var _ref3 = _asyncToGenerator(_regeneratorRuntime2.default.mark(function _callee3(roleId, updateId, model, modelName) {
        var result;
        return _regeneratorRuntime2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                result = void 0;
                _context3.next = 3;
                return model.update({
                  roleId: roleId
                }, {
                  where: {
                    id: updateId
                  }
                }).then(function (updatedContext) {
                  if (updatedContext[0] === _Constants2.default.UPDATED) {
                    result = {
                      data: { message: modelName + ' has been successfully updated' },
                      status: 200
                    };
                  } else {
                    result = {
                      data: {
                        message: 'No matching user was found, No updates made'
                      },
                      status: 404
                    };
                  }
                }).catch(function () {
                  result = {
                    data: { message: 'Error encoutered while updating the user' },
                    status: 500
                  };
                });

              case 3:
                if (!(result.status === 200)) {
                  _context3.next = 6;
                  break;
                }

                _context3.next = 6;
                return model.findById(updateId).then(function (updatedField) {
                  result = {
                    data: _Helper2.default.chooseContext(modelName, updatedField),
                    status: 200
                  };
                }).catch(function () {
                  result = {
                    data: {
                      message: 'Error encoutered while retrieving the updated document'
                    },
                    status: 500
                  };
                });

              case 6:
                return _context3.abrupt('return', result);

              case 7:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function updateUserRoles(_x8, _x9, _x10, _x11) {
        return _ref3.apply(this, arguments);
      }

      return updateUserRoles;
    }()

    /**
     * Deletes the matching data that equals the id params
     * @static
     * @param {object} model the choice model
     * @param {string} modelName the name of the choice model
     * @param {integer} deleteId the id of the item to be deleted
     * @returns {object} feedback message from delete operation
     * @memberof Repository
     */

  }, {
    key: 'deleteContextInstance',
    value: function () {
      var _ref4 = _asyncToGenerator(_regeneratorRuntime2.default.mark(function _callee4(model, modelName, deleteId) {
        var result;
        return _regeneratorRuntime2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                result = void 0;
                _context4.next = 3;
                return model.destroy({
                  where: {
                    id: deleteId
                  }
                }).then(function (deletedContext) {
                  if (deletedContext === _Constants2.default.DELETED) {
                    result = {
                      data: {
                        message: modelName + ' has been removed successfully'
                      },
                      status: 200
                    };
                  } else {
                    result = {
                      data: {
                        message: 'No matching ' + modelName.toLowerCase() + ' was found'
                      },
                      status: 404
                    };
                  }
                }).catch(function () {
                  result = {
                    data: {
                      message: 'Error encountered while trying to delete ' + modelName
                    },
                    status: 500
                  };
                });

              case 3:
                return _context4.abrupt('return', result);

              case 4:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function deleteContextInstance(_x12, _x13, _x14) {
        return _ref4.apply(this, arguments);
      }

      return deleteContextInstance;
    }()
  }]);

  return Repository;
}();

exports.default = Repository;