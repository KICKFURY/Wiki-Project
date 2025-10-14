// models/usuario.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UsuarioSchema = new Schema({
    dni: { type: String, required: true, unique: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    followers: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'Recurso' }], // Resources liked by the user
    lastActivity: { type: Date, default: Date.now } // Last activity timestamp for session management
}, { timestamps: true });

export default mongoose.model('Usuario', UsuarioSchema);
