import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WalletTransactionType } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  get(organizationId: string) {
    return this.prisma.wallet.findUnique({ where: { organizationId }, include: { transactions: { orderBy: { createdAt: 'desc' }, take: 50 } } });
  }

  async recharge(organizationId: string, amountPaise: number, reference = 'manual') {
    const wallet = await this.prisma.wallet.upsert({
      where: { organizationId },
      update: { balancePaise: { increment: amountPaise } },
      create: { organizationId, balancePaise: amountPaise },
    });
    return this.prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: WalletTransactionType.recharge,
        amountPaise,
        balanceAfterPaise: wallet.balancePaise,
        reference,
      },
    });
  }

  async debitCall(organizationId: string, durationSeconds: number, freeFirstCall = false) {
    const minutes = Math.max(1, Math.ceil(durationSeconds / 60));
    const wallet = await this.prisma.wallet.findUnique({ where: { organizationId } });
    if (this.config.get<string>('BILLING_MODE') !== 'wallet') {
      if (wallet) {
        await this.prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: WalletTransactionType.promo_free_call,
            amountPaise: 0,
            balanceAfterPaise: wallet.balancePaise,
            metadata: { durationSeconds, minutes, billingMode: 'free_beta' },
          },
        });
      }
      return { costPaise: 0, balancePaise: wallet?.balancePaise || 0 };
    }
    if (!wallet) throw new BadRequestException('Wallet is not configured for this organization');
    const amount = freeFirstCall ? 0 : minutes * wallet.perMinutePricePaise;
    if (!freeFirstCall && wallet.balancePaise < amount) {
      throw new BadRequestException('Wallet balance is too low. Please recharge using an INR/UPI payment link.');
    }
    const updated = await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { balancePaise: { decrement: amount } },
    });
    await this.prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: freeFirstCall ? WalletTransactionType.promo_free_call : WalletTransactionType.debit_call,
        amountPaise: -amount,
        balanceAfterPaise: updated.balancePaise,
        metadata: { durationSeconds, minutes },
      },
    });
    return { costPaise: amount, balancePaise: updated.balancePaise };
  }
}
