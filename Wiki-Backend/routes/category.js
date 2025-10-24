import express from 'express';
const router = express.Router();
import Category from '../models/category.js';
import auth from '../middleware/auth.js';

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Endpoints para gestionar categorías de recursos
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Obtener todas las categorías activas
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lista de categorías activas ordenadas por nombre
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   slug:
 *                     type: string
 *                   description:
 *                     type: string
 *                   parentCategory:
 *                     type: string
 *                     nullable: true
 *                   color:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Obtener una categoría por su ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID de la categoría
 *         required: true
 *         schema:
 *           type: string
 *           example: 6715babc9c6a89e49b9f556a
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 slug:
 *                   type: string
 *                 description:
 *                   type: string
 *                 parentCategory:
 *                   type: string
 *                   nullable: true
 *                 color:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 *       404:
 *         description: Categoría no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Datos para crear la categoría
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Tecnología"
 *               slug:
 *                 type: string
 *                 example: "tecnologia"
 *               description:
 *                 type: string
 *                 example: "Recursos relacionados con tecnología y desarrollo"
 *               parentCategory:
 *                 type: string
 *                 nullable: true
 *                 example: "6715babc9c6a89e49b9f556a"
 *               color:
 *                 type: string
 *                 example: "#1e90ff"
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 slug:
 *                   type: string
 *                 description:
 *                   type: string
 *                 parentCategory:
 *                   type: string
 *                   nullable: true
 *                 color:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 *       400:
 *         description: Datos inválidos o categoría con mismo nombre/slug ya existe
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', auth, async (req, res) => {
    try {
        const { name, slug, description, parentCategory, color } = req.body;

        const existing = await Category.findOne({ $or: [{ name }, { slug }] });
        if (existing) {
            return res.status(400).json({ message: 'Category with this name or slug already exists' });
        }

        const category = new Category({
            name,
            slug,
            description,
            parentCategory: parentCategory || null,
            color
        });

        const savedCategory = await category.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Actualizar una categoría existente
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID de la categoría a actualizar
 *         required: true
 *         schema:
 *           type: string
 *           example: 6715babc9c6a89e49b9f556a
 *     requestBody:
 *       description: Campos a actualizar de la categoría
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               parentCategory:
 *                 type: string
 *                 nullable: true
 *               color:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Categoría actualizada correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Categoría no encontrada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', auth, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        const { name, slug, description, parentCategory, color, isActive } = req.body;

        category.name = name || category.name;
        category.slug = slug || category.slug;
        category.description = description || category.description;
        category.parentCategory = parentCategory !== undefined ? parentCategory : category.parentCategory;
        category.color = color || category.color;
        if (isActive !== undefined) category.isActive = isActive;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: "Eliminar una categoría (soft delete: isActive = false)"
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID de la categoría a eliminar
 *         required: true
 *         schema:
 *           type: string
 *           example: 6715babc9c6a89e49b9f556a
 *     responses:
 *       200:
 *         description: Categoría desactivada correctamente
 *       404:
 *         description: Categoría no encontrada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', auth, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        category.isActive = false;
        await category.save();

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
