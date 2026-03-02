import { rastrearEncomendas } from 'correios-brasil';
import prisma from '../config/database.js';
import webpush from 'web-push';
import EmailService from './emailService.js';

const emailService = new EmailService();

webpush.setVapidDetails(
  `mailto:${process.env.ADMIN_EMAIL || 'admin@primestore.com.br'}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export const trackOrder = async (trackingNumber, retries = 3) => {
  if (!trackingNumber) {
    throw new Error('Número de rastreio não fornecido.');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const [result] = await rastrearEncomendas([trackingNumber]);
      
      // Se a resposta indicar erro de objeto não encontrado, retornamos o erro formatado
      if (result?.erro) {
        return { erro: result.erro, numero: trackingNumber };
      }
      
      return result;
    } catch (error) {
      const isLastAttempt = attempt === retries;
      console.error(`Tentativa ${attempt}/${retries} - Erro ao rastrear encomenda ${trackingNumber}:`, error.message);
      
      if (isLastAttempt) {
        throw new Error(`Serviço de rastreamento indisponível após ${retries} tentativas.`);
      }
      
      // Aguarda um pouco antes de tentar novamente (backoff exponencial simples)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

export const syncTrackingHistory = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true }
  });

  if (!order || !order.trackingNumber) {
    throw new Error('Pedido ou código de rastreio não encontrado.');
  }

  const trackingInfo = await trackOrder(order.trackingNumber);

  // Se for erro de objeto não encontrado, não fazemos nada mas não lançamos exceção
  if (trackingInfo?.erro) {
    console.warn(`Objeto ${order.trackingNumber} não encontrado nos Correios ainda.`);
    return order;
  }

  if (!trackingInfo || !Array.isArray(trackingInfo.eventos)) {
    return order;
  }

  const newEvents = trackingInfo.eventos.map(event => ({
    status: mapStatus(event.descricao),
    description: event.descricao,
    location: event.unidade.nome,
    createdAt: new Date(event.data),
    notes: `Origem: ${event.unidade.cidade}/${event.unidade.uf}`,
  }));

  // Lógica para evitar duplicatas e atualizar o histórico
  const existingHistory = await prisma.orderStatusHistory.findMany({
    where: { orderId },
  });

  const eventsToCreate = newEvents.filter(newEvent => 
    !existingHistory.some(existingEvent => 
      existingEvent.description === newEvent.description &&
      new Date(existingEvent.createdAt).getTime() === newEvent.createdAt.getTime()
    )
  );

  if (eventsToCreate.length > 0) {
    await prisma.orderStatusHistory.createMany({
      data: eventsToCreate.map(event => ({ ...event, orderId })),
    });

    const latestEvent = eventsToCreate[0];
    
    // Envia Notificação Push
    sendNotification(orderId, {
      title: `Atualização do Pedido #${order.orderNumber}`,
      body: latestEvent.description,
    });

    // Envia E-mail de Atualização
    if (order.user) {
      emailService.sendShippingUpdate(order, order.user, latestEvent).catch(err => {
        console.error('Falha ao enviar e-mail de atualização de frete:', err);
      });
    }
  }

  // Atualiza o status principal do pedido
  const latestStatus = newEvents[0]?.status;
  if (latestStatus && latestStatus !== order.status) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: latestStatus },
    });
  }

  return prisma.order.findUnique({
    where: { id: orderId },
    include: { statusHistory: { orderBy: { createdAt: 'desc' } } },
  });
};

const mapStatus = (description) => {
  const desc = description.toLowerCase();
  if (desc.includes('entregue')) return 'DELIVERED';
  if (desc.includes('saiu para entrega')) return 'SHIPPED';
  if (desc.includes('em trânsito') || desc.includes('transferência')) return 'PROCESSING';
  if (desc.includes('postado')) return 'CONFIRMED';
  return 'PENDING';
};

export const sendNotification = async (orderId, payload) => {
  const subscriptions = await prisma.notificationSubscription.findMany({
    where: { orderId },
  });

  subscriptions.forEach(subscription => {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    webpush.sendNotification(pushSubscription, JSON.stringify(payload))
      .catch(error => {
        console.error('Erro ao enviar notificação:', error);
        // Se a inscrição for inválida (ex: 410 Gone), remova-a do banco
        if (error.statusCode === 410) {
          prisma.notificationSubscription.delete({ where: { id: subscription.id } }).catch(() => {});
        }
      });
  });
};
