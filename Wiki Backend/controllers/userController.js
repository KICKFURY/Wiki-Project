const IUserController = require('../interfaces/IUserController');

class UserController extends IUserController {
    constructor(userService) {
        super();
        this.userService = userService;
    }

    async getAll(req, res) {
        try {
            const users = await this.userService.getAll();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const user = await this.userService.getById(req.params.id);
            res.json(user);
        } catch (error) {
            if (error.message === 'Usuario no encontrado') {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: 'Id inválido' });
            }
        }
    }

    async getByUsername(req, res) {
        try {
            const user = await this.userService.getByUsername(req.params.username);
            res.json(user);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async getByEmail(req, res) {
        try {
            const user = await this.userService.getByEmail(req.params.email);
            res.json(user);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const { dni, username, email, password, role } = req.body;
            if (!dni || !username || !email || !password || !role) {
                return res.status(400).json({ error: 'dni, username, email, password y role son requeridos' });
            }

            const user = await this.userService.create({ dni, username, email, password, role });
            res.status(201).json(user);
        } catch (error) {
            if (error.message.includes('ya registrado')) {
                res.status(409).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    async update(req, res) {
        try {
            const updatedUser = await this.userService.update(req.params.id, req.body);
            res.json(updatedUser);
        } catch (error) {
            if (error.message === 'Usuario no encontrado') {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    async delete(req, res) {
        try {
            const result = await this.userService.delete(req.params.id);
            res.json(result);
        } catch (error) {
            if (error.message === 'Usuario no encontrado') {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: 'Id inválido' });
            }
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'email y password son requeridos' });
            }

            const result = await this.userService.login(email, password);
            res.json(result);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    async logout(req, res) {
        try {
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json({ error: 'userId es requerido' });
            }

            const result = await this.userService.logout(userId);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async follow(req, res) {
        try {
            const { followerId } = req.body;
            if (!followerId) {
                return res.status(400).json({ error: 'followerId es requerido' });
            }

            const result = await this.userService.follow(req.params.id, followerId);
            res.json(result);
        } catch (error) {
            if (error.message === 'Usuario no encontrado' || error.message === 'Ya sigues a este usuario') {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    async unfollow(req, res) {
        try {
            const { followerId } = req.body;
            if (!followerId) {
                return res.status(400).json({ error: 'followerId es requerido' });
            }

            const result = await this.userService.unfollow(req.params.id, followerId);
            res.json(result);
        } catch (error) {
            if (error.message === 'Usuario no encontrado') {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    async getFollowers(req, res) {
        try {
            const followers = await this.userService.getFollowers(req.params.id);
            res.json(followers);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async getFollowing(req, res) {
        try {
            const following = await this.userService.getFollowing(req.params.id);
            res.json(following);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async invite(req, res) {
        try {
            const { fromUserId, toUserIds, resourceId } = req.body;
            const result = await this.userService.invite(fromUserId, toUserIds, resourceId);
            res.json(result);
        } catch (error) {
            if (error.message.includes('son requeridos')) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }
}

module.exports = UserController;
