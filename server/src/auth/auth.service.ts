import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  roleType: UserRole;
}

const ACCESS_SECRET = () => process.env.JWT_ACCESS_SECRET || 'dev_access_secret';
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';
const ACCESS_TTL = () => Number(process.env.ACCESS_TOKEN_TTL || 900);
const REFRESH_TTL = () => Number(process.env.REFRESH_TOKEN_TTL || 604800);

const hashToken = (t: string) => createHash('sha256').update(t).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  private signAccess(u: User): string {
    return this.jwt.sign(
      { username: u.username, roleType: u.roleType },
      { secret: ACCESS_SECRET(), expiresIn: ACCESS_TTL(), subject: u.id }
    );
  }

  private signRefresh(u: User): string {
    return this.jwt.sign(
      { type: 'refresh', username: u.username },
      { secret: REFRESH_SECRET(), expiresIn: REFRESH_TTL(), subject: u.id }
    );
  }

  private storeRefresh(userId: string, token: string, ip?: string, ua?: string) {
    const expiresAt = new Date(Date.now() + REFRESH_TTL() * 1000);
    return this.prisma.refreshToken.create({
      data: { userId, tokenHash: hashToken(token), expiresAt, ip, userAgent: ua },
    });
  }

  private toAuthUser(u: User): AuthUser {
    return { id: u.id, username: u.username, name: u.name, roleType: u.roleType };
  }

  async login(username: string, password: string, ip?: string, ua?: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');
    }
    const ok = await argon2.verify(user.passwordHash, password).catch(() => false);
    if (!ok) {
      throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');
    }

    const accessToken = this.signAccess(user);
    const refreshToken = this.signRefresh(user);
    await this.storeRefresh(user.id, refreshToken, ip, ua);
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => null);

    return { accessToken, refreshToken, user: this.toAuthUser(user) };
  }

  async refresh(raw: string, ip?: string, ua?: string) {
    let payload: { type?: string };
    try {
      payload = this.jwt.verify<{ type?: string }>(raw, { secret: REFRESH_SECRET() });
    } catch {
      throw new UnauthorizedException('Phiên đăng nhập hết hạn');
    }
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    const tokenHash = hashToken(raw);
    const record = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Phiên đăng nhập hết hạn');
    }

    const user = await this.prisma.user.findUnique({ where: { id: record.userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Tài khoản không hợp lệ');
    }

    await this.prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
    const accessToken = this.signAccess(user);
    const refreshToken = this.signRefresh(user);
    await this.storeRefresh(user.id, refreshToken, ip, ua);

    return { accessToken, refreshToken, user: this.toAuthUser(user) };
  }

  async logout(raw?: string) {
    if (raw) {
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(raw), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  async me(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }
    return this.toAuthUser(user);
  }

  async switch(actor: User, targetUserId: string, ip?: string, ua?: string) {
    if (actor.roleType !== 'ADMIN') {
      throw new ForbiddenException('Chỉ quản trị viên mới được chuyển phiên');
    }
    const target = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target || !target.isActive) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }
    const accessToken = this.signAccess(target);
    const refreshToken = this.signRefresh(target);
    await this.storeRefresh(target.id, refreshToken, ip, ua);
    return { accessToken, refreshToken, user: this.toAuthUser(target) };
  }
}