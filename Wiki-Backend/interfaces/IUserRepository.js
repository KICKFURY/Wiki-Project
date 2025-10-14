class IUserRepository {
  async findById(id) {
    throw new Error('Method not implemented');
  }

  async findByIdWithFollowing(id) {
    throw new Error('Method not implemented');
  }

  async findByIdWithFollowers(id) {
    throw new Error('Method not implemented');
  }

  async findByUsername(username) {
    throw new Error('Method not implemented');
  }

  async findByEmail(email) {
    throw new Error('Method not implemented');
  }

  async create(userData) {
    throw new Error('Method not implemented');
  }

  async update(id, updateData) {
    throw new Error('Method not implemented');
  }

  async delete(id) {
    throw new Error('Method not implemented');
  }

  async addFollower(userId, followerId) {
    throw new Error('Method not implemented');
  }

  async removeFollower(userId, followerId) {
    throw new Error('Method not implemented');
  }

  async findAll() {
    throw new Error('Method not implemented');
  }
}

module.exports = IUserRepository;
