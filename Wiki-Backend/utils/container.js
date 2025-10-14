import UserRepository from '../repositories/userRepository.js';
import UserService from '../services/userService.js';
import UserController from '../controllers/userController.js';

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

export default container;
