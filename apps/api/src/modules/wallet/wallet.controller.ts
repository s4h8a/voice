import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/auth.guard';
import { WalletService } from './wallet.service';

@UseGuards(AuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get()
  get(@Req() req: any) {
    return this.wallet.get(req.user.organizationId);
  }

  @Get('transactions')
  transactions(@Req() req: any) {
    return this.wallet.get(req.user.organizationId);
  }
}
