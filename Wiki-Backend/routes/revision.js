import express from 'express';
const router = express.Router();
import Revision from '../models/revision.js';
import Recurso from '../models/recurso.js';
import auth from '../middleware/auth.js'; // Assuming you have auth middleware

// Get all revisions for a specific recurso
router.get('/recurso/:recursoId', async (req, res) => {
    try {
        const revisions = await Revision.find({ recurso: req.params.recursoId })
            .populate('author', 'username')
            .sort({ version: -1 });
        res.json(revisions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific revision
router.get('/:id', async (req, res) => {
    try {
        const revision = await Revision.findById(req.params.id)
            .populate('author', 'username')
            .populate('recurso', 'title');
        if (!revision) return res.status(404).json({ message: 'Revision not found' });
        res.json(revision);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new revision (when editing a recurso)
router.post('/', auth, async (req, res) => {
    try {
        const { recursoId, title, content, summary, tags, image } = req.body;

        // Get current version
        const recurso = await Recurso.findById(recursoId);
        if (!recurso) return res.status(404).json({ message: 'Recurso not found' });

        const newVersion = recurso.currentVersion + 1;

        const revision = new Revision({
            recurso: recursoId,
            author: req.user.id,
            title,
            content,
            summary,
            version: newVersion,
            tags,
            image
        });

        const savedRevision = await revision.save();

        // Update recurso with new version info
        recurso.currentVersion = newVersion;
        recurso.lastEditedAt = new Date();
        recurso.lastEditedBy = req.user.id;
        await recurso.save();

        res.status(201).json(savedRevision);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
