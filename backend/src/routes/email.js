/**
 * Email Routes
 * File: backend/src/routes/email.js
 */

import express from 'express';
import { EmailController } from '../controllers/emailController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Rotas públicas
router.post('/send-test', EmailController.sendTest.bind(EmailController));
router.get('/test', EmailController.testConnection.bind(EmailController));
router.post('/send-password-reset', EmailController.sendPasswordReset.bind(EmailController));

// Rotas protegidas (ADMIN)
router.use(authMiddleware);

router.post(
  '/send-order-confirmation',
  authorizeRoles('ADMIN'),
  EmailController.resendOrderConfirmation.bind(EmailController)
);

router.post(
  '/send-promotion',
  authorizeRoles('ADMIN'),
  EmailController.sendPromotion.bind(EmailController)
);

router.get(
  '/status',
  authorizeRoles('ADMIN'),
  EmailController.getStatus.bind(EmailController)
);

export default router;
