import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { AuthService, AuthUser } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthJwtUser, CurrentUser } from '../common/decorators/current-user.decorator';

const COOKIE_NAME = 'ticketsys_refresh';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/api/auth',
      maxAge: Number(process.env.REFRESH_TOKEN_TTL || 604800) * 1000,
    });
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie(COOKIE_NAME, { path: '/api/auth' });
  }

  @Post('login')
  async login(
    @Body() body: { username?: string; password?: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const { username = '', password = '' } = body;
    if (!username || !password) {
      throw new BadRequestException('Thiếu tên đăng nhập hoặc mật khẩu');
    }
    const result = await this.auth.login(username, password, req.ip, req.headers['user-agent']);
    this.setRefreshCookie(res, result.refreshToken);
    return { data: { accessToken: result.accessToken, user: result.user } };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = (req.cookies as Record<string, unknown>)?.[COOKIE_NAME] as string | undefined;
    if (!raw) {
      throw new BadRequestException('Thiếu refresh token');
    }
    const result = await this.auth.refresh(raw, req.ip, req.headers['user-agent']);
    this.setRefreshCookie(res, result.refreshToken);
    return { data: { accessToken: result.accessToken, user: result.user } };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout((req.cookies as Record<string, unknown>)?.[COOKIE_NAME] as string | undefined);
    this.clearRefreshCookie(res);
    return { data: { ok: true } };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: { sub: string }): Promise<{ data: AuthUser }> {
    return { data: await this.auth.me(user.sub) };
  }

  @Post('switch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async switchUser(
    @Body() body: { userId?: string },
    @CurrentUser() actor: AuthJwtUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    if (!body.userId) {
      throw new BadRequestException('Thiếu userId cần chuyển');
    }
    const result = await this.auth.switch(
      { roleType: actor.roleType } as unknown as User,
      body.userId,
      req.ip,
      req.headers['user-agent']
    );
    this.setRefreshCookie(res, result.refreshToken);
    return { data: { accessToken: result.accessToken, user: result.user } };
  }
}