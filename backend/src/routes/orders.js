import express from 'express';
import OrderController from '../controllers/orderController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.get('/user', authMiddleware, OrderController.getUserOrders.bind(OrderController));
router.get('/:id/public', OrderController.getOrderPublic.bind(OrderController));
router.post('/:id/sync-tracking', OrderController.syncOrderTracking.bind(OrderController));

export default router;
