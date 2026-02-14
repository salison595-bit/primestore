import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // ========================================================================
    // 1. Criar categoria padrão "Geral"
    // ========================================================================
    console.log('📂 Criando categoria padrão...');

    let generalCategory = await prisma.category.findUnique({
      where: { slug: 'geral' },
    });

    if (!generalCategory) {
      generalCategory = await prisma.category.create({
        data: {
          name: 'Geral',
          slug: 'geral',
          description: 'Categoria padrão para produtos sem categoria específica',
          isActive: true,
          displayOrder: 0,
        },
      });
      console.log(`✅ Categoria "Geral" criada: ${generalCategory.id}`);
    } else {
      console.log('✅ Categoria "Geral" já existe');
    }

    // ========================================================================
    // 2. Atualizar produtos sem categoryId para usar a categoria padrão
    // ========================================================================
    console.log('🔄 Atualizando produtos sem categoria...');

    const productsWithoutCategory = await prisma.product.findMany({
      where: { categoryId: null },
    });

    if (productsWithoutCategory.length > 0) {
      const updated = await prisma.product.updateMany({
        where: { categoryId: null },
        data: { categoryId: generalCategory.id },
      });
      console.log(
        `✅ ${updated.count} produtos atualizados com a categoria padrão`,
      );
    } else {
      console.log('✓ Todos os produtos já têm categoria');
    }

    // ========================================================================
    // 3. Gerar slug para produtos sem slug
    // ========================================================================
    console.log('🔄 Atualizando produtos sem slug...');

    const productsWithoutSlug = await prisma.product.findMany({
      where: { slug: null },
    });

    for (const product of productsWithoutSlug) {
      const slug = product.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
        .substring(0, 100);

      // Garantir slug único
      let finalSlug = slug;
      let counter = 1;
      while (
        await prisma.product.findUnique({
          where: { slug: finalSlug },
        })
      ) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      await prisma.product.update({
        where: { id: product.id },
        data: { slug: finalSlug },
      });
    }

    if (productsWithoutSlug.length > 0) {
      console.log(`✅ ${productsWithoutSlug.length} slugs gerados`);
    } else {
      console.log('✓ Todos os produtos já têm slug');
    }

    // ========================================================================
    // 4. Criar usuário admin padrão
    // ========================================================================
    console.log('👤 Criando usuário admin...');

    const adminEmail = 'salison595@gmail.com';
    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!adminUser) {
      // Gerar hash bcrypt da senha
      const plainPassword = 'Primestore.8'; // Senha padrão (mudar em produção!)
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      adminUser = await prisma.user.create({
        data: {
          name: 'Administrador',
          email: adminEmail,
          password: hashedPassword,
          phone: '+55 15 99197-8558',
          role: 'ADMIN',
          avatar:
            'https://api.dicebear.com/7.x/avataaars/svg?seed=admin-prime',
          isActive: true,
          emailVerified: true,
          phoneVerified: true,
        },
      });

      console.log(`✅ Usuário admin criado: ${adminUser.id}`);
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔐 Senha padrão: ${plainPassword}`);
      console.log('⚠️  IMPORTANTE: Altere a senha na primeira vez que fizer login!');
    } else {
      console.log('✅ Usuário admin já existe');
    }

    // ========================================================================
    // 5. Criar configuração padrão da loja
    // ========================================================================
    console.log('⚙️  Criando configurações padrão da loja...');

    const storeSettings = await prisma.storeSettings.findFirst();

    if (!storeSettings) {
      await prisma.storeSettings.create({
        data: {
          storeName: 'PRIME STORE',
          storeEmail: 'contato@primestore.com',
          storePhone: '+55 11 3000-0000',
          storeWebsite: 'https://primestore.com.br',
          seoTitle: 'PRIME STORE - Sua Loja Online',
          seoDescription:
            'A melhor loja online com produtos de qualidade e entrega rápida',
          seoKeywords: 'loja, ecommerce, compras online, prime store',
          defaultTaxRate: 0,
          shippingBase: 10.0,
          shippingPerKm: 0.5,
          freeShippingMin: 100.0,
          instagram: '@primestore',
          facebook: 'primestore',
          tiktok: '@primestore',
          whatsapp: '+5511999999999',
          maintenanceMode: false,
        },
      });
      console.log('✅ Configurações da loja criadas');
    } else {
      console.log('✅ Configurações da loja já existem');
    }

    // ========================================================================
    // Summary
    // ========================================================================
    console.log('\n');
    console.log('╔══════════════════════════════════════╗');
    console.log('║  ✅ SEED DO BANCO CONCLUÍDO COM ÊXITO ║');
    console.log('╚══════════════════════════════════════╝');
    console.log('\nDados inicializados:');
    console.log('  ✓ Categoria padrão: "Geral"');
    console.log(`  ✓ Usuário admin: ${adminEmail}`);
    console.log('  ✓ Configurações da loja');
    console.log('\n');
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
