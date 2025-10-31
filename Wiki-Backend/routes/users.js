import express from 'express';
const router = express.Router();
import container from '../utils/container.js';
import { validateUserCreation, validateLogin, validateFollow, validateInvite } from '../middleware/validation.js';

// Get controller instance from container
const userController = container.getUserController();

// Routes
router.get('/', userController.getAll.bind(userController));
router.get('/:id', userController.getById.bind(userController));
router.get('/username/:username', userController.getByUsername.bind(userController));
router.get('/email/:email', userController.getByEmail.bind(userController));

router.post('/', validateUserCreation, userController.create.bind(userController));
router.put('/:id', userController.update.bind(userController));
router.delete('/:id', userController.delete.bind(userController));

router.post('/login', validateLogin, userController.login.bind(userController));
router.post('/logout', userController.logout.bind(userController));

router.post('/:id/follow', validateFollow, userController.follow.bind(userController));
router.post('/:id/unfollow', validateFollow, userController.unfollow.bind(userController));

router.get('/followers/:id', userController.getFollowers.bind(userController));
router.get('/following/:id', userController.getFollowing.bind(userController));

router.post('/invite', validateInvite, userController.invite.bind(userController));

router.post('/:id/upload-profile-image', userController.uploadProfileImage.bind(userController));

// Notification routes
router.get('/notifications', userController.getNotifications.bind(userController));
router.put('/notifications/:id/read', userController.markNotificationAsRead.bind(userController));
router.delete('/notifications/:id', userController.deleteNotification.bind(userController));

export default router;
