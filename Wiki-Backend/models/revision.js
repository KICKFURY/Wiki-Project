const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RevisionSchema = new Schema({
    recurso: { type: Schema.Types.ObjectId, ref: 'Recurso', required: true }, // Referencia al recurso
    author: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }, // Autor de la revisión
    title: { type: String, required: true, trim: true }, // Título de la revisión
    content: { type: String, required: true }, // Contenido de la revisión
    summary: { type: String, trim: true }, // Resumen de los cambios
    version: { type: Number, required: true }, // Número de versión
    tags: [{ type: String, trim: true }], // Etiquetas de la revisión
    image: { type: String, trim: true } // Imagen asociada
}, { timestamps: true }); // Timestamps automáticos

module.exports = mongoose.model('Revision', RevisionSchema);
