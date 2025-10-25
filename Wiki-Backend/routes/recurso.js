import express from 'express';
const router = express.Router();
import Recurso from '../models/recurso.js';
import auth from '../middleware/auth.js';
import Category from '../models/category.js';
import mongoose from 'mongoose';

/**
 * @swagger
 * tags:
 *   name: Recursos
 *   description: Endpoints para gestionar los recursos del Wiki Project
 */

/**
 * @swagger
 * /api/recursos:
 *   get:
 *     summary: Obtener todos los recursos
 *     tags: [Recursos]
 *     responses:
 *       200:
 *         description: Lista de todos los recursos con autor y categoría
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   author:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *                   category:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Error al obtener los recursos
 */
router.get('/', async (req, res) => {
  try {
    const recursos = await Recurso.find()
      .populate('author', 'username email')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(recursos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/recursos/{id}:
 *   get:
 *     summary: Obtener un recurso por su ID
 *     tags: [Recursos]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del recurso
 *         schema:
 *           type: string
 *           example: 6715babc9c6a89e49b9f556a
 *     responses:
 *       200:
 *         description: Recurso encontrado
 *       404:
 *         description: Recurso no encontrado
 *       400:
 *         description: ID inválido
 */
router.get('/:id', async (req, res) => {
    try {
        const recurso = await Recurso.findById(req.params.id)
            .populate('author', 'username email')
            .populate('category', 'name');
        if (!recurso) return res.status(404).json({ error: 'Recurso no encontrado' });
        res.json(recurso);
    } catch (err) {
        res.status(400).json({ error: 'Id inválido' });
    }
});

/**
 * @swagger
 * /api/recursos/{id}/view:
 *   patch:
 *     summary: Incrementar contador de visualizaciones de un recurso
 *     tags: [Recursos]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del recurso
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contador de vistas actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 viewCount:
 *                   type: integer
 *       404:
 *         description: Recurso no encontrado
 *       400:
 *         description: ID inválido
 */
router.patch('/:id/view', async (req, res) => {
  try {
    const recurso = await Recurso.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    if (!recurso) return res.status(404).json({ error: 'Recurso no encontrado' });
    res.json({ viewCount: recurso.viewCount });
  } catch (err) {
    res.status(400).json({ error: 'Id inválido' });
  }
});

/**
 * @swagger
 * /api/recursos:
 *   post:
 *     summary: Crear un nuevo recurso
 *     tags: [Recursos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - category
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Introducción a la Ciberseguridad"
 *               content:
 *                 type: string
 *                 example: "Este recurso explica los fundamentos de la ciberseguridad..."
 *               category:
 *                 type: string
 *                 example: "Tecnología"
 *               author:
 *                 type: string
 *                 example: "6714cabc9c6a89e49b9f556b"
 *               image:
 *                 type: string
 *                 example: "https://example.com/imagen.jpg"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["seguridad", "redes"]
 *     responses:
 *       201:
 *         description: Recurso creado exitosamente
 *       400:
 *         description: Datos faltantes o categoría no encontrada
 *       500:
 *         description: Error en el servidor
 */
router.post('/', auth, async (req, res) => {
    try {
        const { title, content, category, image, tags } = req.body;
        const author = req.user._id;
        if (!title || !content || !category) {
            return res.status(400).json({ error: 'title, content y category son requeridos' });
        }

        let categoryId = category;

        // If category is provided as string, try to find by name first, then by ObjectId
        if (typeof category === 'string') {
            // Check if it's a valid ObjectId
            if (mongoose.Types.ObjectId.isValid(category)) {
                const categoryDoc = await Category.findById(category);
                if (categoryDoc) {
                    categoryId = categoryDoc._id;
                } else {
                    return res.status(400).json({ error: 'Categoría no encontrada por ID' });
                }
            } else {
                // Find category by name
                const categoryDoc = await Category.findOne({ name: category });
                if (!categoryDoc) {
                    return res.status(400).json({ error: 'Categoría no encontrada por nombre' });
                }
                categoryId = categoryDoc._id;
            }
        }

        const recurso = new Recurso({ title, content, category: categoryId, author, image, tags });
        const saved = await recurso.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/recursos/{id}:
 *   put:
 *     summary: Actualizar un recurso existente
 *     tags: [Recursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del recurso a actualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Recurso actualizado exitosamente
 *       400:
 *         description: Error en los datos enviados
 *       404:
 *         description: Recurso no encontrado
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const updateData = { ...req.body };
        // If category is provided as string, handle both name and ObjectId
        if (updateData.category && typeof updateData.category === 'string') {
            // Check if it's a valid ObjectId
            if (mongoose.Types.ObjectId.isValid(updateData.category)) {
                const categoryDoc = await Category.findById(updateData.category);
                if (categoryDoc) {
                    updateData.category = categoryDoc._id;
                } else {
                    return res.status(400).json({ error: 'Categoría no encontrada por ID' });
                }
            } else {
                // Find category by name
                const categoryDoc = await Category.findOne({ name: updateData.category });
                if (!categoryDoc) {
                    return res.status(400).json({ error: 'Categoría no encontrada por nombre' });
                }
                updateData.category = categoryDoc._id;
            }
        }

        const updated = await Recurso.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ error: 'Recurso no encontrado' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/recursos/{id}:
 *   delete:
 *     summary: Eliminar un recurso por ID
 *     tags: [Recursos]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del recurso a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recurso eliminado exitosamente
 *       404:
 *         description: Recurso no encontrado
 *       400:
 *         description: ID inválido
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Recurso.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Recurso no encontrado' });
    res.json({ message: 'Recurso eliminado' });
  } catch (err) {
    res.status(400).json({ error: 'Id inválido' });
  }
});

export default router;
