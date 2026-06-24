import { Controller, Get, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../../common/auth.guard';
import { LeadsService } from './leads.service';

@UseGuards(AuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get('list')
  list(@Req() req: any) {
    return this.leads.list(req.user.organizationId);
  }

  @Post('upload/preview')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  preview(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    return this.leads.preview(file, req.user.organizationId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  upload(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    return this.leads.importPreview(file, req.user.organizationId);
  }
}
