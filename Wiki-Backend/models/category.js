import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true }, // Nombre de la categoría
    slug: { type: String, required: true, unique: true, trim: true }, // Slug para URLs
    description: { type: String, trim: true }, // Descripción de la categoría
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null }, // Categoría padre para jerarquía
    color: { type: String, trim: true }, // Color opcional para UI
    isActive: { type: Boolean, default: true } // Indicador de actividad
}, { timestamps: true }); // Timestamps automáticos

export default mongoose.model('Category', CategorySchema);
