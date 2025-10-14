const UserRepository = require('../repositories/userRepository');
const UserService = require('../services/userService');
const UserController = require('../controllers/userController');

// Dependency Injection Container
class Container {
  constructor() {
    this.instances = new Map();
  }

  getUserRepository() {
    if (!this.instances.has('userRepository')) {
      this.instances.set('userRepository', new UserRepository());
    }
    return this.instances.get('userRepository');
  }

  getUserService() {
    if (!this.instances.has('userService')) {
      const userRepository = this.getUserRepository();
      this.instances.set('userService', new UserService(userRepository));
    }
    return this.instances.get('userService');
  }

  getUserController() {
    if (!this.instances.has('userController')) {
      const userService = this.getUserService();
      this.instances.set('userController', new UserController(userService));
    }
    return this.instances.get('userController');
  }
}

const container = new Container();

module.exports = container;
