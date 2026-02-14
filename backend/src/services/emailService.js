/**
 * Email Service - Notificações para clientes e admin
 * File: backend/src/services/emailService.js
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Configurar transporter
const createTransporter = () => {
  // Opção 1: Gmail
  // return nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS  // Use App Password, não senha normal
  //   }
  // });

  // Opção 2: Brevo/Sendinblue (melhor para produção)
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
    port: process.env.EMAIL_PORT || 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Opção 3: SendGrid
  // return nodemailer.createTransport({
  //   host: 'smtp.sendgrid.net',
  //   port: 587,
  //   auth: {
  //     user: 'apikey',
  //     pass: process.env.SENDGRID_API_KEY
  //   }
  // });
};

class EmailService {
  constructor() {
    this.transporter = createTransporter();
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@primestore.com.br';
    this.adminEmail = process.env.ADMIN_EMAIL || 'admin@primestore.com.br';
  }

  /**
   * Enviar email de confirmação de pedido
   */
  async sendOrderConfirmation(order, customer) {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9fafb; padding: 20px; }
            .order-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2563eb; }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .total { font-size: 18px; font-weight: bold; color: #2563eb; margin-top: 15px; }
            .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; }
            .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Pedido Confirmado! 🎉</h1>
            </div>
            
            <div class="content">
              <p>Olá <strong>${customer.name}</strong>,</p>
              
              <p>Seu pedido foi confirmado com sucesso!</p>
              
              <div class="order-details">
                <h3>Detalhes do Pedido</h3>
                <p><strong>ID:</strong> #${order.id}</p>
                <p><strong>Data:</strong> ${new Date(order.createdAt).toLocaleDateString('pt-BR', { timeStyle: 'short' })}</p>
                <p><strong>Status:</strong> ✅ CONFIRMADO</p>
                <p><strong>Forma de Pagamento:</strong> ${order.paymentMethod}</p>
              </div>
              
              <h3>Produtos</h3>
              ${order.items.map(item => `
                <div class="item">
                  <span>${item.productName} (x${item.quantity})</span>
                  <span>R$ ${item.price.toFixed(2)}</span>
                </div>
              `).join('')}
              
              <div class="total">
                Total: R$ ${order.total.toFixed(2)}
              </div>
              
              <p style="margin-top: 20px;">
                <a href="${process.env.FRONT_URL}/order/${order.id}" class="button">
                  Acompanhar Pedido
                </a>
              </p>
              
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                Se você não fez este pedido, ignore este email.
              </p>
            </div>
            
            <div class="footer">
              <p>PRIME STORE - Sua loja online</p>
              <p>© 2026 Todos os direitos reservados</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: customer.email,
        subject: `Pedido Confirmado #${order.id} - PRIME STORE`,
        html: htmlContent
      });

      logger.info('📧 Email de confirmação enviado', {
        orderId: order.id,
        customerEmail: customer.email
      });

      return { success: true };
    } catch (error) {
      logger.error('❌ Erro ao enviar email de confirmação', {
        orderId: order.id,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar notificação para admin
   */
  async sendAdminNotification(order, type = 'new-order') {
    const subjects = {
      'new-order': '🆕 Novo Pedido Recebido',
      'payment-approved': '✅ Pagamento Aprovado',
      'payment-failed': '❌ Pagamento Falhou',
      'order-shipped': '📦 Pedido Enviado'
    };

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>${subjects[type]}</h2>
          <p><strong>ID do Pedido:</strong> ${order.id}</p>
          <p><strong>Cliente:</strong> ${order.customerName}</p>
          <p><strong>Email:</strong> ${order.customerEmail}</p>
          <p><strong>Valor Total:</strong> R$ ${order.total.toFixed(2)}</p>
          <p><strong>Data:</strong> ${new Date(order.createdAt).toLocaleString('pt-BR')}</p>
          <hr>
          <p><a href="${process.env.FRONT_URL}/admin/orders/${order.id}">Ver detalhes no painel</a></p>
        </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: this.adminEmail,
        subject: `[ADMIN] ${subjects[type]} - #${order.id}`,
        html: htmlContent
      });

      logger.info('📧 Notificação admin enviada', {
        orderId: order.id,
        type
      });

      return { success: true };
    } catch (error) {
      logger.error('❌ Erro ao enviar notificação admin', {
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Email de recuperação de senha
   */
  async sendPasswordReset(user, resetToken) {
    const resetUrl = `${process.env.FRONT_URL}/reset-password?token=${resetToken}`;

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Recuperação de Senha</h2>
          <p>Oi ${user.name},</p>
          <p>Clique no link abaixo para redefinir sua senha:</p>
          <p><a href="${resetUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Redefinir Senha
          </a></p>
          <p style="color: #666; font-size: 12px;">
            Este link expira em 1 hora.<br>
            Se você não solicitou isso, ignore este email.
          </p>
        </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: user.email,
        subject: 'Recupere sua senha - PRIME STORE',
        html: htmlContent
      });

      logger.info('📧 Email de recuperação enviado', {
        userId: user.id,
        email: user.email
      });

      return { success: true };
    } catch (error) {
      logger.error('❌ Erro ao enviar email de recuperação', {
        error: error.message
      });
      return { success: false };
    }
  }

  /**
   * Email de boas-vindas
   */
  async sendWelcomeEmail(user) {
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Bem-vindo à PRIME STORE! 🎉</h2>
          <p>Olá <strong>${user.name}</strong>,</p>
          <p>Sua conta foi criada com sucesso! Agora você pode fazer compras em nossa loja.</p>
          
          <h3>Próximos passos:</h3>
          <ul>
            <li>Explore nossos produtos</li>
            <li>Adicione itens ao carrinho</li>
            <li>Complete o checkout com segurança</li>
            <li>Acompanhe seus pedidos</li>
          </ul>
          
          <p>
            <a href="${process.env.FRONT_URL}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Começar a Comprar
            </a>
          </p>
          
          <p>Qualquer dúvida, nos contate!</p>
        </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: user.email,
        subject: 'Boas-vindas à PRIME STORE',
        html: htmlContent
      });

      logger.info('📧 Email de boas-vindas enviado', {
        userId: user.id
      });

      return { success: true };
    } catch (error) {
      logger.error('❌ Erro ao enviar email de boas-vindas', {
        error: error.message
      });
      return { success: false };
    }
  }

  /**
   * Email de notificação de promoção
   */
  async sendPromotionEmail(users, promotion) {
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>🎁 Promoção Especial!</h2>
          <p><strong>${promotion.title}</strong></p>
          <p>${promotion.description}</p>
          
          <h3>Detalhes:</h3>
          <ul>
            <li>Desconto: ${promotion.discount}%</li>
            <li>Válida até: ${new Date(promotion.expiresAt).toLocaleDateString('pt-BR')}</li>
            <li>Código: <strong>${promotion.code}</strong></li>
          </ul>
          
          <p>
            <a href="${process.env.FRONT_URL}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Aproveitar Promoção
            </a>
          </p>
        </body>
      </html>
    `;

    const emailPromises = users.map(user =>
      this.transporter.sendMail({
        from: this.fromEmail,
        to: user.email,
        subject: `${promotion.title} - PRIME STORE`,
        html: htmlContent
      }).catch(error => {
        logger.error('❌ Erro ao enviar promoção', {
          userEmail: user.email,
          error: error.message
        });
      })
    );

    try {
      await Promise.all(emailPromises);
      logger.info('📧 Promoção enviada para ' + users.length + ' usuários', {
        promotionId: promotion.id
      });
      return { success: true, sentCount: users.length };
    } catch (error) {
      logger.error('❌ Erro ao enviar promoções em massa', {
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Teste de conexão com email
   */
  async testConnection() {
    try {
      await this.transporter.verify();
      logger.info('✅ Conexão com servidor SMTP OK', {
        host: process.env.EMAIL_HOST
      });
      return { success: true, message: 'Conexão OK' };
    } catch (error) {
      logger.error('❌ Erro na conexão SMTP', {
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
