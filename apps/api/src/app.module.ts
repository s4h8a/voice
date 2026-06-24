import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './common/prisma.service';
import { AuditService } from './common/audit.service';
import { CryptoService } from './common/crypto.service';
import { RbacGuard } from './common/rbac.guard';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { OrganizationsController } from './modules/organizations/organizations.controller';
import { OrganizationsService } from './modules/organizations/organizations.service';
import { BusinessProfilesController } from './modules/business-profiles/business-profiles.controller';
import { BusinessProfilesService } from './modules/business-profiles/business-profiles.service';
import { LeadsController } from './modules/leads/leads.controller';
import { LeadsService } from './modules/leads/leads.service';
import { CampaignsController } from './modules/campaigns/campaigns.controller';
import { CampaignsService } from './modules/campaigns/campaigns.service';
import { WalletController } from './modules/wallet/wallet.controller';
import { WalletService } from './modules/wallet/wallet.service';
import { PaymentsController } from './modules/payments/payments.controller';
import { PaymentsService } from './modules/payments/payments.service';
import { CallsController } from './modules/calls/calls.controller';
import { CallsService } from './modules/calls/calls.service';
import { AdminController } from './modules/admin/admin.controller';
import { AdminService } from './modules/admin/admin.service';
import { ProviderRegistry } from './providers/provider-registry';
import { CampaignProcessor } from './jobs/campaign.processor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'dev-secret-change-me',
        signOptions: { expiresIn: '7d' },
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: { url: config.get<string>('REDIS_URL') || 'redis://localhost:6379' },
      }),
    }),
    BullModule.registerQueue({ name: 'campaigns' }),
  ],
  controllers: [
    AuthController,
    OrganizationsController,
    BusinessProfilesController,
    LeadsController,
    CampaignsController,
    WalletController,
    PaymentsController,
    CallsController,
    AdminController,
  ],
  providers: [
    PrismaService,
    AuditService,
    CryptoService,
    RbacGuard,
    AuthService,
    OrganizationsService,
    BusinessProfilesService,
    LeadsService,
    CampaignsService,
    WalletService,
    PaymentsService,
    CallsService,
    AdminService,
    ProviderRegistry,
    CampaignProcessor,
  ],
})
export class AppModule {}
