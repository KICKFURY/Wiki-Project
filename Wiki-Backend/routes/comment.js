import express from 'express';
const router = express.Router();
import Comment from '../models/comment.js';
import Recurso from '../models/recurso.js';
import auth from '../middleware/auth.js';

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: API para gestionar comentarios de los recursos
 */

/**
 * @swagger
 * /comments/recurso/{recursoId}:
 *   get:
 *     summary: Obtener todos los comentarios de un recurso
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: recursoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del recurso
 *     responses:
 *       200:
 *         description: Lista de comentarios del recurso
 *       500:
 *         description: Error en el servidor
 */
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

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Obtener un comentario específico
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del comentario
 *     responses:
 *       200:
 *         description: Comentario encontrado
 *       404:
 *         description: Comentario no encontrado
 *       500:
 *         description: Error en el servidor
 */
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

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Crear un nuevo comentario
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recursoId:
 *                 type: string
 *               content:
 *                 type: string
 *               parentCommentId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Comentario creado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Recurso no encontrado
 */
router.post('/', auth, async (req, res) => {
    try {
        const { recursoId, content, parentCommentId } = req.body;

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

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Actualizar un comentario (solo por el autor)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comentario actualizado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Comentario no encontrado
 *       400:
 *         description: Error en la solicitud
 */
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

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Eliminar (soft delete) un comentario (por autor o admin)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comentario eliminado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Comentario no encontrado
 */
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

/**
 * @swagger
 * /comments/{id}/like:
 *   post:
 *     summary: Dar o quitar like a un comentario
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado de like actualizado
 *       404:
 *         description: Comentario no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.post('/:id/like', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const userId = req.user.id;
        const likeIndex = comment.likes.indexOf(userId);

        if (likeIndex > -1) {
            comment.likes.splice(likeIndex, 1);
        } else {
            comment.likes.push(userId);
        }

        await comment.save();
        res.json({ likes: comment.likes.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
