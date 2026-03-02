import express from 'express';
import NotificationController from '../controllers/notificationController.js';
import { optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/subscribe', optionalAuth, NotificationController.subscribe);

export default router;
