import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthJwtUser {
  sub: string;
  username: string;
  roleType: 'ADMIN' | 'DOCTOR' | 'NURSE' | 'HARDWARE_TECH' | 'SOFTWARE_TECH' | 'TECHNICIAN';
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthJwtUser => {
    const req = ctx.switchToHttp().getRequest<{ user: AuthJwtUser }>();
    return req.user;
  }
);