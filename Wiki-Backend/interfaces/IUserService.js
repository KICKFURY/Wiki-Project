class IUserService {
  async getById(id) {
    throw new Error('Method not implemented');
  }

  async getByUsername(username) {
    throw new Error('Method not implemented');
  }

  async getByEmail(email) {
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

  async getAll() {
    throw new Error('Method not implemented');
  }

  async follow(targetUserId, followerId) {
    throw new Error('Method not implemented');
  }

  async unfollow(targetUserId, followerId) {
    throw new Error('Method not implemented');
  }

  async getFollowers(userId) {
    throw new Error('Method not implemented');
  }

  async getFollowing(userId) {
    throw new Error('Method not implemented');
  }

  async login(email, password) {
    throw new Error('Method not implemented');
  }

  async logout(userId) {
    throw new Error('Method not implemented');
  }

  async invite(fromUserId, toUserIds, resourceId) {
    throw new Error('Method not implemented');
  }
}

export default IUserService;
