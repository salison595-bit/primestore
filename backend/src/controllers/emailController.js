/**
 * Email Controller - Gerenciar notificações por email
 * File: backend/src/controllers/emailController.js
 */

import emailService from '../services/emailService.js';
import { logger } from '../utils/logger.js';
import prisma from '../config/database.js';

export class EmailController {
  /**
   * GET /api/email/test
   * Testa conexão com servidor SMTP
   */
  static async testConnection(req, res) {
    try {
      const result = await emailService.testConnection();
      
      if (result.success) {
        logger.info('✅ Teste de email bem-sucedido');
        return res.json({
          success: true,
          message: 'Conexão com SMTP funcionando',
        });
      }

      logger.warn('❌ Teste de email falhou');
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    } catch (error) {
      logger.error('Erro ao testar email', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/email/send-test
   * Envia email de teste para um endereço
   * Body: { email: "teste@example.com" }
   */
  static async sendTest(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email é obrigatório',
        });
      }

      const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; background: #f9fafb; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
              <h2 style="color: #2563eb;">Email de Teste - PRIME STORE</h2>
              <p>Este é um email de teste para validar a configuração do sistema de notificações.</p>
              
              <p style="margin-top: 20px; color: #666;">
                <strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}
              </p>
              
              <p style="margin-top: 20px; padding: 10px; background: #f0f9ff; border-left: 4px solid #2563eb;">
                Se você recebeu este email, significa que o sistema está funcionando corretamente! ✅
              </p>
            </div>
          </body>
        </html>
      `;

      await emailService.transporter.sendMail({
        from: emailService.fromEmail,
        to: email,
        subject: 'Email de Teste - PRIME STORE',
        html: htmlContent,
      });

      logger.info('📧 Email de teste enviado', { email });

      return res.json({
        success: true,
        message: 'Email de teste enviado com sucesso',
        sentTo: email,
      });
    } catch (error) {
      logger.error('Erro ao enviar email de teste', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/email/send-order-confirmation
   * Reenviar email de confirmação de pedido
   * Body: { orderId: "uuid" }
   * Requer autenticação ADMIN
   */
  static async resendOrderConfirmation(req, res) {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'orderId é obrigatório',
        });
      }

      // Buscar pedido e cliente
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: true,
          items: {
            include: { product: true },
          },
        },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Pedido não encontrado',
        });
      }

      const customerName = order.customer?.name || 'Cliente';
      const customerEmail = order.customer?.email;

      if (!customerEmail) {
        return res.status(400).json({
          success: false,
          error: 'Email do cliente não encontrado',
        });
      }

      // Preparar dados do pedido
      const orderData = {
        id: order.id,
        total: order.total,
        paymentMethod: order.paymentMethod || 'Mercado Pago',
        items: order.items.map(item => ({
          productName: item.product?.name || 'Produto',
          quantity: item.quantity,
          price: item.price,
        })),
        createdAt: order.createdAt,
      };

      const result = await emailService.sendOrderConfirmation(
        orderData,
        { name: customerName, email: customerEmail }
      );

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error,
        });
      }

      logger.info('📧 Email de confirmação reenviado', {
        orderId,
        email: customerEmail,
      });

      return res.json({
        success: true,
        message: 'Email de confirmação reenviado',
        sentTo: customerEmail,
      });
    } catch (error) {
      logger.error('Erro ao reenviar email de confirmação', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/email/send-password-reset
   * Enviar email de recuperação de senha
   * Body: { email: "user@example.com" }
   */
  static async sendPasswordReset(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email é obrigatório',
        });
      }

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Não revelar se usuário existe ou não (segurança)
        return res.json({
          success: true,
          message: 'Se o email existe, você receberá um link de recuperação',
        });
      }

      // Gerar token de reset (seria armazenado no banco com TTL)
      const resetToken = require('crypto').randomBytes(32).toString('hex');

      // Aqui você armazenaria o token no banco com um TTL
      // await prisma.passwordReset.create({...})

      const result = await emailService.sendPasswordReset(user, resetToken);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error,
        });
      }

      logger.info('📧 Email de recuperação enviado', { email });

      return res.json({
        success: true,
        message: 'Email de recuperação enviado',
      });
    } catch (error) {
      logger.error('Erro ao enviar email de recuperação', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/email/send-promotion
   * Enviar email de promoção para múltiplos usuários
   * Body: { promotionId: "uuid" }
   * Requer autenticação ADMIN
   */
  static async sendPromotion(req, res) {
    try {
      const { promotionId } = req.body;

      if (!promotionId) {
        return res.status(400).json({
          success: false,
          error: 'promotionId é obrigatório',
        });
      }

      // Buscar promoção
      const promotion = await prisma.promotion.findUnique({
        where: { id: promotionId },
      });

      if (!promotion) {
        return res.status(404).json({
          success: false,
          error: 'Promoção não encontrada',
        });
      }

      // Buscar clientes ativos
      const users = await prisma.user.findMany({
        where: {
          emailVerified: true,
          deletedAt: null,
        },
        select: { email: true },
      });

      if (users.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum usuário para enviar promoção',
        });
      }

      const result = await emailService.sendPromotionEmail(users, promotion);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error,
        });
      }

      logger.info('📧 Promoção enviada', {
        promotionId,
        sentCount: result.sentCount,
      });

      return res.json({
        success: true,
        message: `Promoção enviada para ${result.sentCount} usuários`,
        sentCount: result.sentCount,
      });
    } catch (error) {
      logger.error('Erro ao enviar promoção', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/email/status
   * Verificar status do sistema de email
   * Requer autenticação ADMIN
   */
  static async getStatus(req, res) {
    try {
      const connectionTest = await emailService.testConnection();

      return res.json({
        success: true,
        status: {
          connectionOk: connectionTest.success,
          emailService: 'Ativo',
          provider: process.env.EMAIL_HOST || 'brevo',
          fromEmail: emailService.fromEmail,
          adminEmail: emailService.adminEmail,
        },
      });
    } catch (error) {
      logger.error('Erro ao verificar status de email', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export default EmailController;
