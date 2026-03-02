import prisma from '../config/database.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('NotificationController');

class NotificationController {
  static async subscribe(req, res, next) {
    try {
      const { endpoint, keys, orderId } = req.body;
      const { p256dh, auth } = keys;

      await prisma.notificationSubscription.create({
        data: {
          endpoint,
          p256dh,
          auth,
          orderId,
          userId: req.user?.id || null,
        },
      });

      res.status(201).json({ success: true, message: 'Inscrição realizada com sucesso.' });
    } catch (error) {
      logger.error('Erro ao inscrever para notificações', error);
      next(error);
    }
  }
}

export default NotificationController;
