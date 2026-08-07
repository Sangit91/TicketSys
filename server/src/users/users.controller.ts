import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthJwtUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { ShiftStatus, UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Roles('ADMIN')
  list(@Query('roleType') roleType?: string, @Query('shiftStatus') shiftStatus?: string, @Query('q') q?: string) {
    return this.users.list({ roleType, shiftStatus, q }).then((data) => ({ data }));
  }

  @Get(':id/departments')
  departments(@Param('id') id: string) {
    return this.users.departments(id).then((data) => ({ data }));
  }

  @Post()
  @Roles('ADMIN')
  async create(
    @Body()
    body: {
      username?: string;
      password?: string;
      name?: string;
      email?: string;
      roleType?: string;
      phone?: string;
      specialty?: string;
      shiftStatus?: string;
    }
  ) {
    if (!body.username || !body.name || !body.email || !body.roleType) {
      throw new BadRequestException('Thiếu username/name/email/roleType');
    }
    const data = await this.users.create({
      username: body.username,
      password: body.password || '123456',
      name: body.name,
      email: body.email,
      roleType: body.roleType as UserRole,
      phone: body.phone,
      specialty: body.specialty,
      shiftStatus: (body.shiftStatus as ShiftStatus | undefined) || 'SAN_SANG',
    });
    return { data };
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() body: Record<string, string>) {
    return this.users
      .update(id, {
        name: body.name,
        phone: body.phone,
        email: body.email,
        specialty: body.specialty,
        shiftStatus: body.shiftStatus as ShiftStatus | undefined,
      })
      .then((r) => ({ data: r }));
  }

  @Patch(':id/departments')
  @Roles('ADMIN')
  async assignDepartments(@Param('id') id: string, @Body() body: { departmentIds?: string[] }) {
    if (!Array.isArray(body.departmentIds)) {
      throw new BadRequestException('departmentIds phải là mảng');
    }
    const data = await this.users.assignDepartments(id, body.departmentIds);
    return { data };
  }

  @Delete(':id')
  @Roles('ADMIN')
  softDelete(@Param('id') id: string, @CurrentUser() actor: AuthJwtUser) {
    return this.users.softDelete(id, actor.sub).then((r) => ({ data: { id: r.id, deletedAt: r.deletedAt } }));
  }
}