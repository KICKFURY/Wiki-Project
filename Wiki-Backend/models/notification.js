import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    type: {
        type: String,
        enum: ['follow', 'like', 'comment', 'invite'],
        required: true
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }, // User who receives the notification
    relatedUser: { type: Schema.Types.ObjectId, ref: 'Usuario' }, // User who triggered the notification (e.g., who followed)
    relatedResource: { type: Schema.Types.ObjectId, ref: 'Recurso' }, // Resource related to the notification (e.g., liked or commented on)
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);
