import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const RecursoSchema = new Schema({
    title: { type: String, required: true, trim: true }, // Título del recurso
    content: { type: String, required: true }, // Contenido del recurso
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true }, // Referencia a la categoría
    author: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }, // Autor del recurso
    image: { type: String, trim: true }, // Imagen asociada
    tags: [{ type: String, trim: true }], // Etiquetas del recurso
    // Metadatos específicos de wiki
    viewCount: { type: Number, default: 0 }, // Contador de vistas
    lastEditedAt: { type: Date, default: Date.now }, // Última edición
    lastEditedBy: { type: Schema.Types.ObjectId, ref: 'Usuario' }, // Último editor
    // Control de acceso
    isPublic: { type: Boolean, default: true }, // Si es público
    allowedUsers: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }], // Usuarios permitidos para páginas privadas
    // Versionado
    currentVersion: { type: Number, default: 1 } // Versión actual
}, { timestamps: true }); // Timestamps automáticos

export default mongoose.model('Recurso', RecursoSchema);
