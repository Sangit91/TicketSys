import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { JwtGlobalModule } from './common/jwt-global.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DepartmentsModule } from './departments/departments.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [PrismaModule, JwtGlobalModule, AuthModule, UsersModule, DepartmentsModule, TicketsModule],
  controllers: [AppController],
})
export class AppModule {}