import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { CampaignStatus, LeadOutcome } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { ProviderRegistry } from '../providers/provider-registry';
import { WalletService } from '../modules/wallet/wallet.service';

@Injectable()
@Processor('campaigns')
export class CampaignProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providers: ProviderRegistry,
    private readonly wallet: WalletService,
  ) {
    super();
  }

  async process(job: Job) {
    if (job.name === 'scheduleCampaignCalls') return this.schedule(job.data.campaignId, job.data.organizationId);
    if (job.name === 'executeCall') return this.execute(job.data.campaignLeadId, job.data.organizationId);
  }

  private async schedule(campaignId: string, organizationId: string) {
    const organization = await this.prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
    const wallet = await this.prisma.wallet.findUnique({ where: { organizationId } });
    if (wallet && organization.firstCallFreeUsed && wallet.balancePaise <= wallet.lowBalancePaise) {
      await this.prisma.campaign.update({ where: { id: campaignId }, data: { status: CampaignStatus.paused } });
      return { queued: 0, reason: 'low_balance' };
    }

    const campaignLeads = await this.prisma.campaignLead.findMany({
      where: { campaignId, campaign: { organizationId } },
      include: { lead: true },
    });
    for (const item of campaignLeads) {
      const optOut = await this.prisma.optOutNumber.findFirst({
        where: { organizationId, phone: item.lead.phone },
      });
      if (optOut || item.lead.consentStatus !== 'consented') {
        await this.prisma.campaignLead.update({ where: { id: item.id }, data: { outcome: LeadOutcome.do_not_call } });
        continue;
      }
      await jobQueuePlaceholder(this, item.id, organizationId);
    }
    return { queued: campaignLeads.length };
  }

  private async execute(campaignLeadId: string, organizationId: string) {
    const item = await this.prisma.campaignLead.findUniqueOrThrow({
      where: { id: campaignLeadId },
      include: { lead: true, campaign: { include: { businessProfile: true, organization: true } } },
    });
    const telephony = this.providers.getTelephony();
    const started = await telephony.startCall(item.lead, item.campaign);
    const call = await this.prisma.call.create({
      data: {
        organizationId,
        campaignId: item.campaignId,
        leadId: item.leadId,
        provider: this.providers.getTelephonyName(),
        providerCallId: started.providerCallId,
        status: 'in_progress',
        startedAt: new Date(),
        disclosurePlayed: item.campaign.recordingDisclosureEnabled,
      },
    });

    const freeFirstCall = !item.campaign.organization.firstCallFreeUsed;
    const debit = await this.wallet.debitCall(organizationId, 60, freeFirstCall);
    if (freeFirstCall) {
      await this.prisma.organization.update({ where: { id: organizationId }, data: { firstCallFreeUsed: true } });
    }
    const recording = await telephony.recordCall(call.id);

    await this.prisma.call.update({
      where: { id: call.id },
      data: {
        status: 'in_progress',
        costPaise: debit.costPaise,
        recordingUrl: recording.recordingUrl,
      },
    });
    await this.prisma.callEvent.create({
      data: {
        callId: call.id,
        type: 'provider_call_started',
        payload: {
          provider: this.providers.getTelephonyName(),
          providerCallId: started.providerCallId,
          providerStatus: started.status,
          costPaise: debit.costPaise,
        },
      },
    });
    await this.prisma.campaignLead.update({
      where: { id: campaignLeadId },
      data: {
        attempts: { increment: 1 },
        lastCallAt: new Date(),
        aiNotes: `Live call started through ${this.providers.getTelephonyName()} with provider id ${started.providerCallId}.`,
      },
    });
    return { callId: call.id, providerCallId: started.providerCallId, status: started.status };
  }
}

async function jobQueuePlaceholder(processor: CampaignProcessor, campaignLeadId: string, organizationId: string) {
  // In production this schedules BullMQ delayed jobs with call-window logic.
  // Free beta executes immediately after consent, opt-out, and balance gates.
  return processor['execute'](campaignLeadId, organizationId);
}
