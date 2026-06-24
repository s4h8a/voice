import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { CampaignStatus, LeadOutcome } from '@prisma/client';
import { Queue } from 'bullmq';
import * as XLSX from 'xlsx';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class CampaignsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('campaigns') private readonly queue: Queue,
  ) {}

  list(organizationId: string) {
    return this.prisma.campaign.findMany({
      where: { organizationId },
      include: { businessProfile: true, _count: { select: { campaignLeads: true, calls: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(organizationId: string, data: any) {
    return this.prisma.campaign.create({ data: { ...data, organizationId } });
  }

  async attachLeads(campaignId: string, organizationId: string, leadIds: string[]) {
    const campaign = await this.prisma.campaign.findFirstOrThrow({ where: { id: campaignId, organizationId } });
    for (const leadId of leadIds) {
      await this.prisma.campaignLead.upsert({
        where: { campaignId_leadId: { campaignId: campaign.id, leadId } },
        update: {},
        create: { campaignId: campaign.id, leadId },
      });
    }
    return { ok: true, attached: leadIds.length };
  }

  async start(id: string, organizationId: string) {
    const campaign = await this.prisma.campaign.findFirstOrThrow({
      where: { id, organizationId },
      include: { campaignLeads: { include: { lead: true } } },
    });
    if (!campaign.consentConfirmed) throw new BadRequestException('Consent confirmation is required');
    await this.prisma.campaign.update({ where: { id }, data: { status: CampaignStatus.running } });
    await this.queue.add('scheduleCampaignCalls', { campaignId: id, organizationId });
    return { ok: true, queued: campaign.campaignLeads.length };
  }

  async pause(id: string, organizationId: string) {
    const campaign = await this.prisma.campaign.findFirstOrThrow({ where: { id, organizationId } });
    return this.prisma.campaign.update({ where: { id: campaign.id }, data: { status: CampaignStatus.paused } });
  }

  resume(id: string, organizationId: string) {
    return this.start(id, organizationId);
  }

  async exportExcel(id: string, organizationId: string) {
    const rows = await this.prisma.campaignLead.findMany({
      where: { campaignId: id, campaign: { organizationId } },
      include: { lead: true, campaign: true },
    });
    const data = rows.map((row) => ({
      name: row.lead.name,
      phone: row.lead.phone,
      email: row.lead.email,
      city: row.lead.city,
      product_interest: row.lead.productInterest,
      budget: row.lead.budget,
      call_attempts: row.attempts,
      last_call_time: row.lastCallAt?.toISOString() || '',
      outcome: row.outcome,
      interest_level: row.interestLevel || '',
      callback_time: row.callbackAt?.toISOString() || '',
      ai_notes: row.aiNotes || '',
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Campaign Results');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return { fileName: `campaign-${id}-results.xlsx`, base64: buffer.toString('base64') };
  }
}
