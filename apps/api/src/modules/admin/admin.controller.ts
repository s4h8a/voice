import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ProviderType, Role } from '@prisma/client';
import { AuthGuard } from '../../common/auth.guard';
import { RbacGuard } from '../../common/rbac.guard';
import { Roles } from '../../common/roles.decorator';
import { AdminService } from './admin.service';

@UseGuards(AuthGuard, RbacGuard)
@Roles(Role.super_admin)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  users() {
    return this.admin.users();
  }

  @Get('campaigns')
  campaigns() {
    return this.admin.campaigns();
  }

  @Get('audit-logs')
  auditLogs() {
    return this.admin.auditLogs();
  }

  @Get('provider-configs')
  providerConfigs() {
    return this.admin.providerConfigs();
  }

  @Post('provider-configs')
  providerConfig(@Body() body: { organizationId?: string; type: ProviderType; provider: string; isActive: boolean; config: Record<string, unknown> }) {
    return this.admin.providerConfig(body);
  }

  @Get('pricing')
  pricing() {
    return this.admin.pricing();
  }

  @Post('pricing')
  updatePricing(@Body() body: { organizationId?: string; perMinutePricePaise: number; telephonyCostPaise: number; aiCostPaise: number; platformMarginPaise: number }) {
    return this.admin.updatePricing(body);
  }

  @Post('wallet-credit')
  walletCredit(@Body() body: { organizationId: string; amountPaise: number }) {
    return this.admin.creditWallet(body.organizationId, body.amountPaise);
  }
}
