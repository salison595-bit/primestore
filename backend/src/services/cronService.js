import cron from 'node-cron';
import prisma from '../config/database.js';
import { syncTrackingHistory } from './shippingService.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('CronService');

/**
 * Inicializa as tarefas agendadas da aplicação
 */
export const initCronJobs = () => {
  // Sincronização de rastreio a cada 6 horas
  // 0 */6 * * * -> Minuto 0, a cada 6 horas, todos os dias
  cron.schedule('0 */6 * * *', async () => {
    logger.info('Iniciando sincronização automática de rastreios...');
    
    try {
      // Busca pedidos ativos que tenham código de rastreio
      const activeOrders = await prisma.order.findMany({
        where: {
          status: {
            notIn: ['DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED']
          },
          trackingNumber: {
            not: null
          }
        },
        select: {
          id: true,
          orderNumber: true
        }
      });

      logger.info(`Encontrados ${activeOrders.length} pedidos para sincronização.`);

      for (const order of activeOrders) {
        try {
          await syncTrackingHistory(order.id);
          logger.debug(`Pedido #${order.orderNumber} sincronizado com sucesso.`);
        } catch (err) {
          logger.error(`Falha ao sincronizar pedido #${order.orderNumber}:`, err);
        }
      }

      logger.info('Sincronização automática de rastreios finalizada.');
    } catch (error) {
      logger.error('Erro geral no cron de sincronização:', error);
    }
  });

  logger.info('Tarefas agendadas inicializadas com sucesso.');
};
