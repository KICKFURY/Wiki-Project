import express from 'express';
const router = express.Router();
import Comment from '../models/comment.js';
import Recurso from '../models/recurso.js';
import auth from '../middleware/auth.js';

// Get all comments for a specific recurso
router.get('/recurso/:recursoId', async (req, res) => {
    try {
        const comments = await Comment.find({
            recurso: req.params.recursoId,
            isDeleted: false
        })
            .populate('author', 'username')
            .populate({
                path: 'parentComment',
                populate: { path: 'author', select: 'username' }
            })
            .sort({ createdAt: 1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific comment
router.get('/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
            .populate('author', 'username')
            .populate('recurso', 'title');
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new comment
router.post('/', auth, async (req, res) => {
    try {
        const { recursoId, content, parentCommentId } = req.body;

        // Verify recurso exists
        const recurso = await Recurso.findById(recursoId);
        if (!recurso) return res.status(404).json({ message: 'Recurso not found' });

        const comment = new Comment({
            recurso: recursoId,
            author: req.user.id,
            content,
            parentComment: parentCommentId || null
        });

        const savedComment = await comment.save();
        await savedComment.populate('author', 'username');

        res.status(201).json(savedComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a comment (only by author)
router.put('/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this comment' });
        }

        comment.content = req.body.content;
        const updatedComment = await comment.save();
        await updatedComment.populate('author', 'username');

        res.json(updatedComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Soft delete a comment (only by author or admin)
router.delete('/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        comment.isDeleted = true;
        await comment.save();

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Like/unlike a comment
router.post('/:id/like', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const userId = req.user.id;
        const likeIndex = comment.likes.indexOf(userId);

        if (likeIndex > -1) {
            // Unlike
            comment.likes.splice(likeIndex, 1);
        } else {
            // Like
            comment.likes.push(userId);
        }

        await comment.save();
        res.json({ likes: comment.likes.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
