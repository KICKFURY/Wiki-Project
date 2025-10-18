import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Usuario from '../models/usuario.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints para gestión de usuarios, autenticación y relaciones sociales.
 */

/**
 * @swagger
 * /api/usuarios/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dni
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               dni:
 *                 type: string
 *                 example: "123456789"
 *               username:
 *                 type: string
 *                 example: "nohemiCampos"
 *               email:
 *                 type: string
 *                 example: "nohemi@example.com"
 *               password:
 *                 type: string
 *                 example: "12345"
 *               role:
 *                 type: string
 *                 example: "user"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Faltan datos requeridos o error de validación
 *       409:
 *         description: El DNI ya está registrado
 */
router.post('/register', async (req, res) => {
  try {
    const { dni, username, email, password, role } = req.body;
    if (!dni || !username || !email || !password || !role)
      return res.status(400).json({ error: 'Todos los campos son requeridos' });

    const userExists = await Usuario.findOne({ dni });
    if (userExists)
      return res.status(409).json({ error: 'El DNI ya está registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Usuario({ dni, username, email, password: hashedPassword, role });
    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/usuarios/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dni
 *               - password
 *             properties:
 *               dni:
 *                 type: string
 *                 example: "123456789"
 *               password:
 *                 type: string
 *                 example: "12345"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       400:
 *         description: DNI o contraseña incorrectos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', async (req, res) => {
  try {
    const { dni, password } = req.body;
    const user = await Usuario.findOne({ dni });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de todos los usuarios
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', async (req, res) => {
  try {
    const users = await Usuario.find().sort({ username: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por su ID
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await Usuario.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/usuarios/{id}/follow:
 *   put:
 *     summary: Seguir a otro usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario a seguir
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               followerId:
 *                 type: string
 *                 example: "6715babc9c6a89e49b9f556a"
 *     responses:
 *       200:
 *         description: Usuario seguido correctamente
 *       400:
 *         description: Ya sigues a este usuario o error de validación
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id/follow', async (req, res) => {
  try {
    const { followerId } = req.body;
    const user = await Usuario.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (user.followers.includes(followerId))
      return res.status(400).json({ error: 'Ya sigues a este usuario' });

    user.followers.push(followerId);
    await user.save();

    res.json({ message: 'Usuario seguido correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/usuarios/{id}/unfollow:
 *   put:
 *     summary: Dejar de seguir a un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario a dejar de seguir
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               followerId:
 *                 type: string
 *                 example: "6715babc9c6a89e49b9f556a"
 *     responses:
 *       200:
 *         description: Has dejado de seguir al usuario
 *       400:
 *         description: No seguías a este usuario
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id/unfollow', async (req, res) => {
  try {
    const { followerId } = req.body;
    const user = await Usuario.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (!user.followers.includes(followerId))
      return res.status(400).json({ error: 'No seguías a este usuario' });

    user.followers = user.followers.filter(id => id.toString() !== followerId);
    await user.save();

    res.json({ message: 'Has dejado de seguir al usuario' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
