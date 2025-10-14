const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    recurso: { type: Schema.Types.ObjectId, ref: 'Recurso', required: true }, // Referencia al recurso
    author: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }, // Autor del comentario
    content: { type: String, required: true }, // Contenido del comentario
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null }, // Comentario padre para hilos
    isDeleted: { type: Boolean, default: false }, // Indicador de eliminación suave
    likes: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }] // Usuarios que dieron like
}, { timestamps: true }); // Timestamps automáticos

module.exports = mongoose.model('Comment', CommentSchema);
