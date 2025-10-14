import IUserService from '../interfaces/IUserService.js';

class UserService extends IUserService {
  constructor(userRepository) {
    super();
    this.userRepository = userRepository;
  }

  async getById(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  async getByUsername(username) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  async getByEmail(email) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  async create(userData) {
    const { dni, username, email } = userData;

    // Check if DNI already exists
    const existingDni = await this.userRepository.findById(dni);
    if (existingDni) {
      throw new Error('DNI ya registrado');
    }

    // Check if username already exists
    const existingUsername = await this.userRepository.findByUsername(username);
    if (existingUsername) {
      throw new Error('Username ya registrado');
    }

    // Check if email already exists
    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) {
      throw new Error('Email ya registrado');
    }

    return this.userRepository.create(userData);
  }

  async update(id, updateData) {
    const user = await this.userRepository.update(id, updateData);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  async delete(id) {
    const user = await this.userRepository.delete(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return { message: 'Usuario eliminado' };
  }

  async getAll() {
    return this.userRepository.findAll();
  }

  async follow(targetUserId, followerId) {
    return this.userRepository.addFollower(targetUserId, followerId);
  }

  async unfollow(targetUserId, followerId) {
    return this.userRepository.removeFollower(targetUserId, followerId);
  }

  async getFollowers(userId) {
    const user = await this.userRepository.findByIdWithFollowers(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user.followers;
  }

  async getFollowing(userId) {
    const user = await this.userRepository.findByIdWithFollowing(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user.following;
  }

  async login(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user || user.password !== password) {
      throw new Error('Credenciales inválidas');
    }
    return { message: 'Login exitoso', user };
  }

  async logout(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Set lastActivity to past to force session expiration
    user.lastActivity = new Date(0); // Unix epoch
    await this.userRepository.update(userId, { lastActivity: user.lastActivity });

    return { message: 'Logout exitoso' };
  }

  async invite(fromUserId, toUserIds, resourceId) {
    // Validate inputs
    if (!fromUserId || !toUserIds || !resourceId) {
      throw new Error('fromUserId, toUserIds y resourceId son requeridos');
    }

    // Validate that fromUser exists
    await this.getById(fromUserId);

    // Validate that all toUserIds exist
    for (const userId of toUserIds) {
      await this.getById(userId);
    }

    // Here we can implement the logic to send notifications or save invitations in DB
    // For now, just return success
    return { message: 'Invitaciones enviadas correctamente' };
  }
}

export default UserService;
