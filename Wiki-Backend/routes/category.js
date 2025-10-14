const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const auth = require('../middleware/auth');

/**
 * Obtener todas las categorías activas
 */
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific category by ID
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new category
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

// Update a category
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

// Delete a category
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

module.exports = router;
