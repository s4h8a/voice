import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/auth.guard';
import { CampaignsService } from './campaigns.service';

@UseGuards(AuthGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Get()
  list(@Req() req: any) {
    return this.campaigns.list(req.user.organizationId);
  }

  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.campaigns.create(req.user.organizationId, body);
  }

  @Post(':id/leads')
  attachLeads(@Req() req: any, @Param('id') id: string, @Body() body: { leadIds: string[] }) {
    return this.campaigns.attachLeads(id, req.user.organizationId, body.leadIds);
  }

  @Post(':id/start')
  start(@Req() req: any, @Param('id') id: string) {
    return this.campaigns.start(id, req.user.organizationId);
  }

  @Post(':id/pause')
  pause(@Req() req: any, @Param('id') id: string) {
    return this.campaigns.pause(id, req.user.organizationId);
  }

  @Post(':id/resume')
  resume(@Req() req: any, @Param('id') id: string) {
    return this.campaigns.resume(id, req.user.organizationId);
  }

  @Get(':id/export')
  export(@Req() req: any, @Param('id') id: string) {
    return this.campaigns.exportExcel(id, req.user.organizationId);
  }
}
