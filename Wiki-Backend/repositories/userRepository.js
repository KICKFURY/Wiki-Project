import Usuario from '../models/usuario.js';
import IUserRepository from '../interfaces/IUserRepository.js';

class UserRepository extends IUserRepository {
  async findById(id) {
    return Usuario.findById(id);
  }

  async findByDni(dni) {
    return Usuario.findOne({ dni });
  }

  async findByIdWithFollowing(id) {
    return Usuario.findById(id).populate('following', 'username email');
  }

  async findByIdWithFollowers(id) {
    return Usuario.findById(id).populate('followers', 'username email');
  }

  async findByUsername(username) {
    return Usuario.findOne({ username });
  }

  async findByEmail(email) {
    return Usuario.findOne({ email });
  }

  async create(userData) {
    const user = new Usuario(userData);
    return user.save();
  }

  async update(id, updateData) {
    return Usuario.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async delete(id) {
    return Usuario.findByIdAndDelete(id);
  }

  async addFollower(userId, followerId) {
    const user = await Usuario.findById(userId);
    const follower = await Usuario.findById(followerId);

    if (!user || !follower) {
      throw new Error('Usuario no encontrado');
    }

    if (user.followers.includes(followerId)) {
      throw new Error('Ya sigues a este usuario');
    }

    user.followers.push(followerId);
    follower.following.push(userId);

    await user.save();
    await follower.save();

    return { message: 'Usuario seguido exitosamente' };
  }

  async removeFollower(userId, followerId) {
    const user = await Usuario.findById(userId);
    const follower = await Usuario.findById(followerId);

    if (!user || !follower) {
      throw new Error('Usuario no encontrado');
    }

    user.followers = user.followers.filter(id => id.toString() !== followerId);
    follower.following = follower.following.filter(id => id.toString() !== userId);

    await user.save();
    await follower.save();

    return { message: 'Usuario dejado de seguir exitosamente' };
  }

  async findAll() {
    return Usuario.find().sort({ username: 1 });
  }
}

export default UserRepository;
