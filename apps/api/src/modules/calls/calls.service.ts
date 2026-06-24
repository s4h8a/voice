import { BadRequestException, Injectable } from '@nestjs/common';
import { CallStatus, CampaignStatus, LeadOutcome } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { ProviderRegistry } from '../../providers/provider-registry';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class CallsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providers: ProviderRegistry,
    private readonly wallet: WalletService,
  ) {}

  list(organizationId: string) {
    return this.prisma.call.findMany({
      where: { organizationId },
      include: { lead: true, campaign: true, transcript: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  get(id: string, organizationId: string) {
    return this.prisma.call.findFirst({
      where: { id, organizationId },
      include: { lead: true, campaign: true, transcript: true, events: true },
    });
  }

  async startTestCall(
    organizationId: string,
    input: { name: string; phone: string; preferredLanguage?: string; consentConfirmed: boolean },
  ) {
    if (!input.consentConfirmed) {
      throw new BadRequestException('Consent confirmation is required before starting a test call');
    }

    const organization = await this.prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
    const wallet = await this.prisma.wallet.findUnique({ where: { organizationId } });
    const phone = String(input.phone || '').replace(/\D/g, '').replace(/^91/, '');
    const businessProfile =
      (await this.prisma.businessProfile.findFirst({ where: { organizationId } })) ||
      (await this.prisma.businessProfile.create({
        data: {
          organizationId,
          businessName: organization.name,
          industry: organization.industry || 'general',
          description: 'Starter business profile for consent-based AI calling.',
          productsServices: [{ name: 'Starter product', price: 999 }],
          pricing: [{ item: 'Starter product', amountPaise: 99900 }],
          businessHours: { start: '10:00', end: '18:00', timezone: 'Asia/Kolkata' },
        },
      }));

    const campaign = await this.prisma.campaign.create({
      data: {
        organizationId,
        businessProfileId: businessProfile.id,
        name: 'One-call client trial',
        objective: 'Let the client test the consent-based AI calling experience.',
        status: CampaignStatus.running,
        maxCallAttempts: 1,
        callWindow: { start: '10:00', end: '18:00', timezone: 'Asia/Kolkata' },
        language: input.preferredLanguage || businessProfile.preferredLanguage,
        paymentCollectionEnabled: false,
        humanHandoffEnabled: true,
        consentConfirmed: true,
      },
    });

    const lead = await this.prisma.lead.create({
      data: {
        organizationId,
        name: input.name,
        phone,
        consentStatus: 'consented',
        preferredLanguage: input.preferredLanguage || businessProfile.preferredLanguage,
        notes: 'Created from authenticated test-call console.',
      },
    });

    const provider = this.providers.getTelephony();
    const started = await provider.startCall(lead, campaign);
    const freeFirstCall = !organization.firstCallFreeUsed;
    const debit = await this.wallet.debitCall(organizationId, 60, freeFirstCall);
    if (freeFirstCall) {
      await this.prisma.organization.update({ where: { id: organizationId }, data: { firstCallFreeUsed: true } });
    }

    const call = await this.prisma.call.create({
      data: {
        organizationId,
        campaignId: campaign.id,
        leadId: lead.id,
        provider: this.providers.getTelephonyName(),
        providerCallId: started.providerCallId,
        status: CallStatus.in_progress,
        outcome: LeadOutcome.new,
        startedAt: new Date(),
        durationSeconds: 60,
        costPaise: debit.costPaise,
        disclosurePlayed: true,
      },
    });

    await this.prisma.callEvent.create({
      data: {
        callId: call.id,
        type: 'test_call_started',
        payload: {
          providerStatus: started.status,
          freeFirstCall,
          currency: 'INR',
          pricePerMinutePaise: freeFirstCall ? 0 : wallet?.perMinutePricePaise || 100,
        },
      },
    });

    return { callId: call.id, providerCallId: started.providerCallId, status: started.status, firstCallFree: freeFirstCall };
  }
}
