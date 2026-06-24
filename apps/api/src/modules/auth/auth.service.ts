import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async register(input: { organizationName: string; email: string; password: string; phone?: string }) {
    const passwordHash = await bcrypt.hash(input.password, 10);
    const org = await this.prisma.organization.create({
      data: {
        name: input.organizationName,
        wallet: { create: { balancePaise: 0 } },
      },
    });
    const user = await this.prisma.user.create({
      data: {
        organizationId: org.id,
        email: input.email,
        phone: input.phone,
        passwordHash,
        role: Role.business_owner,
      },
    });
    return this.sign(user.id, user.email, user.role, org.id);
  }

  async login(input: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.sign(user.id, user.email, user.role, user.organizationId || undefined);
  }

  async passwordResetRequest(email: string) {
    return { ok: true, message: `Password reset placeholder queued for ${email}` };
  }

  private sign(userId: string, email: string, role: Role, organizationId?: string) {
    const accessToken = this.jwt.sign({ sub: userId, email, role, organizationId });
    return { accessToken, user: { id: userId, email, role, organizationId } };
  }
}
