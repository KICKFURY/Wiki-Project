import express from 'express';
const router = express.Router();
import Revision from '../models/revision.js';
import Recurso from '../models/recurso.js';
import auth from '../middleware/auth.js';

/**
 * @swagger
 * tags:
 *   name: Revisiones
 *   description: Endpoints para gestionar las revisiones de los recursos.
 */

/**
 * @swagger
 * /api/revisions/recurso/{recursoId}:
 *   get:
 *     summary: Obtener todas las revisiones de un recurso específico
 *     tags: [Revisiones]
 *     parameters:
 *       - name: recursoId
 *         in: path
 *         required: true
 *         description: ID del recurso del cual se quieren obtener las revisiones
 *         schema:
 *           type: string
 *           example: 6715babc9c6a89e49b9f556a
 *     responses:
 *       200:
 *         description: Lista de revisiones del recurso especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   recurso:
 *                     type: string
 *                   author:
 *                     type: string
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   summary:
 *                     type: string
 *                   version:
 *                     type: integer
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: No se encontraron revisiones
 *       500:
 *         description: Error interno del servidor
 */
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

/**
 * @swagger
 * /api/revisions/{id}:
 *   get:
 *     summary: Obtener una revisión específica
 *     tags: [Revisiones]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la revisión
 *         schema:
 *           type: string
 *           example: 6715babc9c6a89e49b9f556a
 *     responses:
 *       200:
 *         description: Revisión encontrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 recurso:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                 author:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     username:
 *                       type: string
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 summary:
 *                   type: string
 *                 version:
 *                   type: integer
 *       404:
 *         description: Revisión no encontrada
 *       500:
 *         description: Error interno del servidor
 */
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

/**
 * @swagger
 * /api/revisions:
 *   post:
 *     summary: Crear una nueva revisión para un recurso
 *     tags: [Revisiones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recursoId
 *               - title
 *               - content
 *             properties:
 *               recursoId:
 *                 type: string
 *                 example: 6715babc9c6a89e49b9f556a
 *               title:
 *                 type: string
 *                 example: "Actualización de la guía de ciberseguridad"
 *               content:
 *                 type: string
 *                 example: "Se añadieron nuevos ejemplos de ataques de phishing."
 *               summary:
 *                 type: string
 *                 example: "Actualización menor del contenido"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["ciberseguridad", "guía"]
 *               image:
 *                 type: string
 *                 example: "https://example.com/imagen.png"
 *     responses:
 *       201:
 *         description: Revisión creada exitosamente
 *       400:
 *         description: Error en los datos enviados o recurso no encontrado
 *       401:
 *         description: No autorizado (token inválido o ausente)
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', auth, async (req, res) => {
  try {
    const { recursoId, title, content, summary, tags, image } = req.body;

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
      image,
    });

    const savedRevision = await revision.save();

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
