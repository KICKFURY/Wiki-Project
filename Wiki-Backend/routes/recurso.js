const express = require('express');
const router = express.Router();
const Recurso = require('../models/recurso');
const auth = require('../middleware/auth');


// Listar todos los recursos con autor y categoría poblados
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


// Obtener un recurso específico por ID con autor poblado
router.get('/:id', async (req, res) => {
    try {
        const recurso = await Recurso.findById(req.params.id).populate('author', 'username email');
        if (!recurso) return res.status(404).json({ error: 'Recurso no encontrado' });
        res.json(recurso);
    } catch (err) {
        res.status(400).json({ error: 'Id inválido' });
    }
});

// Incrementar contador de visualizaciones
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

// Crear un nuevo recurso
router.post('/', auth, async (req, res) => {
    try {
        const { title, content, category, author, image, tags } = req.body;
        if (!title || !content || !category || !author) {
            return res.status(400).json({ error: 'title, content, category y author son requeridos' });
        }

        // Find category by name
        const Category = require('../models/category');
        const categoryDoc = await Category.findOne({ name: category });
        if (!categoryDoc) {
            return res.status(400).json({ error: 'Categoría no encontrada' });
        }

        const recurso = new Recurso({ title, content, category: categoryDoc._id, author, image, tags });
        const saved = await recurso.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar recurso
router.put('/:id', auth, async (req, res) => {
    try {
        const updateData = { ...req.body };

        // If category is provided as name, find the ObjectId
        if (updateData.category && typeof updateData.category === 'string') {
            const Category = require('../models/category');
            const categoryDoc = await Category.findOne({ name: updateData.category });
            if (!categoryDoc) {
                return res.status(400).json({ error: 'Categoría no encontrada' });
            }
            updateData.category = categoryDoc._id;
        }

        const updated = await Recurso.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ error: 'Recurso no encontrado' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Eliminar recurso
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Recurso.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Recurso no encontrado' });
        res.json({ message: 'Recurso eliminado' });
    } catch (err) {
        res.status(400).json({ error: 'Id inválido' });
    }
});

module.exports = router;
