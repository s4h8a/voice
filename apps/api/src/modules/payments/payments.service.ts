import { Injectable } from '@nestjs/common';
import { PaymentStatus, WalletTransactionType } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { ProviderRegistry } from '../../providers/provider-registry';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService, private readonly providers: ProviderRegistry) {}

  async createLink(organizationId: string, input: { leadId?: string; amountPaise: number; description: string; metadata?: Record<string, unknown> }) {
    const lead = input.leadId ? await this.prisma.lead.findUnique({ where: { id: input.leadId } }) : undefined;
    const link = await this.providers.getPayment().createPaymentLink(
      input.amountPaise,
      { name: lead?.name || 'Customer', phone: lead?.phone || '', email: lead?.email || undefined },
      input.description,
    );
    return this.prisma.payment.create({
      data: {
        organizationId,
        leadId: input.leadId,
        provider: this.providers.getPaymentName(),
        providerPaymentId: link.providerPaymentId,
        paymentLink: link.paymentLink,
        amountPaise: input.amountPaise,
        description: input.description,
        metadata: { currency: 'INR', paymentMode: 'upi_or_india_gateway', ...(input.metadata || {}) },
        status: PaymentStatus.link_sent,
      },
    });
  }

  createWalletRechargeLink(organizationId: string, amountPaise: number) {
    return this.createLink(organizationId, {
      amountPaise,
      description: `Wallet recharge INR ${(amountPaise / 100).toFixed(2)}`,
      metadata: { purpose: 'wallet_recharge' },
    });
  }

  async webhook(provider: string, payload: any, signature?: string) {
    const ok = await this.providers.getPayment().verifyWebhook(payload, signature);
    const providerPaymentId =
      payload?.providerPaymentId ||
      payload?.payment_id ||
      payload?.razorpay_payment_id ||
      payload?.data?.payment?.id ||
      payload?.data?.payment_id;
    const statusText = String(payload?.status || payload?.event || payload?.data?.payment?.status || '').toLowerCase();
    const paid = ok && /(paid|captured|success|payment_success)/.test(statusText);
    const payment = providerPaymentId
      ? await this.prisma.payment.findFirst({ where: { providerPaymentId } })
      : undefined;

    const webhook = await this.prisma.paymentWebhook.create({
      data: { provider, signatureOk: ok, payload, paymentId: payment?.id },
    });

    if (payment && paid && payment.status !== PaymentStatus.paid) {
      await this.prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.paid } });
      const metadata = payment.metadata as any;
      if (metadata?.purpose === 'wallet_recharge') {
        const wallet = await this.prisma.wallet.upsert({
          where: { organizationId: payment.organizationId },
          update: { balancePaise: { increment: payment.amountPaise } },
          create: { organizationId: payment.organizationId, balancePaise: payment.amountPaise },
        });
        await this.prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: WalletTransactionType.recharge,
            amountPaise: payment.amountPaise,
            balanceAfterPaise: wallet.balancePaise,
            reference: providerPaymentId,
            metadata: { source: 'upi_webhook', paymentId: payment.id },
          },
        });
      }
    }

    return webhook;
  }

  list(organizationId: string) {
    return this.prisma.payment.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } });
  }
}
