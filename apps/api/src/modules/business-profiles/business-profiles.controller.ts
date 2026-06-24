import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/auth.guard';
import { BusinessProfilesService } from './business-profiles.service';

@UseGuards(AuthGuard)
@Controller('business-profiles')
export class BusinessProfilesController {
  constructor(private readonly service: BusinessProfilesService) {}

  @Get()
  list(@Req() req: any) {
    return this.service.list(req.user.organizationId);
  }

  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.service.create(req.user.organizationId, body);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.service.update(id, req.user.organizationId, body);
  }
}
