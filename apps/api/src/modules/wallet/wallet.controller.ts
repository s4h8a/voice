import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/auth.guard';
import { PaymentsService } from '../payments/payments.service';
import { WalletService } from './wallet.service';

@UseGuards(AuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly wallet: WalletService, private readonly payments: PaymentsService) {}

  @Get()
  get(@Req() req: any) {
    return this.wallet.get(req.user.organizationId);
  }

  @Post('recharge')
  recharge(@Req() req: any, @Body() body: { amountPaise: number }) {
    return this.payments.createWalletRechargeLink(req.user.organizationId, body.amountPaise);
  }

  @Post('recharge/manual-demo')
  manualDemoRecharge(@Req() req: any, @Body() body: { amountPaise: number }) {
    return this.wallet.recharge(req.user.organizationId, body.amountPaise, 'self_recharge_demo');
  }

  @Get('transactions')
  transactions(@Req() req: any) {
    return this.wallet.get(req.user.organizationId);
  }
}
