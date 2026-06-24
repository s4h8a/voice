import { BadRequestException, Injectable } from '@nestjs/common';
import { WalletTransactionType } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

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
    const wallet = await this.prisma.wallet.findUniqueOrThrow({ where: { organizationId } });
    const minutes = Math.max(1, Math.ceil(durationSeconds / 60));
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
