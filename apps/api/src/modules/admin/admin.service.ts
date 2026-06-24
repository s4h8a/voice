import { Injectable } from '@nestjs/common';
import { ProviderType } from '@prisma/client';
import { CryptoService } from '../../common/crypto.service';
import { PrismaService } from '../../common/prisma.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
    private readonly crypto: CryptoService,
  ) {}

  users() {
    return this.prisma.user.findMany({ include: { organization: true }, orderBy: { createdAt: 'desc' } });
  }

  campaigns() {
    return this.prisma.campaign.findMany({ include: { organization: true }, orderBy: { createdAt: 'desc' } });
  }

  auditLogs() {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 500 });
  }

  providerConfigs() {
    return this.prisma.providerConfig.findMany({
      select: { id: true, organizationId: true, type: true, provider: true, isActive: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  providerConfig(input: { organizationId?: string; type: ProviderType; provider: string; isActive: boolean; config: Record<string, unknown> }) {
    return this.prisma.providerConfig.create({
      data: {
        organizationId: input.organizationId,
        type: input.type,
        provider: input.provider,
        isActive: input.isActive,
        encryptedConfig: this.crypto.encryptJson(input.config),
      },
      select: { id: true, organizationId: true, type: true, provider: true, isActive: true, createdAt: true, updatedAt: true },
    });
  }

  pricing() {
    return this.prisma.wallet.findMany({
      include: { organization: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  updatePricing(input: {
    organizationId?: string;
    perMinutePricePaise: number;
    telephonyCostPaise: number;
    aiCostPaise: number;
    platformMarginPaise: number;
  }) {
    const data = {
      perMinutePricePaise: input.perMinutePricePaise,
      telephonyCostPaise: input.telephonyCostPaise,
      aiCostPaise: input.aiCostPaise,
      platformMarginPaise: input.platformMarginPaise,
    };

    if (input.organizationId) {
      return this.prisma.wallet.update({ where: { organizationId: input.organizationId }, data });
    }

    return this.prisma.wallet.updateMany({ data });
  }

  creditWallet(organizationId: string, amountPaise: number) {
    return this.wallet.recharge(organizationId, amountPaise, 'admin_credit');
  }
}
