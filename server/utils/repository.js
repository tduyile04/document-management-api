import regeneratorRuntime from 'regenerator-runtime';
import Constants from '../constants/Constants';
import Helper from '../utils/Helper';

/**
 * An helper class that abstracts shared model queries so as to prevent
 * code repetition
 * @export
 * @class Repository
 */
export default class Repository {
  /**
   * Gets the matching data that equals the id params
   * @static
   * @param {integer} id obtained from req.params.id
   * @param {object} model Model instance type
   * @param {string} modelName Name of the model instance
   * @returns {object} the requested data
   * @memberof Repository
   */
  static async findDataById(id, model, modelName) {
    let result;
    await model.findById(id).then((data) => {
      if (!data) {
        result = {
          data: { message: `${modelName} does not exist in the database` },
          status: 404
        };
      } else {
        result = { data, status: 200 };
      }
    })
      .catch(() => {
        result = {
          message: 'Error occured while retrieving the data', status: 500
        };
      });
    return result;
  }

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
  static async updateContextDetails(userRequest, updateId, model, modelName) {
    let result, name, email, password, title, content, access;
    let updateField;
    if (userRequest.name && userRequest.email && userRequest.password) {
      name = userRequest.name;
      email = userRequest.email;
      password = userRequest.password;
      updateField = { name, email, password };
    } else if (userRequest.title && userRequest.content && userRequest.access) {
      title = userRequest.title;
      content = userRequest.content;
      access = userRequest.access;
      updateField = { title, content, access };
    } else {
      return {
        data: { message: 'Empty fields not allowed, check and fill them' },
        status: 400
      };
    }
    await model.update(updateField, { where: { id: updateId } })
      .then((updatedContext) => {
        if (updatedContext[0] === Constants.UPDATED) {
          result = {
            data: { message: `${modelName} has been successfully updated` },
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
      })
      .catch(() => {
        result = {
          data: { message: 'Error encoutered while updating...' },
          status: 500
        };
      });
    if (result.status === 200) {
      await model.findById(updateId)
        .then((updatedField) => {
          result = {
            data: Helper.chooseContext(modelName, updatedField),
            status: 200
          };
        })
        .catch(() => {
          result = {
            data: {
              message: 'Error encoutered while retrieving the updated document'
            },
            status: 500
          };
        });
    }
    return result;
  }

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
  static async updateUserRoles(roleId, updateId, model, modelName) {
    let result;
    await model.update({
      roleId
    }, {
      where: {
        id: updateId
      }
    })
      .then((updatedContext) => {
        if (updatedContext[0] === Constants.UPDATED) {
          result = {
            data: { message: `${modelName} has been successfully updated` },
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
      })
      .catch(() => {
        result = {
          data: { message: 'Error encoutered while updating the user' },
          status: 500
        };
      });
    if (result.status === 200) {
      await model.findById(updateId)
        .then((updatedField) => {
          result = {
            data: Helper.chooseContext(modelName, updatedField),
            status: 200
          };
        })
        .catch(() => {
          result = {
            data: {
              message: 'Error encoutered while retrieving the updated document'
            },
            status: 500
          };
        });
    }
    return result;
  }

  /**
   * Deletes the matching data that equals the id params
   * @static
   * @param {object} model the choice model
   * @param {string} modelName the name of the choice model
   * @param {integer} deleteId the id of the item to be deleted
   * @returns {object} feedback message from delete operation
   * @memberof Repository
   */
  static async deleteContextInstance(model, modelName, deleteId) {
    let result;
    await model.destroy({
      where: {
        id: deleteId
      }
    })
      .then((deletedContext) => {
        if (deletedContext === Constants.DELETED) {
          result = {
            data: {
              message: `${modelName} has been removed successfully`
            },
            status: 200
          };
        } else {
          result = {
            data: {
              message: `No matching ${modelName.toLowerCase()} was found`
            },
            status: 404
          };
        }
      })
      .catch(() => {
        result = {
          data: {
            message: `Error encountered while trying to delete ${modelName}`
          },
          status: 500
        };
      });
    return result;
  }
}
