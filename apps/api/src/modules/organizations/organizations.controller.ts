import { Body, Controller, Delete, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/auth.guard';
import { OrganizationsService } from './organizations.service';

@UseGuards(AuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizations: OrganizationsService) {}

  @Get('me')
  me(@Req() req: any) {
    return this.organizations.me(req.user.organizationId);
  }

  @Patch('me')
  update(@Req() req: any, @Body() body: { name?: string; industry?: string; status?: string }) {
    return this.organizations.update(req.user.organizationId, body);
  }

  @Delete('me/data')
  deleteData(@Req() req: any, @Body() body: { confirm: string }) {
    return this.organizations.deleteData(req.user.organizationId, body.confirm);
  }
}
