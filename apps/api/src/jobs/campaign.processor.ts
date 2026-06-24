import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { CampaignStatus, LeadOutcome } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { ProviderRegistry } from '../providers/provider-registry';
import { WalletService } from '../modules/wallet/wallet.service';
import { PaymentsService } from '../modules/payments/payments.service';

@Injectable()
@Processor('campaigns')
export class CampaignProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providers: ProviderRegistry,
    private readonly wallet: WalletService,
    private readonly payments: PaymentsService,
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
    const llm = this.providers.getLLM();
    const started = await telephony.startCall(item.lead, item.campaign);
    const call = await this.prisma.call.create({
      data: {
        organizationId,
        campaignId: item.campaignId,
        leadId: item.leadId,
        provider: 'mock',
        providerCallId: started.providerCallId,
        status: 'in_progress',
        startedAt: new Date(),
        disclosurePlayed: item.campaign.recordingDisclosureEnabled,
      },
    });

    const transcript = await buildDemoTranscript(llm, item);
    const outcome = (await llm.classifyOutcome(transcript)) as LeadOutcome;
    const summary = await llm.summarizeCall(transcript);
    const paymentIntent = await llm.extractPaymentIntent(transcript);
    const callback = await llm.detectCallbackRequest(transcript);
    const durationSeconds = 75 + Math.floor(Math.random() * 120);
    const freeFirstCall = !item.campaign.organization.firstCallFreeUsed;
    const debit = await this.wallet.debitCall(organizationId, durationSeconds, freeFirstCall);
    if (freeFirstCall) {
      await this.prisma.organization.update({ where: { id: organizationId }, data: { firstCallFreeUsed: true } });
    }
    const recording = await telephony.recordCall(call.id);

    let finalOutcome = outcome;
    let paymentLink: string | undefined;
    if (paymentIntent.wantsToPay && item.campaign.paymentCollectionEnabled) {
      const payment = await this.payments.createLink(organizationId, {
        leadId: item.leadId,
        amountPaise: paymentIntent.amountPaise || 99900,
        description: `${item.campaign.businessProfile.businessName} purchase`,
      });
      paymentLink = payment.paymentLink || undefined;
      finalOutcome = LeadOutcome.payment_link_sent;
    }
    if (finalOutcome === LeadOutcome.do_not_call) {
      await this.prisma.optOutNumber.upsert({
        where: { organizationId_phone: { organizationId, phone: item.lead.phone } },
        update: { reason: 'customer_requested_opt_out' },
        create: { organizationId, phone: item.lead.phone, reason: 'customer_requested_opt_out' },
      });
    }

    await this.prisma.call.update({
      where: { id: call.id },
      data: {
        status: 'completed',
        outcome: finalOutcome,
        endedAt: new Date(),
        durationSeconds,
        costPaise: debit.costPaise,
        recordingUrl: recording.recordingUrl,
        transcriptUrl: `internal://calls/${call.id}/transcript`,
        optOutDetected: finalOutcome === LeadOutcome.do_not_call,
      },
    });
    await this.prisma.callTranscript.create({ data: { callId: call.id, transcript: transcript as any, summary } });
    await this.prisma.campaignLead.update({
      where: { id: campaignLeadId },
      data: {
        attempts: { increment: 1 },
        outcome: finalOutcome,
        lastCallAt: new Date(),
        aiNotes: `${summary}${paymentLink ? ` Payment link: ${paymentLink}` : ''}`,
        callbackAt: callback.requested ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined,
        interestLevel: finalOutcome === LeadOutcome.not_interested ? 1 : finalOutcome === LeadOutcome.payment_link_sent ? 5 : 3,
      },
    });
    return { callId: call.id, outcome: finalOutcome };
  }
}

async function jobQueuePlaceholder(processor: CampaignProcessor, campaignLeadId: string, organizationId: string) {
  // In production this schedules BullMQ delayed jobs with call-window logic.
  // For demo mode we execute immediately so the UI updates without telephony.
  return processor['execute'](campaignLeadId, organizationId);
}

async function buildDemoTranscript(llm: any, item: any) {
  const greeting = await llm.generateResponse({
    businessProfile: item.campaign.businessProfile,
    lead: item.lead,
    campaign: item.campaign,
  });
  return [
    { speaker: 'agent', text: greeting, at: new Date().toISOString() },
    { speaker: 'agent', text: 'Yeh call consented inquiry ke liye hai. Call record ho sakti hai. Agar aap opt out karna chahte hain to bata dijiye.', at: new Date().toISOString() },
    { speaker: 'customer', text: `${item.lead.name} bol raha hoon. Details bhej dijiye, interest hai.`, at: new Date().toISOString() },
    { speaker: 'agent', text: `Hamare paas ${item.campaign.businessProfile.businessName} ka current offer hai. Main payment link WhatsApp/SMS par bhej sakti hoon.`, at: new Date().toISOString() },
    { speaker: 'customer', text: 'Payment link bhej do, main check karta hoon.', at: new Date().toISOString() },
  ];
}
