import { Body, Controller, Get, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/auth.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @UseGuards(AuthGuard)
  @Get()
  list(@Req() req: any) {
    return this.payments.list(req.user.organizationId);
  }

  @UseGuards(AuthGuard)
  @Post('create-link')
  create(@Req() req: any, @Body() body: any) {
    return this.payments.createLink(req.user.organizationId, body);
  }

  @Post('webhook/:provider')
  webhook(@Param('provider') provider: string, @Body() payload: any, @Headers('x-signature') signature?: string) {
    return this.payments.webhook(provider, payload, signature);
  }
}
