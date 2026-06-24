import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class BusinessProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  list(organizationId: string) {
    return this.prisma.businessProfile.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } });
  }

  create(organizationId: string, data: any) {
    return this.prisma.businessProfile.create({ data: { ...data, organizationId } });
  }

  async update(id: string, organizationId: string, data: any) {
    const profile = await this.prisma.businessProfile.findFirstOrThrow({ where: { id, organizationId } });
    return this.prisma.businessProfile.update({ where: { id: profile.id }, data });
  }
}
