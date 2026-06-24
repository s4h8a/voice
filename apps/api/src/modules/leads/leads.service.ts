import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../../common/prisma.service';

const PHONE_RE = /^[6-9]\d{9}$/;

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  list(organizationId: string) {
    return this.prisma.lead.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' }, take: 500 });
  }

  async preview(file: Express.Multer.File, organizationId: string) {
    const parsed = await this.parseSheet(file, organizationId);
    return {
      totalRows: parsed.length,
      validRows: parsed.filter((r) => r.valid).length,
      invalidRows: parsed.filter((r) => !r.valid).length,
      rows: parsed.slice(0, 100),
    };
  }

  async importPreview(file: Express.Multer.File, organizationId: string) {
    const parsed = await this.parseSheet(file, organizationId);
    const report = {
      totalRows: parsed.length,
      validRows: parsed.filter((r) => r.valid).length,
      invalidRows: parsed.filter((r) => !r.valid).length,
      rows: parsed.slice(0, 100),
    };
    const batch = await this.prisma.leadUploadBatch.create({
      data: {
        organizationId,
        fileName: file.originalname,
        totalRows: report.totalRows,
        validRows: report.validRows,
        invalidRows: report.invalidRows,
        status: 'imported',
        validationReport: report as any,
      },
    });
    for (const row of parsed.filter((r) => r.valid)) {
      const data = row as Record<string, any>;
      await this.prisma.lead.create({
        data: {
          organizationId,
          uploadBatchId: batch.id,
          name: String(data.name),
          phone: String(row.phone),
          email: data.email ? String(data.email) : undefined,
          city: data.city ? String(data.city) : undefined,
          productInterest: data.product_interest ? String(data.product_interest) : undefined,
          budget: data.budget ? String(data.budget) : undefined,
          notes: data.notes ? String(data.notes) : undefined,
          consentStatus: 'consented',
          preferredLanguage: data.preferred_language ? String(data.preferred_language) : undefined,
        },
      });
    }
    return { batchId: batch.id, importedRows: report.validRows, ...report };
  }

  private async parseSheet(file: Express.Multer.File, organizationId: string): Promise<Array<Record<string, any> & { phone: string; valid: boolean; errors: string[]; rowNumber: number }>> {
    if (!file) throw new BadRequestException('Missing file');
    const wb = XLSX.read(file.buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
    const existing = await this.prisma.lead.findMany({ where: { organizationId }, select: { phone: true } });
    const seen = new Set(existing.map((x) => x.phone));
    return rows.map((row, index) => {
      const digits = String(row.phone || '').replace(/\D/g, '');
      const phone = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
      const errors: string[] = [];
      if (!row.name) errors.push('missing_name');
      if (!PHONE_RE.test(phone)) errors.push('invalid_phone');
      if (seen.has(phone)) errors.push('duplicate_phone');
      if (String(row.consent_status || '').toLowerCase() !== 'consented') errors.push('missing_consent');
      seen.add(phone);
      return { rowNumber: index + 2, ...row, phone, valid: errors.length === 0, errors };
    });
  }
}
