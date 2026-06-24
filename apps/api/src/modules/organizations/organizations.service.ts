import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  me(organizationId: string) {
    return this.prisma.organization.findUniqueOrThrow({
      where: { id: organizationId },
      include: { wallet: true, subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
  }

  update(organizationId: string, data: { name?: string; industry?: string; status?: string }) {
    return this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: data.name,
        industry: data.industry,
        status: data.status,
      },
    });
  }

  async deleteData(organizationId: string, confirm: string) {
    if (confirm !== 'DELETE_MY_ORGANIZATION_DATA') {
      throw new BadRequestException('Deletion confirmation phrase is required');
    }

    await this.prisma.$transaction([
      this.prisma.paymentWebhook.deleteMany({ where: { payment: { organizationId } } }),
      this.prisma.payment.deleteMany({ where: { organizationId } }),
      this.prisma.callEvent.deleteMany({ where: { call: { organizationId } } }),
      this.prisma.callTranscript.deleteMany({ where: { call: { organizationId } } }),
      this.prisma.call.deleteMany({ where: { organizationId } }),
      this.prisma.campaignLead.deleteMany({ where: { campaign: { organizationId } } }),
      this.prisma.campaign.deleteMany({ where: { organizationId } }),
      this.prisma.lead.deleteMany({ where: { organizationId } }),
      this.prisma.leadUploadBatch.deleteMany({ where: { organizationId } }),
      this.prisma.businessProfile.deleteMany({ where: { organizationId } }),
      this.prisma.providerConfig.deleteMany({ where: { organizationId } }),
      this.prisma.optOutNumber.deleteMany({ where: { organizationId } }),
      this.prisma.auditLog.deleteMany({ where: { organizationId } }),
      this.prisma.walletTransaction.deleteMany({ where: { wallet: { organizationId } } }),
      this.prisma.wallet.deleteMany({ where: { organizationId } }),
      this.prisma.subscription.deleteMany({ where: { organizationId } }),
      this.prisma.user.deleteMany({ where: { organizationId } }),
      this.prisma.organization.delete({ where: { id: organizationId } }),
    ]);

    return { ok: true };
  }
}
