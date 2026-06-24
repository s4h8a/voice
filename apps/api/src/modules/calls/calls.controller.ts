import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/auth.guard';
import { CallsService } from './calls.service';

@UseGuards(AuthGuard)
@Controller('calls')
export class CallsController {
  constructor(private readonly calls: CallsService) {}

  @Get('list')
  list(@Req() req: any) {
    return this.calls.list(req.user.organizationId);
  }

  @Get(':id')
  get(@Req() req: any, @Param('id') id: string) {
    return this.calls.get(id, req.user.organizationId);
  }

  @Post('test-call')
  startTestCall(@Req() req: any, @Body() body: { name: string; phone: string; preferredLanguage?: string; consentConfirmed: boolean }) {
    return this.calls.startTestCall(req.user.organizationId, body);
  }
}
