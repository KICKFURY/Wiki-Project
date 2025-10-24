import express from 'express';
const router = express.Router();
import Usuario from '../models/usuario.js';

// 🧭 Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const list = await Usuario.find().sort({ username: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Obtener usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const h = await Usuario.findById(req.params.id);
    if (!h) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(h);
  } catch (err) {
    res.status(400).json({ error: 'Id inválido' });
  }
});

// 🔍 Obtener usuario por username
router.get('/username/:username', async (req, res) => {
  try {
    const h = await Usuario.findOne({ username: req.params.username });
    if (!h) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(h);
  } catch (error) {
    res.status(400).json({ error: 'Username inválido' });
  }
});

// 🔍 Obtener usuario por email
router.get('/email/:email', async (req, res) => {
  try {
    const h = await Usuario.findOne({ email: req.params.email });
    if (!h) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(h);
  } catch (error) {
    res.status(400).json({ error: 'Email inválido' });
  }
});

// ➕ Crear usuario
router.post('/', async (req, res) => {
  try {
    const { dni, username, email, password, role } = req.body;
    if (!dni || !username || !email || !password || !role)
      return res.status(400).json({ error: 'dni, username, password y role son requeridos' });

    const exists = await Usuario.findOne({ dni });
    if (exists) return res.status(409).json({ error: 'DNI ya registrado' });

    const h = new Usuario({ dni, username, email, password, role });
    const saved = await h.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔐 Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email y password son requeridos' });

    const user = await Usuario.findOne({ email });
    if (!user || user.password !== password)
      return res.status(401).json({ error: 'Credenciales inválidas' });

    res.json({ message: 'Login exitoso', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔁 Seguir / dejar de seguir
router.post('/:id/follow', async (req, res) => {
  try {
    const { followerId } = req.body;
    if (!followerId) return res.status(400).json({ error: 'followerId es requerido' });

    const userToFollow = await Usuario.findById(req.params.id);
    const follower = await Usuario.findById(followerId);

    if (!userToFollow || !follower)
      return res.status(404).json({ error: 'Usuario no encontrado' });

    if (userToFollow.followers.includes(followerId))
      return res.status(400).json({ error: 'Ya sigues a este usuario' });

    userToFollow.followers.push(followerId);
    follower.following.push(req.params.id);

    await userToFollow.save();
    await follower.save();

    res.json({ message: 'Usuario seguido exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/unfollow', async (req, res) => {
  try {
    const { followerId } = req.body;
    if (!followerId) return res.status(400).json({ error: 'followerId es requerido' });

    const userToUnfollow = await Usuario.findById(req.params.id);
    const follower = await Usuario.findById(followerId);

    if (!userToUnfollow || !follower)
      return res.status(404).json({ error: 'Usuario no encontrado' });

    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== followerId);
    follower.following = follower.following.filter(id => id.toString() !== req.params.id);

    await userToUnfollow.save();
    await follower.save();

    res.json({ message: 'Usuario dejado de seguir exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👥 Obtener seguidores
router.get('/followers/:id', async (req, res) => {
  try {
    const user = await Usuario.findById(req.params.id).populate('followers', 'username email');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💫 Obtener usuarios seguidos
router.get('/following/:id', async (req, res) => {
  try {
    const user = await Usuario.findById(req.params.id).populate('following', 'username email');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✉️ Enviar invitaciones
router.post('/invite', async (req, res) => {
  try {
    const { fromUserId, toUserIds, resourceId } = req.body;
    if (!fromUserId || !toUserIds || !resourceId)
      return res.status(400).json({ error: 'fromUserId, toUserIds y resourceId son requeridos' });

    res.json({ message: 'Invitaciones enviadas correctamente', invited: toUserIds.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
