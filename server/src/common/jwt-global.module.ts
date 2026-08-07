import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
      signOptions: { expiresIn: Number(process.env.ACCESS_TOKEN_TTL || 900) },
    }),
  ],
  exports: [JwtModule],
})
export class JwtGlobalModule {}