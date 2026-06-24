import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Demo@123456', 10);
  const org = await prisma.organization.upsert({
    where: { id: 'demo-org-india' },
    update: {},
    create: {
      id: 'demo-org-india',
      name: 'Demo Indian Business',
      industry: 'education',
      wallet: {
        create: {
          balancePaise: 100000,
          lowBalancePaise: 10000,
          perMinutePricePaise: 100,
          telephonyCostPaise: 40,
          aiCostPaise: 30,
          platformMarginPaise: 30,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      passwordHash,
      role: Role.business_owner,
      organizationId: org.id,
      isEmailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      role: Role.super_admin,
      isEmailVerified: true,
    },
  });

  await prisma.businessProfile.create({
    data: {
      organizationId: org.id,
      businessName: 'Sofron Academy',
      industry: 'education',
      description: 'Online courses and admissions counselling for Indian students.',
      productsServices: [{ name: 'Full Stack Course', price: 14999 }],
      pricing: [{ item: 'Full Stack Course', amountPaise: 1499900 }],
      offersDiscounts: [{ name: 'June offer', discount: '20%' }],
      faqs: [{ q: 'Is EMI available?', a: 'Yes, EMI and UPI payment links are available.' }],
      refundPaymentPolicy: 'Refunds as per published policy within 7 days.',
      preferredLanguage: 'hi-IN',
      tone: 'friendly',
      businessHours: { start: '10:00', end: '18:30', timezone: 'Asia/Kolkata' },
      callbackRules: { sameDayBefore: '17:00', retryAfterMinutes: 120 },
      humanHandoffNumber: '+919999999999',
    },
  });
}

main().finally(() => prisma.$disconnect());
