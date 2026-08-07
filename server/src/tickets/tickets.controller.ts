import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Priority, TicketStatus, TicketType } from '@prisma/client';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthJwtUser, CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthJwtUser,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
    @Query('departmentId') departmentId?: string,
    @Query('q') q?: string
  ) {
    return this.tickets
      .list({ page, pageSize, status, priority, category, departmentId, q }, { sub: user.sub, roleType: user.roleType })
      .then((data) => ({ data }));
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.tickets.detail(id).then((data) => ({ data }));
  }

  @Post()
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'HARDWARE_TECH', 'SOFTWARE_TECH', 'TECHNICIAN')
  async create(
    @Body()
    body: {
      title?: string;
      description?: string;
      category?: string;
      priority?: string;
      type?: string;
      requestorName?: string;
      departmentId?: string;
      assetId?: string;
      slaPolicyId?: string;
      requiresE2E?: boolean;
    },
    @CurrentUser() user: AuthJwtUser
  ) {
    if (!body.title || !body.departmentId) {
      throw new BadRequestException('Thiếu title/departmentId');
    }
    const data = await this.tickets.create({
      title: body.title,
      description: body.description || '',
      category: body.category || 'PHAN_CUNG_Y_TE',
      priority: (body.priority as Priority) || 'P3_TRUNG_BINH',
      type: body.type as TicketType | undefined,
      requestorName: body.requestorName,
      departmentId: body.departmentId,
      assetId: body.assetId,
      slaPolicyId: body.slaPolicyId,
      requiresE2E: body.requiresE2E,
      createdById: user.sub,
    });
    return { data };
  }

  @Patch(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body() body: { status?: string; note?: string },
    @CurrentUser() user: AuthJwtUser
  ) {
    if (!body.status) throw new BadRequestException('Thiếu status');
    const data = await this.tickets.changeStatus(id, body.status as TicketStatus, body.note, user.sub);
    return { data };
  }

  @Patch(':id/assign')
  async assign(
    @Param('id') id: string,
    @Body() body: { engineerId?: string },
    @CurrentUser() user: AuthJwtUser
  ) {
    if (!body.engineerId) throw new BadRequestException('Thiếu engineerId');
    const data = await this.tickets.assign(id, body.engineerId, user.sub);
    return { data };
  }

  @Post(':id/comments')
  async comment(
    @Param('id') id: string,
    @Body() body: { content?: string },
    @CurrentUser() user: AuthJwtUser
  ) {
    if (!body.content) throw new BadRequestException('Thiếu content');
    const data = await this.tickets.comment(id, body.content, user.sub);
    return { data };
  }

  @Post(':id/sign')
  async sign(
    @Param('id') id: string,
    @Body() body: { userId?: string },
    @CurrentUser() user: AuthJwtUser
  ) {
    const signerId = body.userId || user.sub;
    const data = await this.tickets.sign(id, signerId);
    return { data };
  }
}