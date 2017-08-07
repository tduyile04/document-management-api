import Constants from '../constants/index';

export default class Repository {
  /**
   * Gets the matching data that equals the id params
   * @static
   * @param {integer} id obtained from req.params.id
   * @param {object} model Model instance type
   * @param {string} modelName Name of the model instance
   * @returns 
   * @memberof Repository
   */
  static async findDataById(id, model, modelName) {
    let result;
    let counter = 0;
    await model.findById(id).then((data) => {
      if(!data) {
        result = {
          data: { message: `${modelName} does not exist in the database` },
          status: 404
        };
      } else {
        result = { data, status: 200 };
      }
    })
    .catch((err) => {
      res.status(500).json({ err });
    });
    return result;
  }

  /**
   * 
   * 
   * @static
   * @param {string} name 
   * @param {string} email 
   * @param {string} password 
   * @param {integer} updateId 
   * @param {object} model 
   * @param {string} modelName 
   * @returns 
   * @memberof Repository
   */
  static async updateContextDetails(userRequest, updateId, model, modelName) {
    let result, name, email, password, title, content, access;
    let updateField;
    if(userRequest.name && userRequest.email && userRequest.password) {
      name = userRequest.name,
      email = userRequest.email,
      password = userRequest.password;
      updateField = { name, email, password };
    } else if(userRequest.title && userRequest.content && userRequest.access) {
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
    await model.update(updateField, {
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
          data: { message: 'You do not have the permission to perform this action' }, 
          status: 403
        };
      }
    })
    .catch((error) => {
      result = {
        data: { message: 'Error encoutered while updating...' },
        status: 500
      };
    });
    return result;
  }

  /**
   * 
   * 
   * @static
   * @param {integer} roleId 
   * @param {integer} updateId 
   * @param {object} model 
   * @param {string} modelName 
   * @returns 
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
          data: { message: 'User has been successfully updated' },
          status: 200
        };
      } else {
        result = {
          data : { message: 'No matching user was found in the database, No updates made' },
          status: 404
        };
      }
    })
    .catch((error) => {
      result = {
        data: { message: 'Error encoutered while updating...' },
        status: 500
      };
    });
    return result;
  }

  /**
   * 
   * 
   * @static
   * @param {object} model 
   * @param {string} modelName 
   * @param {integer} deleteId 
   * @returns 
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
          data : { message: `${modelName} has been removed from the database successfully` },
          status: 200
        };
      } else {
        result = {
          data: { message: `No matching ${modelName.toLowerCase()} was found in the database` },
          status: 404
        };
      }
    })
    .catch((error) => {
      result = {
        data: { message: `Error encountered while trying to delete ${modelName.toLowerCase()}, Please try again` },
        status: 500
      };
    });
    return result;
  }
}